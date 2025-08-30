# 🛍️ ZM Deals - Modern E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)

A full-featured e-commerce platform built with Next.js 15, TypeScript, and modern web technologies. ZM Deals offers a complete solution for online retail with advanced features like coupon management, Stripe payments, inventory management, and comprehensive admin tools.

## ✨ Features

### 🛒 E-commerce Core
- **Product Management**: Complete CRUD operations with image uploads and inventory tracking
- **Category System**: Hierarchical product categorization with search functionality
- **Shopping Cart**: Persistent cart with anonymous and authenticated users
- **Wishlist**: User wishlist management with persistence
- **Order Management**: Complete order lifecycle tracking with delivery deadlines
- **Coupon System**: Advanced discount management with validation and usage tracking
- **Checkout**: Stripe-powered secure payment processing
- **Combo Deals**: Special promotional product bundles
- **Recently Viewed**: Track and display recently viewed products

### 🔐 Authentication & Security
- **Better Auth**: Modern authentication with multiple providers
- **OAuth Integration**: Google OAuth support
- **Anonymous Shopping**: Guest checkout capabilities
- **Role-based Access**: Admin and user role management
- **Session Management**: Redis-backed session storage

### 💳 Payment Processing
- **Stripe Integration**: Complete payment processing with webhooks
- **Webhook Handling**: Real-time payment event processing
- **Multiple Payment Methods**: Credit cards, UPI, and more
- **Order Status Tracking**: Real-time order updates

### 🎫 Coupon Management
- **Advanced Coupons**: Percentage and fixed amount discounts
- **Usage Limits**: Configurable usage restrictions per user and globally
- **Date Ranges**: Start and end date validation
- **Minimum Order**: Order amount requirements
- **Admin Dashboard**: Complete coupon management interface
- **Stripe Integration**: Seamless coupon application during checkout

### 📊 Inventory Management
- **Stock Tracking**: Real-time inventory management
- **Low Stock Alerts**: Automated notifications for low inventory
- **Inventory History**: Track inventory changes over time
- **Multi-location Support**: Manage inventory across different locations

### 🔍 Search & Discovery
- **Advanced Search**: Full-text search with filters and sorting
- **Product Recommendations**: AI-powered product suggestions
- **User Behavior Analysis**: Track and analyze user interactions
- **Category Filtering**: Dynamic category-based filtering

### 🎨 Modern UI/UX
- **Shadcn UI**: Beautiful, accessible components
- **Tailwind CSS 4.1.12**: Utility-first styling with animations
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support
- **Animations**: Smooth interactions with Motion (Framer Motion)
- **Carousel**: Product image carousels with Embla
- **Drag & Drop**: Interactive drag and drop functionality with DND Kit
- **Rich Text Editor**: TipTap-based content editor for admin

### 🛠️ Developer Experience
- **TypeScript 5.9.2**: Full type safety throughout the application
- **Biome 2.2.2**: Fast linting and formatting
- **Drizzle ORM**: Type-safe database operations
- **Turbopack**: Lightning-fast development builds
- **Docker**: Containerized development environment
- **Husky**: Git hooks for code quality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Docker and Docker Compose
- PostgreSQL database
- Redis instance

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd zm-deals
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/zm_deals"
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=zm_deals
   
   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379
   
   # Authentication
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="your-secret-key"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   
   # AWS S3 (for file uploads)
   AWS_BUCKET_NAME="your-bucket-name"
   AWS_BUCKET_REGION="us-east-1"
   AWS_ACCESS_KEY_ZMDEALS="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   
   # Application
   BASE_URL="http://localhost:3000"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Start the database and Redis**
   ```bash
   pnpm docker:up
   ```

5. **Run database migrations**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

6. **Generate auth schemas**
   ```bash
   pnpm auth:generate
   ```

7. **Start the development server**
   ```bash
   pnpm dev
   ```

8. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
zm-deals/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (root)/            # Main application routes
│   │   │   ├── deals/         # Product listings
│   │   │   ├── cart/          # Shopping cart
│   │   │   ├── checkout/      # Payment processing
│   │   │   ├── account/       # User account management
│   │   │   ├── categories/    # Product categories
│   │   │   ├── search/        # Search functionality
│   │   │   ├── testimonials/  # Customer testimonials
│   │   │   ├── about/         # About page
│   │   │   ├── faqs/          # Frequently asked questions
│   │   │   ├── legal/         # Legal pages
│   │   │   └── [product]/     # Individual product pages
│   │   ├── auth/              # Authentication routes
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Better Auth endpoints
│   │   │   └── upload/        # File upload handling
│   │   └── studio/            # Admin dashboard
│   │       ├── products/      # Product management
│   │       ├── orders/        # Order management
│   │       ├── users/         # User management
│   │       └── coupons/       # Coupon management
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── admin/            # Admin-specific components
│   │   ├── category/         # Category-related components
│   │   ├── editor/           # Rich text editor components
│   │   ├── layout/           # Layout components
│   │   ├── seo/              # SEO components
│   │   └── global/           # Global components
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication logic
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Payment processing
│   │   ├── coupons/          # Coupon management
│   │   ├── orders/           # Order management
│   │   ├── product/          # Product management
│   │   ├── categories/       # Category management
│   │   ├── wishlist/         # Wishlist functionality
│   │   ├── inventory/        # Inventory management
│   │   ├── users/            # User management
│   │   ├── combo-deals/      # Combo deals management
│   │   └── home/             # Home page functionality
│   ├── lib/                  # Utilities and configurations
│   │   ├── actions/          # Server actions
│   │   ├── auth/             # Authentication utilities
│   │   ├── cache/            # Caching utilities
│   │   ├── env/              # Environment configuration
│   │   ├── utils/            # Helper functions
│   │   ├── stripe/           # Stripe integration
│   │   ├── functions/        # Utility functions
│   │   ├── logging/          # Logging utilities
│   │   └── redis.ts          # Redis configuration
│   ├── server/               # Server-side code
│   │   └── schema/           # Database schemas
│   │       ├── auth-schema.ts
│   │       ├── product-schema.ts
│   │       ├── cart-schema.ts
│   │       ├── orders-schema.ts
│   │       ├── coupons-schema.ts
│   │       ├── categories-schema.ts
│   │       ├── wishlist-schema.ts
│   │       ├── inventory-schema.ts
│   │       ├── review-schema.ts
│   │       ├── search-schema.ts
│   │       ├── recently-viewed-schema.ts
│   │       ├── media-schema.ts
│   │       ├── meta-schema.ts
│   │       └── helpers.ts
│   ├── hooks/                # Custom React hooks
│   ├── data/                 # Static data and constants
│   ├── content/              # Content management
│   ├── assets/               # Static assets and icons
│   └── styles/               # Global styles
├── public/                   # Static assets
├── scripts/                  # Build and utility scripts
└── docker-compose.yml        # Docker configuration
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run Biome linter
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Biome

# Database
pnpm db:generate      # Generate database migrations
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Drizzle Studio

# Docker
pnpm docker:up        # Start Docker services (PostgreSQL, Redis, RedisInsight)
pnpm docker:down      # Stop Docker services

