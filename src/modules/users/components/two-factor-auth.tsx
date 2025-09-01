"use client";

import { useState, useTransition } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { IconKey, IconQrcode, IconShield } from "@/assets/icons";

interface TwoFactorAuthProps {
  user: {
    id: string;
  };
}

export function TwoFactorAuth({ user }: TwoFactorAuthProps) {
  const [isPending, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(false); // TODO: Get from user data

  function handleToggle2FA() {
    startTransition(async () => {
      // TODO: Implement 2FA toggle using better-auth
      // For now, just show a message
      if (isEnabled) {
        toast.success("Two-factor authentication disabled", {
          description: "Your account is now less secure.",
        });
        setIsEnabled(false);
      } else {
        toast.success("Two-factor authentication enabled", {
          description: "Please complete the setup process.",
        });
        setIsEnabled(true);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconShield className="size-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <IconKey className="size-5 text-blue-600" />
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-muted-foreground text-sm">Use an app like Google Authenticator or Authy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isEnabled ? "default" : "secondary"}>{isEnabled ? "Enabled" : "Disabled"}</Badge>
            <Button disabled={isPending} onClick={handleToggle2FA} size="sm" variant="outline">
              {isEnabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>

        {isEnabled && (
          <div className="rounded-lg border bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              <IconQrcode className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium text-sm">Setup Required</p>
                <p className="text-muted-foreground text-xs">
                  Scan the QR code with your authenticator app to complete setup
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Button disabled size="sm" variant="outline">
                Show QR Code
              </Button>
            </div>
          </div>
        )}

        <div className="text-muted-foreground text-sm">
          <p>Two-factor authentication features will be fully implemented in the next update.</p>
        </div>
      </CardContent>
    </Card>
  );
}
