CREATE TABLE "place_review" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rating_between_1_5" CHECK ("place_review"."rating" >= 1 AND "place_review"."rating" <= 5)
);
--> statement-breakpoint
CREATE TABLE "review_like" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"review_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_review" ADD CONSTRAINT "place_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_like" ADD CONSTRAINT "review_like_review_id_place_review_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."place_review"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "place_review_user_place_unique" ON "place_review" USING btree ("place_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_like_user_review_unique" ON "review_like" USING btree ("user_id","review_id");