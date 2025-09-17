import { drizzle } from "drizzle-orm/node-postgres";
import { DATABASE_URL } from "~/lib/env";

export const db = drizzle(DATABASE_URL);
