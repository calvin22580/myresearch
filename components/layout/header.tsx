"use client";

import Link from "next/link";
import { UserButton } from "@/components/auth/user-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";

interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  className?: string;
}

export function Header({
  title = "My-Research.ai",
  onMenuClick,
  showMenuButton = false,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-background border-b p-4 flex items-center justify-between",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            <MenuIcon size={20} />
          </Button>
        )}
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserButton />
      </div>
    </header>
  );
} 