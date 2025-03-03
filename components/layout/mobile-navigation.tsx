"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";
import { MenuIcon } from "lucide-react";

interface MobileNavigationProps {
  children?: React.ReactNode;
  className?: string;
  useSheet?: boolean; // Sheet slides from side, Drawer slides from bottom
}

export function MobileNavigation({
  children,
  className,
  useSheet = true, // Default to sheet for side navigation
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (useSheet) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", className)}
            aria-label="Open menu"
          >
            <MenuIcon size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[250px]">
          <Sidebar />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", className)}
          aria-label="Open menu"
        >
          <MenuIcon size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[85vh]">
        <div className="h-full py-4">
          {children || <Sidebar className="border-t pt-4" />}
        </div>
      </DrawerContent>
    </Drawer>
  );
} 