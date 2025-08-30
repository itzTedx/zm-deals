"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSwap } from "@/components/ui/loading-swap";

import { IconBrandGoogle } from "@/assets/icons";

import { signIn, signUp } from "@/lib/auth/client";

import { RegisterSchema, registerSchema } from "../schema";

export const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: undefined,
    },
  });

  function onSubmit(data: RegisterSchema) {
    startTransition(async () => {
      await signUp.email(
        {
          email: data.email,
          name: data.username,
          password: data.password,
          callbackURL: "/",
        },
        {
          onSuccess: async (_response) => {
            toast.success("Registration Successful!");
            router.push("/");
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        }
      );
    });
  }

  function onGoogleSubmit() {
    startGoogleTransition(async () => {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    });
  }
  return (
    <>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" placeholder="shadcn" type="text" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input autoComplete="email" placeholder="example@gmail.com" type="email" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input autoComplete="new-password" placeholder="********" type="password" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-full" disabled={isPending} type="submit">
            <LoadingSwap isLoading={isPending}>Register</LoadingSwap>
          </Button>
        </form>
      </Form>
      <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <hr className="border-dashed" />
        <span className="text-muted-foreground text-xs">Or continue With</span>
        <hr className="border-dashed" />
      </div>

      <Button onClick={onGoogleSubmit} type="button" variant="outline">
        <LoadingSwap className="flex items-center gap-2" isLoading={isGooglePending}>
          <IconBrandGoogle />
          <span>Google</span>
        </LoadingSwap>
      </Button>
    </>
  );
};
