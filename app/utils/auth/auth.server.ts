import "dotenv/config";
import { betterAuth } from "better-auth";
import { db } from "~/db/db.server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env, isDevelopment } from "../env.server";

let _auth: ReturnType<typeof betterAuth>;

// Альтернатива Cloudflare R2 (например, S3 или локальное хранилище)
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

export function serverAuth() {
  if (!_auth) {
    console.log(env.BETTER_AUTH_URL);

    _auth = betterAuth({
      baseUrl: env.BETTER_AUTH_URL || "http://localhost",
      trustedOrigins: [env.BETTER_AUTH_URL!],

      database: drizzleAdapter(db, {
        provider: "pg",
      }),

      // Замена KV-хранилища на Redis
      // secondaryStorage: {
      //   get: async (key) => await redis.get(`_auth:${key}`),
      //   set: async (key, value, ttl) =>
      //     await redis.set(`_auth:${key}`, JSON.stringify(value), "EX", ttl),
      //   delete: async (key) => await redis.del(`_auth:${key}`),
      // },

      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }) => {
          if (isDevelopment) {
            console.log("Password reset URL:", url);
          } else {
            // Реальная отправка email (Nodemailer, SendGrid и т.д.)
          }
        },
      },

      emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }) => {
          if (isDevelopment) {
            console.log("Verification URL:", url);
          } else {
            // Реальная отправка email
          }
        },
      },

      socialProviders: {
        vk: {
          clientId: env.VK_CLIENT_ID || "",
          clientSecret: env.VK_CLIENT_SECRET || "",
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
        window: 60,
        max: 10,
      },
    });
  }

  return _auth;
}
