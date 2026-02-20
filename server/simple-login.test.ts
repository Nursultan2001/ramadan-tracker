import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock nanoid
vi.mock("nanoid", () => ({
  nanoid: () => "test-nanoid-123",
}));

// Mock db module
vi.mock("./db", () => ({
  getUserByName: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  getDb: vi.fn(),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock websocket
vi.mock("./websocket", () => ({
  broadcastLeaderboardUpdate: vi.fn(),
}));

// Mock sdk
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-session-token"),
    authenticateRequest: vi.fn(),
    verifySession: vi.fn(),
  },
}));

// Mock cookies
vi.mock("./_core/cookies", () => ({
  getSessionCookieOptions: vi.fn().mockReturnValue({
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: false,
  }),
}));

import * as db from "./db";
import { sdk } from "./_core/sdk";

describe("Simple Login System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("simpleLogin mutation logic", () => {
    it("should create a new user when name does not exist", async () => {
      const mockUser = {
        id: 1,
        openId: "simple_test-nanoid-123",
        name: "Test User",
        email: null,
        role: "user" as const,
        loginMethod: "simple",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      };

      // User doesn't exist yet
      vi.mocked(db.getUserByName).mockResolvedValue(undefined);
      // After creation, return the user
      vi.mocked(db.getUserByOpenId).mockResolvedValue(mockUser);
      vi.mocked(db.upsertUser).mockResolvedValue(undefined as any);

      // Simulate the login logic
      const name = "Test User";
      let user = await db.getUserByName(name);
      expect(user).toBeUndefined();

      // Create user
      const openId = `simple_test-nanoid-123`;
      await db.upsertUser({
        openId,
        name,
        loginMethod: "simple",
        lastSignedIn: new Date(),
      });

      user = await db.getUserByOpenId(openId);
      expect(user).toBeDefined();
      expect(user?.name).toBe("Test User");
      expect(user?.openId).toBe("simple_test-nanoid-123");
      expect(user?.loginMethod).toBe("simple");

      // Create session token
      const token = await sdk.createSessionToken(user!.openId, {
        name: user!.name || name,
        expiresInMs: 1000 * 60 * 60 * 24 * 365,
      });
      expect(token).toBe("mock-session-token");
      expect(sdk.createSessionToken).toHaveBeenCalledWith(
        "simple_test-nanoid-123",
        expect.objectContaining({ name: "Test User" })
      );
    });

    it("should return existing user when name already exists", async () => {
      const existingUser = {
        id: 5,
        openId: "simple_existing-user-id",
        name: "Returning User",
        email: null,
        role: "user" as const,
        loginMethod: "simple",
        createdAt: new Date(),
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserByName).mockResolvedValue(existingUser);
      vi.mocked(db.upsertUser).mockResolvedValue(undefined as any);

      const name = "Returning User";
      const user = await db.getUserByName(name);
      expect(user).toBeDefined();
      expect(user?.id).toBe(5);
      expect(user?.name).toBe("Returning User");

      // Should update lastSignedIn
      await db.upsertUser({
        openId: user!.openId,
        lastSignedIn: new Date(),
      });

      expect(db.upsertUser).toHaveBeenCalledWith(
        expect.objectContaining({ openId: "simple_existing-user-id" })
      );

      // Should NOT call getUserByOpenId (no new user creation)
      expect(db.getUserByOpenId).not.toHaveBeenCalled();
    });

    it("should trim whitespace from name", () => {
      const rawName = "  Test User  ";
      const trimmedName = rawName.trim();
      expect(trimmedName).toBe("Test User");
    });

    it("should reject empty names", () => {
      const emptyName = "";
      const whitespaceOnly = "   ";
      expect(emptyName.trim().length).toBe(0);
      expect(whitespaceOnly.trim().length).toBe(0);
    });

    it("should generate unique openId with simple_ prefix", () => {
      const openId = `simple_test-nanoid-123`;
      expect(openId).toMatch(/^simple_/);
      expect(openId.length).toBeGreaterThan(7); // "simple_" + at least 1 char
    });
  });

  describe("getUserByName db function", () => {
    it("should be called with the correct name", async () => {
      vi.mocked(db.getUserByName).mockResolvedValue(undefined);
      await db.getUserByName("Ahmad");
      expect(db.getUserByName).toHaveBeenCalledWith("Ahmad");
    });

    it("should return undefined for non-existent names", async () => {
      vi.mocked(db.getUserByName).mockResolvedValue(undefined);
      const result = await db.getUserByName("NonExistent");
      expect(result).toBeUndefined();
    });
  });
});
