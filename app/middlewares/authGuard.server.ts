import { redirect, type unstable_MiddlewareFunction } from "react-router";
import { getServerSession } from "~/utils/auth/auth.server";
import { authSessionContext } from "~/utils/contexts";

const publicRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forget-password",
  "/auth/reset-password",
  "/api/auth/*",
  "/api/color-scheme",
  "/images",
];

export const authMiddleware: unstable_MiddlewareFunction = async (
  { request, context },
  next,
) => {
  const url = new URL(request.url);
  const isPublic = publicRoutes.some((path) => url.pathname.startsWith(path));

  if (isPublic) {
    return await next();
  }

  const authSession = await getServerSession(request);

  if (!authSession) {
    throw redirect(`/auth/sign-in?redirectTo=${url.pathname}`);
  }

  console.log(authSession.user.role);


  if (url.pathname.startsWith("/admin") && authSession.user.role !== "admin") {
    throw redirect("/");
  }

  context.set(authSessionContext, authSession);

  return await next();
};

export const noAuthMiddleware: unstable_MiddlewareFunction = async (
  { request },
  next,
) => {
  const authSession = await getServerSession(request);

  if (authSession) {
    throw redirect("/home");
  }

  return await next();
};