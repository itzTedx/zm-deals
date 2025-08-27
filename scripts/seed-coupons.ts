import "dotenv/config";

import { createCoupon } from "@/modules/coupons/actions/mutation";

async function seedCoupons() {
  console.log("🌱 Seeding test coupons...");

  const testCoupons = [
    {
      code: "WELCOME10",
      discountType: "percentage" as const,
      discountValue: 10,
      minOrderAmount: 25,
      maxDiscount: 20,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      usageLimit: 1000,
      description: "Welcome discount - 10% off orders over $25",
    },
    {
      code: "SAVE5",
      discountType: "fixed" as const,
      discountValue: 5,
      minOrderAmount: 50,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      usageLimit: 500,
      description: "Save $5 on orders over $50",
    },
    {
      code: "SUMMER20",
      discountType: "percentage" as const,
      discountValue: 20,
      minOrderAmount: 100,
      maxDiscount: 50,
      startDate: new Date("2024-06-01"),
      endDate: new Date("2024-08-31"),
      usageLimit: 200,
      description: "Summer sale - 20% off orders over $100",
    },
    {
      code: "FREESHIP",
      discountType: "fixed" as const,
      discountValue: 10,
      minOrderAmount: 75,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2025-12-31"),
      usageLimit: 1000,
      description: "Free shipping equivalent - $10 off orders over $75",
    },
  ];

  for (const couponData of testCoupons) {
    try {
      const result = await createCoupon(couponData);
      if (result.success) {
        console.log(`✅ Created coupon: ${couponData.code}`);
      } else {
        console.log(`❌ Failed to create coupon ${couponData.code}: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error creating coupon ${couponData.code}:`, error);
    }
  }

  console.log("🎉 Coupon seeding completed!");
}

// Run the seeding function
seedCoupons().catch(console.error);
