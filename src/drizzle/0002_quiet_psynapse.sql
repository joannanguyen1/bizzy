ALTER TABLE "follows" RENAME TO "follow";--> statement-breakpoint
ALTER TABLE "follow" DROP CONSTRAINT "follows_follower_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "follow" DROP CONSTRAINT "follows_following_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "follows_follower_idx";--> statement-breakpoint
DROP INDEX "follows_following_idx";--> statement-breakpoint
ALTER TABLE "follow" DROP CONSTRAINT "follows_follower_id_following_id_pk";--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id");--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "display_username" text;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_follower_id_user_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow" ADD CONSTRAINT "follow_following_id_user_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "follower_idx" ON "follow" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "following_idx" ON "follow" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_username_unique" UNIQUE("username");