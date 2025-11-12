import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth.api.getSession(req);

  console.log("middleware", { session });

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
