"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import NumberFlow from "@number-flow/react";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";
import { getDeadlineProgress, getTimeUntilDeadline, isDeadlinePassed } from "@/modules/cart/utils/delivery-deadline";

interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
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
    <span className="flex items-center font-medium text-xs leading-none">
      <NumberFlow trend={trend} value={value} />
      <span className="">{unit}</span>
    </span>
  );
});

TimeUnit.displayName = "TimeUnit";

interface DeliveryDeadlineProps {
  compact?: boolean;
}

export const DeliveryDeadline = React.memo<DeliveryDeadlineProps>(({ compact = true }) => {
  const [timeComponents, setTimeComponents] = useState<TimeComponents>(() => getTimeUntilDeadline());

  // Memoize the time calculation to prevent unnecessary recalculations
  const updateTime = useCallback(() => {
    setTimeComponents(getTimeUntilDeadline());
  }, []);

  useEffect(() => {
    // Update time immediately
    updateTime();

    // Update time every second for smooth animation
    const interval = setInterval(updateTime, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [updateTime]);

  // Check if deadline has passed
  const deadlinePassed = useMemo(() => isDeadlinePassed(), []);

  // Get progress percentage
  const progressPercentage = useMemo(() => getDeadlineProgress(), []);

  // Don't render if deadline has passed for today
  if (deadlinePassed) return null;

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <p className={cn("font-medium text-muted-foreground", compact ? "text-xs" : "text-sm")}>
          Order in{" "}
          <span className="inline-flex items-center gap-1 font-bold">
            <TimeUnit unit="h" value={timeComponents.hours} />
            <TimeUnit unit="m" value={timeComponents.minutes} />
            {!compact && <TimeUnit unit="s" value={timeComponents.seconds} />}
          </span>
        </p>
      </div>
      <p className="font-medium text-xs">
        Get it <span className="font-semibold text-green-600">Tomorrow</span>
      </p>
      {!compact && (
        <div className="mt-2">
          <Progress className="h-1.5" value={progressPercentage} />
        </div>
      )}
    </div>
  );
});

DeliveryDeadline.displayName = "DeliveryDeadline";
