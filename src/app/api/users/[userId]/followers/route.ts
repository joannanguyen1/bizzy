import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { follow } from "@/schema/follow-schema";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";

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

    const { userId } = await params;

    const followers = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        createdAt: follow.createdAt,
      })
      .from(follow)
      .innerJoin(user, eq(follow.followerId, user.id))
      .where(eq(follow.followingId, userId))
      .orderBy(follow.createdAt);

    return NextResponse.json({ followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
