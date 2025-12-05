"use client";

import React from "react";
import Link from "next/link";
import BizzyLogo from "@/components/logo";
import { cn } from "@/lib/utils";

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-neutral-800">
      <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/"
            className="font-normal flex items-center gap-2 text-sm text-black dark:text-white"
          >
            <div className="w-6 h-6 shrink-0">
              <BizzyLogo width={24} height={24} />
            </div>
            <span className="font-medium">Bizzy</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

