import { useQuery } from "@tanstack/react-query";

interface UserItem {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  createdAt: string;
}

async function fetchFollowers(userId: string): Promise<UserItem[]> {
  const response = await fetch(`/api/users/${userId}/followers`);
  if (!response.ok) {
    throw new Error("Failed to fetch followers");
  }
  const data = await response.json();
  return data.followers || [];
}

async function fetchFollowing(userId: string): Promise<UserItem[]> {
  const response = await fetch(`/api/users/${userId}/following`);
  if (!response.ok) {
    throw new Error("Failed to fetch following");
  }
  const data = await response.json();
  return data.following || [];
}

export function useFollowers(userId: string) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => fetchFollowers(userId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useFollowing(userId: string) {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: () => fetchFollowing(userId),
    staleTime: 2 * 60 * 1000,
  });
}

