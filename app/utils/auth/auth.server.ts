import "dotenv/config";
import { betterAuth } from "better-auth";
import { db } from "~/db/db.server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

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
    console.log(process.env.BETTER_AUTH_URL);

    _auth = betterAuth({
      baseUrl: process.env.BETTER_AUTH_URL || "http://localhost",
      trustedOrigins: [process.env.BETTER_AUTH_URL!],

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
          if (process.env.NODE_ENV === "development") {
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
          if (process.env.NODE_ENV === "development") {
            console.log("Verification URL:", url);
          } else {
            // Реальная отправка email
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
        window: 60,
        max: 10,
      },
    });
  }

  return _auth;
}
