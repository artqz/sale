import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const db = drizzle(process.env.DATABASE_URL!, {
  schema,
  logger: process.env.ENVIRONMENT === "development",
});
export { db };
