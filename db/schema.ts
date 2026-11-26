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
