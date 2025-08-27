"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import NumberFlow from "@number-flow/react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { IconTruck } from "@/assets/icons/truck";

import { cn } from "@/lib/utils";
import {
  getDeadlineProgress,
  getDeliveryDate,
  getNextDeadline,
  getTimeUntilDeadline,
  isDeadlinePassed,
  isDeadlineUrgent,
} from "@/modules/cart/utils/delivery-deadline";

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

  // Get delivery date
  const deliveryDate = useMemo(() => getDeliveryDate(), []);

  // Get next deadline
  const nextDeadline = useMemo(() => getNextDeadline(), []);

  // Check if deadline is urgent
  const isUrgent = useMemo(() => isDeadlineUrgent(60), []);

  // Get progress percentage
  const progressPercentage = useMemo(() => getDeadlineProgress(), []);

  // Don't render if deadline has passed for today
  if (deadlinePassed) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className={`flex items-center gap-3 ${compact ? "p-3" : "p-4"}`}>
          <IconTruck className="size-5 text-green-600" />
          <div className="flex-1">
            <p className={`font-medium text-green-800 ${compact ? "text-xs" : "text-sm"}`}>
              Order now to get it {deliveryDate}
            </p>
            <p className="text-green-600 text-xs">Next deadline: {nextDeadline}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
