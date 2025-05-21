import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";

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
  closed: integer("closed", { mode: "boolean" }),
  location: text("location"),
  label: text("label"),
  desc: text("desc"),
  code: text("code").notNull().unique(),
  owner: integer("owner").notNull(),
});

export const tables = sqliteTable("tables", {
  id: integer("id").primaryKey(),
  no: integer("no").notNull(),
  label: text("label"),
  gameId: integer("game_id")
    .references(() => games.id, { onDelete: "cascade" })
    .notNull(),
});

export const rounds = sqliteTable("rounds", {
  id: integer("id").primaryKey(),
  no: integer("no").notNull(),
  gameId: integer("game_id")
    .references(() => games.id, { onDelete: "cascade" })
    .notNull(),
});

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey(),
  no: integer("no").notNull(),
  roundId: integer("round_id")
    .references(() => rounds.id, { onDelete: "cascade" })
    .notNull(),
  playerA: integer("player_a")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  playerB: integer("player_b")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  playerAScore: integer("player_a_score").default(0),
  playerBScore: integer("player_b_score").default(0),
});

export const usersToGames = sqliteTable(
  "users_to_games",
  {
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    gameId: integer("game_id")
      .references(() => games.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.gameId] })]
);

export const usersRelations = relations(users, ({ many }) => ({
  games: many(games),
  playing: many(usersToGames),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  owner: one(users, {
    fields: [games.owner],
    references: [users.id],
  }),
  players: many(usersToGames),
}));

export const usersToGamesRelations = relations(usersToGames, ({ one }) => ({
  player: one(users, {
    fields: [usersToGames.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [usersToGames.gameId],
    references: [games.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type CreateGameInput = typeof games.$inferInsert;
export type UpdateGameInput = Partial<typeof games.$inferInsert>;
