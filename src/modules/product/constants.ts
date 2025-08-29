export const PRODUCT_UPLOAD_ROUTE = "products" as const;
export const PRODUCT_FILE_TYPES = ["image/*"];
export const PRODUCT_FILE_MAX_SIZE = 1024 * 1024 * 5; // 5MB
export const PRODUCT_FILE_MAX_FILES = 9;

export const CATEGORY_UPLOAD_ROUTE = "categories" as const;
export const CATEGORY_FILE_TYPES = ["image/*"];
export const CATEGORY_FILE_MAX_SIZE = 1024 * 1024 * 5; // 5MB
export const CATEGORY_FILE_MAX_FILES = 1;

export const CATEGORY_BANNER_UPLOAD_ROUTE = "categories/banners" as const;
export const CATEGORY_BANNER_FILE_TYPES = ["image/*"];
export const CATEGORY_BANNER_FILE_MAX_SIZE = 1024 * 1024 * 5; // 5MB
export const CATEGORY_BANNER_FILE_MAX_FILES = 5; // Allow up to 5 banner images
