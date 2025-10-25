"use client";

import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogClose,
} from "@/components/ui/dialog";
import SearchProducts from "@/components/SeachProducts"; // <-- new component
import { cn } from "@/lib/utils";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  // Keyboard shortcuts: Ctrl+K / Cmd+K to open
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleShortcut);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogHeader className="flex justify-between items-center px-4 pt-4">
          <DialogTitle className=""></DialogTitle>
        </DialogHeader>
      <DialogContent
        className={cn(
          "max-w-[600px] w-[90%] h-[50vh] p-4 overflow-hidden rounded-2xl border border-gray-200 shadow-xl",
          "bg-white"
        )}
      >
        <div className="px-4 py-4">
          <SearchProducts />
        </div>
      </DialogContent>
    </Dialog>
  );
}
