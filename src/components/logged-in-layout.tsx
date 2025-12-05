"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, LogOutIcon, ChevronDownIcon, PinIcon, UserPenIcon, MapPinIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import BizzyLogo from "@/components/logo";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BoringAvatar from "boring-avatars";
import { Session, User } from "better-auth/types";
import PlacesSearchCommand from "@/components/places-search-command";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { PlaceRecommendationsCarousel } from "@/components/place-recommendations-carousel";
import { UsersToFollowCarousel } from "@/components/users-to-follow-carousel";
import { ReviewFeed } from "@/components/review-feed";
import { Card, CardContent } from "@/components/ui/card";

const AVATAR_COLORS = ["#F59E0B", "#FBBF24", "#FDE047", "#FEF3C7", "#FFFBEB"];

interface LoggedInLayoutProps {
  session: {
    session: Session;
    user: User;
  };
  children?: React.ReactNode;
}

function getInitials(name: string) {
  if (!name) return "US";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const UserAvatar = React.memo(({ user }: { user: User }) => {
  if (user.image) {
    return (
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={user.image}
          alt={user.name}
        />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <div className="rounded-full overflow-hidden shrink-0">
      <BoringAvatar
        name={user.name}
        variant="marble"
        colors={AVATAR_COLORS}
        size={32}
        square={false}
        className="size-7"
      />
    </div>
  );
});

UserAvatar.displayName = "UserAvatar";

export function LoggedInLayout({ session, children }: LoggedInLayoutProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestsLoading, setInterestsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setInterestsLoading(true);
      try {
        const response = await fetch(`/api/profile/${session.user.id}`);
        if (response.ok) {
          const userData = await response.json();
          if (!userData.onboardingCompleted) {
            setShowOnboarding(true);
          }
          if (userData.user?.username) {
            setUsername(userData.user.username);
          }
          if (userData.interests) {
            try {
              const parsedInterests = JSON.parse(userData.interests);
              setInterests(Array.isArray(parsedInterests) ? parsedInterests : []);
            } catch {
              setInterests([]);
            }
          } else {
            setInterests([]);
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setOnboardingChecked(true);
        setInterestsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [session.user.id]);

  const handleDropdownChange = (isOpen: boolean) => {
    setDropdownOpen(isOpen);
    if (!isOpen) {
      setOpen(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  const profileHref = username ? `/profile/@${username}` : `/profile/${session.user.id}`;

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Map",
      href: "/map",
      icon: (
        <MapPinIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
  ];

  return (
    <>
      <OnboardingDialog
        open={showOnboarding && onboardingChecked}
        userId={session.user.id}
        onComplete={handleOnboardingComplete}
      />
      <div
        className={cn(
          "flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
          "h-screen"
        )}
      >
      <Sidebar open={open} setOpen={dropdownOpen ? undefined : setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo open={open} />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <DropdownMenu onOpenChange={handleDropdownChange}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent w-full" aria-label="User menu">
                  <div className="flex items-center gap-2 w-full">
                    <UserAvatar user={session.user} />
                    <motion.div
                      animate={{
                        display: open ? "flex" : "none",
                        opacity: open ? 1 : 0,
                      }}
                      className="flex items-center justify-between flex-1"
                    >
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 truncate max-w-28">
                        {session.user.name}
                      </span>
                      <ChevronDownIcon
                        size={16}
                        className="opacity-60 text-neutral-700 dark:text-neutral-200"
                        aria-hidden="true"
                      />
                    </motion.div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-w-64" align="end" side="top">
                <DropdownMenuLabel className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {session.user.name}
                  </span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    {session.user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <PinIcon size={16} className="opacity-60" aria-hidden="true" />
                    <span>Your List</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={profileHref} className="flex items-center gap-2">
                      <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <SettingsIcon size={16} className="opacity-60" aria-hidden="true" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarBody>
      </Sidebar>
      {children || <Dashboard interests={interests} interestsLoading={interestsLoading} onboardingChecked={onboardingChecked} />}
    </div>
    </>
  );
}

const LogoIcon = React.memo(() => (
  <div className="w-6 h-6 shrink-0">
    <BizzyLogo width={24} height={24} />
  </div>
));

LogoIcon.displayName = "LogoIcon";

export const Logo = React.memo(({ open }: { open: boolean }) => {
  return (
    <Link
      href="/"
      className="font-normal flex items-center gap-2 text-sm text-black py-1 relative z-20"
    >
      <LogoIcon />
      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
          width: open ? "auto" : 0,
        }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
        className="font-medium text-black dark:text-white whitespace-nowrap overflow-hidden"
      >
        Bizzy
      </motion.span>
    </Link>
  );
});

Logo.displayName = "Logo";

const Dashboard = ({ interests, interestsLoading, onboardingChecked }: { interests: string[]; interestsLoading: boolean; onboardingChecked: boolean }) => {
  return (
    <div className="flex flex-1 min-w-0">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-6 flex-1 w-full h-full overflow-y-auto min-w-0">
        <div className="flex items-center justify-start p-4 border-b border-neutral-200 dark:border-neutral-700">
          <PlacesSearchCommand />
        </div>
        <div className="flex flex-col gap-8 pb-8 min-w-0">
          {interestsLoading || (interests.length === 0 && !onboardingChecked) ? (
            <>
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Place Recommendations</h2>
                <div className="relative">
                  <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2 -mx-2 px-2">
                    <div className="flex gap-4 min-w-max">
                      {[...Array(3)].map((_, index) => (
                        <div key={`skeleton-place-${index}`} className="shrink-0 w-full max-w-md">
                          <Card className="overflow-hidden h-full animate-pulse">
                            <div className="relative h-48 w-full bg-muted" />
                            <CardContent className="p-4">
                              <div className="h-5 bg-muted rounded mb-2" />
                              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <h2 className="text-xl font-semibold mb-4">Users to Follow</h2>
                <div className="relative">
                  <div className="overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pb-2 -mx-2 px-2">
                    <div className="flex gap-4 min-w-max">
                      {[...Array(3)].map((_, index) => (
                        <div key={`skeleton-user-${index}`} className="shrink-0 w-full md:max-w-xs">
                          <Card className="h-full animate-pulse">
                            <CardContent className="p-4 flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-muted" />
                              <div className="text-center w-full">
                                <div className="h-4 bg-muted rounded mb-2 mx-auto w-24" />
                                <div className="h-3 bg-muted rounded mb-1 mx-auto w-20" />
                                <div className="h-3 bg-muted rounded mx-auto w-32" />
                              </div>
                              <div className="h-8 w-20 bg-muted rounded" />
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : interests.length > 0 ? (
            <>
              <PlaceRecommendationsCarousel interests={interests} />
              <UsersToFollowCarousel interests={interests} />
            </>
          ) : null}
          <ReviewFeed />
        </div>
      </div>
    </div>
  );
};

