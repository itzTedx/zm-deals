import "dotenv/config";

import { db } from "@/server/db";
import { comboDealProducts, comboDeals } from "@/server/schema/product-schema";

async function seedCombos() {
  console.log("🌱 Seeding combo deals...");

  // First, let's get some existing products to use in combos
  const existingProducts = await db.query.products.findMany({
    columns: {
      id: true,
      title: true,
      price: true,
    },
    limit: 10, // Get first 10 products
  });

  if (existingProducts.length < 3) {
    console.log("❌ Need at least 3 products to create combo deals. Please seed products first.");
    return;
  }

  console.log(`📦 Found ${existingProducts.length} products to use in combos`);

  // Create combo deals
  const comboData = [
    {
      title: "Kitchen Essentials Bundle",
      slug: "kitchen-essentials-bundle",
      description: "Complete your kitchen with this essential bundle including cleaning supplies and storage solutions",
      originalPrice: 89.99,
      comboPrice: 64.99,
      isFeatured: true,
      products: [
        { productId: existingProducts[0]?.id, quantity: 1, sortOrder: 0 },
        { productId: existingProducts[1]?.id, quantity: 1, sortOrder: 1 },
        { productId: existingProducts[2]?.id, quantity: 2, sortOrder: 2 },
      ],
    },
    {
      title: "Bathroom Refresh Combo",
      slug: "bathroom-refresh-combo",
      description: "Transform your bathroom with this comprehensive cleaning and organization combo",
      originalPrice: 67.5,
      comboPrice: 49.99,
      isFeatured: false,
      products: [
        { productId: existingProducts[3]?.id, quantity: 1, sortOrder: 0 },
        { productId: existingProducts[4]?.id, quantity: 1, sortOrder: 1 },
      ],
    },
    {
      title: "Electronics Starter Pack",
      slug: "electronics-starter-pack",
      description: "Get started with the latest electronics and accessories at an unbeatable price",
      originalPrice: 129.99,
      comboPrice: 99.99,
      isFeatured: true,
      maxQuantity: 5,
      products: [
        { productId: existingProducts[5]?.id, quantity: 1, sortOrder: 0 },
        { productId: existingProducts[6]?.id, quantity: 1, sortOrder: 1 },
        { productId: existingProducts[7]?.id, quantity: 1, sortOrder: 2 },
      ],
    },
    {
      title: "Home Cleaning Mega Pack",
      slug: "home-cleaning-mega-pack",
      description: "Everything you need for a spotless home in one convenient package",
      originalPrice: 145.0,
      comboPrice: 109.99,
      isFeatured: false,
      products: [
        { productId: existingProducts[8]?.id, quantity: 1, sortOrder: 0 },
        { productId: existingProducts[9]?.id, quantity: 1, sortOrder: 1 },
        { productId: existingProducts[0]?.id, quantity: 1, sortOrder: 2 },
      ],
    },
  ];

  const createdCombos = [];

  for (const combo of comboData) {
    try {
      // Calculate savings
      const savings = combo.originalPrice - combo.comboPrice;

      // Create combo deal
      const [newCombo] = await db
        .insert(comboDeals)
        .values({
          title: combo.title,
          description: combo.description,
          slug: combo.slug,
          originalPrice: combo.originalPrice.toString(),
          comboPrice: combo.comboPrice.toString(),
          savings: savings.toString(),
          isFeatured: combo.isFeatured,
          isActive: true,
          maxQuantity: combo.maxQuantity || null,
        })
        .returning();

      // Create combo deal products
      const comboProducts = combo.products.map((product) => ({
        comboDealId: newCombo.id,
        productId: product.productId,
        quantity: product.quantity,
        sortOrder: product.sortOrder,
      }));

      await db.insert(comboDealProducts).values(comboProducts);

      createdCombos.push(newCombo);
      console.log(`✅ Created combo: ${combo.title} (${combo.products.length} products)`);
    } catch (error) {
      console.error(`❌ Failed to create combo ${combo.title}:`, error);
    }
  }

  console.log("🎉 Combo deals seeding completed!");
  console.log("📊 Summary:");
  console.log(`   - Combos created: ${createdCombos.length}`);

  // Log combo IDs for reference
  console.log("\n📋 Combo IDs for reference:");
  createdCombos.forEach((combo) => {
    console.log(`   - ${combo.title}: ${combo.id}`);
  });
}

// Run the seeding function
seedCombos().catch(console.error);
