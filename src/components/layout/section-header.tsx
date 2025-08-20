import Link from "next/link";

import { IconChevronRight } from "@/assets/icons/chevron";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface Props {
  title: string;
  description: string;
  btnText?: string;
  link?: string;
  hasButton?: boolean;
}

export const SectionHeader = ({
  title,
  description,
  btnText,
  link,
  className,
  hasButton = true,
  ...props
}: Props & React.ComponentProps<"header">) => {
  return (
    <header className={cn("grid gap-3 md:grid-cols-2 md:gap-6", className)} {...props}>
      <div className="space-y-3">
        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl">{title}</h2>

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
      <p className="text-muted-foreground text-sm sm:text-base">{description}</p>
    </header>
  );
};
