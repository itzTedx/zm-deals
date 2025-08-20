"use client";

import { useEffect, useState } from "react";

import { Banner, BannerContent, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";

import { IconHourglass } from "@/assets/icons/hourglass";

import { formatTime } from "@/lib/utils";

export const EndsInCounter = ({ endsIn }: { endsIn: Date }) => {
  const [timeRemaining, setTimeRemaining] = useState(formatTime(endsIn));

  useEffect(() => {
    // Update time immediately
    setTimeRemaining(formatTime(endsIn));

    // Update time every minute
    const interval = setInterval(() => {
      setTimeRemaining(formatTime(endsIn));
    }, 60000); // 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [endsIn]);

  return (
    <Banner variant="destructive">
      <BannerContent>
        <BannerIcon>
          <IconHourglass />
        </BannerIcon>
        <BannerText>
          <BannerTitle className="tracking-[0.0125em]">
            Deal ends in <span className="font-medium">{timeRemaining}</span>
          </BannerTitle>
        </BannerText>
      </BannerContent>
    </Banner>
  );
};
