import { createAuthClient } from "better-auth/react";
import { BETTER_AUTH_URL } from "~/lib/env";
import { jwtClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  baseURL: BETTER_AUTH_URL,
  plugins: [jwtClient()],
});

export const getAuthToken = () => authClient.token();

export const { signIn, signUp, useSession, getSession, signOut } = authClient;
