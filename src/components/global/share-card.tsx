"use client";

import { toast } from "sonner";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

import { IconBrandFacebook, IconBrandInstagram, IconBrandX, IconEmail, IconLink, IconShare } from "@/assets/icons";

import {
  copyToClipboard,
  shareViaEmail,
  shareViaFacebook,
  shareViaInstagram,
  shareViaNativeAPI,
  shareViaTwitter,
} from "@/lib/utils";

import { Button } from "../ui/button";

interface Props {
  link: string;
  title?: string;
  description?: string;
}

export const ShareCard = ({
  link,
  title = "Check out this deal!",
  description = "I found an amazing deal you might like!",
}: Props) => {
  const handleEmailShare = () => {
    shareViaEmail(title, `${description}\n\n${link}`);
    toast.success("Opening email client...");
  };

  const handleFacebookShare = () => {
    shareViaFacebook(link, description);
    toast.success("Opening Facebook in new tab...");
  };

  const handleTwitterShare = () => {
    shareViaTwitter(link, description);
    toast.success("Opening Twitter/X in new tab...");
  };

  const handleInstagramShare = () => {
    shareViaInstagram(link);
    toast.success("Link copied! You can now paste it in Instagram.");
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(link);
    if (success) {
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to copy link to clipboard");
    }
  };

  const handleNativeShare = async () => {
    const success = await shareViaNativeAPI(link, title, description);
    if (success) {
      toast.success("Shared successfully!");
    } else {
      // Fallback to copy to clipboard
      await handleCopyLink();
    }
  };

  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <Button
          aria-label="Share this deal"
          className="col-start-2 row-span-2 row-start-1 cursor-pointer self-start justify-self-end p-1"
          variant="ghost"
        >
          <IconShare className="size-5 text-muted-foreground" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="max-w-fit text-center">
        <h2 className="mb-2 font-medium">Share this deal</h2>
        <ul className="flex items-center gap-2" role="list">
          <li role="listitem">
            <Button
              aria-label="Share via email"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-9"
              onClick={handleEmailShare}
              title="Share via email"
              variant="ghost"
            >
              <IconEmail className="size-5" />
            </Button>
          </li>
          <li role="listitem">
            <Button
              aria-label="Share on Facebook"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-9"
              onClick={handleFacebookShare}
              title="Share on Facebook"
              variant="ghost"
            >
              <IconBrandFacebook className="size-5" />
            </Button>
          </li>
          <li role="listitem">
            <Button
              aria-label="Share on Twitter/X"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-9"
              onClick={handleTwitterShare}
              title="Share on Twitter/X"
              variant="ghost"
            >
              <IconBrandX className="size-5" />
            </Button>
          </li>
          <li role="listitem">
            <Button
              aria-label="Copy link for Instagram"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-9"
              onClick={handleInstagramShare}
              title="Copy link for Instagram"
              variant="ghost"
            >
              <IconBrandInstagram className="size-5" />
            </Button>
          </li>
          <li role="listitem">
            <Button
              aria-label="Copy link to clipboard"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-gray-400 shadow-lg transition-[background-color_box-shadow_color] hover:bg-transparent hover:text-gray-700 hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:size-9"
              onClick={handleCopyLink}
              title="Copy link to clipboard"
              variant="ghost"
            >
              <IconLink className="size-5" />
            </Button>
          </li>
        </ul>
        {/* Native share Button for mobile devices */}
        <div className="mt-3">
          <Button aria-label="Share using native share dialog" className="w-full" onClick={handleNativeShare}>
            Share
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
