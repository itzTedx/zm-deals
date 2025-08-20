import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const bannerVariants = cva(
  "relative w-full overflow-hidden rounded-lg border [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:top-4 [&>svg]:left-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-brand-800/70 bg-brand-500 text-destructive-foreground shadow-brand-lg dark:border-destructive [&>svg]:text-destructive",
        success:
          "border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-yellow-500/50 text-yellow-700 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        info: "border-blue-500/50 text-blue-700 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
      size: {
        default: "p-3 px-4",
        sm: "p-2 px-3",
        lg: "p-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Banner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof bannerVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div className={cn(bannerVariants({ variant, size }), className)} ref={ref} role="banner" {...props} />
));
Banner.displayName = "Banner";

const BannerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("flex items-start gap-3", className)} ref={ref} {...props} />
);
BannerContent.displayName = "BannerContent";

const BannerIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("shrink-0", className)} ref={ref} {...props} />
);
BannerIcon.displayName = "BannerIcon";

const BannerText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("flex-1", className)} ref={ref} {...props} />
);
BannerText.displayName = "BannerText";

const BannerTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h5 className={cn("leading-none", className)} ref={ref} {...props} />
);
BannerTitle.displayName = "BannerTitle";

const BannerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} ref={ref} {...props} />
  )
);
BannerDescription.displayName = "BannerDescription";

const BannerClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      className={cn(
        "absolute top-2 right-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      ref={ref}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
);
BannerClose.displayName = "BannerClose";

export { Banner, bannerVariants, BannerContent, BannerIcon, BannerText, BannerTitle, BannerDescription, BannerClose };
