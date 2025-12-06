import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user, updateNameSchema } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = updateNameSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name } = validation.data;
    await db
      .update(user)
      .set({
        name,
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, name });
  } catch (error) {
    console.error("Error updating name:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update name" },
      { status: 500 }
    );
  }
}

