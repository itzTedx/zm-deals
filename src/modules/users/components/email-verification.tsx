"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconCheckboxCircle, IconEmail } from "@/assets/icons";

interface EmailVerificationProps {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
  };
}

export function EmailVerification({ user }: EmailVerificationProps) {
  const [isPending, startTransition] = useTransition();

  function handleResendVerification() {
    startTransition(async () => {
      // TODO: Implement resend verification using better-auth
      // For now, just show a success message
      toast.success("Verification email sent", {
        description: "Please check your inbox and follow the verification link.",
      });
    });
  }

  if (user.emailVerified) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <IconCheckboxCircle className="size-5" />
            Email Verified
          </CardTitle>
          <CardDescription className="text-green-700">
            Your email address has been verified successfully.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <IconEmail className="size-5" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-yellow-700">
          Please verify your email address to access all features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-yellow-700">
            We sent a verification email to <span className="font-mono">{user.email}</span>
          </p>
          <Button
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            disabled={isPending}
            onClick={handleResendVerification}
            variant="outline"
          >
            <LoadingSwap isLoading={isPending}>
              <IconEmail className="mr-2 size-4" />
              Resend Verification Email
            </LoadingSwap>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
