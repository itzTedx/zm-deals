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
