import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { follow } from "@/schema/follow-schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: targetUserId } = await params;
    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) {
      return NextResponse.json({ isFollowing: false });
    }

    const followRelation = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followerId, currentUserId),
          eq(follow.followingId, targetUserId)
        )
      )
      .limit(1);

    return NextResponse.json({ isFollowing: followRelation.length > 0 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
}
