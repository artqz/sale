import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  // Auth
  ...prefix("auth", [
    route("/sign-in", "routes/auth/signIn.tsx"),
    route("/sign-up", "routes/auth/signUp.tsx"),
    route("/sign-out", "routes/auth/signOut.tsx"),
    route("forget-password", "routes/auth/forgetPassword.tsx"),
    route("reset-password", "routes/auth/resetPassword.tsx"),
  ]),

  // Main routes
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),

    // Settings
    ...prefix("settings", [
      layout("routes/settings/layout.tsx", [
        route("account", "routes/settings/account.tsx"),
        route("appearance", "routes/settings/appearance.tsx"),
        route("connections", "routes/settings/connections.tsx"),
        route("password", "routes/settings/password.tsx"),
        route("sessions", "routes/settings/sessions.tsx"),
      ]),
    ]),
  ]),

  // API
  ...prefix("api", [
    // route("auth/error", "routes/api/better-error.tsx"),
    route("auth/*", "routes/api/better.ts"),
    route("color-scheme", "routes/api/colorScheme.ts"),
  ]),

  // Not found
  route("*", "routes/notFound.tsx"),
] satisfies RouteConfig;
