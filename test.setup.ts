import { beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "@/database";

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
});
