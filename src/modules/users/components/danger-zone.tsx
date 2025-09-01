"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconAlertTriangle, IconTrash } from "@/assets/icons";

interface DangerZoneProps {
  user: {
    id: string;
    email: string;
  };
}

export function DangerZone({ user }: DangerZoneProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  function handleDeleteAccount() {
    if (deleteConfirmation !== user.email) {
      toast.error("Email confirmation does not match", {
        description: "Please enter your email address exactly as shown to confirm deletion.",
      });
      return;
    }

    startTransition(async () => {
      // TODO: Implement account deletion using better-auth
      // For now, just show a message
      toast.success("Account deletion feature coming soon", {
        description: "This feature will be implemented in the next update.",
      });

      setShowDeleteForm(false);
      setDeleteConfirmation("");
    });
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <IconAlertTriangle className="size-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>Irreversible and destructive actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="font-medium text-sm">Delete Account</Label>
          <p className="text-muted-foreground text-sm">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteForm ? (
            <Button onClick={() => setShowDeleteForm(true)} variant="destructive">
              <IconTrash className="mr-2 size-4" />
              Delete Account
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="space-y-2">
                <Label className="font-medium text-sm" htmlFor="delete-confirmation">
                  Type your email address to confirm: <span className="font-mono">{user.email}</span>
                </Label>
                <Input
                  id="delete-confirmation"
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  value={deleteConfirmation}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  disabled={isPending || deleteConfirmation !== user.email}
                  onClick={handleDeleteAccount}
                  variant="destructive"
                >
                  <LoadingSwap isLoading={isPending}>
                    <IconTrash className="mr-2 size-4" />
                    Delete Account
                  </LoadingSwap>
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteForm(false);
                    setDeleteConfirmation("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
