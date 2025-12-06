import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { follow } from "@/schema/follow-schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = await db
      .select()
      .from(follow)
      .where(
        and(
          eq(follow.followerId, session.user.id),
          eq(follow.followingId, userId)
        )
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json({ message: "Already following" });
    }

    await db.insert(follow).values({
      followerId: session.user.id,
      followingId: userId,
    });

    return NextResponse.json({ message: "Successfully followed" });
  } catch (err) {
    console.error("Error following user:", err);
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
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;

    await db
      .delete(follow)
      .where(
        and(
          eq(follow.followerId, session.user.id),
          eq(follow.followingId, userId)
        )
      );

    return NextResponse.json({ message: "Successfully unfollowed" });
  } catch (err) {
    console.error("Error unfollowing user:", err);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
}

