"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { IconClock, IconDevice, IconShield } from "@/assets/icons";

interface SessionInfoProps {
  user: {
    id: string;
    role: string | null;
  };
}

export function SessionInfo({ user }: SessionInfoProps) {
  // TODO: Implement session management using better-auth
  // For now, show basic session information

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconShield className="size-5" />
          Session Information
        </CardTitle>
        <CardDescription>Your current session details and security information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-medium text-muted-foreground text-sm">Session Status</label>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800" variant="default">
                Active
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-muted-foreground text-sm">User Role</label>
            <div className="flex items-center gap-2">
              <IconShield className="size-4 text-muted-foreground" />
              <span className="text-sm capitalize">{user.role || "User"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="font-medium text-muted-foreground text-sm">Last Activity</label>
            <div className="flex items-center gap-2">
              <IconClock className="size-4 text-muted-foreground" />
              <span className="text-sm">Just now</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-medium text-muted-foreground text-sm">Device</label>
            <div className="flex items-center gap-2">
              <IconDevice className="size-4 text-muted-foreground" />
              <span className="text-sm">This device</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button disabled size="sm" variant="outline">
            <IconShield className="mr-2 size-4" />
            Manage Sessions
          </Button>
        </div>

        <div className="text-muted-foreground text-sm">
          <p>Advanced session management features will be available in the next update.</p>
        </div>
      </CardContent>
    </Card>
  );
}
