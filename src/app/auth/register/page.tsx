import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LogoIcon } from "@/assets/logo";

import { RegisterForm } from "@/modules/auth/components/register-form";

export default function RegisterPage() {
  return (
    <section className="flex min-h-screen items-center justify-center">
      <div className="m-auto h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border bg-muted shadow-md shadow-zinc-950/5">
        <div className="-m-px rounded-[calc(var(--radius)+.125rem)] border bg-card p-8 pb-6">
          <div className="mb-6 text-center">
            <Link aria-label="go home" className="mx-auto block w-fit" href="/">
              <LogoIcon />
            </Link>
            <h1 className="mt-4 mb-1 font-semibold text-xl">Create a ZM Deals Account</h1>
            <p className="text-sm">Welcome! Create an account to get started</p>
          </div>

          <RegisterForm />
        </div>

        <div className="p-3">
          <p className="text-center text-accent-foreground text-sm">
            Have an account ?
            <Button asChild className="px-2" variant="link">
              <Link href="#">Sign In</Link>
            </Button>
          </p>
        </div>
      </div>
    </section>
  );
}
