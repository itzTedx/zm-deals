import { useState } from "react";

import { Edit, Trash2 } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import type { Coupon } from "@/server/schema";

interface RowActionsProps {
  data: Coupon[];
  item: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (couponId: string) => Promise<void>;
  isDeleting: string | null;
}

export function RowActions({ item, onEdit, onDelete, isDeleting }: RowActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    await onDelete(item.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="h-8 w-8 p-0" onClick={() => onEdit(item)} size="sm" variant="ghost">
                <Edit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit coupon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
          <AlertDialogTrigger asChild>
            <Button className="h-8 w-8 p-0 text-destructive hover:text-destructive" size="sm" variant="ghost">
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the coupon "{item.code}"? This action cannot be undone and will
                deactivate the coupon.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting === item.id}
                onClick={handleDelete}
              >
                {isDeleting === item.id ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
