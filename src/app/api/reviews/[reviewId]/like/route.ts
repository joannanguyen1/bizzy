import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewLike } from "@/schema/places-schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await context.params;

    const [like] = await db
      .select()
      .from(reviewLike)
      .where(
        and(
          eq(reviewLike.reviewId, reviewId),
          eq(reviewLike.userId, session.user.id)
        )
      )
      .limit(1);

    return NextResponse.json({ isLiked: !!like }, { status: 200 });
  } catch (err) {
    console.error("GET /reviews/[reviewId]/like error:", err);
    return NextResponse.json(
      { error: "Failed to check like status" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await context.params;

    await db
      .insert(reviewLike)
      .values({
        userId: session.user.id,
        reviewId,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("POST /reviews/[reviewId]/like error:", err);
    return NextResponse.json(
      { error: "Failed to like review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await auth.api.getSession(req);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await context.params;

    await db
      .delete(reviewLike)
      .where(
        and(
          eq(reviewLike.reviewId, reviewId),
          eq(reviewLike.userId, session.user.id)
        )
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE /reviews/[reviewId]/like error:", err);
    return NextResponse.json(
      { error: "Failed to unlike review" },
      { status: 500 }
    );
  }
}

