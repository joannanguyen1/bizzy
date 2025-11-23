import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/schema/auth-schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ne } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const interestsParam = searchParams.get("interests")

    let currentUserInterests: string[] = []
    if (interestsParam) {
      try {
        currentUserInterests = JSON.parse(interestsParam)
      } catch {
        currentUserInterests = []
      }
    }

    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
        interests: user.interests,
      })
      .from(user)
      .where(ne(user.id, session.user.id))

    const usersWithSharedInterests = allUsers.map((u) => {
      let userInterests: string[] = []
      if (u.interests) {
        try {
          userInterests = JSON.parse(u.interests)
        } catch {
          userInterests = []
        }
      }

      const sharedCount = currentUserInterests.filter((interest) =>
        userInterests.includes(interest)
      ).length

      return {
        id: u.id,
        name: u.name,
        image: u.image,
        sharedInterests: sharedCount,
      }
    })

    usersWithSharedInterests.sort((a, b) => b.sharedInterests - a.sharedInterests)

    return NextResponse.json({ users: usersWithSharedInterests })
  } catch (error) {
    console.error("Error fetching user suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch user suggestions" },
      { status: 500 }
    )
  }
}

