"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Home,
  Plus
} from "lucide-react";
import { getConversations } from "@/lib/actions/conversation";
import { toast } from "sonner";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  activeConversationId?: string | null;
}

interface ConversationItem {
  id: string;
  title: string | null;
  createdAt: Date | null;
  preview?: string | null;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isCollapsed?: boolean;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isCollapsed, isActive }: NavItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isPathActive = pathname === href;
  const active = isActive !== undefined ? isActive : isPathActive;
  const isConversationLink = href.includes('conversation=');

  const handleClick = (e: React.MouseEvent) => {
    if (isConversationLink) {
      e.preventDefault();
      router.push(href, { scroll: false });
    }
  };

  return (
    <Link href={href} passHref onClick={handleClick}>
      <Button
        variant={active ? "secondary" : "ghost"}
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
  className,
  activeConversationId
}: SidebarProps) {
  // Local collapsed state when no control function is provided
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [conversationsExpanded, setConversationsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;
  const router = useRouter();

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  // Fetch user conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        setIsLoading(true);
        const userConversations = await getConversations();
        setConversations(userConversations as ConversationItem[]);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Could not load conversations");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchConversations();
  }, [activeConversationId]); // Refresh when active conversation changes

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
            href="/dashboard"
            icon={<Home size={18} />}
            label="Dashboard"
            isCollapsed={collapsed}
          />
          
          {/* Conversations Section */}
          {!collapsed ? (
            <Collapsible 
              open={conversationsExpanded} 
              onOpenChange={setConversationsExpanded}
              className="mt-2"
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-2 w-full justify-start">
                    <MessageSquare size={18} />
                    <span className="ml-2">Conversations</span>
                    <ChevronRight 
                      size={16} 
                      className={`ml-auto transition-transform ${conversationsExpanded ? 'rotate-90' : ''}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-1"
                  onClick={() => router.push("/dashboard")}
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <CollapsibleContent className="pl-6 space-y-1 mt-1">
                {isLoading ? (
                  <div className="text-sm text-muted-foreground py-1 px-2">Loading...</div>
                ) : conversations.length > 0 ? (
                  conversations.map(conversation => (
                    <NavItem
                      key={conversation.id}
                      href={`/dashboard?conversation=${conversation.id}`}
                      icon={<MessageSquare size={16} />}
                      label={conversation.title || "Untitled conversation"}
                      isCollapsed={false}
                      isActive={activeConversationId === conversation.id}
                    />
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground py-1 px-2">No conversations yet</div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <NavItem 
              href="/conversations"
              icon={<MessageSquare size={18} />}
              label="Conversations"
              isCollapsed={collapsed}
            />
          )}

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