CREATE TABLE `admin_sessions` (
	`digest` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `login_windows` (
	`client` text PRIMARY KEY NOT NULL,
	`resets_at` integer NOT NULL,
	`attempts` integer NOT NULL
);
