"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { useConversations, Conversation } from "@/hooks/use-conversations";
import { getDomainById, getDefaultDomain } from "@/lib/knowledge-domains";

interface ConversationItemProps {
  conversation: Conversation;
  className?: string;
}

export function ConversationItem({ conversation, className }: ConversationItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/conversations/${conversation.id}`;
  const { deleteConversation } = useConversations();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Convert string dates to Date objects if needed
  const createdAt = conversation.createdAt instanceof Date 
    ? conversation.createdAt 
    : new Date(conversation.createdAt);
  
  // Get domain info
  const domain = getDomainById(conversation.domain) || getDefaultDomain();
  
  // Format the date as "2 hours ago", "5 days ago", etc.
  const formattedDate = formatDistanceToNow(createdAt, { addSuffix: true });
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    await deleteConversation(conversation.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Link
        href={`/conversations/${conversation.id}`}
        className={cn(
          "flex items-center justify-between p-3 rounded-md hover:bg-muted group relative",
          isActive && "bg-muted",
          className
        )}
      >
        <div className="flex flex-col min-w-0">
          <div className="font-medium truncate">{conversation.title}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{formattedDate}</span>
            <span className="text-xs bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded-full">
              {domain.label}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      </Link>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 