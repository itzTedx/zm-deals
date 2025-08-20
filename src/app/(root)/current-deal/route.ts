import { redirect } from "next/navigation";

import { PRODUCT } from "@/data/product";

export async function GET() {
  redirect(`/${PRODUCT.slug}`);
}
