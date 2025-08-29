import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SectionHeader } from "@/components/layout/section-header";
import { SeparatorBox } from "@/components/ui/separator";

import { getCategories, getCategoryBySlug } from "@/modules/categories/actions/query";
import { getProductsByCategorySlug } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components/product-card";

type Params = Promise<{ slug: string }>;

interface Props {
  params: Params;
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

// Revalidate pages every hour (3600 seconds)
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} - ZM Deals`,
    description:
      category.description ||
      `Explore our collection of ${category.name.toLowerCase()} products at ZM Deals. Find the best deals and discounts.`,
    openGraph: {
      title: `${category.name} - ZM Deals`,
      description:
        category.description ||
        `Explore our collection of ${category.name.toLowerCase()} products at ZM Deals. Find the best deals and discounts.`,
      type: "website",
    },
  };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { slug } = await params;

  // Get category and products
  const [category, products] = await Promise.all([getCategoryBySlug(slug), getProductsByCategorySlug(slug)]);

  // If category doesn't exist, show 404
  if (!category) {
    notFound();
  }

  return (
    <main className="container relative space-y-6 pt-9 pb-8 sm:pb-12 md:space-y-9 md:pb-16 lg:pb-20">
      {/* Category Header */}

      <SectionHeader
        description={category.description || `Explore our collection of ${category.name.toLowerCase()} products`}
        hasButton={false}
        title={category.name}
      />

      <SeparatorBox />

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard data={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <svg className="size-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h3 className="mb-2 font-semibold text-lg">No products found</h3>
          <p className="mb-6 max-w-md text-muted-foreground">
            We couldn't find any products in the {category.name.toLowerCase()} category. Check back later for new
            additions!
          </p>
        </div>
      )}
    </main>
  );
}
