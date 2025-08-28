"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

export interface MoveRightIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MoveRightIconProps extends HTMLMotionProps<"div"> {
  size?: number;
}

const MoveRightIcon = forwardRef<MoveRightIconHandle, MoveRightIconProps>(
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
      normal: { x: 0 },
      animate: {
        x: [0, 3, 0],
        transition: { duration: 0.6, repeat: Number.POSITIVE_INFINITY },
      },
    };

    const lineVariants: Variants = {
      normal: { strokeOpacity: 1 },
      animate: {
        strokeOpacity: [1, 0.5, 1],
        transition: { duration: 0.8, repeat: Number.POSITIVE_INFINITY },
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
          <motion.path d="M18 8L22 12L18 16" variants={arrowVariants} />
          <motion.path d="M2 12H22" variants={lineVariants} />
        </motion.svg>
      </motion.div>
    );
  }
);

MoveRightIcon.displayName = "MoveRightIcon";
export { MoveRightIcon };

export interface MoveLeftIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MoveLeftIconProps extends HTMLMotionProps<"div"> {
  size?: number;
}

const MoveLeftIcon = forwardRef<MoveLeftIconHandle, MoveLeftIconProps>(
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
      normal: { x: 0 },
      animate: {
        x: [0, -3, 0],
        transition: { duration: 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
      },
    };

    const lineVariants: Variants = {
      normal: { strokeOpacity: 1 },
      animate: {
        strokeOpacity: [1, 0.5, 1],
        transition: { duration: 0.8, repeat: Number.POSITIVE_INFINITY },
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
          <motion.path d="M6 8L2 12L6 16" stroke="currentColor" variants={arrowVariants} />
          <motion.path d="M2 12H22" stroke="currentColor" variants={lineVariants} />
        </motion.svg>
      </motion.div>
    );
  }
);

MoveLeftIcon.displayName = "MoveLeftIcon";
export { MoveLeftIcon };

export const IconTrendingDown = (props: SvgProps) => {
  return (
    <svg {...props} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <g fill="none" fillRule="nonzero">
          <path d="M24 0v24H0V0h24ZM12.594 23.258l-.012.002-.071.035-.02.004-.014-.004-.071-.036c-.01-.003-.019 0-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.016-.018Zm.264-.113-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01-.184-.092Z" />
          <path
            d="M18.586 16H17a1 1 0 1 0 0 2h4a1 1 0 0 0 1-1v-4a1 1 0 1 0-2 0v1.586l-5.293-5.293a1 1 0 0 0-1.414 0L9.5 13.086 3.707 7.293a1 1 0 0 0-1.414 1.414l6.5 6.5a1 1 0 0 0 1.414 0L14 11.414 18.586 16Z"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
};

export const IconTrendingUp = (props: SvgProps) => {
  return (
    <svg {...props} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <g fill="none" fillRule="nonzero">
          <path d="M24 0v24H0V0h24ZM12.594 23.258l-.012.002-.071.035-.02.004-.014-.004-.071-.036c-.01-.003-.019 0-.024.006l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.016-.018Zm.264-.113-.014.002-.184.093-.01.01-.003.011.018.43.005.012.008.008.201.092c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022Zm-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.003-.011.018-.43-.003-.012-.01-.01-.184-.092Z" />
          <path
            d="M17 6a1 1 0 1 0 0 2h1.586L14 12.586l-3.793-3.793a1 1 0 0 0-1.414 0l-6.5 6.5a1 1 0 1 0 1.414 1.414L9.5 10.914l3.793 3.793a1 1 0 0 0 1.414 0L20 9.414V11a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1h-4Z"
            fill="currentColor"
          />
        </g>
      </g>
    </svg>
  );
};
