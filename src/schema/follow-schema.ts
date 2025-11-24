import { pgTable, text, timestamp, primaryKey, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const follow = pgTable(
  "follow",
  {
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    followerIdx: index("follower_idx").on(table.followerId),
    followingIdx: index("following_idx").on(table.followingId),
  })
);

