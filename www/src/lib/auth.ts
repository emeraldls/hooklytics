import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "~/db";
import {
  user,
  account,
  session,
  verification,
  jwks,
} from "~/schemas/auth-schema";
import { reactStartCookies } from "better-auth/react-start";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
      jwks,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [reactStartCookies(), jwt()],
});
