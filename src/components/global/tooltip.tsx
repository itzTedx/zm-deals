import { IconInfoCircleFilled } from "@/assets/icons";

import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface Props {
  info: React.ReactNode;
  triggerClassName?: string;
}

export const InfoTooltip = ({ info, triggerClassName }: Props) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <IconInfoCircleFilled className={cn("size-3.5", triggerClassName)} />
        </TooltipTrigger>
        <TooltipContent className="max-w-3xs text-center">{info}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
