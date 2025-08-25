export const PRODUCT_UPLOAD_ROUTE = "products" as const;
export const PRODUCT_FILE_TYPES = ["image/*"];
export const PRODUCT_FILE_MAX_SIZE = 1024 * 1024 * 5; // 5MB
export const PRODUCT_FILE_MAX_FILES = 9;

export const CATEGORY_UPLOAD_ROUTE = "categories" as const;
export const CATEGORY_FILE_TYPES = ["image/*"];
export const CATEGORY_FILE_MAX_SIZE = 1024 * 1024 * 5; // 5MB
export const CATEGORY_FILE_MAX_FILES = 1;
