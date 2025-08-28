export interface WishlistActionResponse {
  success: boolean;
  error?: string;
  anonymous?: boolean;
  added?: boolean;
}

export interface WishlistItem {
  id: string;
  product: {
    id: string;
    title: string;
    price: string;
    image: string;
    slug: string;
    meta?: {
      metaTitle?: string;
      metaDescription?: string;
    } | null;
    inventory?: {
      stock: number;
      isOutOfStock: boolean;
    } | null;
    images?: Array<{
      media: {
        url: string;
        alt: string;
      };
    }> | null;
  };
  addedAt: Date;
}

export interface WishlistData {
  items: WishlistItem[];
  itemCount: number;
}
