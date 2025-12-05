import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession(req);
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/map/places/") || pathname.startsWith("/profile/")) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/map/:path*", "/dashboard/:path*"],
};
