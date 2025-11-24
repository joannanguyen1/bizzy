import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "@/schema/auth-schema";
import { username } from "better-auth/plugins/username";
import { eq } from "drizzle-orm";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Google OAuth environment variables are missing.");
}

const generateUniqueUsername = async (email: string): Promise<string> => {
  const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const existingUser = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.username, username))
      .limit(1);

    if (existingUser.length === 0) {
      return username;
    }

    username = `${baseUsername}${counter}`;
    counter++;
  }
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24,  // 1 day in seconds
  },
  socialProviders: {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      mapProfileToUser: async (profile) => {
        const generatedUsername = await generateUniqueUsername(profile.email);
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          emailVerified: false,
          image: profile.picture,
          username: generatedUsername,
        };
      },
    },
  },
  plugins: [
    username()
  ],
});
