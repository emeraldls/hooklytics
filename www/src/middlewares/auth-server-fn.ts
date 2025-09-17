import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { getSession } from "~/lib/auth-client";

export const canExecServerFn = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      const request = getWebRequest();
      const session = await getSession({
        fetchOptions: {
          headers: request.headers,
        },
      });

      if (!session.data?.session && !session.data?.user) {
        throw Error("unauthenticated");
      }

      const {
        data: { user },
        error,
      } = session;
      if (error) {
        console.error(error);
        throw Error(`Something went wrong in session: `);
      }
      return next({ context: { user } });
    } catch (err) {
      console.error("Error occured in canServerFn: ", err);
      throw Error("something went wrong");
    }
  }
);
