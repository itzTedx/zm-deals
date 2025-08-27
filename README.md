# 🛍️ ZM Deals - Modern E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange?style=flat-square&logo=pnpm)](https://pnpm.io/)

A full-featured e-commerce platform built with Next.js 15, TypeScript, and modern web technologies. ZM Deals offers a complete solution for online retail with advanced features like coupon management, Stripe payments, and comprehensive admin tools.

## ✨ Features

### 🛒 E-commerce Core
- **Product Management**: Complete CRUD operations with image uploads
- **Category System**: Hierarchical product categorization
- **Shopping Cart**: Persistent cart with anonymous and authenticated users
- **Order Management**: Complete order lifecycle tracking
- **Coupon System**: Advanced discount management with validation
- **Checkout**: Stripe-powered secure payment processing

### 🔐 Authentication & Security
- **Better Auth**: Modern authentication with multiple providers
- **OAuth Integration**: Google OAuth support
- **Anonymous Shopping**: Guest checkout capabilities
- **Role-based Access**: Admin and user role management
- **Session Management**: Redis-backed session storage

### 💳 Payment Processing
- **Stripe Integration**: Complete payment processing
- **Webhook Handling**: Real-time payment event processing
- **Multiple Payment Methods**: Credit cards, UPI, and more
- **Order Status Tracking**: Real-time order updates

### 🎫 Coupon Management
- **Advanced Coupons**: Percentage and fixed amount discounts
- **Usage Limits**: Configurable usage restrictions
- **Date Ranges**: Start and end date validation
- **Minimum Order**: Order amount requirements
- **Admin Dashboard**: Complete coupon management interface

### 🎨 Modern UI/UX
- **Shadcn UI**: Beautiful, accessible components
- **Tailwind CSS**: Utility-first styling
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme switching support
- **Animations**: Smooth interactions with Framer Motion

### 🛠️ Developer Experience
- **TypeScript**: Full type safety
- **Biome**: Fast linting and formatting
- **Drizzle ORM**: Type-safe database operations
- **Turbopack**: Lightning-fast development builds
- **Docker**: Containerized development environment

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

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
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
│   │   │   └── [product]/     # Individual product pages
│   │   ├── auth/              # Authentication routes
│   │   ├── api/               # API routes
│   │   └── studio/            # Admin dashboard
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── forms/            # Form components
│   │   └── layout/           # Layout components
│   ├── modules/              # Feature modules
│   │   ├── auth/             # Authentication logic
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Payment processing
│   │   ├── coupons/          # Coupon management
│   │   ├── orders/           # Order management
│   │   └── product/          # Product management
│   ├── lib/                  # Utilities and configurations
│   │   ├── actions/          # Server actions
│   │   ├── auth/             # Authentication utilities
│   │   ├── env/              # Environment configuration
│   │   └── utils/            # Helper functions
│   ├── server/               # Server-side code
│   │   ├── schema/           # Database schemas
│   │   └── migrations/       # Database migrations
│   └── styles/               # Global styles
├── public/                   # Static assets
├── docs/                     # Documentation
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
pnpm docker:up        # Start Docker services
pnpm docker:down      # Stop Docker services

# Authentication
pnpm auth:generate    # Generate auth schemas

# Stripe
pnpm stripe:cli       # Run Stripe CLI
```

## 🗄️ Database Schema

The application uses PostgreSQL with Drizzle ORM. Key tables include:

- **users**: User accounts and authentication
- **products**: Product catalog with images and metadata
- **categories**: Product categorization
- **orders**: Order management with payment tracking
- **coupons**: Discount codes and validation rules
- **cart_items**: Shopping cart persistence

## 🔧 Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Shadcn UI**: Component library
- **Radix UI**: Accessible primitives
- **Framer Motion**: Animations

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Server Actions**: Form handling and data mutations
- **Drizzle ORM**: Type-safe database operations
- **Better Auth**: Modern authentication
- **Stripe**: Payment processing

### Infrastructure
- **PostgreSQL**: Primary database
- **Redis**: Session storage and caching
- **AWS S3**: File storage
- **Docker**: Containerization

### Development Tools
- **Biome**: Linting and formatting
- **Turbopack**: Fast bundling
- **Husky**: Git hooks
- **TypeScript**: Type checking

## 🎫 Coupon System

The platform includes a comprehensive coupon management system:

### Features
- **Multiple Discount Types**: Percentage and fixed amount discounts
- **Usage Limits**: Configurable usage restrictions
- **Date Validation**: Start and end date enforcement
- **Minimum Order Requirements**: Order amount validation
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

### Setup
1. Configure Stripe keys in environment
2. Set up webhook endpoints
3. Configure payment methods in Stripe dashboard

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Convention
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the code examples in the codebase

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://better-auth.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)

---

Built with ❤️ using modern web technologies
