import { beforeAll } from "bun:test";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "@server//database";
import { createUser } from "@server//auth/service";

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await createUser("test@test.com", "12345");
});
