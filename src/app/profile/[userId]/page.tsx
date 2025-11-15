import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-page-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const { userId } = await params;

  return (
    <ProfilePageClient
      userId={userId}
      currentUserId={session.user.id}
      session={session}
    />
  );
}

