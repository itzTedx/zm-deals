import "../styles/globals.css";

import { Toaster } from "@/components/ui/sonner";

import { geist, helvetica } from "@/assets/fonts";

import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(helvetica.className, geist.variable)}>
        {children}

        <Toaster />
      </body>
    </html>
  );
}
