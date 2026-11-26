CREATE TABLE `publication` (
	`id` integer PRIMARY KEY NOT NULL,
	`revision` integer NOT NULL,
	`content` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `streamer_access` (
	`id` integer PRIMARY KEY NOT NULL,
	`email` text NOT NULL
);
