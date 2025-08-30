"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

export interface ChevronRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ChevronRightIconProps extends HTMLMotionProps<"div"> {
  size?: number;
}

const ChevronRightIcon = forwardRef<ChevronRightIconHandle, ChevronRightIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("animate");
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter]
    );

    const handleLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("normal");
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave]
    );

    const arrowVariants: Variants = {
      normal: { x: 0, opacity: 1 },
      animate: {
        x: [0, 4, 0],
        opacity: [1, 0.6, 1],
        transition: {
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    };

    const trailVariants: Variants = {
      normal: { x: 0, opacity: 0 },
      animate: {
        x: [6, 10],
        opacity: [0.4, 0],
        transition: {
          duration: 0.8,
          repeat: Number.POSITIVE_INFINITY,
        },
      },
    };

    return (
      <motion.div
        className={cn("inline-flex", className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...props}
      >
        <motion.svg
          animate={controls}
          fill="none"
          height={size}
          initial="normal"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path d="m9 18 6-6-6-6" stroke="currentColor" variants={trailVariants} />
          <motion.path d="m9 18 6-6-6-6" variants={arrowVariants} />
        </motion.svg>
      </motion.div>
    );
  }
);

ChevronRightIcon.displayName = "ChevronRightIcon";
export { ChevronRightIcon };

export const IconChevronRight = (props: SvgProps) => {
  return (
    <svg {...props} fill="none" height="10" viewBox="0 0 9 10" width="9" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.1875 8.75009C3.0435 8.75009 2.8995 8.69534 2.79 8.58509C2.57025 8.36534 2.57025 8.00909 2.79 7.78934L5.58 4.99934L2.79 2.20934C2.57025 1.98959 2.57025 1.63334 2.79 1.41359C3.00975 1.19384 3.366 1.19384 3.58575 1.41359L6.77325 4.60109C6.993 4.82084 6.993 5.17709 6.77325 5.39684L3.58575 8.58434C3.47625 8.69384 3.33225 8.74934 3.18825 8.74934L3.1875 8.75009Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const IconChevronUpDown = (props: SvgProps) => {
  return (
    <svg {...props} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <path d="M18.2072 9.0428 12.0001 2.83569 5.793 9.0428 7.20721 10.457 12.0001 5.66412 16.793 10.457 18.2072 9.0428ZM5.79285 14.9572 12 21.1643 18.2071 14.9572 16.7928 13.543 12 18.3359 7.20706 13.543 5.79285 14.9572Z" />
      </g>
    </svg>
  );
};

export const IconCaretUpDown = (props: SvgProps) => {
  return (
    <svg {...props} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <path d="M18 9 12 3 6 9H18ZM18 15 12 21 6 15H18Z" />
      </g>
    </svg>
  );
};
