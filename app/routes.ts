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
    layout("routes/auth/layout.tsx", [
      route("/sign-in", "routes/auth/signIn.tsx"),
      route("/sign-up", "routes/auth/signUp.tsx"),
      route("/sign-out", "routes/auth/signOut.tsx"),]),
    route("forget-password", "routes/auth/forgetPassword.tsx"),
    route("reset-password", "routes/auth/resetPassword.tsx"),
  ]),

  // Admin routes
  ...prefix("admin", [
    layout("routes/admin/layout.tsx", [
      index("routes/admin/dashboard.tsx"),
      route("users", "routes/admin/users/index.tsx"),
    ]),
  ]),

  // Docs routes
  ...prefix("docs", [
    layout("routes/docs/layout.tsx", [
      index("routes/docs/index.tsx"),
      route("add", "routes/docs/add.tsx"),
      ...prefix(":documentId", [
        layout("routes/docs/documentId/edit/layout.tsx", [
          route("edit", "routes/docs/documentId/edit/index.tsx", [
            route("upload", "routes/api/docs/upload.ts")
          ]),
          route("links", "routes/docs/documentId/edit/links.tsx"),
          route("huy", "routes/docs/documentId/edit/huy.tsx"),
        ])
      ]),
    ])
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
    route("auth/error", "routes/api/betterError.tsx"),
    route("auth/*", "routes/api/better.ts"),
    route("color-scheme", "routes/api/colorScheme.ts"),

    ...prefix("docs", [
      layout("routes/api/docs/layout.tsx", [
        route("add-document", "routes/api/docs/addDocument.ts"),
        // route("upload", "routes/api/docs/upload.ts")
      ])
    ])
  ]),

  // Not found
  route("*", "routes/notFound.tsx"),

] satisfies RouteConfig;
