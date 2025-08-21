import "../styles/globals.css";

import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

import { geist, helvetica } from "@/assets/fonts";

import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(helvetica.className, geist.variable, "max-sm:overflow-x-hidden")}>
        <Providers>
          {children}

          <Toaster richColors />
        </Providers>
      </body>
    </html>
  );
}
