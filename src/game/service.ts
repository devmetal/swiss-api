import { db } from "@/database";
import { type CreateGameInput, games } from "@/schema";
import { and, eq } from "drizzle-orm";

export async function getGamesByUserId(uid: number) {
  const [result] = await db.select().from(games).where(eq(games.owner, uid));
  return result;
}

export async function getGameByIdAndUserId(gid: number, uid: number) {
  const [result] = await db
    .select()
    .from(games)
    .where(and(eq(games.id, gid), eq(games.owner, uid)));

  return result;
}

export async function getGameByCode(code: string) {
  const [result] = await db.select().from(games).where(eq(games.code, code));
  return result;
}

export async function createGame(game: CreateGameInput) {
  const [result] = await db.insert(games).values(game).returning();
  return result;
}
