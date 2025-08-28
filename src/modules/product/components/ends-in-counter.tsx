"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import NumberFlow from "@number-flow/react";

import { Banner, BannerContent, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";

import { IconHourglass } from "@/assets/icons";

import { parseTimeComponents } from "@/lib/utils";

interface TimeComponents {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface AnimatedCountdownProps {
  endsIn: Date;
  className?: string;
  showSeconds?: boolean;
}

interface TimeUnitProps {
  value: number;
  unit: string;
  showLeadingZero?: boolean;
  trend?: number;
}

// Memoized time unit component for better performance
const TimeUnit = React.memo<TimeUnitProps>(({ value, unit, trend }) => {
  return (
    <span className="flex items-center leading-none">
      <NumberFlow trend={trend} value={value} />
      <TimeText>{unit}</TimeText>
    </span>
  );
});

TimeUnit.displayName = "TimeUnit";

// Memoized time text component
const TimeText = React.memo<{ children: React.ReactNode }>(({ children }) => <span>{children}</span>);

TimeText.displayName = "TimeText";

export const AnimatedCountdown = React.memo<AnimatedCountdownProps>(
  ({ endsIn, className = "", showSeconds = true }) => {
    const [timeComponents, setTimeComponents] = useState<TimeComponents>(() => parseTimeComponents(endsIn));

    // Memoize the time calculation to prevent unnecessary recalculations
    const updateTime = useCallback(() => {
      setTimeComponents(parseTimeComponents(endsIn));
    }, [endsIn]);

    useEffect(() => {
      // Update time immediately
      updateTime();

      // Update time every second for smooth animation
      const interval = setInterval(updateTime, 1000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, [updateTime]);

    // Memoize the time parts to prevent unnecessary re-renders
    const timeParts = useMemo(() => {
      const parts: React.JSX.Element[] = [];

      // Show days if greater than 0
      if (timeComponents.days > 0) {
        parts.push(<TimeUnit key="days" trend={-1} unit="d" value={timeComponents.days} />);
      }

      // Show hours if greater than 0 or if days are shown
      if (timeComponents.hours > 0 || timeComponents.days > 0) {
        parts.push(<TimeUnit key="hours" unit="h" value={timeComponents.hours} />);
      }

      // Show minutes if greater than 0 or if hours/days are shown
      if (timeComponents.minutes > 0 || timeComponents.hours > 0 || timeComponents.days > 0) {
        parts.push(<TimeUnit key="minutes" unit="m" value={timeComponents.minutes} />);
      }

      // Always show seconds for the most dynamic animation (unless disabled)
      if (showSeconds) {
        parts.push(<TimeUnit key="seconds" unit="s" value={timeComponents.seconds} />);
      }

      return parts;
    }, [timeComponents, showSeconds]);

    // Memoize the rendered time string
    const renderedTime = useMemo(() => {
      return timeParts.map((part, index) => (
        <span className="inline-flex items-center gap-0.5" key={index}>
          {part}
          {index < timeParts.length - 1 && <span>&nbsp;</span>}
        </span>
      ));
    }, [timeParts]);

    // Check if the countdown has expired
    const isExpired = useMemo(() => {
      const now = new Date();
      return endsIn <= now;
    }, [endsIn]);

    // Don't render if expired
    if (isExpired) {
      return null;
    }

    return (
      <span className={className} role="timer">
        {renderedTime}
      </span>
    );
  }
);

AnimatedCountdown.displayName = "AnimatedCountdown";

interface EndsInCounterProps {
  endsIn: Date;
  className?: string;
  showSeconds?: boolean;
}

export const EndsInCounter = React.memo<EndsInCounterProps>(({ endsIn, className = "", showSeconds = true }) => {
  // Validate the endsIn prop
  const isValidDate = useMemo(() => {
    const date = new Date(endsIn);
    return !isNaN(date.getTime());
  }, [endsIn]);

  // Check if the deal has already expired
  const isExpired = useMemo(() => {
    const now = new Date();
    return endsIn <= now;
  }, [endsIn]);

  // Early return for invalid or expired dates
  if (!isValidDate) {
    console.warn("EndsInCounter: Invalid date provided for endsIn prop", endsIn);
    return null;
  }

  if (isExpired) {
    return null;
  }

  return (
    <Banner className={className} size="sm" variant="destructive">
      <BannerContent className="items-center">
        <BannerIcon>
          <IconHourglass />
        </BannerIcon>
        <BannerText>
          <BannerTitle className="text-xs leading-none sm:text-sm md:text-base">
            Deal ends in{" "}
            <span className="font-medium">
              <AnimatedCountdown endsIn={endsIn} showSeconds={showSeconds} />
            </span>
          </BannerTitle>
        </BannerText>
      </BannerContent>
    </Banner>
  );
});

EndsInCounter.displayName = "EndsInCounter";
