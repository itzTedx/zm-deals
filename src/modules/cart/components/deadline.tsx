"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

import { IconTimer } from "@/assets/icons/timer";

interface DeadlineProps {
  compact?: boolean;
}

export function Deadline({ compact = false }: DeadlineProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set deadline to end of current week (Sunday 23:59:59)
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = endOfWeek.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100" variant="secondary">
        <IconTimer className="mr-1 size-3" />
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconTimer className="size-4 text-muted-foreground" />
      <span className="text-muted-foreground text-sm">
        Deal ends in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}
