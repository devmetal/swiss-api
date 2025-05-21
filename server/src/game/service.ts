import { db } from "@server//database";
import { games, type UpdateGameInput } from "@server//schema";
import { and, eq } from "drizzle-orm";

export async function getGamesByUserId(uid: number) {
  const result = await db.select().from(games).where(eq(games.owner, uid));
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

const genCode = (seed: string[]): string => {
  const random = new Uint32Array(10);
  crypto.getRandomValues(random);

  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(seed.join(""));
  hasher.update(random);

  return hasher.digest("hex").substring(0, 5);
};

export async function createGame(game: {
  owner: number;
  label?: string;
  desc?: string;
  location?: string;
}) {
  const code = genCode([
    game.label ?? "",
    game.desc ?? "",
    game.location ?? "",
  ]);

  const [result] = await db
    .insert(games)
    .values({
      code,
      ...game,
    })
    .returning();

  return result;
}

export async function updateGame(
  uid: number,
  gid: number,
  game: UpdateGameInput
) {
  const [result] = await db
    .update(games)
    .set(game)
    .where(and(eq(games.id, gid), eq(games.owner, uid)))
    .returning();

  return result;
}
