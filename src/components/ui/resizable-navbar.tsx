"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const Navbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60", className)}
    {...props}
  />
));
Navbar.displayName = "Navbar";

const NavBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("hidden md:flex h-16 items-center justify-between gap-4 px-4 md:px-6", className)}
    {...props}
  />
));
NavBody.displayName = "NavBody";

const NavItems = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    items?: Array<{ name: string; link: string }>;
  }
>(({ className, items, ...props }, ref) => {
  if (!items) return null;

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-3.5", className)}
      {...props}
    >
      {items.map((item, idx) => (
        <a
          key={`nav-link-${idx}`}
          href={item.link}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.name}
        </a>
      ))}
    </div>
  );
});
NavItems.displayName = "NavItems";

const MobileNav = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("md:hidden", className)}
    {...props}
  />
));
MobileNav.displayName = "MobileNav";

const MobileNavHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-16 items-center justify-between px-4", className)}
    {...props}
  />
));
MobileNavHeader.displayName = "MobileNavHeader";

interface MobileNavToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
}

const MobileNavToggle = React.forwardRef<
  HTMLButtonElement,
  MobileNavToggleProps
>(({ className, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn("inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary", className)}
    aria-label="Toggle menu"
    aria-expanded={isOpen}
    {...props}
  >
    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </button>
));
MobileNavToggle.displayName = "MobileNavToggle";

interface MobileNavMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose?: () => void;
}

const MobileNavMenu = React.forwardRef<
  HTMLDivElement,
  MobileNavMenuProps
>(({ className, isOpen, children, ...props }, ref) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-x-0 top-16 z-50 h-[calc(100vh-4rem)] overflow-y-auto bg-background border-b transition-transform duration-300 ease-in-out",
        isOpen ? "translate-y-0" : "-translate-y-full opacity-0 pointer-events-none",
        className
      )}
      {...props}
    >
      <div className="px-4 py-6 space-y-4">
        {children}
      </div>
    </div>
  );
});
MobileNavMenu.displayName = "MobileNavMenu";

const NavbarLogo = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center", className)}
    {...props}
  />
));
NavbarLogo.displayName = "NavbarLogo";

interface NavbarButtonProps extends Omit<React.ComponentProps<typeof Button>, "variant"> {
  variant?: "primary" | "secondary";
}

const NavbarButton = React.forwardRef<
  HTMLButtonElement,
  NavbarButtonProps
>(({ variant = "primary", ...props }, ref) => {
  const buttonVariant = variant === "primary" ? "default" : "ghost";

  return (
    <Button
      ref={ref}
      variant={buttonVariant}
      size="sm"
      {...props}
    />
  );
});
NavbarButton.displayName = "NavbarButton";

export {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
};

