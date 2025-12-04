"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LoggedInLayout } from "@/components/logged-in-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Session, User } from "better-auth/types";
import { toast } from "sonner";
import { usernameSchema } from "@/schema/auth-schema";
import { authClient } from "@/lib/auth-client";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface SettingsPageClientProps {
  session: {
    session: Session;
    user: User;
  };
  currentUsername: string;
}

export default function SettingsPageClient({
  session,
  currentUsername,
}: SettingsPageClientProps) {
  const router = useRouter();
  const [username, setUsername] = useState(currentUsername);
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasUsernameChanged = username !== currentUsername;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!username.trim() || username === currentUsername) {
      setIsUsernameAvailable(null);
      setUsernameError("");
      return;
    }

    const validation = usernameSchema.safeParse({ username });

    if (!validation.success) {
      setUsernameError(validation.error.issues[0]?.message || "Invalid username");
      setIsUsernameAvailable(null);
      return;
    }

    setUsernameError("");
    setIsCheckingUsername(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/profile/check-username?username=${encodeURIComponent(username)}`
        );
        const data = await response.json();

        if (response.ok) {
          setIsUsernameAvailable(data.available);
          if (!data.available) {
            setUsernameError("Username is already taken");
          }
        } else {
          setUsernameError(data.error || "Failed to check username");
          setIsUsernameAvailable(null);
        }
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameError("Failed to check username availability");
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [username, currentUsername]);

  const handleSaveUsername = async () => {
    if (!hasUsernameChanged || usernameError || !isUsernameAvailable) {
      return;
    }

    setIsSavingUsername(true);
    try {
      const response = await fetch("/api/profile/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Username updated successfully");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update username");
      }
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/profile/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Account deleted successfully");
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete account");
        setIsDeletingAccount(false);
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
      setIsDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <LoggedInLayout session={session}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>
                Change your username. This is how others will find you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="Enter username"
                      className={usernameError ? "border-red-500" : ""}
                      maxLength={20}
                    />
                    {hasUsernameChanged && !usernameError && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isUsernameAvailable === true ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : isUsernameAvailable === false ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleSaveUsername}
                    disabled={
                      !hasUsernameChanged ||
                      !!usernameError ||
                      isCheckingUsername ||
                      !isUsernameAvailable ||
                      isSavingUsername
                    }
                  >
                    {isSavingUsername ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {usernameError && (
                  <p className="text-sm text-red-500">{usernameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Username must be 3-20 characters, letters and numbers only
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers, including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Your profile information</li>
                <li>All saved places</li>
                <li>Your followers and following connections</li>
                <li>All other associated data</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingAccount}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LoggedInLayout>
  );
}

