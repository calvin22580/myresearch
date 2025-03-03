"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { UserButton } from "@/components/auth/user-button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  Settings, 
  CreditCard,
  Home
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isCollapsed?: boolean;
}

function NavItem({ href, icon, label, isCollapsed }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        size={isCollapsed ? "icon" : "default"}
        className={cn(
          "w-full justify-start mb-1",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {icon}
        {!isCollapsed && <span className="ml-2">{label}</span>}
      </Button>
    </Link>
  );
}

export function Sidebar({ 
  isCollapsed = false, 
  onToggleCollapse, 
  className 
}: SidebarProps) {
  // Local collapsed state when no control function is provided
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  return (
    <div className={cn(
      "h-full flex flex-col py-2",
      collapsed ? "items-center" : "items-stretch",
      className
    )}>
      {/* Collapse Toggle */}
      <div className={cn(
        "flex items-center",
        collapsed ? "justify-center" : "justify-end px-4"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      <Separator className="my-2" />

      {/* Navigation Links */}
      <div className="flex-1 overflow-auto px-2">
        <nav className="flex flex-col gap-1">
          <NavItem 
            href="/"
            icon={<Home size={18} />}
            label="Dashboard"
            isCollapsed={collapsed}
          />
          <NavItem 
            href="/conversations"
            icon={<MessageSquare size={18} />}
            label="Conversations"
            isCollapsed={collapsed}
          />
          <NavItem 
            href="/documents"
            icon={<FileText size={18} />}
            label="Documents"
            isCollapsed={collapsed}
          />
          <NavItem 
            href="/subscription"
            icon={<CreditCard size={18} />}
            label="Subscription"
            isCollapsed={collapsed}
          />
          <NavItem 
            href="/settings"
            icon={<Settings size={18} />}
            label="Settings"
            isCollapsed={collapsed}
          />
        </nav>
      </div>

      <Separator className="my-2" />

      {/* Footer with theme toggle and user button */}
      <div className={cn(
        "flex gap-2", 
        collapsed ? "flex-col items-center" : "px-2 items-center justify-between"
      )}>
        <ThemeToggle />
        {!collapsed && <span className="text-xs text-muted-foreground">v1.0.0</span>}
        <UserButton />
      </div>
    </div>
  );
} 