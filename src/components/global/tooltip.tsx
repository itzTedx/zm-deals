import { IconInfoCircleFilled } from "@/assets/icons/info";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

export const InfoTooltip = ({ info }: { info: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <IconInfoCircleFilled className="size-3.5" />
        </TooltipTrigger>
        <TooltipContent className="max-w-3xs text-center">{info}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
