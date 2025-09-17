import {
  pgTable,
  serial,
  text,
  varchar,
  uuid,
  date,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const website = pgTable(
  "website",
  {
    id: uuid("id").primaryKey(),
    domain: text("domain").notNull().unique(),
    name: text("name").notNull(),
    user_id: text("user_id").references(() => user.id),
    client_id: text("client_id"),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
  },
  (table) => [
    index("website_user_id_idx").on(table.user_id),
    index("website_client_id_idx").on(table.client_id),
  ]
);
