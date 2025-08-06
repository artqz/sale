CREATE TABLE "dealComment" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer NOT NULL,
	"userId" text NOT NULL,
	"parentId" integer,
	"text" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealRating" (
	"id" serial PRIMARY KEY NOT NULL,
	"dealId" integer NOT NULL,
	"userId" text NOT NULL,
	"rating" integer NOT NULL,
	"createdAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealComment" ADD CONSTRAINT "dealComment_parentId_dealComment_id_fk" FOREIGN KEY ("parentId") REFERENCES "public"."dealComment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealRating" ADD CONSTRAINT "dealRating_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealRating" ADD CONSTRAINT "dealRating_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dealComment_dealId_idx" ON "dealComment" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "dealComment_userId_idx" ON "dealComment" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "dealComment_parentId_idx" ON "dealComment" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "dealRating_dealId_idx" ON "dealRating" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "dealRating_userId_idx" ON "dealRating" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "dealRating_dealId_userId_idx" ON "dealRating" USING btree ("dealId","userId");--> statement-breakpoint
ALTER TABLE "deal" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "deal" DROP COLUMN "ratingCount";--> statement-breakpoint
ALTER TABLE "deal" DROP COLUMN "ratingSum";