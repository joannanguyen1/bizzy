import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { follow } from "@/schema/follow-schema";
import { user } from "@/schema/auth-schema";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
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
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);

    if (!targetUser || targetUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingFollow = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followerId, currentUserId),
          eq(follow.followingId, targetUserId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { error: "Already following this user" },
        { status: 400 }
      );
    }

    await db.insert(follow).values({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    const [followersCount, followingCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followingId, targetUserId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followerId, targetUserId)),
    ]);

    return NextResponse.json({
      success: true,
      isFollowing: true,
      followersCount: followersCount[0]?.count || 0,
      followingCount: followingCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await db
      .delete(follow)
      .where(
        and(
          eq(follow.followerId, currentUserId),
          eq(follow.followingId, targetUserId)
        )
      );

    const [followersCount, followingCount] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followingId, targetUserId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followerId, targetUserId)),
    ]);

    return NextResponse.json({
      success: true,
      isFollowing: false,
      followersCount: followersCount[0]?.count || 0,
      followingCount: followingCount[0]?.count || 0,
    });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}
