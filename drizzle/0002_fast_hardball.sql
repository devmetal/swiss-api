CREATE TABLE `matches` (
	`id` integer PRIMARY KEY NOT NULL,
	`no` integer NOT NULL,
	`round_id` integer NOT NULL,
	`player_a` integer NOT NULL,
	`player_b` integer NOT NULL,
	`player_a_score` integer DEFAULT 0,
	`player_b_score` integer DEFAULT 0,
	FOREIGN KEY (`round_id`) REFERENCES `rounds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_a`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_b`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rounds` (
	`id` integer PRIMARY KEY NOT NULL,
	`no` integer NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tables` (
	`id` integer PRIMARY KEY NOT NULL,
	`no` integer NOT NULL,
	`label` text,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users_to_games` (
	`user_id` integer NOT NULL,
	`game_id` integer NOT NULL,
	PRIMARY KEY(`game_id`, `user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade
);
