import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  email: text("name").notNull().unique(),
  password: text("password").notNull(),
});

export type User = typeof users.$inferSelect;
