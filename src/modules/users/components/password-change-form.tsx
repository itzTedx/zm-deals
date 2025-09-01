"use client";

import { useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconLock } from "@/assets/icons";

const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(40, "Password must be less than 40 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordChangeData = z.infer<typeof passwordChangeSchema>;

export function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<PasswordChangeData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: PasswordChangeData) {
    startTransition(async () => {
      // TODO: Implement password change using better-auth
      // For now, just show a success message
      toast.success("Password change feature coming soon", {
        description: "This feature will be implemented in the next update.",
      });

      // Reset form and hide it
      form.reset();
      setShowForm(false);
    });
  }

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconLock className="size-5" />
            Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowForm(true)} variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconLock className="size-5" />
          Change Password
        </CardTitle>
        <CardDescription>Enter your current password and choose a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your current password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your new password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Confirm your new password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button disabled={isPending} type="submit">
                <LoadingSwap isLoading={isPending}>Update Password</LoadingSwap>
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false);
                  form.reset();
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
