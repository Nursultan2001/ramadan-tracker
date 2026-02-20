import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Unique identifier: OAuth openId or email-based ID for password auth */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  /** Hashed password for email/password authentication */
  password: varchar("password", { length: 255 }),
  /** Email verification status */
  emailVerified: int("emailVerified").default(0).notNull(),
  /** Password reset token for forgot password flow */
  passwordResetToken: varchar("passwordResetToken", { length: 255 }),
  /** Password reset token expiry timestamp */
  passwordResetExpiry: timestamp("passwordResetExpiry"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Daily activities submitted by users
 * Tracks all Ramadan activities with comprehensive point system
 */
export const dailyActivities = mysqlTable("dailyActivities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  /** Date of the activity (YYYY-MM-DD format) */
  activityDate: varchar("activityDate", { length: 10 }).notNull(),
  
  // Prayer activities (10 points each)
  /** Number of daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha) - 10 points each */
  dailyPrayers: int("dailyPrayers").default(0).notNull(),
  /** Tahajud prayer count - 30 points each */
  tahajud: int("tahajud").default(0).notNull(),
  /** Tarawih 20 rakat - 100 points */
  tarawih20: int("tarawih20").default(0).notNull(),
  /** Tarawih 8 rakat - 40 points */
  tarawih8: int("tarawih8").default(0).notNull(),
  /** Fasting (full day) - 100 points */
  fasting: int("fasting").default(0).notNull(),
  
  // Quran reading activities
  /** Arabic Quran pages - 20 points each */
  quranArabicPages: int("quranArabicPages").default(0).notNull(),
  /** Quran in other languages - 10 points each */
  quranOtherLanguagePages: int("quranOtherLanguagePages").default(0).notNull(),
  
  // Reading activities
  /** Islamic book pages - 8 points each */
  islamicBookPages: int("islamicBookPages").default(0).notNull(),
  /** Other book pages - 4 points each */
  otherBookPages: int("otherBookPages").default(0).notNull(),
  
  // Audio activities
  /** Islamic podcast minutes (quality content) - 3 points per minute */
  podcastMinutes: int("podcastMinutes").default(0).notNull(),
  
  // Salawat (blessings)
  /** Salawat count (10 salawat = 1 point) */
  salawat: int("salawat").default(0).notNull(),
  
  /** Total points earned for this day */
  totalPoints: int("totalPoints").default(0).notNull(),
  /** Additional notes from user */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyActivity = typeof dailyActivities.$inferSelect;
export type InsertDailyActivity = typeof dailyActivities.$inferInsert;

/**
 * Leaderboard snapshots published by admin
 * Stores daily rankings for historical tracking
 */
export const leaderboardSnapshots = mysqlTable("leaderboardSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  /** Date for which this leaderboard was published */
  publishDate: varchar("publishDate", { length: 10 }).notNull(),
  /** JSON array of user rankings with scores */
  rankings: text("rankings").notNull(),
  /** Admin who published this leaderboard */
  publishedBy: int("publishedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type InsertLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;

/**
 * User notification preferences and history
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  /** Receive notifications when leaderboard is published */
  notifyOnLeaderboard: int("notifyOnLeaderboard").default(1).notNull(),
  /** Receive announcements from admin */
  notifyOnAnnouncements: int("notifyOnAnnouncements").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Admin announcements sent to participants
 */
export const announcements = mysqlTable("announcements", {
  id: int("id").autoincrement().primaryKey(),
  /** Admin who created the announcement */
  createdBy: int("createdBy").notNull(),
  /** Announcement title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Announcement content */
  content: text("content").notNull(),
  /** Announcement status: draft, sent, archived */
  status: mysqlEnum("status", ["draft", "sent", "archived"]).default("draft").notNull(),
  /** When the announcement was sent */
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;

/**
 * Tracks delivery status of announcements to each user
 */
export const announcementDelivery = mysqlTable("announcementDelivery", {
  id: int("id").autoincrement().primaryKey(),
  /** Announcement ID */
  announcementId: int("announcementId").notNull(),
  /** User ID */
  userId: int("userId").notNull(),
  /** Delivery status: pending, delivered, read, failed */
  status: mysqlEnum("status", ["pending", "delivered", "read", "failed"]).default("pending").notNull(),
  /** When the announcement was delivered to user */
  deliveredAt: timestamp("deliveredAt"),
  /** When the user read the announcement */
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnnouncementDelivery = typeof announcementDelivery.$inferSelect;
export type InsertAnnouncementDelivery = typeof announcementDelivery.$inferInsert;
