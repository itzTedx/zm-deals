"use client";

import React, { useEffect, useState } from "react";

import NumberFlow from "@number-flow/react";

import { Banner, BannerContent, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";

import { IconHourglass } from "@/assets/icons/hourglass";

import { parseTimeComponents } from "@/lib/utils";

interface AnimatedCountdownProps {
  endsIn: Date;
  className?: string;
}

export const AnimatedCountdown = ({ endsIn, className = "" }: AnimatedCountdownProps) => {
  const [timeComponents, setTimeComponents] = useState(parseTimeComponents(endsIn));

  useEffect(() => {
    // Update time immediately
    setTimeComponents(parseTimeComponents(endsIn));

    // Update time every second for smooth animation
    const interval = setInterval(() => {
      setTimeComponents(parseTimeComponents(endsIn));
    }, 1000); // 1 second

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [endsIn]);

  // Build the animated time string
  const renderAnimatedTime = () => {
    const parts: React.JSX.Element[] = [];

    if (timeComponents.days > 0) {
      parts.push(
        <span key="days">
          <NumberFlow value={timeComponents.days} />
          <TimeText>d</TimeText>
        </span>
      );
    }

    if (timeComponents.hours > 0 || timeComponents.days > 0) {
      parts.push(
        <span key="hours">
          <NumberFlow value={timeComponents.hours} />
          <TimeText>h</TimeText>
        </span>
      );
    }

    if (timeComponents.minutes > 0 || timeComponents.hours > 0 || timeComponents.days > 0) {
      parts.push(
        <span key="minutes">
          <NumberFlow value={timeComponents.minutes} />
          <TimeText>m</TimeText>
        </span>
      );
    }

    // Always show seconds for the most dynamic animation
    parts.push(
      <span key="seconds">
        <NumberFlow value={timeComponents.seconds} />
        <TimeText>s</TimeText>
      </span>
    );

    return parts.map((part, index) => (
      <span className="inline-flex items-center gap-0.5" key={index}>
        {part}
        {index < parts.length - 1 && <span>&nbsp;</span>}
      </span>
    ));
  };

  return <span className={className}>{renderAnimatedTime()}</span>;
};

export const EndsInCounter = ({ endsIn }: { endsIn: Date }) => {
  return (
    <Banner size="sm" variant="destructive">
      <BannerContent className="items-center">
        <BannerIcon>
          <IconHourglass />
        </BannerIcon>
        <BannerText>
          <BannerTitle className="text-sm leading-none sm:text-base">
            Deal ends in{" "}
            <span className="font-medium">
              <AnimatedCountdown endsIn={endsIn} />
            </span>
          </BannerTitle>
        </BannerText>
      </BannerContent>
    </Banner>
  );
};

function TimeText({ children }: { children: React.ReactNode }) {
  return <span className="font-medium">{children}</span>;
}
