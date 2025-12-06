import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    if (!/^[a-z0-9]+$/.test(normalizedUsername)) {
      return NextResponse.json(
        { error: "Username can only contain letters and numbers", available: false },
        { status: 400 }
      );
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters", available: false },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, normalizedUsername))
      .limit(1);

    return NextResponse.json({ available: existingUser.length === 0 });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username" },
      { status: 500 }
    );
  }
}

