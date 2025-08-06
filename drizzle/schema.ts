import { pgTable, index, text, integer, timestamp, unique, boolean, foreignKey, serial } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const rateLimit = pgTable("rateLimit", {
	id: text().primaryKey().notNull(),
	key: text(),
	count: integer(),
	lastRequest: integer(),
}, (table) => [
	index("rateLimit_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("user_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ withTimezone: true, mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("account_providerId_accountId_idx").using("btree", table.providerId.asc().nullsLast().op("text_ops"), table.accountId.asc().nullsLast().op("text_ops")),
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	token: text().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("session_token_idx").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}),
	unique("session_token_unique").on(table.token),
]);

export const dealCommentRating = pgTable("dealCommentRating", {
	id: serial().primaryKey().notNull(),
	commentId: integer().notNull(),
	userId: text().notNull(),
	rating: integer().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("dealCommentRating_commentId_idx").using("btree", table.commentId.asc().nullsLast().op("int4_ops")),
	index("dealCommentRating_commentId_userId_idx").using("btree", table.commentId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("text_ops")),
	index("dealCommentRating_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [dealComment.id],
			name: "dealCommentRating_commentId_dealComment_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "dealCommentRating_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const dealRating = pgTable("dealRating", {
	id: serial().primaryKey().notNull(),
	dealId: integer().notNull(),
	userId: text().notNull(),
	rating: integer().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	index("dealRating_dealId_idx").using("btree", table.dealId.asc().nullsLast().op("int4_ops")),
	index("dealRating_dealId_userId_idx").using("btree", table.dealId.asc().nullsLast().op("int4_ops"), table.userId.asc().nullsLast().op("text_ops")),
	index("dealRating_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.dealId],
			foreignColumns: [deal.id],
			name: "dealRating_dealId_deal_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "dealRating_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const deal = pgTable("deal", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	body: text(),
	image: text(),
	slug: text().default('default-slug').notNull(),
	userId: text().notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }),
}, (table) => [
	index("deal_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "deal_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const dealComment = pgTable("dealComment", {
	id: serial().primaryKey().notNull(),
	dealId: integer().notNull(),
	userId: text().notNull(),
	parentId: integer(),
	text: text().notNull(),
	isDeleted: boolean().default(false).notNull(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("dealComment_dealId_idx").using("btree", table.dealId.asc().nullsLast().op("int4_ops")),
	index("dealComment_parentId_idx").using("btree", table.parentId.asc().nullsLast().op("int4_ops")),
	index("dealComment_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.dealId],
			foreignColumns: [deal.id],
			name: "dealComment_dealId_deal_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "dealComment_userId_user_id_fk"
		}),
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "dealComment_parentId_dealComment_id_fk"
		}),
]);
