import { defineConfig } from "drizzle-kit";
import { DATABASE_URL } from "~/lib/env";

export default defineConfig({
  schema: ["./src/schemas/auth-schema.ts", "./src/schemas/website-schema.ts"],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
