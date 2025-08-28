import "dotenv/config";

import { db } from "@/server/db";
import { categories } from "@/server/schema/categories-schema";

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  // Create categories
  const categoryData = [
    {
      name: "Appliances & Cleaning",
      slug: "appliances-cleaning",
      description: "Essential products for your home and kitchen needs",
    },
    {
      name: "Electronics & Accessories",
      slug: "electronics-accessories",
      description: "Latest electronics and smart gadgets for modern living",
    },
    {
      name: "Bathroom & Hygiene",
      slug: "bathroom-hygiene",
      description: "Bathroom essentials and personal hygiene products",
    },
  ];

  const createdCategories = [];
  for (const category of categoryData) {
    const [newCategory] = await db.insert(categories).values(category).returning();
    createdCategories.push(newCategory);
    console.log(`✅ Created category: ${category.name}`);
  }

  console.log("🎉 Categories seeding completed!");
  console.log("📊 Summary:");
  console.log(`   - Categories created: ${createdCategories.length}`);

  // Log category IDs for reference when seeding products
  console.log("\n📋 Category IDs for reference:");
  createdCategories.forEach((category) => {
    console.log(`   - ${category.name}: ${category.id}`);
  });
}

// Run the seeding function
seedCategories().catch(console.error);
