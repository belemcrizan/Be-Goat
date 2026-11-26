import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const publication = sqliteTable("publication", {
  id: integer("id").primaryKey(),
  revision: integer("revision").notNull(),
  content: text("content").notNull(),
});

export const streamerAccess = sqliteTable("streamer_access", {
  id: integer("id").primaryKey(),
  email: text("email").notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  digest: text("digest").primaryKey(),
  expiresAt: integer("expires_at").notNull(),
});

export const loginWindows = sqliteTable("login_windows", {
  client: text("client").primaryKey(),
  resetsAt: integer("resets_at").notNull(),
  attempts: integer("attempts").notNull(),
});
