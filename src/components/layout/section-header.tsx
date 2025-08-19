import Link from "next/link";

import { IconChevronRight } from "@/assets/icons/chevron";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface Props {
  title: string;
  description: string;
  btnText?: string;
  link?: string;
}

export const SectionHeader = ({
  title,
  description,
  btnText,
  link,
  className,
  ...props
}: Props & React.ComponentProps<"header">) => {
  return (
    <header className={cn("grid grid-cols-2 gap-6", className)} {...props}>
      <div className="space-y-3">
        <h2 className="font-bold text-4xl">{title}</h2>

        {link ? (
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
        )}
      </div>
      <p className="text-muted-foreground">{description}</p>
    </header>
  );
};
