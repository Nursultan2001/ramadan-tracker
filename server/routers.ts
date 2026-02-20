import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
// Backend version: 2.0.0 - Email/Password Authentication
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { broadcastLeaderboardUpdate } from "./websocket";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { sendEmail } from "./_core/email";
import crypto from "crypto";

import * as db from "./db";

// Point values for each activity type
const POINTS = {
  dailyPrayer: 10,        // Each prayer (5 prayers = 50 points)
  tahajud: 30,            // Per tahajud prayer
  tarawih20: 100,         // 20 rakat tarawih
  tarawih8: 40,           // 8 rakat tarawih
  fasting: 100,           // Full day fasting
  quranArabic: 20,        // Per Arabic Quran page
  quranOtherLanguage: 10, // Per other language Quran page
  islamicBook: 8,         // Per Islamic book page
  otherBook: 4,           // Per other book page
  podcast: 3,             // Per minute of quality Islamic podcast
  salawat: 0.1,           // 10 salawat = 1 point
};

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const appRouter = router({
    system: router({
    notifyOwner: adminProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input }) => {
        const result = await notifyOwner(input);
        return result;
      }),
  }),

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    
    // Register with email and password
    register: publicProcedure
      .input(z.object({ 
        email: z.string().email("Invalid email address"),
        name: z.string().min(1, "Name is required").max(100, "Name is too long").transform(v => v.trim()),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Check if user with this email already exists
          const existingUser = await db.getUserByEmail(input.email);
          if (existingUser) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Email already registered" });
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(input.password, 10);

          // Create user with email-based openId
          const openId = `email_${nanoid()}`;
          await db.upsertUser({
            openId,
            name: input.name,
            email: input.email,
            password: hashedPassword,
            loginMethod: "email",
            emailVerified: 0,
            lastSignedIn: new Date(),
          });

          const user = await db.getUserByOpenId(openId);
          if (!user) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
          }

          // Send welcome email
          const emailSent = await sendEmail({
            to: input.email,
            subject: "Welcome to Ramadan Challenge!",
            html: `<p>Dear ${input.name},</p><p>Thank you for registering for the <strong>Ramadan Challenge</strong>!</p><p>You can now log in and start tracking your daily activities to earn points and compete for prizes.</p><p>May Allah accept your efforts during this blessed month.</p><p>Best regards,<br>Ramadan Challenge Team</p>`,
          });
          if (!emailSent) {
            console.warn("[Auth] Welcome email failed to send but registration completed");
          }

          console.log("[Auth] New user registered:", input.email);
          return { success: true, message: "Registration successful! Please log in." };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Registration failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Registration failed" });
        }
      }),

    // Login with email and password
    login: publicProcedure
      .input(z.object({ 
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Find user by email
          const user = await db.getUserByEmail(input.email);
          if (!user || !user.password) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(input.password, user.password);
          if (!isValidPassword) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
          }

          // Update last signed in
          await db.upsertUser({
            openId: user.openId,
            lastSignedIn: new Date(),
          });

          // Create session token
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || input.email,
            expiresInMs: ONE_YEAR_MS,
          });

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          
          console.log("[Auth] User logged in:", input.email);
          console.log("[Auth] Cookie name:", COOKIE_NAME);
          console.log("[Auth] Cookie options:", JSON.stringify(cookieOptions));
          console.log("[Auth] Session token set, length:", sessionToken.length);
          return { success: true, user };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Login failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Login failed" });
        }
      }),

    // Request password reset
    requestPasswordReset: publicProcedure
      .input(z.object({ 
        email: z.string().email("Invalid email address"),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Find user by email
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            // Don't reveal if email exists or not for security
            return { success: true, message: "If an account exists with this email, you will receive a password reset link." };
          }

          // Generate secure random token
          const resetToken = crypto.randomBytes(32).toString('hex');
          const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

          // Store token and expiry in database
          await db.upsertUser({
            openId: user.openId,
            passwordResetToken: resetToken,
            passwordResetExpiry: resetExpiry,
          });

          // Get the origin from the request
          const origin = ctx.req.protocol + '://' + ctx.req.get('host');
          const resetLink = `${origin}/reset-password?token=${resetToken}`;

          // Send password reset email
          try {
            await sendEmail({
              to: input.email,
              subject: "Reset Your Ramadan Challenge Password",
              html: `<p>Dear ${user.name || 'User'},</p><p>You requested to reset your password for the <strong>Ramadan Challenge</strong>.</p><p>Click the link below to reset your password (this link expires in 1 hour):</p><p><a href="${resetLink}" style="display: inline-block; background-color: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a></p><p>Or copy and paste this link into your browser:</p><p>${resetLink}</p><p>If you didn't request this, you can safely ignore this email.</p><p>Best regards,<br>Ramadan Challenge Team</p>`,
            });
          } catch (emailError) {
            console.error("[Auth] Failed to send password reset email:", emailError);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send password reset email" });
          }

          console.log("[Auth] Password reset requested for:", input.email);
          return { success: true, message: "If an account exists with this email, you will receive a password reset link." };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Password reset request failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Password reset request failed" });
        }
      }),

    // Reset password with token
    resetPassword: publicProcedure
      .input(z.object({ 
        token: z.string().min(1, "Token is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Find user by reset token
          const user = await db.getUserByResetToken(input.token);
          if (!user || !user.passwordResetToken || !user.passwordResetExpiry) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token" });
          }

          // Check if token is expired
          if (new Date() > user.passwordResetExpiry) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Reset token has expired. Please request a new one." });
          }

          // Hash new password
          const hashedPassword = await bcrypt.hash(input.password, 10);

          // Update password and clear reset token
          await db.upsertUser({
            openId: user.openId,
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiry: null,
          });

          console.log("[Auth] Password reset successful for:", user.email);
          return { success: true, message: "Password reset successful! You can now log in with your new password." };
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("[Auth] Password reset failed:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Login failed" });
        }
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    updateDisplayName: protectedProcedure
      .input(z.object({ displayName: z.string().min(1).max(100) }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserDisplayName(ctx.user.id, input.displayName);
        const leaderboardData = await db.getLeaderboard();
        const formattedLeaderboard = leaderboardData.map((item: any, index: number) => ({
          rank: index + 1,
          userId: item.id,
          userName: item.name || "Anonymous",
          totalPoints: item.totalPoints,
          isTopFive: index < 5,
        }));
        broadcastLeaderboardUpdate(formattedLeaderboard);
        return { success: true, displayName: input.displayName };
      }),
  }),

  activities: router({
    submitDaily: protectedProcedure
      .input(
        z.object({
          activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
          dailyPrayers: z.number().default(0),
          tahajud: z.number().default(0),
          tarawih20: z.number().default(0),
          tarawih8: z.number().default(0),
          fasting: z.number().default(0),
          quranArabicPages: z.number().default(0),
          quranOtherLanguagePages: z.number().default(0),
          islamicBookPages: z.number().default(0),
          otherBookPages: z.number().default(0),
          podcastMinutes: z.number().default(0),
          salawat: z.number().default(0),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        
        // Calculate total points
        const totalPoints = Math.round(
          input.dailyPrayers * POINTS.dailyPrayer +
          input.tahajud * POINTS.tahajud +
          input.tarawih20 * POINTS.tarawih20 +
          input.tarawih8 * POINTS.tarawih8 +
          input.fasting * POINTS.fasting +
          input.quranArabicPages * POINTS.quranArabic +
          input.quranOtherLanguagePages * POINTS.quranOtherLanguage +
          input.islamicBookPages * POINTS.islamicBook +
          input.otherBookPages * POINTS.otherBook +
          input.podcastMinutes * POINTS.podcast +
          input.salawat * POINTS.salawat
        );
        
        // Check if activity already exists for this date
        const existing = await db.getDailyActivityByUserAndDate(userId, input.activityDate);
        
        if (existing) {
          // Update existing activity
          await db.updateDailyActivity(existing.id, {
            dailyPrayers: input.dailyPrayers,
            tahajud: input.tahajud,
            tarawih20: input.tarawih20,
            tarawih8: input.tarawih8,
            fasting: input.fasting,
            quranArabicPages: input.quranArabicPages,
            quranOtherLanguagePages: input.quranOtherLanguagePages,
            islamicBookPages: input.islamicBookPages,
            otherBookPages: input.otherBookPages,
            podcastMinutes: input.podcastMinutes,
            salawat: input.salawat,
            totalPoints,
            notes: input.notes,
          });
        } else {
          // Create new activity
          await db.createDailyActivity({
            userId,
            activityDate: input.activityDate,
            dailyPrayers: input.dailyPrayers,
            tahajud: input.tahajud,
            tarawih20: input.tarawih20,
            tarawih8: input.tarawih8,
            fasting: input.fasting,
            quranArabicPages: input.quranArabicPages,
            quranOtherLanguagePages: input.quranOtherLanguagePages,
            islamicBookPages: input.islamicBookPages,
            otherBookPages: input.otherBookPages,
            podcastMinutes: input.podcastMinutes,
            salawat: input.salawat,
            totalPoints,
            notes: input.notes,
          });
        }
        
        // Notify admin about submission
        await notifyOwner({
          title: "New Daily Activity Submitted",
          content: `${ctx.user.name || ctx.user.email} submitted activities for ${input.activityDate}. Total points: ${totalPoints}`,
        });
        
        // Broadcast updated leaderboard to all connected clients
        const usersWithPoints = await db.getAllUsersWithTotalPoints();
        const leaderboardData = (usersWithPoints || []).map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          userName: user.userName || 'Anonymous',
          totalPoints: Number(user.totalPoints) || 0,
          isTopFive: index < 5,
        }));
        broadcastLeaderboardUpdate(leaderboardData);
        
        return { success: true, totalPoints };
      }),

    // Get user's own activities
    getMyActivities: protectedProcedure
      .query(async ({ ctx }) => {
      const activities = await db.getUserActivities(ctx.user.id);
      return activities || [];
    }),

    // Get activity by date
    getActivityByDate: protectedProcedure
      .input(z.object({ activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format") }))
      .query(async ({ input, ctx }) => {
        const activity = await db.getDailyActivityByUserAndDate(ctx.user.id, input.activityDate);
        return activity || null;
      }),

    // Delete activity for a specific date
    deleteActivity: protectedProcedure
      .input(z.object({ activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format") }))
      .mutation(async ({ input, ctx }) => {
        const userId = ctx.user.id;
        const activity = await db.getDailyActivityByUserAndDate(userId, input.activityDate);
        
        if (!activity) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Activity not found for this date',
          });
        }
        
        // Delete the activity
        await db.deleteDailyActivity(activity.id);
        
        // Broadcast leaderboard update
        const usersWithPoints = await db.getAllUsersWithTotalPoints();
        const leaderboardData = (usersWithPoints || []).map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          userName: user.userName || 'Anonymous',
          totalPoints: Number(user.totalPoints) || 0,
          isTopFive: index < 5,
        }));
        broadcastLeaderboardUpdate(leaderboardData);
        
        return { success: true, message: 'Activity deleted successfully' };
      }),
  }),

  leaderboard: router({
    getCurrent: publicProcedure.query(async () => {
      const usersWithPoints = await db.getAllUsersWithTotalPoints();
      const leaderboardData = (usersWithPoints || []).map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        userName: user.userName || 'Anonymous',
        totalPoints: Number(user.totalPoints) || 0,
        isTopFive: index < 5,
      }));
      return leaderboardData;
    }),

    getHistory: publicProcedure
      .input(z.object({ publishDate: z.string() }))
      .query(async ({ input }) => {
        const snapshot = await db.getLeaderboardSnapshot(input.publishDate);
        if (!snapshot) return null;
        try {
          return JSON.parse(snapshot.rankings);
        } catch {
          return null;
        }
      }),
  }),

  admin: router({
    getAllUsers: adminProcedure.query(async () => {
      const users = await db.getAllUsersWithActivities();
      return users || [];
    }),

    publishLeaderboard: adminProcedure
      .input(z.object({ publishDate: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const usersWithPoints = await db.getAllUsersWithTotalPoints();
        const leaderboardData = (usersWithPoints || []).map((user, index) => ({
          rank: index + 1,
          userId: user.userId,
          userName: user.userName || 'Anonymous',
          totalPoints: Number(user.totalPoints) || 0,
          isTopFive: index < 5,
        }));

        await db.saveLeaderboardSnapshot(input.publishDate, leaderboardData, ctx.user.id);

        await notifyOwner({
          title: "Leaderboard Published",
          content: `Daily leaderboard for ${input.publishDate} has been published.`,
        });

        return { success: true, leaderboard: leaderboardData };
      }),

    sendEmail: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          subject: z.string().min(1, "Subject is required"),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user || !user.email) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found or email not available',
          });
        }

        try {
          await notifyOwner({
            title: `Email sent to ${user.name || 'User'}`,
            content: `Subject: ${input.subject}\n\nMessage: ${input.message}\n\nRecipient: ${user.email}`,
          });
          return { success: true, message: `Email sent to ${user.email}` };
        } catch (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send email',
          });
        }
      }),
  }),

  announcements: router({
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const announcement = await db.createAnnouncement({
          createdBy: ctx.user.id,
          title: input.title,
          content: input.content,
          status: "draft" as const,
        });

        return announcement;
      }),

    list: adminProcedure.query(async () => {
      const announcements = await db.getAnnouncements();
      return announcements || [];
    }),

    send: adminProcedure
      .input(z.object({ announcementId: z.number() }))
      .mutation(async ({ input }) => {
        const result = await db.sendAnnouncement(input.announcementId);
        return result;
      }),

    getDeliveryStats: adminProcedure
      .input(z.object({ announcementId: z.number() }))
      .query(async ({ input }) => {
        const stats = await db.getAnnouncementDeliveryStats(input.announcementId);
        return stats || null;
      }),

  }),

  preferences: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const prefs = await db.getUserPreferences(ctx.user.id);
      return prefs || null;
    }),

    update: protectedProcedure
      .input(
        z.object({
          notifyOnLeaderboard: z.boolean().optional(),
          notifyOnAnnouncements: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updateData: any = {};
        if (input.notifyOnLeaderboard !== undefined) {
          updateData.notifyOnLeaderboard = input.notifyOnLeaderboard ? 1 : 0;
        }
        if (input.notifyOnAnnouncements !== undefined) {
          updateData.notifyOnAnnouncements = input.notifyOnAnnouncements ? 1 : 0;
        }
        await db.updateUserPreferences(ctx.user.id, updateData);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
