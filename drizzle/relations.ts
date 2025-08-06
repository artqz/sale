import { relations } from "drizzle-orm/relations";
import { user, account, session, dealComment, dealCommentRating, deal, dealRating } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	dealCommentRatings: many(dealCommentRating),
	dealRatings: many(dealRating),
	deals: many(deal),
	dealComments: many(dealComment),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const dealCommentRatingRelations = relations(dealCommentRating, ({one}) => ({
	dealComment: one(dealComment, {
		fields: [dealCommentRating.commentId],
		references: [dealComment.id]
	}),
	user: one(user, {
		fields: [dealCommentRating.userId],
		references: [user.id]
	}),
}));

export const dealCommentRelations = relations(dealComment, ({one, many}) => ({
	dealCommentRatings: many(dealCommentRating),
	deal: one(deal, {
		fields: [dealComment.dealId],
		references: [deal.id]
	}),
	user: one(user, {
		fields: [dealComment.userId],
		references: [user.id]
	}),
	dealComment: one(dealComment, {
		fields: [dealComment.parentId],
		references: [dealComment.id],
		relationName: "dealComment_parentId_dealComment_id"
	}),
	dealComments: many(dealComment, {
		relationName: "dealComment_parentId_dealComment_id"
	}),
}));

export const dealRatingRelations = relations(dealRating, ({one}) => ({
	deal: one(deal, {
		fields: [dealRating.dealId],
		references: [deal.id]
	}),
	user: one(user, {
		fields: [dealRating.userId],
		references: [user.id]
	}),
}));

export const dealRelations = relations(deal, ({one, many}) => ({
	dealRatings: many(dealRating),
	user: one(user, {
		fields: [deal.userId],
		references: [user.id]
	}),
	dealComments: many(dealComment),
}));