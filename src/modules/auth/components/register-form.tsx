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

import { signUp } from "@/lib/auth/client";

import { RegisterSchema, registerSchema } from "../schema";

export const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
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
  return (
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
  );
};
