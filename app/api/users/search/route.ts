import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/schema/auth-schema";
import { ilike, or, and, ne } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(
        and(
          ne(user.id, session.user.id),
          or(
            ilike(user.name, `%${query}%`),
            ilike(user.email, `%${query}%`)
          )
        )
      )
      .limit(20);

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}

