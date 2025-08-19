import { IconStar, IconStarHalf } from "@/assets/icons/star";

import { cn } from "@/lib/utils";

interface Props {
  value: number;
}

export const Rating = ({ value, className, ...props }: Props & React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = value - index;

        if (starValue >= 1) {
          // Full star
          return <IconStar className="text-yellow-500" key={index} />;
        }
        if (starValue > 0) {
          // Half star
          return <IconStarHalf className="text-yellow-500" key={index} />;
        }
        // Empty star
        return <IconStar className="text-gray-200" key={index} />;
      })}
    </div>
  );
};
