import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/schema/auth-schema";
import { follow } from "@/schema/follow-schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const { userId } = await params;

    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData || userData.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userRecord = userData[0];

    const [followersResult, followingResult] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followingId, userId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(follow)
        .where(eq(follow.followerId, userId)),
    ]);

    const followersCount = followersResult[0]?.count || 0;
    const followingCount = followingResult[0]?.count || 0;

    let isFollowing = false;
    if (session?.user?.id) {
      const followCheck = await db
        .select()
        .from(follow)
        .where(
          and(
            eq(follow.followerId, session.user.id),
            eq(follow.followingId, userId)
          )
        )
        .limit(1);

      isFollowing = followCheck.length > 0;
    }

    return NextResponse.json({
      user: {
        id: userRecord.id,
        name: userRecord.name,
        username: userRecord.username,
        email: userRecord.email,
        image: userRecord.image,
        createdAt: userRecord.createdAt,
      },
      onboardingCompleted: userRecord.onboardingCompleted,
      interests: userRecord.interests,
      followersCount,
      followingCount,
      isFollowing,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
