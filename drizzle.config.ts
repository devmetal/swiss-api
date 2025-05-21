import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "./.env.local" });

export default defineConfig({
  out: "./drizzle",
  dialect: "sqlite",
  schema: "./src/schema.ts",
  dbCredentials: {
    url: process.env.DB,
  },
});
