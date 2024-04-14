CREATE TABLE `games` (
	`id` integer PRIMARY KEY NOT NULL,
	`started` integer NOT NULL,
	`user_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `puzzles` (
	`id` integer PRIMARY KEY NOT NULL,
	`cid` text NOT NULL,
	`score` real,
	`cmc_guessed` integer,
	`cmc_actual` integer NOT NULL,
	`colors_guessed` text,
	`colors_actual` text NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_name_unique` ON `users` (`name`);