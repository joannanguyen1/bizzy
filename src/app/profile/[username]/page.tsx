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
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;
  const headersList = await headers();

  const userResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/by-username/${cleanUsername}`,
    {
      headers: headersList,
      cache: 'no-store'
    }
  );

  if (!userResponse.ok) {
    redirect("/map");
  }

  const userData = await userResponse.json();
  const fetchedUserId = userData.user.id;

  const [profileResponse, placesResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${fetchedUserId}`,
      {
        headers: headersList,
        cache: 'no-store'
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${fetchedUserId}/places`,
      {
        headers: headersList,
        cache: 'no-store'
      }
    ),
  ]);

  if (!profileResponse.ok || !placesResponse.ok) {
    redirect("/map");
  }

  const profile = await profileResponse.json();
  const placesData = await placesResponse.json();

  const profileData = {
    ...profile,
    user: {
      ...profile.user,
      username: userData.user.username,
    },
  };

  return (
    <ProfilePageClient
      profileData={profileData}
      places={placesData.places || []}
      userId={fetchedUserId}
      currentUserId={session.user.id}
      session={session}
    />
  );
}

