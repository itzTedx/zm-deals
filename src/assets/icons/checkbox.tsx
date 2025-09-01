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

export const IconCheckboxFilled = (props: SvgProps) => {
  return (
    <svg {...props} height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <g fill="currentColor">
        <g fill="none">
          <path d="M24 0v24H0V0zM12.593 23.258l-.011.002-.071.035-.02.004-.014-.004-.071-.035c-.01-.004-.019-.001-.024.005l-.004.01-.017.428.005.02.01.013.104.074.015.004.012-.004.104-.074.012-.016.004-.017-.017-.427c-.002-.01-.009-.017-.017-.018m.265-.113-.013.002-.185.093-.01.01-.003.011.018.43.005.012.008.007.201.093c.012.004.023 0 .029-.008l.004-.014-.034-.614c-.003-.012-.01-.02-.02-.022m-.715.002a.023.023 0 0 0-.027.006l-.006.014-.034.614c0 .012.007.02.017.024l.015-.002.201-.093.01-.008.004-.011.017-.43-.003-.012-.01-.01z" />
          <path
            d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m3.535 6.381-4.95 4.95-2.12-2.121a1 1 0 0 0-1.415 1.414l2.758 2.758a1.1 1.1 0 0 0 1.556 0l5.586-5.586a1 1 0 0 0-1.415-1.415"
            fill="currentColor"
          />
        </g>
      </g>
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
