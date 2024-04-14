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

export async function createGame(game: {
  owner: number;
  label?: string;
  desc?: string;
  location?: string;
}) {
  const random = new Uint32Array(10);
  crypto.getRandomValues(random);

  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(`${game.desc}${game.label}${game.location}`);
  hasher.update(random);

  const code = hasher.digest("hex").substring(0, 5);

  const [result] = await db
    .insert(games)
    .values({
      code,
      ...game,
    })
    .returning();

  return result;
}
