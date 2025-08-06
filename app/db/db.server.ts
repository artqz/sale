import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { env } from "~/utils/env.server";

const db = drizzle(env.DATABASE_URL, {
  schema,
  logger: process.env.ENVIRONMENT === "development",
});
export { db };
