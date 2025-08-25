import { Review } from "@/server/schema";

export async function getImageMetadata(file: File | Blob): Promise<{
  width: number;
  height: number;
  blurData: string;
}> {
  try {
    // Read file as data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Create an image to get dimensions
    const img = document.createElement("img");
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Create a tiny blurred version (e.g., 8x8 px)
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const size = 8;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    const blurData = canvas.toDataURL("image/webp");

    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      blurData,
    };
  } catch (error) {
    console.error("Error extracting image metadata:", error);
    throw error;
  }
}

export function calculateAverageRating(reviews?: Review[]): number {
  if (!reviews || reviews.length === 0) return 0;

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / reviews.length) * 10) / 10;
}

export function getRatingDistribution(reviews: Review[]) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  reviews.forEach((review) => {
    distribution[review.rating as keyof typeof distribution]++;
  });

  return distribution;
}