# Authentication
pnpm auth:generate    # Generate auth schemas
```

## 🗄️ Database Schema

The application uses PostgreSQL with Drizzle ORM. Key tables include:

- **users**: User accounts and authentication
- **products**: Product catalog with images and metadata
- **categories**: Product categorization
- **orders**: Order management with payment tracking
- **coupons**: Discount codes and validation rules
- **cart_items**: Shopping cart persistence
- **wishlist_items**: User wishlist management
- **inventory**: Stock tracking and management
- **reviews**: Product reviews and ratings
- **recently_viewed**: User browsing history
- **search_logs**: Search analytics and behavior tracking
- **media**: File uploads and media management
- **meta**: SEO and metadata management

## 🔧 Technology Stack

### Frontend
- **Next.js 15.5.2**: React framework with App Router
- **TypeScript 5.9.2**: Type-safe development
- **React 19.1.1**: Latest React with concurrent features
- **Tailwind CSS 4.1.12**: Utility-first styling
- **Shadcn UI**: Component library
- **Radix UI**: Accessible primitives
- **Motion**: Animations (Framer Motion)
- **Embla Carousel**: Image carousels
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **TipTap**: Rich text editor
- **DND Kit**: Drag and drop functionality
- **React Dropzone**: File upload handling
- **React Zoom Pan Pinch**: Image zoom functionality

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Server Actions**: Form handling and data mutations
- **Drizzle ORM**: Type-safe database operations
- **Better Auth**: Modern authentication
- **Stripe**: Payment processing
- **AWS S3**: File storage
- **Redis**: Session storage and caching

### Infrastructure
- **PostgreSQL 17.0**: Primary database
- **Redis 7.2**: Session storage and caching
- **RedisInsight 2.70**: Redis management interface
- **Docker**: Containerization

### Development Tools
- **Biome 2.2.2**: Linting and formatting
- **Turbopack**: Fast bundling
- **TypeScript**: Type checking
- **pnpm**: Package management

## 🎫 Coupon System

The platform includes a comprehensive coupon management system:

### Features
- **Multiple Discount Types**: Percentage and fixed amount discounts
- **Usage Limits**: Configurable usage restrictions per user and globally
- **Date Validation**: Start and end date enforcement
- **Minimum Order Requirements**: Order amount validation
- **Stripe Integration**: Seamless coupon application during checkout
- **Admin Dashboard**: Complete management interface

### Usage Example
```typescript
// Create a coupon
const coupon = await createCoupon({
  code: "SUMMER2024",
  discountType: "percentage",
  discountValue: 15,
  minOrderAmount: 50,
  maxDiscount: 25,
  startDate: new Date("2024-06-01"),
  endDate: new Date("2024-08-31"),
  usageLimit: 100,
  description: "Summer sale discount"
});

// Validate during checkout
const validation = await validateCoupon({
  code: "SUMMER2024",
  cartTotal: 75.50
});
```

## 🔐 Authentication

The platform uses Better Auth for authentication:

### Features
- **Multiple Providers**: Email/password and OAuth
- **Anonymous Shopping**: Guest checkout support
- **Role-based Access**: Admin and user roles
- **Session Management**: Redis-backed sessions

### Setup
1. Configure OAuth providers in your environment
2. Set up Better Auth secrets
3. Configure session storage with Redis

## 💳 Payment Processing

Stripe integration provides secure payment processing:

### Features
- **Multiple Payment Methods**: Credit cards, UPI, etc.
- **Webhook Handling**: Real-time payment events
- **Order Status Tracking**: Automatic status updates
- **Secure Checkout**: Stripe-hosted checkout pages
- **Coupon Integration**: Seamless discount application

### Setup
1. Configure Stripe keys in environment
2. Set up webhook endpoints
3. Configure payment methods in Stripe dashboard

## 📊 Inventory Management

Advanced inventory tracking system:

### Features
- **Real-time Stock Tracking**: Live inventory updates
- **Low Stock Alerts**: Automated notifications
- **Inventory History**: Track changes over time
- **Multi-location Support**: Manage across locations
- **Stock Reservations**: Hold inventory during checkout

## 🔍 Search & Discovery

Comprehensive search and recommendation system:

### Features
- **Full-text Search**: Advanced product search
- **Filtering & Sorting**: Dynamic product filtering
- **User Behavior Analysis**: Track interactions
- **Product Recommendations**: AI-powered suggestions
- **Search Analytics**: Monitor search patterns

## 🎨 Rich Text Editor

Built-in content management with TipTap:

### Features
- **WYSIWYG Editor**: Visual content creation
- **Multiple Extensions**: Typography, images, horizontal rules
- **Custom Styling**: Tailwind CSS integration
- **Admin Interface**: Easy content management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Docker
```bash
# Build the application
docker build -t zm-deals .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables
Ensure all required environment variables are set in your production environment.

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **Stripe Integration**: Complete payment setup guide
- **Coupon System**: Advanced coupon management
- **Inventory Management**: Stock tracking and alerts
- **Search Feature**: Search implementation details
- **User Behavior Analysis**: Analytics and tracking
- **Recommendation System**: AI-powered suggestions
- **Webhook Flow**: Payment event processing
- **Review System**: Product review management


## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://better-auth.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [TipTap Editor](https://tiptap.dev/)
- [Embla Carousel](https://www.embla-carousel.com/)
- [DND Kit](https://dndkit.com/)

---

Built with ❤️ using modern web technologies

---

**Website designed and developed by [Ziron Media](https://www.zironmedia.com)**
