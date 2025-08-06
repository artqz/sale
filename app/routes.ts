import {
  index,
  layout,
  prefix,
  type RouteConfig,
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

    // Deals
    ...prefix("deals", [
      index("routes/deals/index.tsx"),
      route("add", "routes/deals/add.tsx"),
      route(":dealId", "routes/deals/$dealId.tsx"),
    ]),

    // Forum
    ...prefix("forum", [
      index("routes/forum/index.tsx"),
      ...prefix("topics", [
        route(":topicId", "routes/forum/topics/$topicId.tsx"),
      ]),
    ]),

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
    route("comments", "routes/api/comments.ts"),
    route("upload-image", "routes/api/uploadImage.ts"),
  ]),

  // Not found
  route("*", "routes/notFound.tsx"),
] satisfies RouteConfig;
