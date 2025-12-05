import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface FollowStatusResponse {
  isFollowing: boolean;
}

export function useFollowStatus(userId: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<FollowStatusResponse>({
    queryKey: ["follow-status", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/follow-status`);
      if (!response.ok) {
        throw new Error("Failed to fetch follow status");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: async (action: "follow" | "unfollow") => {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: action === "follow" ? "POST" : "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to update follow status");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData<FollowStatusResponse>(["follow-status", userId], {
        isFollowing: data.isFollowing,
      });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success(
        data.isFollowing ? "Successfully followed user" : "Successfully unfollowed user"
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-status", userId] });
      toast.error("Failed to update follow status");
    },
  });

  return {
    isFollowing: data?.isFollowing ?? false,
    isLoading,
    error,
    toggleFollow: () => {
      const currentStatus = data?.isFollowing ?? false;
      mutation.mutate(currentStatus ? "unfollow" : "follow");
    },
    isToggling: mutation.isPending,
  };
}

