CREATE TABLE "dealCommentRating" (
	"id" serial PRIMARY KEY NOT NULL,
	"commentId" integer NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dealComment" DROP CONSTRAINT "dealComment_dealId_deal_id_fk";
--> statement-breakpoint
ALTER TABLE "dealComment" DROP CONSTRAINT "dealComment_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "dealComment" DROP CONSTRAINT "dealComment_parentId_dealComment_id_fk";
--> statement-breakpoint
ALTER TABLE "deal" ADD COLUMN "slug" text DEFAULT 'default-slug' NOT NULL;--> statement-breakpoint
ALTER TABLE "dealCommentRating" ADD CONSTRAINT "dealCommentRating_commentId_dealComment_id_fk" FOREIGN KEY ("commentId") REFERENCES "public"."dealComment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealCommentRating" ADD CONSTRAINT "dealCommentRating_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dealCommentRating_commentId_idx" ON "dealCommentRating" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "dealCommentRating_userId_idx" ON "dealCommentRating" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "dealCommentRating_commentId_userId_idx" ON "dealCommentRating" USING btree ("commentId","userId");--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_parentId_dealComment_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."dealComment"("id") ON DELETE no action ON UPDATE no action;