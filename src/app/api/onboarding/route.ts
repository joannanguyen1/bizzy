import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { user } from "@/schema/auth-schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { interests } = body

    if (!interests || !Array.isArray(interests)) {
      return NextResponse.json(
        { error: "Invalid interests data" },
        { status: 400 }
      )
    }

    await db
      .update(user)
      .set({
        interests: JSON.stringify(interests),
        onboardingCompleted: true,
      })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving onboarding data:", error)
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    )
  }
}

