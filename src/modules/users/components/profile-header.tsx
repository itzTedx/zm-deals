import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { IconEmail, IconShield } from "@/assets/icons";

import { formatDate } from "@/lib/functions/format-date";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    role: string | null;
    createdAt: Date;
  };
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent>
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="size-24">
              <AvatarImage alt={user.name} src={user.image || undefined} />
              <AvatarFallback className="font-semibold text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-base">
                Member since {formatDate(user.createdAt, { includeTime: true })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge className="flex items-center gap-1" variant="secondary">
            <IconEmail className="size-3" />
            {user.emailVerified ? "Email Verified" : "Email Unverified"}
          </Badge>
          <Badge className="flex items-center gap-1" variant="outline">
            <IconShield className="size-3" />
            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
