CREATE TABLE "comment" (
	"id" serial PRIMARY KEY NOT NULL,
	"entityId" text NOT NULL,
	"entityType" text NOT NULL,
	"userId" text NOT NULL,
	"parentId" integer,
	"text" text NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentRating" (
	"id" serial PRIMARY KEY NOT NULL,
	"commentId" integer NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dealComment" DROP CONSTRAINT "dealComment_parentId_dealComment_id_fk";
--> statement-breakpoint
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentRating" ADD CONSTRAINT "commentRating_commentId_comment_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentRating" ADD CONSTRAINT "commentRating_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comment_entityId_entityType_idx" ON "comment" USING btree ("entityId","entityType");--> statement-breakpoint
CREATE INDEX "comment_userId_idx" ON "comment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "comment_parentId_idx" ON "comment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "comment_createdAt_idx" ON "comment" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "commentRating_commentId_idx" ON "commentRating" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "commentRating_userId_idx" ON "commentRating" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "commentRating_commentId_userId_idx" ON "commentRating" USING btree ("commentId","userId");