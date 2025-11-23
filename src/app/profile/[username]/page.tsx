import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-page-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  const { username } = await params;

  return (
    <ProfilePageClient
      username={username}
      currentUserId={session.user.id}
      session={session}
    />
  );
}

