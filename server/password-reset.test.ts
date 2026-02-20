import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/trpc";
import * as db from "./db";
import bcrypt from "bcryptjs";

// Mock context for testing
const createMockContext = (): TrpcContext => ({
  user: null,
  req: {
    headers: {},
    protocol: "https",
    get: (name: string) => {
      if (name === "host") return "test.example.com";
      return undefined;
    },
  } as any,
  res: {
    cookie: () => {},
    clearCookie: () => {},
  } as any,
});

describe("Password Reset Flow", () => {
  const testEmail = `reset-test-${Date.now()}@example.com`;
  const testName = "Reset Test User";
  const testPassword = "oldpassword123";
  const newPassword = "newpassword456";
  let resetToken: string;

  describe("Setup: Create test user", () => {
    it("should create a test user for password reset tests", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await caller.auth.register({
        email: testEmail,
        name: testName,
        password: testPassword,
        confirmPassword: testPassword,
      });

      const user = await db.getUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });
  });

  describe("Request Password Reset", () => {
    it("should generate reset token and store expiry", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.requestPasswordReset({
        email: testEmail,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("password reset link");

      // Verify token was stored in database
      const user = await db.getUserByEmail(testEmail);
      expect(user?.passwordResetToken).toBeDefined();
      expect(user?.passwordResetToken).not.toBeNull();
      expect(user?.passwordResetExpiry).toBeDefined();
      expect(user?.passwordResetExpiry).not.toBeNull();

      // Store token for next tests
      if (user?.passwordResetToken) {
        resetToken = user.passwordResetToken;
      }

      // Verify expiry is in the future
      const now = new Date();
      const expiry = user?.passwordResetExpiry;
      expect(expiry).toBeDefined();
      if (expiry) {
        expect(expiry.getTime()).toBeGreaterThan(now.getTime());
      }
    });

    it("should not reveal if email doesn't exist", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.requestPasswordReset({
        email: "nonexistent@example.com",
      });

      // Same message for security
      expect(result.success).toBe(true);
      expect(result.message).toContain("password reset link");
    });

    it("should reject invalid email format", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.requestPasswordReset({
          email: "not-an-email",
        })
      ).rejects.toThrow();
    });
  });

  describe("Reset Password with Token", () => {
    it("should reset password with valid token", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.resetPassword({
        token: resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Password reset successful");

      // Verify password was updated
      const user = await db.getUserByEmail(testEmail);
      expect(user?.password).toBeDefined();
      if (user?.password) {
        const isNewPassword = await bcrypt.compare(newPassword, user.password);
        expect(isNewPassword).toBe(true);

        const isOldPassword = await bcrypt.compare(testPassword, user.password);
        expect(isOldPassword).toBe(false);
      }

      // Verify reset token was cleared
      expect(user?.passwordResetToken).toBeNull();
      expect(user?.passwordResetExpiry).toBeNull();
    });

    it("should allow login with new password", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.login({
        email: testEmail,
        password: newPassword,
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe(testEmail);
    });

    it("should reject old password after reset", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: testEmail,
          password: testPassword, // Old password
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should reject invalid reset token", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.resetPassword({
          token: "invalid-token-12345",
          password: "newpassword",
          confirmPassword: "newpassword",
        })
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should reject mismatched passwords", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Request new reset token
      await caller.auth.requestPasswordReset({ email: testEmail });
      const user = await db.getUserByEmail(testEmail);
      const newToken = user?.passwordResetToken || "";

      await expect(
        caller.auth.resetPassword({
          token: newToken,
          password: "password123",
          confirmPassword: "differentpassword",
        })
      ).rejects.toThrow();
    });

    it("should reject short passwords", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Request new reset token
      await caller.auth.requestPasswordReset({ email: testEmail });
      const user = await db.getUserByEmail(testEmail);
      const newToken = user?.passwordResetToken || "";

      await expect(
        caller.auth.resetPassword({
          token: newToken,
          password: "12345", // Less than 6 characters
          confirmPassword: "12345",
        })
      ).rejects.toThrow();
    });
  });

  describe("Token Expiry", () => {
    it("should reject expired token", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Create a user with expired reset token
      const expiredEmail = `expired-${Date.now()}@example.com`;
      await caller.auth.register({
        email: expiredEmail,
        name: "Expired User",
        password: "password123",
        confirmPassword: "password123",
      });

      // Request reset
      await caller.auth.requestPasswordReset({ email: expiredEmail });
      const user = await db.getUserByEmail(expiredEmail);
      const token = user?.passwordResetToken || "";

      // Manually expire the token by setting expiry to past
      const pastExpiry = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      await db.upsertUser({
        openId: user!.openId,
        passwordResetExpiry: pastExpiry,
      });

      // Try to reset with expired token
      await expect(
        caller.auth.resetPassword({
          token,
          password: "newpassword",
          confirmPassword: "newpassword",
        })
      ).rejects.toThrow("Reset token has expired");
    });
  });
});
