import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { db } from "@server//database";

migrate(db, { migrationsFolder: "./drizzle" });
