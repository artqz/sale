import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Better auth tables
// Added indexes based on the table provided by Better auth
// https://www.better-auth.com/docs/concepts/database
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull(),
    image: text("image"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [index("user_email_idx").on(table.email)]
);

export const userRelations = relations(user, ({ many }) => ({
  deals: many(deal),
  comments: many(comment),
  commentRatings: many(commentRating),
}));

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    index("session_token_idx").on(table.token),
  ]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("account_userId_idx").on(table.userId),
    index("account_providerId_accountId_idx").on(
      table.providerId,
      table.accountId
    ),
  ]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true }),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

export const rateLimit = pgTable(
  "rateLimit",
  {
    id: text("id").primaryKey().notNull(),
    key: text("key"),
    count: integer("count"),
    lastRequest: integer("lastRequest"),
  },
  (table) => [index("rateLimit_key_idx").on(table.key)]
);

export const deal = pgTable(
  "deal",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    body: json("body"),
    image: text("image"),
    slug: text("slug").notNull().default("default-slug"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt", { withTimezone: true }),
    updatedAt: timestamp("updatedAt", { withTimezone: true }),
  },
  (table) => [index("deal_userId_idx").on(table.userId)]
);

export const dealRating = pgTable(
  "dealRating",
  {
    id: serial("id").primaryKey(),
    dealId: integer("dealId")
      .notNull()
      .references(() => deal.id, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(), // 1 для лайка, -1 для дизлайка
    createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("dealRating_dealId_idx").on(table.dealId),
    index("dealRating_userId_idx").on(table.userId),
    // Уникальный индекс для предотвращения повторных голосов
    index("dealRating_dealId_userId_idx").on(table.dealId, table.userId),
  ]
);

// Универсальная система комментариев
export const comment = pgTable("comment", {
  id: serial("id").primaryKey(),
  entityId: text("entityId").notNull(), // ID сущности (может быть число или строка)
  entityType: text("entityType").notNull(), // Тип сущности ('deal', 'forum_topic', etc.)
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  parentId: integer("parentId"), // Ссылка на тот же комментарий (для ответов)
  text: text("text").notNull(),
  isDeleted: boolean("isDeleted").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("comment_entityId_entityType_idx").on(table.entityId, table.entityType),
  index("comment_userId_idx").on(table.userId),
  index("comment_parentId_idx").on(table.parentId),
  index("comment_createdAt_idx").on(table.createdAt),
]);

export const commentRelations = relations(comment, ({ one, many }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
  }),
  replies: many(comment),
  ratings: many(commentRating),
}));

export const commentRating = pgTable("commentRating", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId").notNull().references(() => comment.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 для лайка, -1 для дизлайка
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
}, (table) => [
  index("commentRating_commentId_idx").on(table.commentId),
  index("commentRating_userId_idx").on(table.userId),
  // Уникальный индекс для предотвращения повторных голосов
  index("commentRating_commentId_userId_idx").on(table.commentId, table.userId),
]);

export const commentRatingRelations = relations(commentRating, ({ one }) => ({
  comment: one(comment, {
    fields: [commentRating.commentId],
    references: [comment.id],
  }),
  user: one(user, {
    fields: [commentRating.userId],
    references: [user.id],
  }),
}));

// Старые таблицы для обратной совместимости (можно удалить после миграции)
export const dealComment = pgTable("dealComment", {
  id: serial("id").primaryKey(),
  dealId: integer("dealId").notNull().references(() => deal.id),
  userId: text("userId").notNull().references(() => user.id),
  parentId: integer("parentId"), // Ссылка на тот же комментарий (для ответов)
  text: text("text").notNull(),
  isDeleted: boolean("isDeleted").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("dealComment_dealId_idx").on(table.dealId),
  index("dealComment_userId_idx").on(table.userId),
  index("dealComment_parentId_idx").on(table.parentId),
]);

export const dealCommentRelations = relations(dealComment, ({ one, many }) => ({
  deal: one(deal, {
    fields: [dealComment.dealId],
    references: [deal.id],
  }),
  user: one(user, {
    fields: [dealComment.userId],
    references: [user.id],
  }),
  parent: one(dealComment, {
    fields: [dealComment.parentId],
    references: [dealComment.id],
  }),
  replies: many(dealComment),
  ratings: many(dealCommentRating),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
  user: one(user, {
    fields: [deal.userId],
    references: [user.id],
  }),
  ratings: many(dealRating),
  comments: many(dealComment),
}));

export const dealRatingRelations = relations(dealRating, ({ one }) => ({
  deal: one(deal, {
    fields: [dealRating.dealId],
    references: [deal.id],
  }),
  user: one(user, {
    fields: [dealRating.userId],
    references: [user.id],
  }),
}));

export const dealCommentRating = pgTable("dealCommentRating", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId").notNull().references(() => dealComment.id, { onDelete: "cascade" }),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1 для лайка, -1 для дизлайка
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull(),
}, (table) => [
  index("dealCommentRating_commentId_idx").on(table.commentId),
  index("dealCommentRating_userId_idx").on(table.userId),
  // Уникальный индекс для предотвращения повторных голосов
  index("dealCommentRating_commentId_userId_idx").on(table.commentId, table.userId),
]);

export const dealCommentRatingRelations = relations(dealCommentRating, ({ one }) => ({
  comment: one(dealComment, {
    fields: [dealCommentRating.commentId],
    references: [dealComment.id],
  }),
  user: one(user, {
    fields: [dealCommentRating.userId],
    references: [user.id],
  }),
}));
