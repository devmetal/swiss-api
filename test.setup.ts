import { beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "@/database";
import { createUser } from "@/auth/service";

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await createUser("test@test.com", "12345");
});
