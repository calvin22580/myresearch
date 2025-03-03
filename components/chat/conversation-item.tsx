"use client";

import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckIcon, Pencil, Save, Trash2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useConversations } from '@/hooks/use-conversations';
import { Conversation } from '@/types/conversation';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title || 'New Conversation');
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateConversationTitle } = useConversations();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Format the date relative to now (e.g., "2 hours ago")
  const formattedDate = formatDistanceToNow(new Date(conversation.createdAt), {
    addSuffix: true,
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle saving the new title
  const handleSaveTitle = async () => {
    if (newTitle.trim() && newTitle !== conversation.title) {
      await updateConversationTitle(conversation.id, newTitle.trim());
    }
    setIsEditing(false);
  };

  // Handle key press events in the input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setNewTitle(conversation.title || 'New Conversation');
      setIsEditing(false);
    }
  };
  
  // Handle clicking outside the input to cancel editing
  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      setNewTitle(conversation.title || 'New Conversation');
      setIsEditing(false);
    }
  };
  
  useEffect(() => {
    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing]);

  return (
    <div
      className={cn(
        'flex flex-col p-3 rounded-lg border cursor-pointer transition-colors',
        isActive
          ? 'bg-primary/5 border-primary/20'
          : 'bg-background border-transparent hover:bg-muted/50'
      )}
      onClick={isEditing ? undefined : onClick}
    >
      <div className="flex justify-between items-start gap-2">
        {isEditing ? (
          <div className="flex-1 flex items-center gap-1">
            <Input
              ref={inputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-7 py-1 text-sm font-medium"
              autoFocus
            />
            <div className="flex items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSaveTitle}
              >
                <Save className="h-3.5 w-3.5" />
                <span className="sr-only">Save</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setNewTitle(conversation.title || 'New Conversation');
                  setIsEditing(false);
                }}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Cancel</span>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="font-medium text-sm truncate flex-1">
              {conversation.title || 'New Conversation'}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formattedDate}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit title</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Edit title</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {onDelete && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this conversation? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          setDeleteDialogOpen(false);
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-1.5">
        <p className="text-xs text-muted-foreground truncate">
          {conversation.preview || 'No messages yet'}
        </p>
        
        {conversation.knowledgeDomain && (
          <Badge variant="outline" className="text-[10px] h-5 whitespace-nowrap ml-2">
            {conversation.knowledgeDomain}
          </Badge>
        )}
      </div>
    </div>
  );
} 