"use client";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface AlertDialogConfirmProps {
  showBtnText?: string;
  id: string;
  onConfirm: (id: string) => Promise<void> | void;
  description?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  renderTrigger?: (onClick?: () => void) => React.ReactNode;
}

export function AlertDialogConfirm({
  showBtnText = "Confirm",
  id,
  onConfirm,
  description = "This action cannot be undone.",
  variant = "outline",
  renderTrigger,
}: AlertDialogConfirmProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {renderTrigger ? (
          renderTrigger()
        ) : (
          <Button variant={variant} size="sm">
            {showBtnText}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(id)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
