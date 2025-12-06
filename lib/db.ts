import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "@/schema/auth-schema";
import * as placesSchema from "@/schema/places-schema";
import * as followSchema from "@/schema/follow-schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema: { ...authSchema, ...placesSchema, ...followSchema } });
