import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, dailyActivities, DailyActivity, InsertDailyActivity, leaderboardSnapshots, LeaderboardSnapshot, InsertLeaderboardSnapshot, userPreferences, UserPreference, InsertUserPreference, announcements, Announcement, InsertAnnouncement, announcementDelivery, AnnouncementDelivery, InsertAnnouncementDelivery } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "password", "passwordResetToken"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
    }
    if (user.passwordResetExpiry !== undefined) {
      values.passwordResetExpiry = user.passwordResetExpiry;
      updateSet.passwordResetExpiry = user.passwordResetExpiry;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByName(name: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Daily Activities
export async function createDailyActivity(activity: InsertDailyActivity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(dailyActivities).values(activity);
  return result;
}

export async function getDailyActivityByUserAndDate(userId: number, activityDate: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(dailyActivities)
    .where(and(eq(dailyActivities.userId, userId), eq(dailyActivities.activityDate, activityDate)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDailyActivity(id: number, activity: Partial<InsertDailyActivity>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(dailyActivities).set(activity).where(eq(dailyActivities.id, id));
}

export async function getUserActivities(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(dailyActivities)
    .where(eq(dailyActivities.userId, userId))
    .orderBy(desc(dailyActivities.activityDate));
}

export async function deleteDailyActivity(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(dailyActivities).where(eq(dailyActivities.id, id));
}

export async function getAllActivitiesByDate(activityDate: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(dailyActivities)
    .where(eq(dailyActivities.activityDate, activityDate));
}

export async function getUserTotalPoints(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ total: sql<number>`SUM(${dailyActivities.totalPoints})` })
    .from(dailyActivities)
    .where(eq(dailyActivities.userId, userId));
  
  return result[0]?.total || 0;
}

export async function getAllUsersWithTotalPoints() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      userId: dailyActivities.userId,
      userName: users.name,
      userEmail: users.email,
      totalPoints: sql<number>`SUM(${dailyActivities.totalPoints})`,
    })
    .from(dailyActivities)
    .leftJoin(users, eq(dailyActivities.userId, users.id))
    .groupBy(dailyActivities.userId, users.name, users.email)
    .orderBy(desc(sql`SUM(${dailyActivities.totalPoints})`));
  
  return result;
}

// Leaderboard
export async function createLeaderboardSnapshot(snapshot: InsertLeaderboardSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leaderboardSnapshots).values(snapshot);
  return result;
}

export async function getLatestLeaderboard() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(leaderboardSnapshots)
    .orderBy(desc(leaderboardSnapshots.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getLeaderboardByDate(publishDate: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(leaderboardSnapshots)
    .where(eq(leaderboardSnapshots.publishDate, publishDate))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function saveLeaderboardSnapshot(publishDate: string, rankings: any, publishedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(leaderboardSnapshots).values({
    publishDate,
    rankings: JSON.stringify(rankings),
    publishedBy,
  });
}

export async function getLeaderboardSnapshot(publishDate: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(leaderboardSnapshots)
    .where(eq(leaderboardSnapshots.publishDate, publishDate))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// User Preferences
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserPreferences(prefs: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userPreferences).values(prefs);
}

export async function updateUserPreferences(userId: number, prefs: Partial<InsertUserPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (prefs.notifyOnLeaderboard !== undefined) {
    updateData.notifyOnLeaderboard = prefs.notifyOnLeaderboard ? 1 : 0;
  }
  if (prefs.notifyOnAnnouncements !== undefined) {
    updateData.notifyOnAnnouncements = prefs.notifyOnAnnouncements ? 1 : 0;
  }
  
  if (Object.keys(updateData).length > 0) {
    await db.update(userPreferences).set(updateData).where(eq(userPreferences.userId, userId));
  }
}

// Announcements
export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(announcements).values(announcement);
  return announcement;
}

export async function getAnnouncements() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt));
}

export async function sendAnnouncement(announcementId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get all users
  const allUsers = await db.select().from(users);
  
  // Create delivery records for each user
  for (const user of allUsers) {
    await db.insert(announcementDelivery).values({
      announcementId,
      userId: user.id,
      status: "pending",
    });
  }
  
  // Update announcement status to sent
  await db.update(announcements)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(announcements.id, announcementId));
  
  return { success: true };
}

export async function getAnnouncementDeliveryStats(announcementId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select({
      total: sql<number>`COUNT(*)`,
      pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
      delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
      read: sql<number>`SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END)`,
      failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    })
    .from(announcementDelivery)
    .where(eq(announcementDelivery.announcementId, announcementId));
  
  return result[0] || null;
}

// Admin functions
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

export async function getAllUsersWithActivities() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      activityCount: sql<number>`COUNT(${dailyActivities.id})`,
      totalPoints: sql<number>`COALESCE(SUM(${dailyActivities.totalPoints}), 0)`,
    })
    .from(users)
    .leftJoin(dailyActivities, eq(users.id, dailyActivities.userId))
    .groupBy(users.id, users.name, users.email, users.role)
    .orderBy(desc(sql`COALESCE(SUM(${dailyActivities.totalPoints}), 0)`));
  
  return result;
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserDisplayName(userId: number, displayName: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users).set({ name: displayName }).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user display name:", error);
    throw error;
  }
}

export async function getLeaderboard() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      totalPoints: sql<number>`COALESCE(SUM(${dailyActivities.totalPoints}), 0)`,
    })
    .from(users)
    .leftJoin(dailyActivities, eq(users.id, dailyActivities.userId))
    .groupBy(users.id, users.name, users.email)
    .orderBy(desc(sql`COALESCE(SUM(${dailyActivities.totalPoints}), 0)`));

  return result;
}
