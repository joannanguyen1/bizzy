"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type BetterAuthErrorContext = {
  error: { message: string };
};

export function useGoogleAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const googleAuth = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        fetchOptions: {
          onError: (ctx: BetterAuthErrorContext) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            router.replace("/");
          },
        },
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    isGoogleLoading,
    signInWithGoogle: googleAuth,
    signUpWithGoogle: googleAuth,
  };
}
