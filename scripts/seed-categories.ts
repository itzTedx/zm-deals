import "dotenv/config";

import { db } from "@/server/db";
import { categories, categoryImages } from "@/server/schema/categories-schema";
import { mediaTable } from "@/server/schema/media-schema";

async function seedCategories() {
  console.log("🌱 Seeding categories...");

  // Create categories with images
  const categoryData = [
    {
      name: "Appliances & Cleaning",
      slug: "appliances-cleaning",
      description: "Essential products for your home and kitchen needs",
      thumbnail: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/136dd7d941be286ec077cd715cbfa3db-exhibition-cargo.webp",
        alt: "Kitchen appliances and cleaning supplies",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/appliances-cleaning-thumbnail.webp",
      },
      banner: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/5073b3ecd80a7043d03871469f809303-f8ff9b5ce61343be95934135bbb798b5.webp",
        alt: "Kitchen appliances and cleaning supplies banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/appliances-cleaning-banner.webp",
      },
    },
    {
      name: "Electronics & Accessories",
      slug: "electronics-accessories",
      description: "Latest electronics and smart gadgets for modern living",
      thumbnail: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/55391da0ed923484224afcefd9097de8-f4104f65d4.jpg",
        alt: "Electronics and accessories",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/electronics-accessories-thumbnail.jpg",
      },
      banner: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/5c992c4f50d8d715c0100bef4eee811a-Green_1_284f66a1-dd5a-4ba2-834c-cf5fa47859c0.webp",
        alt: "Electronics and accessories banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/electronics-accessories-banner.webp",
      },
    },
    {
      name: "Bathroom & Hygiene",
      slug: "bathroom-hygiene",
      description: "Bathroom essentials and personal hygiene products",
      thumbnail: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/5dd7706e78b2bae3a0ecf15cafda7cba-Green_1_284f66a1-dd5a-4ba2-834c-cf5fa47859c0.webp",
        alt: "Bathroom and hygiene products",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/bathroom-hygiene-thumbnail.webp",
      },
      banner: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/686b9fe6d12f584c2b433614e620a9a2-Green_2_18cdb17b-638e-4a2e-8231-15cd6f4b3c96.webp",
        alt: "Bathroom and hygiene products banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/bathroom-hygiene-banner.webp",
      },
    },
    {
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      description: "Trendy clothing, shoes, and fashion accessories for all seasons",
      thumbnail: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/153a0f12a5e916433bd89d8a2408d0fd-5afaea25-140c-4a67-aedd-a81f570dec5d.jpg",
        alt: "Fashion and apparel collection",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/fashion-apparel-thumbnail.jpg",
      },
      banner: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/136dd7d941be286ec077cd715cbfa3db-exhibition-cargo.webp",
        alt: "Fashion and apparel collection banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/fashion-apparel-banner.webp",
      },
    },
    {
      name: "Home & Garden",
      slug: "home-garden",
      description: "Everything you need to beautify your home and garden",
      thumbnail: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/5073b3ecd80a7043d03871469f809303-f8ff9b5ce61343be95934135bbb798b5.webp",
        alt: "Home and garden decor",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/home-garden-thumbnail.webp",
      },
      banner: {
        url: "https://foneflip-local.s3.us-east-1.amazonaws.com/70624b96-28e1-4df8-9087-4e85dfdd3e14/product/55391da0ed923484224afcefd9097de8-f4104f65d4.jpg",
        alt: "Home and garden decor banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/home-garden-banner.jpg",
      },
    },
    {
      name: "Sports & Fitness",
      slug: "sports-fitness",
      description: "Equipment and gear for sports, fitness, and outdoor activities",
      thumbnail: {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        alt: "Sports and fitness equipment",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/sports-fitness-thumbnail.jpg",
      },
      banner: {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=400&fit=crop",
        alt: "Sports and fitness equipment banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/sports-fitness-banner.jpg",
      },
    },
    {
      name: "Beauty & Personal Care",
      slug: "beauty-personal-care",
      description: "Cosmetics, skincare, and personal care products for your beauty routine",
      thumbnail: {
        url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
        alt: "Beauty and personal care products",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/beauty-personal-care-thumbnail.jpg",
      },
      banner: {
        url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&h=400&fit=crop",
        alt: "Beauty and personal care products banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/beauty-personal-care-banner.jpg",
      },
    },
    {
      name: "Toys & Games",
      slug: "toys-games",
      description: "Fun toys, games, and entertainment for all ages",
      thumbnail: {
        url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop",
        alt: "Toys and games collection",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/toys-games-thumbnail.jpg",
      },
      banner: {
        url: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=1200&h=400&fit=crop",
        alt: "Toys and games collection banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/toys-games-banner.jpg",
      },
    },
    {
      name: "Automotive & Tools",
      slug: "automotive-tools",
      description: "Car accessories, tools, and automotive maintenance products",
      thumbnail: {
        url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
        alt: "Automotive and tools",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/automotive-tools-thumbnail.jpg",
      },
      banner: {
        url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=400&fit=crop",
        alt: "Automotive and tools banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/automotive-tools-banner.jpg",
      },
    },
    {
      name: "Books & Stationery",
      slug: "books-stationery",
      description: "Books, office supplies, and stationery for work and study",
      thumbnail: {
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
        alt: "Books and stationery",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/books-stationery-thumbnail.jpg",
      },
      banner: {
        url: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop",
        alt: "Books and stationery banner",
        width: 1200,
        height: 400,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/books-stationery-banner.jpg",
      },
    },
  ];

  const createdCategories = [];
  for (const categoryDataItem of categoryData) {
    // Create category
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: categoryDataItem.name,
        slug: categoryDataItem.slug,
        description: categoryDataItem.description,
      })
      .returning();

    createdCategories.push(newCategory);
    console.log(`✅ Created category: ${categoryDataItem.name}`);

    // Create thumbnail image
    const [thumbnailMedia] = await db.insert(mediaTable).values(categoryDataItem.thumbnail).returning();
    await db.insert(categoryImages).values({
      categoryId: newCategory.id,
      mediaId: thumbnailMedia.id,
      type: "thumbnail",
    });
    console.log("   📸 Added thumbnail image");

    // Create banner image
    const [bannerMedia] = await db.insert(mediaTable).values(categoryDataItem.banner).returning();
    await db.insert(categoryImages).values({
      categoryId: newCategory.id,
      mediaId: bannerMedia.id,
      type: "banner",
    });
    console.log("   🖼️  Added banner image");
  }

  console.log("🎉 Categories seeding completed!");
  console.log("📊 Summary:");
  console.log(`   - Categories created: ${createdCategories.length}`);
  console.log(`   - Images created: ${createdCategories.length * 2}`);

  // Log category IDs for reference when seeding products
  console.log("\n📋 Category IDs for reference:");
  createdCategories.forEach((category) => {
    console.log(`   - ${category.name}: ${category.id}`);
  });
}

// Run the seeding function
seedCategories().catch(console.error);
