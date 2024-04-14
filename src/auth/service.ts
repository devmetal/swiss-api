import { db } from "@/database";
import { users } from "@/schema";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(id: number) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
}

export async function isUserAlready(email: string) {
  return !!(await getUserByEmail(email));
}

export async function createUser(email: string, password: string) {
  const hash = await Bun.password.hash(password, { algorithm: "bcrypt" });

  const [user] = await db
    .insert(users)
    .values({ email, password: hash })
    .returning();

  return user;
}

export async function checkEmailAndPassword(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  if (!(await Bun.password.verify(password, user.password))) {
    return null;
  }

  return user;
}
