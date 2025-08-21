// Review and Feedback Types
export interface Review {
  id: number;
  name: string;
  rating: number;
  date: Date;
  comment: string;
}

export interface Feedback extends Review {
  // Feedback is essentially the same as Review but kept separate for semantic clarity
}

// Image Types
export interface ProductImage {
  url: string;
}

// Product Types
export interface Product {
  title: string;
  overview: string;
  slug: string;
  price: string;
  originalPrice: string;
  featuredImage: string;
  stock: number;
  endsIn: Date;
  description: string;
  images: ProductImage[];
  reviews: Review[];
}

// Deal Types (extends Product with id)
export interface Deal extends Product {
  id: number;
}

// Last Minute Deal Types (simplified version)
export interface LastMinuteDeal {
  id: number;
  title: string;
  image: string;
}

// Product Data Export Types
export interface ProductData {
  PRODUCT: Product;
  DEALS: Deal[];
  LAST_MINUTE_DEALS: LastMinuteDeal[];
  FEEDBACKS: Feedback[];
}

// Utility Types
export interface ProductCardProps {
  deal: Deal;
  className?: string;
}

export interface ProductGridProps {
  deals: Deal[];
  className?: string;
}

export interface ReviewSectionProps {
  reviews: Review[];
  className?: string;
}

export interface ProductImageGalleryProps {
  images: ProductImage[];
  featuredImage: string;
  className?: string;
}

// Form Types
export interface ProductFormData {
  title: string;
  overview: string;
  slug: string;
  price: string;
  originalPrice: string;
  featuredImage: string;
  stock: number;
  endsIn: Date;
  description: string;
  images: ProductImage[];
}

// API Response Types
export interface ProductApiResponse {
  success: boolean;
  data: Product | Deal | Deal[];
  message?: string;
}

export interface ReviewsApiResponse {
  success: boolean;
  data: Review[];
  message?: string;
}

// Filter and Search Types
export interface ProductFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilters;
  sortBy?: "price" | "rating" | "date" | "popularity";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}
