import type { Route } from "next";
import Link from "next/link";

import { IconChevronRight } from "@/assets/icons";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface Props {
  title: string;
  description?: string | null;
  btnText?: string;
  link?: Route;
  hasButton?: boolean;
  variant?: "default" | "compact" | "secondary";
  titleClassName?: string;
}

export const SectionHeader = ({
  title,
  description,
  btnText,
  link,
  className,
  variant = "default",
  hasButton = true,
  titleClassName,
  ...props
}: Props & React.ComponentProps<"header">) => {
  if (variant === "secondary") {
    return (
      <header className={cn("flex items-center justify-between gap-3", className)} {...props}>
        <div className="space-y-1">
          <h2 className={cn("font-bold text-2xl sm:text-3xl md:text-4xl", titleClassName)}>{title}</h2>
          {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
        </div>
        {hasButton &&
          (link ? (
            <Button asChild>
              <Link href={link}>
                See More {btnText && <span className="text-muted-foreground">- {btnText}</span>}
                <IconChevronRight className="size-3 text-muted-foreground" />
              </Link>
            </Button>
          ) : (
            <Button>
              See More {btnText && <span className="text-muted-foreground">- {btnText}</span>}{" "}
              <IconChevronRight className="size-3 text-muted-foreground" />
            </Button>
          ))}
      </header>
    );
  }
  return (
    <header
      className={cn(
        "grid md:grid-cols-2",
        variant === "default" ? "gap-3 md:grid-cols-2 md:gap-6" : "gap-3 md:grid-cols-1",
        className
      )}
      {...props}
    >
      <div className="space-y-3">
        <h2 className={cn("font-bold text-2xl sm:text-3xl md:text-4xl", titleClassName)}>{title}</h2>

        {hasButton &&
          (link ? (
            <Button asChild>
              <Link href={link}>
                See More {btnText && <span className="text-muted-foreground">- {btnText}</span>}
                <IconChevronRight className="size-3 text-muted-foreground" />
              </Link>
            </Button>
          ) : (
            <Button>
              See More {btnText && <span className="text-muted-foreground">- {btnText}</span>}{" "}
              <IconChevronRight className="size-3 text-muted-foreground" />
            </Button>
          ))}
      </div>
      {description && <p className="text-muted-foreground text-sm sm:text-base">{description}</p>}
    </header>
  );
};
