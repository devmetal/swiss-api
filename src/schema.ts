import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("name").notNull().unique(),
  password: text("password").notNull(),
});

export const games = sqliteTable("games", {
  id: integer("id").primaryKey(),
  started: text("started")
    .notNull()
    .default(sql`( strftime('%Y-%m-%dT%H:%M:%SZ') )`),
  open: integer("open", { mode: "boolean" }).default(true),
  location: text("location"),
  label: text("label"),
  desc: text("desc"),
  code: text("code").notNull().unique(),
  owner: integer("owner")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type CreateGameInput = typeof games.$inferInsert;
