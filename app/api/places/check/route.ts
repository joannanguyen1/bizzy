import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { savedPlace } from "@/schema/places-schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId");

    if (!placeId) {
      return NextResponse.json(
        { error: "placeId is required" },
        { status: 400 }
      );
    }

    const existingPlace = await db
      .select()
      .from(savedPlace)
      .where(
        and(
          eq(savedPlace.userId, session.user.id),
          eq(savedPlace.placeId, placeId)
        )
      )
      .limit(1);

    return NextResponse.json({
      isSaved: existingPlace.length > 0,
      place: existingPlace[0] || null,
    });
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      event: "CHECK_PLACE_SAVED_ERROR",
      timestamp: new Date().toISOString(),
      message: err instanceof Error ? err.message : String(err)
    }));
    return NextResponse.json(
      { error: "Failed to check if place is saved" },
      { status: 500 }
    );
  }
}

