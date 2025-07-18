import { redirect, type unstable_MiddlewareFunction } from "react-router";
import { serverAuth } from "../auth/auth.server";
import { authSessionContext } from "../contexts";

export async function getAuthSession(request: Request) {
  const auth = serverAuth();
  const authSession = await auth.api.getSession({
    headers: request.headers,
    query: {
      disableCookieCache: true,
    },
  });
  return authSession;
}

export const authMiddleware: unstable_MiddlewareFunction = async (
  { request, context },
  next
) => {
  const authSession = await getAuthSession(request);

  if (!authSession) {
    throw redirect("/auth/sign-in");
  }

  context.set(authSessionContext, authSession);

  return await next();
};

export const noAuthMiddleware: unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  const authSession = await getAuthSession(request);

  if (authSession) {
    throw redirect("/home");
  }

  return await next();
};
