import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { env, isDevelopment } from "~/utils/env.server";

const db = drizzle(env.DATABASE_URL, {
  schema,
  logger: isDevelopment,
});
export { db };
