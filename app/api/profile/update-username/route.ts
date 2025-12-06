import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user, usernameSchema } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = usernameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid username", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { username: newUsername } = validation.data;

    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.username, newUsername))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== session.user.id) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    await db
      .update(user)
      .set({
        username: newUsername,
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, username: newUsername });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}

