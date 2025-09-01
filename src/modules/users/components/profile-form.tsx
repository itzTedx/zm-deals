"use client";

import { useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Separator } from "@/components/ui/separator";

import { IconCalendar, IconShield, IconUser } from "@/assets/icons";

import { updateProfile } from "../actions/mutation";
import { UpdateProfileData, updateProfileSchema } from "../actions/schema";
import { AccountLinking } from "./account-linking";
import { DangerZone } from "./danger-zone";
import { EmailVerification } from "./email-verification";
import { PasswordChangeForm } from "./password-change-form";
import { SessionInfo } from "./session-info";
import { TwoFactorAuth } from "./two-factor-auth";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    role: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      image: user.image || "",
    },
  });

  function onSubmit(data: UpdateProfileData) {
    startTransition(async () => {
      const result = await updateProfile(data);

      if (!result.success) {
        toast.error("Failed to update profile", {
          description: result.message,
        });
        return;
      }

      toast.success("Profile updated successfully", {
        description: result.message,
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your personal information and profile picture</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button disabled={isPending} type="submit">
                <LoadingSwap isLoading={isPending}>Update Profile</LoadingSwap>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Email Verification */}
      <EmailVerification user={user} />

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconShield className="size-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-sm">Email Address</label>
              <div className="flex items-center gap-2">
                <IconUser className="size-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-800 text-xs">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 font-medium text-xs text-yellow-800">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-sm">Account Role</label>
              <div className="flex items-center gap-2">
                <IconShield className="size-4 text-muted-foreground" />
                <span className="text-sm capitalize">{user.role || "User"}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-sm">Member Since</label>
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium text-muted-foreground text-sm">Last Updated</label>
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <PasswordChangeForm />

      {/* Account Linking */}
      <AccountLinking user={user} />

      {/* Session Information */}
      <SessionInfo user={user} />

      {/* Two-Factor Authentication */}
      <TwoFactorAuth user={user} />

      {/* Danger Zone */}
      <DangerZone user={user} />
    </div>
  );
}
