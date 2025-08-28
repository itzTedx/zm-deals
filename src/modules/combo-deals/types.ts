import type { ComboDeal, ComboDealProduct } from "@/server/schema/product-schema";

import { ProductCardDate } from "../product/types";

export interface ComboDealWithProducts extends ComboDeal {
  products: (ComboDealProduct & {
    product: ProductCardDate | null;
  })[];
}

export interface ComboDealFormData {
  title: string;
  description?: string;
  slug: string;
  originalPrice: number;
  comboPrice: number;
  savings?: number;
  isFeatured: boolean;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  maxQuantity?: number;
  products: Array<{
    productId: string;
    quantity: number;
    sortOrder: number;
  }>;
}

export interface ComboDealTableData {
  id: string;
  title: string;
  slug: string;
  originalPrice: string;
  comboPrice: string;
  savings: string;
  isFeatured: boolean;
  isActive: boolean;
  startsAt?: Date;
  endsAt?: Date;
  maxQuantity?: number;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}
