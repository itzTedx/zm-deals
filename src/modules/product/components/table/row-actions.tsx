import { useState, useTransition } from "react";

import { RiMoreLine } from "@remixicon/react";

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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ProductQueryResult } from "../../types";

export function RowActions({ data, item }: { data: ProductQueryResult[]; item: ProductQueryResult }) {
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleStatusToggle = () => {
    startUpdateTransition(() => {
      data.map((dataItem) => {
        if (dataItem.id === item.id) {
          return {
            ...dataItem,
            status: item.status === "published" ? "Published" : "Expired",
          };
        }
        return dataItem;
      });
    });
  };

  // const handleVerifiedToggle = () => {
  //   startUpdateTransition(() => {
  //     data.map((dataItem) => {
  //       if (dataItem.id === item.id) {
  //         return {
  //           ...dataItem,
  //           verified: !item.verified,
  //         };
  //       }
  //       return dataItem;
  //     });
  //   });
  // };

  const handleDelete = () => {
    startUpdateTransition(() => {
      data.filter((dataItem) => dataItem.id !== item.id);

      setShowDeleteDialog(false);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex justify-end">
            <Button aria-label="Edit item" className="text-muted-foreground/60 shadow-none" size="icon" variant="ghost">
              <RiMoreLine aria-hidden="true" className="size-5" size={20} />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-auto">
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={isUpdatePending} onClick={handleStatusToggle}>
              {item.status === "published" ? "Deactivate contact" : "Activate contact"}
            </DropdownMenuItem>
            {/* <DropdownMenuItem disabled={isUpdatePending} onClick={handleVerifiedToggle}>
              {item.verified ? "Unverify contact" : "Verify contact"}
            </DropdownMenuItem> */}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="dark:data-[variant=destructive]:focus:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"
              disabled={isUpdatePending}
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
