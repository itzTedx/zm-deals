"use client";

import React from "react";

import { IconStar } from "@/assets/icons/star";

import { cn } from "@/lib/utils";

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
    onMouseMove,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
    onClick: (e: React.MouseEvent<SVGElement>) => void;
    onMouseMove: (e: React.MouseEvent<SVGElement>) => void;
    isInteractive: boolean;
  }) => (
    <IconStar
      className={cn("transition-colors duration-200", isInteractive && "cursor-pointer hover:scale-110")}
      color={style.color}
      fill={style.fill}
      key={index}
      onClick={onClick}
      onMouseMove={onMouseMove}
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

  // Generate stable IDs based on component props to avoid hydration issues
  const starIds = React.useMemo(() => Array.from({ length: maxStars }, (_, i) => `star-${maxStars}-${i}`), [maxStars]);

  const calculateRating = React.useCallback((index: number, event: React.MouseEvent<SVGElement>) => {
    const star = event.currentTarget;
    const rect = star.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    const clickPosition = x / width;

    let fraction = 1;
    if (clickPosition <= 0.25) fraction = 0.25;
    else if (clickPosition <= 0.5) fraction = 0.5;
    else if (clickPosition <= 0.75) fraction = 0.75;

    return index + fraction;
  }, []);

  const handleStarClick = React.useCallback(
    (index: number, event: React.MouseEvent<SVGElement>) => {
      if (readOnly || !onChange) return;
      const newRating = calculateRating(index, event);
      onChange(newRating);
    },
    [readOnly, onChange, calculateRating]
  );

  const handleStarHover = React.useCallback(
    (index: number, event: React.MouseEvent<SVGElement>) => {
      if (!readOnly) {
        const previewRating = calculateRating(index, event);
        setHoverRating(previewRating);
      }
    },
    [readOnly, calculateRating]
  );

  const handleMouseLeave = React.useCallback(() => {
    if (!readOnly) {
      setHoverRating(null);
    }
  }, [readOnly]);

  const getStarStyle = React.useCallback(
    (index: number) => {
      const ratingToUse = !readOnly && hoverRating !== null ? hoverRating : value;
      const difference = ratingToUse - index;

      if (difference <= 0) return { color: "#ebebeb", fill: "transparent" };
      if (difference >= 1) return { color: color, fill: color };

      return {
        color: color,
        fill: `url(#${starIds[index]})`,
      } as React.CSSProperties;
    },
    [readOnly, hoverRating, value, color, starIds]
  );

  const renderGradientDefs = () => {
    const ratingToUse = !readOnly && hoverRating !== null ? hoverRating : value;
    const partialStarIndex = Math.floor(ratingToUse);
    const partialFill = (ratingToUse % 1) * 100;

    // Only create gradient for partial star
    if (partialFill > 0 && partialStarIndex < maxStars) {
      return (
        <linearGradient id={starIds[partialStarIndex]} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset={`${partialFill}%`} stopColor={color} />
          <stop offset={`${partialFill}%`} stopColor="transparent" />
        </linearGradient>
      );
    }
    return null;
  };

  const stars = React.useMemo(() => {
    return Array.from({ length: maxStars }).map((_, index) => {
      const style = getStarStyle(index);
      return (
        <StarIcon
          index={index}
          isInteractive={!readOnly}
          key={starIds[index]}
          onClick={(e) => handleStarClick(index, e)}
          onMouseMove={(e) => handleStarHover(index, e)}
          style={style}
        />
      );
    });
  }, [maxStars, getStarStyle, handleStarClick, handleStarHover, readOnly, starIds]);

  return (
    <div className={cn("relative flex items-center gap-x-0.5", className)} onMouseLeave={handleMouseLeave}>
      <svg height="0" style={{ position: "absolute" }} width="0">
        <defs>{renderGradientDefs()}</defs>
      </svg>
      {stars}
    </div>
  );
};

export default StarRating;
