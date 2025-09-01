"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { IconBrandGoogle, IconEmail } from "@/assets/icons";

interface AccountLinkingProps {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

export function AccountLinking({ user }: AccountLinkingProps) {
  // TODO: Implement account linking functionality using better-auth
  // For now, show a basic interface

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>Manage your connected social accounts and authentication methods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Account */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <IconEmail className="size-5 text-blue-600" />
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-muted-foreground text-sm">Email & Password</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.emailVerified ? "default" : "secondary"}>
              {user.emailVerified ? "Verified" : "Unverified"}
            </Badge>
            <Button disabled size="sm" variant="outline">
              Change
            </Button>
          </div>
        </div>

        {/* Google Account */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <IconBrandGoogle className="size-5 text-red-600" />
            <div>
              <p className="font-medium">Google</p>
              <p className="text-muted-foreground text-sm">OAuth Provider</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Not Connected</Badge>
            <Button disabled size="sm" variant="outline">
              Connect
            </Button>
          </div>
        </div>

        <div className="text-muted-foreground text-sm">
          <p>Account linking features will be available in the next update.</p>
        </div>
      </CardContent>
    </Card>
  );
}
