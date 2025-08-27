"use client";

import Link from "next/link";

import { motion } from "motion/react";

import { Banner, BannerContent, BannerDescription, BannerText, BannerTitle } from "../ui/banner";
import { Button } from "../ui/button";

export const LoginPrompt = () => {
  return (
    <motion.div
      animate={{
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
      }}
      className="-translate-x-1/2 fixed bottom-16 left-1/2 z-50 w-[90%] sm:w-auto md:bottom-4"
      initial={{
        y: 100,
        opacity: 0,
        filter: "blur(10px)",
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 5,
      }}
    >
      <Banner className="bg-card shadow-xl sm:max-w-fit">
        <BannerContent className="flex items-center justify-between gap-3">
          <BannerText>
            <BannerTitle className="font-medium text-sm">Login for better experience</BannerTitle>
            <BannerDescription>
              <p className="text-[11px] text-muted-foreground sm:text-xs">
                Login to your account to get the best deals and discounts
              </p>
            </BannerDescription>
          </BannerText>
          <Button asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
        </BannerContent>
      </Banner>
    </motion.div>
  );
};
