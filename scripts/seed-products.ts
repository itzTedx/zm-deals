import "dotenv/config";

import { db } from "@/server/db";
import { categories } from "@/server/schema/categories-schema";
import { inventory } from "@/server/schema/inventory-schema";
import { mediaTable } from "@/server/schema/media-schema";
import { productImages, products } from "@/server/schema/product-schema";

async function seedProducts() {
  console.log("🌱 Seeding products...");

  // Note: Run seed-categories.ts first to ensure categories exist
  // You can also manually provide category IDs if needed

  // Get existing categories
  const existingCategories = await db.select().from(categories);

  if (existingCategories.length === 0) {
    console.error("❌ No categories found. Please run seed-categories.ts first.");
    return;
  }

  console.log(`📋 Found ${existingCategories.length} existing categories`);
  console.log("💡 Run 'pnpm tsx scripts/seed-categories.ts' first if you need to create categories");

  // Create media entries for the 3 images
  const mediaData = [
    {
      url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
      alt: "Vacuum Suction Phone Holder",
      key: "vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
      width: 800,
      height: 600,
    },
    {
      url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/39743a5fa0ff6af10b1b4ba273bbc6ec-4f0c3d2c90bb17ef717b79fd3d9a55e2.webp",
      alt: "Mobile Phone Charging Stand",
      key: "39743a5fa0ff6af10b1b4ba273bbc6ec-4f0c3d2c90bb17ef717b79fd3d9a55e2.webp",
      width: 800,
      height: 600,
    },
    {
      url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/c9c6f2f912d64e9985748e4433790b81-goods-9bf74001132c1df184aa28ec910daea9.webp",
      alt: "5-Slot Black Toothbrush Holder",
      key: "c9c6f2f912d64e9985748e4433790b81-goods-9bf74001132c1df184aa28ec910daea9.webp",
      width: 800,
      height: 600,
    },
  ];

  const createdMedia = [];
  for (const media of mediaData) {
    const [newMedia] = await db.insert(mediaTable).values(media).returning();
    createdMedia.push(newMedia);
    console.log(`✅ Created media: ${media.alt}`);
  }

  // Create 6 products
  const productData = [
    {
      title: "Portable Bluetooth Speaker",
      overview:
        "Waterproof portable Bluetooth speaker with 360-degree sound, perfect for outdoor activities and parties.",
      description:
        "Take your music anywhere with this rugged, waterproof portable Bluetooth speaker. Featuring 360-degree sound projection, 20-hour battery life, and IPX7 waterproof rating, it's perfect for beach trips, camping, pool parties, or any outdoor adventure. The compact design fits easily in your bag while delivering powerful, crystal-clear audio that fills any space.",
      slug: "portable-bluetooth-speaker",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "67.99",
      compareAtPrice: "129.99",
      isDeliveryFree: true,
      image: createdMedia[0].url!,
      isFeatured: true,
      endsIn: new Date("2025-09-04 20:00:00"),
      schedule: new Date("2025-08-27 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Smart LED Strip Lights",
      overview: "WiFi-enabled LED strip lights with voice control, perfect for creating ambient lighting in any room.",
      description:
        "Transform your space with these smart LED strip lights that connect to your WiFi and respond to voice commands. Choose from 16 million colors, set schedules, and create custom lighting scenes for any mood. Perfect for bedrooms, living rooms, or behind TVs for that cinematic effect. Easy installation with adhesive backing and smartphone app control.",
      slug: "smart-led-strip-lights",
      categoryId: existingCategories[0].id, // Home & Kitchen
      price: "34.50",
      compareAtPrice: "69.99",
      isDeliveryFree: true,
      image: createdMedia[1].url!,
      isFeatured: false,
      endsIn: new Date("2025-09-11 20:00:00"),
      schedule: new Date("2025-08-28 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Electric Facial Cleansing Brush",
      overview:
        "Professional-grade electric facial cleansing brush with multiple speed settings and waterproof design.",
      description:
        "Achieve spa-quality skincare at home with this professional electric facial cleansing brush. Features 3 speed settings, waterproof design, and gentle silicone bristles that remove makeup, dirt, and oil without irritating sensitive skin. Includes a charging stand and travel case. Perfect for all skin types and helps improve skin texture and tone with regular use.",
      slug: "electric-facial-cleansing-brush",
      categoryId: existingCategories[2].id, // Bathroom & Hygiene
      price: "42.99",
      compareAtPrice: "89.99",
      isDeliveryFree: true,
      image: createdMedia[2].url!,
      isFeatured: false,
      endsIn: new Date("2025-08-30 20:00:00"),
      schedule: new Date("2025-08-27 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Air Fryer with Digital Display",
      overview: "6-quart digital air fryer with 8 cooking presets, perfect for healthy, crispy meals without oil.",
      description:
        "Cook healthier meals with this 6-quart digital air fryer that uses up to 80% less oil than traditional frying. Features 8 cooking presets, digital display, and dishwasher-safe parts for easy cleanup. Perfect for fries, chicken, fish, vegetables, and even desserts. The large capacity feeds families while the compact design fits easily on countertops.",
      slug: "air-fryer-digital-display",
      categoryId: existingCategories[0].id, // Home & Kitchen
      price: "89.99",
      compareAtPrice: "149.99",
      isDeliveryFree: true,
      image: createdMedia[0].url!, // Reusing image
      isFeatured: true,
      endsIn: new Date("2025-09-15 20:00:00"),
      schedule: new Date("2025-08-29 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Wireless Charging Pad",
      overview: "Fast wireless charging pad compatible with all Qi-enabled devices, sleek design with LED indicator.",
      description:
        "Charge your phone wirelessly with this sleek charging pad that supports up to 15W fast charging for compatible devices. Features a non-slip surface, LED charging indicator, and compact design that fits perfectly on desks or nightstands. Compatible with all Qi-enabled smartphones and devices. No more tangled cables or searching for charging ports.",
      slug: "wireless-charging-pad",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "28.99",
      compareAtPrice: "59.99",
      isDeliveryFree: true,
      image: createdMedia[1].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-09-20 20:00:00"),
      schedule: new Date("2025-08-30 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Shower Head with Filter",
      overview:
        "High-pressure shower head with built-in filter to remove chlorine and impurities for healthier skin and hair.",
      description:
        "Upgrade your shower experience with this high-pressure shower head featuring a built-in filter that removes chlorine, heavy metals, and other impurities from your water. The 3-setting spray pattern includes rainfall, massage, and mist modes. Easy installation fits most standard shower arms. Enjoy softer skin, healthier hair, and a more refreshing shower experience.",
      slug: "shower-head-with-filter",
      categoryId: existingCategories[2].id, // Bathroom & Hygiene
      price: "45.50",
      compareAtPrice: "89.99",
      isDeliveryFree: true,
      image: createdMedia[2].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-09-25 20:00:00"),
      schedule: new Date("2025-08-31 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Smart Coffee Maker",
      overview:
        "Programmable coffee maker with WiFi connectivity and smartphone app control for the perfect brew every time.",
      description:
        "Start your day with the perfect cup of coffee using this smart coffee maker. Features WiFi connectivity, smartphone app control, and programmable brewing schedules. Choose from multiple brew strengths, set timers, and even get notifications when your coffee is ready. The 12-cup capacity is perfect for families or coffee enthusiasts who love to entertain.",
      slug: "smart-coffee-maker",
      categoryId: existingCategories[0].id, // Home & Kitchen
      price: "129.99",
      compareAtPrice: "199.99",
      isDeliveryFree: true,
      image: createdMedia[0].url!, // Reusing image
      isFeatured: true,
      endsIn: new Date("2025-10-01 20:00:00"),
      schedule: new Date("2025-09-01 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Portable Power Bank",
      overview: "20000mAh portable power bank with fast charging and multiple USB ports for all your devices.",
      description:
        "Never run out of battery again with this high-capacity 20000mAh portable power bank. Features fast charging technology, multiple USB ports to charge multiple devices simultaneously, and a sleek, compact design that fits easily in your bag. Perfect for travelers, students, or anyone who needs reliable power on the go. Includes LED indicator to show remaining battery life.",
      slug: "portable-power-bank",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "39.99",
      compareAtPrice: "79.99",
      isDeliveryFree: true,
      image: createdMedia[1].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-10-05 20:00:00"),
      schedule: new Date("2025-09-02 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Bamboo Bath Towel Set",
      overview: "Luxurious bamboo bath towel set with ultra-soft, absorbent fabric perfect for spa-like comfort.",
      description:
        "Experience luxury every day with this premium bamboo bath towel set. Made from 100% organic bamboo fibers, these towels are incredibly soft, highly absorbent, and naturally antibacterial. The set includes bath towels, hand towels, and washcloths in coordinating colors. Bamboo towels are more sustainable than cotton and get softer with each wash, providing spa-like comfort in your own home.",
      slug: "bamboo-bath-towel-set",
      categoryId: existingCategories[2].id, // Bathroom & Hygiene
      price: "67.50",
      compareAtPrice: "129.99",
      isDeliveryFree: true,
      image: createdMedia[2].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-10-10 20:00:00"),
      schedule: new Date("2025-09-03 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Smart Home Security Camera",
      overview:
        "1080p HD security camera with night vision, motion detection, and two-way audio for complete home monitoring.",
      description:
        "Keep your home safe with this smart security camera featuring 1080p HD video, night vision up to 30 feet, and motion detection alerts. The two-way audio allows you to communicate with visitors or pets remotely. Connects to your WiFi and works with popular smart home platforms. Perfect for monitoring your home, office, or any space that needs surveillance. Includes free cloud storage and mobile app access.",
      slug: "smart-home-security-camera",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "89.99",
      compareAtPrice: "149.99",
      isDeliveryFree: true,
      image: createdMedia[0].url!, // Reusing image
      isFeatured: true,
      endsIn: new Date("2025-10-15 20:00:00"),
      schedule: new Date("2025-09-04 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Robot Vacuum Cleaner",
      overview:
        "Smart robot vacuum with mapping technology, app control, and automatic charging for hands-free cleaning.",
      description:
        "Let technology clean your floors with this intelligent robot vacuum cleaner. Features advanced mapping technology, smartphone app control, and automatic charging. The robot learns your home layout and creates efficient cleaning paths. Perfect for busy households, pet owners, or anyone who wants to maintain clean floors without the effort. Includes HEPA filtration and works on multiple floor types.",
      slug: "robot-vacuum-cleaner",
      categoryId: existingCategories[0].id, // Home & Kitchen
      price: "199.99",
      compareAtPrice: "349.99",
      isDeliveryFree: true,
      image: createdMedia[1].url!, // Reusing image
      isFeatured: true,
      endsIn: new Date("2025-10-20 20:00:00"),
      schedule: new Date("2025-09-05 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Wireless Gaming Headset",
      overview:
        "Premium wireless gaming headset with surround sound, noise cancellation, and long battery life for immersive gaming.",
      description:
        "Elevate your gaming experience with this premium wireless headset featuring 7.1 surround sound, active noise cancellation, and up to 20 hours of battery life. The comfortable over-ear design with memory foam cushions ensures long gaming sessions without discomfort. Compatible with PC, PlayStation, Xbox, and mobile devices. Perfect for competitive gaming, streaming, or casual play with crystal-clear audio and voice chat.",
      slug: "wireless-gaming-headset",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "129.99",
      compareAtPrice: "249.99",
      isDeliveryFree: true,
      image: createdMedia[2].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-10-25 20:00:00"),
      schedule: new Date("2025-09-06 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Electric Toothbrush with UV Sanitizer",
      overview: "Sonic electric toothbrush with built-in UV sanitizer and travel case for complete oral hygiene.",
      description:
        "Upgrade your oral care routine with this advanced electric toothbrush featuring sonic technology and a built-in UV sanitizer. The UV sanitizer kills 99.9% of bacteria on your brush head, ensuring maximum hygiene. Includes multiple cleaning modes, pressure sensor, and a sleek travel case. The long-lasting battery provides up to 3 weeks of use on a single charge. Perfect for maintaining optimal oral health with professional-grade cleaning.",
      slug: "electric-toothbrush-uv-sanitizer",
      categoryId: existingCategories[2].id, // Bathroom & Hygiene
      price: "89.99",
      compareAtPrice: "179.99",
      isDeliveryFree: true,
      image: createdMedia[0].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-10-30 20:00:00"),
      schedule: new Date("2025-09-07 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Smart Kitchen Scale",
      overview: "Digital kitchen scale with nutritional tracking and recipe mode for precise cooking and baking.",
      description:
        "Take your cooking and baking to the next level with this smart digital kitchen scale. Features nutritional tracking, recipe mode, and precise measurements up to 11 pounds. The large LCD display shows weight, calories, and nutritional information for thousands of foods. Perfect for meal prep, baking, portion control, or anyone following specific dietary requirements. Connects to your smartphone for detailed tracking and recipe sharing.",
      slug: "smart-kitchen-scale",
      categoryId: existingCategories[0].id, // Home & Kitchen
      price: "45.99",
      compareAtPrice: "89.99",
      isDeliveryFree: true,
      image: createdMedia[1].url!, // Reusing image
      isFeatured: false,
      endsIn: new Date("2025-11-05 20:00:00"),
      schedule: new Date("2025-09-08 20:00:00"),
      status: "published" as const,
    },
    {
      title: "Portable Bluetooth Projector",
      overview: "Mini portable projector with built-in speakers and wireless connectivity for movie nights anywhere.",
      description:
        "Transform any space into a home theater with this portable Bluetooth projector. Features 1080p resolution, built-in speakers, and wireless connectivity for streaming from your phone, tablet, or laptop. The compact design fits in your pocket, making it perfect for outdoor movie nights, business presentations, or entertainment on the go. Includes tripod mount and multiple input options for versatile use.",
      slug: "portable-bluetooth-projector",
      categoryId: existingCategories[1].id, // Electronics & Gadgets
      price: "159.99",
      compareAtPrice: "299.99",
      isDeliveryFree: true,
      image: createdMedia[2].url!, // Reusing image
      isFeatured: true,
      endsIn: new Date("2025-11-10 20:00:00"),
      schedule: new Date("2025-09-09 20:00:00"),
      status: "published" as const,
    },
  ];

  const createdProducts = [];
  for (const product of productData) {
    const [newProduct] = await db.insert(products).values(product).returning();
    createdProducts.push(newProduct);
    console.log(`✅ Created product: ${product.title}`);
  }

  // Create product images (linking products to media)
  const productImageData = [
    // Product 1 - Portable Bluetooth Speaker
    {
      productId: createdProducts[0].id,
      mediaId: createdMedia[0].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 2 - Smart LED Strip Lights
    {
      productId: createdProducts[1].id,
      mediaId: createdMedia[1].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 3 - Electric Facial Cleansing Brush
    {
      productId: createdProducts[2].id,
      mediaId: createdMedia[2].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 4 - Air Fryer with Digital Display
    {
      productId: createdProducts[3].id,
      mediaId: createdMedia[0].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 5 - Wireless Charging Pad
    {
      productId: createdProducts[4].id,
      mediaId: createdMedia[1].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 6 - Shower Head with Filter
    {
      productId: createdProducts[5].id,
      mediaId: createdMedia[2].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 7 - Smart Coffee Maker
    {
      productId: createdProducts[6].id,
      mediaId: createdMedia[0].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 8 - Portable Power Bank
    {
      productId: createdProducts[7].id,
      mediaId: createdMedia[1].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 9 - Bamboo Bath Towel Set
    {
      productId: createdProducts[8].id,
      mediaId: createdMedia[2].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 10 - Smart Home Security Camera
    {
      productId: createdProducts[9].id,
      mediaId: createdMedia[0].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 11 - Robot Vacuum Cleaner
    {
      productId: createdProducts[10].id,
      mediaId: createdMedia[1].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 12 - Wireless Gaming Headset
    {
      productId: createdProducts[11].id,
      mediaId: createdMedia[2].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 13 - Electric Toothbrush with UV Sanitizer
    {
      productId: createdProducts[12].id,
      mediaId: createdMedia[0].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 14 - Smart Kitchen Scale
    {
      productId: createdProducts[13].id,
      mediaId: createdMedia[1].id,
      isFeatured: true,
      sortOrder: 0,
    },
    // Product 15 - Portable Bluetooth Projector
    {
      productId: createdProducts[14].id,
      mediaId: createdMedia[2].id,
      isFeatured: true,
      sortOrder: 0,
    },
  ];

  for (const productImage of productImageData) {
    await db.insert(productImages).values(productImage);
    console.log(`✅ Created product image for product: ${productImage.productId}`);
  }

  // Create inventory for each product
  const inventoryData = [
    {
      productId: createdProducts[0].id, // Portable Bluetooth Speaker
      stock: 25,
      initialStock: 25,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[1].id, // Smart LED Strip Lights
      stock: 42,
      initialStock: 50,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[2].id, // Electric Facial Cleansing Brush
      stock: 18,
      initialStock: 30,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[3].id, // Air Fryer with Digital Display
      stock: 8,
      initialStock: 15,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[4].id, // Wireless Charging Pad
      stock: 35,
      initialStock: 40,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[5].id, // Shower Head with Filter
      stock: 12,
      initialStock: 20,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[6].id, // Smart Coffee Maker
      stock: 15,
      initialStock: 25,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[7].id, // Portable Power Bank
      stock: 28,
      initialStock: 35,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[8].id, // Bamboo Bath Towel Set
      stock: 22,
      initialStock: 30,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[9].id, // Smart Home Security Camera
      stock: 10,
      initialStock: 18,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[10].id, // Robot Vacuum Cleaner
      stock: 15,
      initialStock: 20,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[11].id, // Wireless Gaming Headset
      stock: 30,
      initialStock: 40,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[12].id, // Electric Toothbrush with UV Sanitizer
      stock: 20,
      initialStock: 25,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[13].id, // Smart Kitchen Scale
      stock: 18,
      initialStock: 25,
      isOutOfStock: false,
    },
    {
      productId: createdProducts[14].id, // Portable Bluetooth Projector
      stock: 10,
      initialStock: 15,
      isOutOfStock: false,
    },
  ];

  for (const inv of inventoryData) {
    await db.insert(inventory).values(inv);
    console.log(`✅ Created inventory for product: ${inv.productId}`);
  }

  console.log("🎉 Product seeding completed!");
  console.log("📊 Summary:");
  console.log(`   - Categories used: ${existingCategories.length}`);
  console.log(`   - Media entries created: ${createdMedia.length}`);
  console.log(`   - Products created: ${createdProducts.length}`);
  console.log(`   - Product images linked: ${productImageData.length}`);
  console.log(`   - Inventory entries created: ${inventoryData.length}`);
}

// Run the seeding function
seedProducts().catch(console.error);
