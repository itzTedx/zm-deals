"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";

import NumberFlow from "@number-flow/react";

import { Badge } from "@/components/ui/badge";

import { IconTimer } from "@/assets/icons/timer";

interface DeadlineProps {
  compact?: boolean;
}

interface TimeUnitProps {
  value: number;
  unit: string;
  trend?: number;
}

// Memoized time unit component for better performance
const TimeUnit = React.memo<TimeUnitProps>(({ value, unit, trend }) => {
  return (
    <span className="inline-flex items-center leading-none">
      <NumberFlow trend={trend} value={value} />
      <span>{unit}</span>
    </span>
  );
});

TimeUnit.displayName = "TimeUnit";

// Memoized time text component
const TimeText = React.memo<{ children: React.ReactNode }>(({ children }) => <span>{children}</span>);

TimeText.displayName = "TimeText";

export function Deadline({ compact = false }: DeadlineProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
  });
  const [deliveryDay, setDeliveryDay] = useState("Tomorrow");
  const [shouldShow, setShouldShow] = useState(false);

  // Memoize the deadline calculation to prevent unnecessary recalculations
  const calculateDeadline = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    const deadline = new Date();
    if (currentHour >= 14) {
      // Past 2PM, set to tomorrow 2PM
      deadline.setDate(deadline.getDate() + 1);
      deadline.setHours(14, 0, 0, 0);
      return { deadline, deliveryDay: "Tomorrow" };
    }
    // Before 2PM, set to today 2PM
    deadline.setHours(14, 0, 0, 0);
    return { deadline, deliveryDay: "Today" };
  }, []);

  // Memoize the time update function
  const updateTime = useCallback(() => {
    const { deadline, deliveryDay: newDeliveryDay } = calculateDeadline();
    const now = new Date();
    const difference = deadline.getTime() - now.getTime();
    const hoursUntilDeadline = difference / (1000 * 60 * 60);

    // Only show countdown if 6 hours or less remaining
    const newShouldShow = hoursUntilDeadline <= 6 && hoursUntilDeadline > 0;

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft({ hours, minutes });
    } else {
      setTimeLeft({ hours: 0, minutes: 0 });
    }

    setDeliveryDay(newDeliveryDay);
    setShouldShow(newShouldShow);
  }, [calculateDeadline]);

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

    // Show hours if greater than 0
    if (timeLeft.hours > 0) {
      parts.push(<TimeUnit key="hours" unit="h" value={timeLeft.hours} />);
    }

    // Show minutes if greater than 0 or if hours are shown
    if (timeLeft.minutes > 0 || timeLeft.hours > 0) {
      parts.push(<TimeUnit key="minutes" unit="m" value={timeLeft.minutes} />);
    }

    return parts;
  }, [timeLeft.hours, timeLeft.minutes]);

  // Memoize the rendered time string
  const renderedTime = useMemo(() => {
    return timeParts.map((part, index) => (
      <span className="inline-flex items-center gap-0.5" key={index}>
        {part}
        {index < timeParts.length - 1 && <span>&nbsp;</span>}
      </span>
    ));
  }, [timeParts]);

  // Don't render if more than 6 hours remaining
  if (!shouldShow) {
    return null;
  }

  if (compact) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100" variant="secondary">
        <IconTimer className="mr-1 size-3" />
        {renderedTime}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col text-left">
      <div className="text-muted-foreground text-sm">Order in {renderedTime}</div>
      <div className="font-medium text-sm">
        <TimeText>Get it </TimeText>
        <span className="font-medium text-green-600">{deliveryDay}</span>
      </div>
    </div>
  );
}
