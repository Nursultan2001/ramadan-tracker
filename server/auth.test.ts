import { describe, it, expect, beforeAll } from "vitest";
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

describe("Auth System", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testName = "Test User";
  const testPassword = "password123";

  describe("Registration", () => {
    it("should register a new user with valid credentials", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.register({
        email: testEmail,
        name: testName,
        password: testPassword,
        confirmPassword: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Registration successful");

      // Verify user was created in database
      const user = await db.getUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.name).toBe(testName);
      expect(user?.email).toBe(testEmail);
      expect(user?.password).toBeDefined();
      expect(user?.emailVerified).toBe(0);
      expect(user?.loginMethod).toBe("email");

      // Verify password was hashed
      const isPasswordHashed = user?.password && user.password !== testPassword;
      expect(isPasswordHashed).toBe(true);
    });

    it("should reject registration with mismatched passwords", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.register({
          email: "another@example.com",
          name: "Another User",
          password: "password123",
          confirmPassword: "differentpassword",
        })
      ).rejects.toThrow();
    });

    it("should reject registration with duplicate email", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      // Try to register with the same email again
      await expect(
        caller.auth.register({
          email: testEmail,
          name: "Duplicate User",
          password: testPassword,
          confirmPassword: testPassword,
        })
      ).rejects.toThrow("Email already registered");
    });

    it("should reject registration with invalid email", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.register({
          email: "not-an-email",
          name: "Test User",
          password: testPassword,
          confirmPassword: testPassword,
        })
      ).rejects.toThrow();
    });

    it("should reject registration with short password", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.register({
          email: "short@example.com",
          name: "Test User",
          password: "12345", // Less than 6 characters
          confirmPassword: "12345",
        })
      ).rejects.toThrow();
    });
  });

  describe("Login", () => {
    it("should login with correct credentials", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.login({
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe(testName);
    });

    it("should reject login with incorrect password", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: testEmail,
          password: "wrongpassword",
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should reject login with non-existent email", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "nonexistent@example.com",
          password: testPassword,
        })
      ).rejects.toThrow("Invalid email or password");
    });

    it("should reject login with invalid email format", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: "not-an-email",
          password: testPassword,
        })
      ).rejects.toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash passwords with bcrypt", async () => {
      const user = await db.getUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.password).toBeDefined();

      // Verify it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      const isBcryptHash = user?.password && /^\$2[aby]\$/.test(user.password);
      expect(isBcryptHash).toBe(true);

      // Verify the hash can be compared
      const isValid = user?.password && await bcrypt.compare(testPassword, user.password);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = user?.password && await bcrypt.compare("wrongpassword", user.password);
      expect(isInvalid).toBe(false);
    });
  });

  describe("Auth Context", () => {
    it("should return null for unauthenticated requests", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });
});
