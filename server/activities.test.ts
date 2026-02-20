import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("activities.submitDaily", () => {
  it("calculates points correctly for daily prayers", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.activities.submitDaily({
      activityDate: "2026-03-15",
      dailyPrayers: 5,
      tahajud: 0,
      tarawih20: 0,
      tarawih8: 0,
      fasting: 0,
      quranArabicPages: 0,
      quranOtherLanguagePages: 0,
      islamicBookPages: 0,
      otherBookPages: 0,
      podcastMinutes: 0,
      salawat: 0,
    });

    expect(result.success).toBe(true);
    expect(result.totalPoints).toBe(50); // 5 prayers * 10 points each
  });

  it("calculates points correctly for Arabic Quran pages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.activities.submitDaily({
      activityDate: "2026-03-16",
      dailyPrayers: 0,
      tahajud: 0,
      tarawih20: 0,
      tarawih8: 0,
      fasting: 0,
      quranArabicPages: 5,
      quranOtherLanguagePages: 0,
      islamicBookPages: 0,
      otherBookPages: 0,
      podcastMinutes: 0,
      salawat: 0,
    });

    expect(result.success).toBe(true);
    expect(result.totalPoints).toBe(100); // 5 pages * 20 points
  });

  it("calculates points correctly for fasting", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.activities.submitDaily({
      activityDate: "2026-03-17",
      dailyPrayers: 0,
      tahajud: 0,
      tarawih20: 0,
      tarawih8: 0,
      fasting: 1,
      quranArabicPages: 0,
      quranOtherLanguagePages: 0,
      islamicBookPages: 0,
      otherBookPages: 0,
      podcastMinutes: 0,
      salawat: 0,
    });

    expect(result.success).toBe(true);
    expect(result.totalPoints).toBe(100); // 1 fast = 100 points
  });

  it("calculates points correctly for tahajud prayer", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.activities.submitDaily({
      activityDate: "2026-03-18",
      dailyPrayers: 0,
      tahajud: 2,
      tarawih20: 0,
      tarawih8: 0,
      fasting: 0,
      quranArabicPages: 0,
      quranOtherLanguagePages: 0,
      islamicBookPages: 0,
      otherBookPages: 0,
      podcastMinutes: 0,
      salawat: 0,
    });

    expect(result.success).toBe(true);
    expect(result.totalPoints).toBe(60); // 2 tahajud * 30 points each
  });

  it("calculates combined points correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.activities.submitDaily({
      activityDate: "2026-03-19",
      dailyPrayers: 5,      // 5 * 10 = 50
      tahajud: 1,            // 1 * 30 = 30
      tarawih20: 1,          // 1 * 100 = 100
      tarawih8: 0,
      fasting: 1,            // 1 * 100 = 100
      quranArabicPages: 3,   // 3 * 20 = 60
      quranOtherLanguagePages: 0,
      islamicBookPages: 5,   // 5 * 8 = 40
      otherBookPages: 0,
      podcastMinutes: 10,    // 10 * 3 = 30
      salawat: 100,          // 100 * 0.1 = 10
    });

    expect(result.success).toBe(true);
    // 50 + 30 + 100 + 100 + 60 + 40 + 30 + 10 = 420
    expect(result.totalPoints).toBe(420);
  });
});

describe("admin.getAllUsers", () => {
  it("requires admin role", async () => {
    const ctx = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getAllUsers()).rejects.toThrow("FORBIDDEN");
  });

  it("allows admin to access user data", async () => {
    const ctx = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getAllUsers();
    expect(Array.isArray(result)).toBe(true);
  });
});
