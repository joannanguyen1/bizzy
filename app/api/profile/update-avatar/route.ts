import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user } from "@/schema/auth-schema";
import { eq } from "drizzle-orm";
import { validateImageSize } from "@/lib/image-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: "Invalid image data" },
        { status: 400 }
      );
    }

    if (
      !(
        image.startsWith('data:image/jpeg') ||
        image.startsWith('data:image/jpg') ||
        image.startsWith('data:image/png')
      )
    ) {
      return NextResponse.json(
        { error: "Invalid image format. Only JPEG and PNG are allowed." },
        { status: 400 }
      );
    }

    if (!validateImageSize(image, 5)) {
      return NextResponse.json(
        { error: "Image too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    await db
      .update(user)
      .set({
        image,
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error("Error updating avatar:", error);
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

