"use client";

import React from "react";

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

interface StarRatingBasicProps {
  value: number;
  onChange?: (value: number) => void;
  className?: string;
  maxStars?: number;
  readOnly?: boolean;
  color?: string;
}

const StarIcon = React.memo(
  ({
    index,
    isInteractive,
    onClick,
    onMouseEnter,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
    onClick: () => void;
    onMouseEnter: () => void;
    isInteractive: boolean;
  }) => (
    <IconStar
      className={cn("transition-colors duration-200", isInteractive && "cursor-pointer hover:scale-110")}
      color={style.color}
      fill={style.fill}
      key={index}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={style}
    />
  )
);
StarIcon.displayName = "StarIcon";

const StarRating = ({
  className,
  color = "#facc15",
  maxStars = 5,
  onChange,
  readOnly = false,
  value,
}: StarRatingBasicProps) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const handleStarClick = React.useCallback(
    (index: number) => {
      if (readOnly || !onChange) return;
      const newRating = index + 1;
      onChange(newRating);
    },
    [readOnly, onChange]
  );

  const handleStarHover = React.useCallback(
    (index: number) => {
      if (!readOnly) {
        setHoverRating(index + 1);
      }
    },
    [readOnly]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!readOnly) {
      setHoverRating(null);
    }
  }, [readOnly]);

  const getStarStyle = React.useCallback(
    (index: number) => {
      const ratingToUse = !readOnly && hoverRating !== null ? hoverRating : value;
      return {
        color: ratingToUse > index ? color : "gray",
        fill: ratingToUse > index ? color : "transparent",
      } as React.CSSProperties;
    },
    [readOnly, hoverRating, value, color]
  );

  const stars = React.useMemo(() => {
    return Array.from({ length: maxStars }).map((_, index) => {
      const style = getStarStyle(index);
      return (
        <StarIcon
          index={index}
          isInteractive={!readOnly}
          key={index}
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => handleStarHover(index)}
          style={style}
        />
      );
    });
  }, [maxStars, getStarStyle, handleStarClick, handleStarHover, readOnly]);

  return (
    <div className={cn("flex items-center gap-x-0.5", className)} onMouseLeave={handleMouseLeave}>
      {stars}
    </div>
  );
};

export default StarRating;
