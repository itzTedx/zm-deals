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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Kitchen appliances and cleaning supplies",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/appliances-cleaning-thumbnail.webp",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Electronics and accessories",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/electronics-accessories-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Bathroom and hygiene products",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/bathroom-hygiene-thumbnail.webp",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Fashion and apparel collection",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/fashion-apparel-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Home and garden decor",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/home-garden-thumbnail.webp",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Sports and fitness equipment",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/sports-fitness-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Beauty and personal care products",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/beauty-personal-care-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Toys and games collection",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/toys-games-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Automotive and tools",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/automotive-tools-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
        alt: "Books and stationery",
        width: 400,
        height: 300,
        blurData:
          "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        key: "categories/books-stationery-thumbnail.jpg",
      },
      banner: {
        url: "https://zm-deals-local.s3.us-east-1.amazonaws.com/products/vacuum-holder-95fe347e5d6b4bc13d937389a40c1c74.png",
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
