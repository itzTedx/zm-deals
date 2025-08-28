# Database Seeding Scripts

This directory contains scripts to seed the database with initial data.

## Scripts

### 1. `seed-categories.ts`
Creates the initial product categories.

**Usage:**
```bash
pnpm tsx scripts/seed-categories.ts
```

**Creates:**
- Appliances & Cleaning
- Electronics & Accessories  
- Bathroom & Hygiene

### 2. `seed-products.ts`
Creates products and links them to existing categories.

**Usage:**
```bash
pnpm tsx scripts/seed-products.ts
```

**Prerequisites:**
- Categories must exist (run `seed-categories.ts` first)

**Creates:**
- 6 sample products with images
- Media entries for product images
- Product-image relationships

### 3. `seed-coupons.ts`
Creates sample coupon codes.

**Usage:**
```bash
pnpm tsx scripts/seed-coupons.ts
```

## Recommended Order

1. Run `seed-categories.ts` first
2. Run `seed-products.ts` 
3. Run `seed-coupons.ts` (optional)

## Notes

- Each script can be run independently
- Scripts check for existing data and provide helpful error messages
- Categories are required before seeding products
- Media files are referenced from S3 URLs 