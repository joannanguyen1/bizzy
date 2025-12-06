import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { savedPlace } from "@/schema/places-schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const places = await db
      .select()
      .from(savedPlace)
      .where(eq(savedPlace.userId, userId))
      .orderBy(desc(savedPlace.createdAt));

    return NextResponse.json({ places });
  } catch (err) {
    console.error("Error fetching user places:", err);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

