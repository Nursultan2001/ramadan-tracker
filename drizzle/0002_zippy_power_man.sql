CREATE TABLE `announcementDelivery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`announcementId` int NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','delivered','read','failed') NOT NULL DEFAULT 'pending',
	`deliveredAt` timestamp,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcementDelivery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`createdBy` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` enum('draft','sent','archived') NOT NULL DEFAULT 'draft',
	`sentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `motivationalMessages`;--> statement-breakpoint
ALTER TABLE `userPreferences` MODIFY COLUMN `notifyOnLeaderboard` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `dailyPrayers` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `tahajud` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `tarawih20` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `tarawih8` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `fasting` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `quranArabicPages` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `quranOtherLanguagePages` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `islamicBookPages` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `otherBookPages` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `juzPages` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `podcastMinutes` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` ADD `salawat` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD `notifyOnAnnouncements` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `dailyActivities` DROP COLUMN `quranPages`;--> statement-breakpoint
ALTER TABLE `dailyActivities` DROP COLUMN `readingPages`;--> statement-breakpoint
ALTER TABLE `dailyActivities` DROP COLUMN `prayersCompleted`;--> statement-breakpoint
ALTER TABLE `userPreferences` DROP COLUMN `notifyMotivational`;