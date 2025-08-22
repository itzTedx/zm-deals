"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

import { cn } from "@/lib/utils";

export const IconCheckboxCircle = (props: SvgProps) => {
  return (
    <svg {...props} fill="none" height="24" viewBox="0 0 25 24" width="25" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 12C4.5 7.58172 8.08172 4 12.5 4C16.9183 4 20.5 7.58172 20.5 12C20.5 16.4183 16.9183 20 12.5 20C8.08172 20 4.5 16.4183 4.5 12ZM12.5 2C6.97715 2 2.5 6.47715 2.5 12C2.5 17.5228 6.97715 22 12.5 22C18.0228 22 22.5 17.5228 22.5 12C22.5 6.47715 18.0228 2 12.5 2ZM17.9571 9.45711L16.5429 8.04289L11.5 13.0858L8.70711 10.2929L7.29289 11.7071L11.5 15.9142L17.9571 9.45711Z"
        fill="currentColor"
      />
    </svg>
  );
};

export interface CircleCheckBigIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface CircleCheckBigIconProps extends HTMLMotionProps<"div"> {
  size?: number;
}

const CircleCheckBigIcon = forwardRef<CircleCheckBigIconHandle, CircleCheckBigIconProps>(
  ({ className, size = 24, ...props }, ref) => {
    const controls = useAnimation();
    const tickControls = useAnimation();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => {
          controls.start("animate");
          tickControls.start("animate");
        },
        stopAnimation: () => {
          controls.start("normal");
          tickControls.start("normal");
        },
      };
    });

    const handleEnter = useCallback(() => {
      if (!isControlled.current) {
        controls.start("animate");
        tickControls.start("animate");
      }
    }, [controls, tickControls]);

    const handleLeave = useCallback(() => {
      if (!isControlled.current) {
        controls.start("normal");
        tickControls.start("normal");
      }
    }, [controls, tickControls]);

    const svgVariants: Variants = {
      normal: { scale: 1 },
      animate: {
        scale: [1, 1.05, 0.98, 1],
        transition: {
          duration: 1,
          ease: [0.42, 0, 0.58, 1],
        },
      },
    };

    const circleVariants: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: { pathLength: 1, opacity: 1 },
    };

    const tickVariants: Variants = {
      normal: { pathLength: 1, opacity: 1 },
      animate: {
        pathLength: [0, 1],
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: [0.42, 0, 0.58, 1],
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
          variants={svgVariants}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path d="M21.801 10A10 10 0 1 1 17 3.335" initial="normal" variants={circleVariants} />
          <motion.path animate={tickControls} d="m9 11 3 3L22 4" initial="normal" variants={tickVariants} />
        </motion.svg>
      </motion.div>
    );
  }
);

CircleCheckBigIcon.displayName = "CircleCheckBigIcon";
export { CircleCheckBigIcon };
