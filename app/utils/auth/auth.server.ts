import { type BetterAuthOptions, betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "~/db/db.server";
import { env } from "~/utils/env.server";

const options = {
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      adminUserIds: ["sqCEdnBmlv7IGavmng4ghfTDY3v3gaCV"],
      impersonationSessionDuration: 60 * 60 * 24, // 1 day
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  // secondaryStorage: {
  //   get: async (key) => await env.APP_KV.get(`_auth:${key}`, "json"),
  //   set: async (key, value, ttl) =>
  //     await env.APP_KV.put(`_auth:${key}`, JSON.stringify(value), {
  //       expirationTtl: ttl,
  //     }),
  //   delete: async (key) => await env.APP_KV.delete(`_auth:${key}`),
  // },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }) => {
      if (env.ENVIRONMENT === "development") {
        console.log("Send email to reset password");
        console.log("User", user);
        console.log("URL", url);
        console.log("Token", token);
      } else {
        // Send email to user ...
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      if (env.ENVIRONMENT === "development") {
        console.log("Send email to verify email address");
        console.log(user, url, token);
      } else {
        // Send email to user ...
      }
    },
  },
  socialProviders: {
    vk: {
      clientId: process.env.VK_CLIENT_ID || "",
      clientSecret: process.env.VK_CLIENT_SECRET || "",
    },
  },

  user: {
    deleteUser: {
      enabled: true,
      afterDelete: async (user) => {
        if (user.image) {
          await deleteUserImageFromStorage(user.image);
        }
      },
    },
  },
  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60, // time window in seconds
    max: 10, // max requests in the window
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for", "x-real-ip"],
    },

  },
} satisfies BetterAuthOptions;

/* let _serverAuth: ReturnType<typeof betterAuth>;

export const serverAuth = () => {
  if (!_serverAuth) {
    _serverAuth = betterAuth({
      ...options,
      plugins: [...(options.plugins ?? [])],
    });
  }

  return _serverAuth;
}; */

export const serverAuth = betterAuth({
  ...options,
  plugins: [...(options.plugins ?? [])],
});

export const getServerSession = async (request: Request) => {
  const session = await serverAuth.api.getSession({
    headers: request.headers,
  });
  return session;
};

export async function deleteUserImageFromStorage(imageUrl: string | null) {
  if (!imageUrl) return;

  const isExternalUrl =
    imageUrl.startsWith("http://") || imageUrl.startsWith("https://");

  if (!isExternalUrl) {
    // Реализация удаления файла (например, через AWS S3)
    console.log(`Удаляем файл: ${imageUrl}`);
    // await s3.deleteObject({ Key: imageUrl }).promise();
  }
}