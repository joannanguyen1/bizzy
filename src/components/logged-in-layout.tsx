"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, UserCog, Settings, LogOutIcon, ChevronDownIcon, BoltIcon, BookOpenIcon, Layers2Icon, PinIcon, UserPenIcon, MapPinIcon } from "lucide-react";
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

  useEffect(() => {
    const checkOnboardingStatus = async () => {
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
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setOnboardingChecked(true);
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
    {
      label: "Profile",
      href: profileHref,
      icon: (
        <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
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
                  {/** TODO: Correctly route links to the correct pages */}
                  <DropdownMenuItem>
                    <BoltIcon size={16} className="opacity-60" aria-hidden="true" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Layers2Icon size={16} className="opacity-60" aria-hidden="true" />
                    <span>Projects</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BookOpenIcon size={16} className="opacity-60" aria-hidden="true" />
                    <span>Documentation</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <PinIcon size={16} className="opacity-60" aria-hidden="true" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={profileHref} className="flex items-center gap-2">
                      <UserPenIcon size={16} className="opacity-60" aria-hidden="true" />
                      <span>My Profile</span>
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
      {children || <Dashboard />}
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

const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex items-center justify-start p-4 border-b border-neutral-200 dark:border-neutral-700">
          <PlacesSearchCommand />
        </div>
        <div className="flex items-center justify-center h-full">
          <h1 className="text-4xl font-light text-neutral-800 dark:text-neutral-200">
            logged in
          </h1>
        </div>
      </div>
    </div>
  );
};

