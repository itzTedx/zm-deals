import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/server";
import { getCurrentUser } from "@/modules/users/actions/query";
import { ProfileForm } from "@/modules/users/components/profile-form";
import { ProfileHeader } from "@/modules/users/components/profile-header";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const { success, user, error } = await getCurrentUser();

  if (!success || !user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h1 className="font-semibold text-2xl text-gray-900">Profile Not Found</h1>
          <p className="mt-2 text-gray-600">{error || "Unable to load your profile information."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="font-bold text-3xl tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and profile information.</p>
      </div>

      <ProfileHeader user={user} />
      <ProfileForm user={user} />
    </div>
  );
}
