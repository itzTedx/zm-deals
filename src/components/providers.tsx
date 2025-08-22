"use client";

import type { ReactNode } from "react";

import { ProgressProvider } from "@bprogress/next/app";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <NuqsAdapter>
      <ProgressProvider color="#fb3748" height="2px" memo options={{ showSpinner: false }} shallowRouting>
        {children}
      </ProgressProvider>
    </NuqsAdapter>
  );
};
