import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Better auth tables
// Added indexes based on the table provided by Better auth
// https://www.better-auth.com/docs/concepts/database
export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    role: text("role", { enum: ["user", "admin"] })
      .notNull()
      .default("user"),
    banned: boolean("banned").notNull().default(false),
    banReason: text("banReason"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    banExpires: timestamp("banExpires", { withTimezone: true }), // Убрали NOT NULL
  },
  (table) => [index("user_email_idx").on(table.email)],
);
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
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
    id: text("id").primaryKey(),
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
    id: text("id").primaryKey(),
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
    id: text("id").primaryKey(),
    key: text("key"),
    count: integer("count"),
    lastRequest: integer("lastRequest"),
  },
  (table) => [index("rateLimit_key_idx").on(table.key)]
);

export const documentTypeEnum = pgEnum("document_type", [
  "INCOMING",       // Входящий документ
  "OUTGOING",       // Исходящий документ
  "REGULATORY",     // Нормативный документ
  "INTERNAL",       // Внутренний документ
  "MEMORANDUM"      // Служебная записка
]);

// 2. Таблица документов
export const document = pgTable("document", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(), // Название документа
  type: documentTypeEnum("type").notNull(),          // Тип из enum
  registrationNumber: varchar("reg_number", { length: 50 }), // Рег. номер
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow(),
  content: text("content"),                         // Текст документа
  userId: text("user_id").references(() => user.id), // Ссылка на автора
  isDeleted: boolean("is_deleted").default(false),
});

export const fileTypeEnum = pgEnum("file_type", [
  "MAIN",       // Основной документ
  "ATTACHMENT",       // Приложение
  "SCAN",     // Скан
]);

export const file = pgTable('file', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  path: text('path').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
  extension: text("extension"),
  type: fileTypeEnum('type').notNull(),
  documentId: uuid('document_id').references(() => document.id),
  userId: text("user_id").references(() => user.id),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  isDeleted: boolean('is_deleted').default(false),
});

// Типы событий
export const eventTypes = pgTable('event_types', {
  id: uuid('id').primaryKey(),
  name: text('name').unique().notNull(), // 'document_created', 'document_updated', 'file_uploaded' и т.д.
  description: text('description'),
});

// Таблица событий
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  typeId: uuid('type_id').references(() => eventTypes.id),
  documentId: uuid('document_id').references(() => document.id),
  fileId: uuid('file_id').references(() => file.id),
  userId: text('user_id').references(() => user.id),
  metadata: jsonb('metadata'), // Дополнительные данные о событии
  createdAt: timestamp('created_at').defaultNow(),
});