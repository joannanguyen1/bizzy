import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

    const userData = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.username, cleanUsername))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userData[0] });
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

