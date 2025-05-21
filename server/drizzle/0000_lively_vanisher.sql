CREATE TABLE `games` (
	`id` integer PRIMARY KEY NOT NULL,
	`started` text DEFAULT ( strftime('%Y-%m-%dT%H:%M:%SZ') ) NOT NULL,
	`open` integer DEFAULT true,
	`closed` integer,
	`location` text,
	`label` text,
	`desc` text,
	`code` text NOT NULL,
	`owner` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_code_unique` ON `games` (`code`);--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`seat` integer NOT NULL,
	`table_id` integer NOT NULL,
	`round_id` integer NOT NULL,
	`player` integer NOT NULL,
	`player_score` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY NOT NULL,
	`no` integer NOT NULL,
	`game_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` integer PRIMARY KEY NOT NULL,
	`no` integer NOT NULL,
	`game_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);--> statement-breakpoint
CREATE TABLE `users_to_games` (
	`user_id` integer NOT NULL,
	`game_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `game_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
