import "../styles/globals.css";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import { geist, helvetica } from "@/assets/fonts";

import { cn } from "@/lib/utils";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("scroll-smooth")} lang="en">
      <body className={cn(helvetica.className, geist.variable, "max-sm:overflow-x-hidden")}>
        <Providers>
          {children}

          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
