import { Banner, BannerContent, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";

import { IconHourglass } from "@/assets/icons/hourglass";

import { formatTime } from "@/lib/utils";

export const EndsInCounter = ({ endsIn }: { endsIn: Date }) => {
  return (
    <Banner variant="destructive">
      <BannerContent>
        <BannerIcon>
          <IconHourglass />
        </BannerIcon>
        <BannerText>
          <BannerTitle className="tracking-[0.0125em]">
            Deal ends in <span className="font-medium">{formatTime(endsIn)}</span>
          </BannerTitle>
        </BannerText>
      </BannerContent>
    </Banner>
  );
};
