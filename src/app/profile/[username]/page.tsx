import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfilePageClient from "./profile-page-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  const fetchHeaders = new Headers(headersList);

  const { username } = await params;
  const cleanUsername = username.startsWith("@") ? username.slice(1) : username;

  const userResponse = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/by-username/${cleanUsername}`,
    {
      headers: fetchHeaders,
      cache: 'force-cache',
      next: { revalidate: 300 }
    }
  );

  if (!userResponse.ok) {
    redirect("/map");
  }

  const userData = await userResponse.json();
  const fetchedUserId = userData.user.id;

  const [profileResponse, placesResponse, followersResponse, followingResponse] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${fetchedUserId}`,
      {
        headers: fetchHeaders,
        cache: 'force-cache',
        next: { revalidate: 300 }
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/profile/${fetchedUserId}/places`,
      {
        headers: fetchHeaders,
        cache: 'force-cache',
        next: { revalidate: 300 }
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/${fetchedUserId}/followers`,
      {
        headers: fetchHeaders,
        cache: 'no-store'
      }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/${fetchedUserId}/following`,
      {
        headers: fetchHeaders,
        cache: 'no-store'
      }
    ),
  ]);

  if (!profileResponse.ok || !placesResponse.ok) {
    redirect("/map");
  }

  const profile = await profileResponse.json();
  const placesData = await placesResponse.json();

  const followersData = followersResponse.ok ? await followersResponse.json() : { followers: [] };
  const followingData = followingResponse.ok ? await followingResponse.json() : { following: [] };

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
      currentUserId={session?.user?.id || null}
      session={session}
      initialFollowers={followersData.followers || []}
      initialFollowing={followingData.following || []}
    />
  );
}

