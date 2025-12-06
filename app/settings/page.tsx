import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsPageClient from "./settings-page-client";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <SettingsPageClient
      session={session}
      currentUsername={session.user.username || ""}
    />
  );
}

