CREATE TABLE `games` (
	`id` integer PRIMARY KEY NOT NULL,
	`started` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`open` integer DEFAULT true,
	`location` text,
	`label` text,
	`desc` text,
	`code` text NOT NULL,
	`owner` integer NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_code_unique` ON `games` (`code`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);