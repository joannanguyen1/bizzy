import { pgTable, text, timestamp, doublePrecision, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { randomUUID } from "crypto";

export const savedPlace = pgTable("saved_place", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  formattedAddress: text("formatted_address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  placeId: text("place_id"), // Google Places ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const placeReview = pgTable(
  "place_review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: text("place_id").notNull(),
    rating: integer("rating")
      .notNull(),
    review: text("review").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    userPlaceUnique: uniqueIndex("place_review_user_place_unique").on(
      table.placeId,
      table.userId,
    ),
  }),
);