import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShareCard } from "@/components/global/share-card";
import { InfoTooltip } from "@/components/global/tooltip";
import { BreadcrumbSchema } from "@/components/seo/structured-data";
import { Badge } from "@/components/ui/badge";
import { Banner, BannerContent, BannerDescription, BannerIcon, BannerText, BannerTitle } from "@/components/ui/banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import ImageCarousel from "@/components/ui/carousel-with-thumbnail";
import { SeparatorBox } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  IconApplePay,
  IconCurrency,
  IconDocument,
  IconMasterCard,
  IconPackage,
  IconShield,
  IconVisaCard,
} from "@/assets/icons";

import { env } from "@/lib/env/server";
import { calculateDiscount, cn } from "@/lib/utils";
import { getComboDealsContainingProduct } from "@/modules/combo-deals/actions/query";
import { getProductBySlug, getProductsByCategorySlug } from "@/modules/product/actions/query";
import { ProductCard } from "@/modules/product/components";
import { EndsInCounter } from "@/modules/product/components/ends-in-counter";
import { FrequentlyBoughtTogether } from "@/modules/product/components/frequently-bought-together";
import { ProductCardSkeleton } from "@/modules/product/components/product-card";
import { AddToCart } from "@/modules/product/components/ui/add-to-cart";
import { CheckboxBadge } from "@/modules/product/components/ui/checkbox-badge";
import { Reviews } from "@/modules/product/sections/reviews";

type Params = Promise<{ product: string }>;

interface Props {
  params: Params;
}

// Revalidate pages every hour (3600 seconds) for fresh content
// export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await params;
  const res = await getProductBySlug(product);

  if (!res) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const productUrl = `${env.BASE_URL}/${res.slug}`;
  const mainImage = res.images[0]?.media?.url || "/default-product-image.jpg";
  const discountPercentage = calculateDiscount(Number(res.compareAtPrice), Number(res.price));

  return {
    title: `${res.title} - Save ${discountPercentage}% | ZM Deals`,
    description:
      res.description ||
      res.overview ||
      `Get ${res.title} at ${discountPercentage}% off! Limited time offer with free shipping.`,
    keywords: [
      res.title,
      "deal",
      "discount",
      "savings",
      "limited time offer",
      "product",
      "free shipping",
      "cash on delivery",
      res.category?.name || "deals",
    ].filter(Boolean),
    openGraph: {
      title: `${res.title} - Save ${discountPercentage}%`,
      description:
        res.description || res.overview || `Get ${res.title} at ${discountPercentage}% off! Limited time offer.`,
      url: productUrl,
      siteName: "ZM Deals",
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: res.title,
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${res.title} - Save ${discountPercentage}%`,
      description: res.description || res.overview || `Get ${res.title} at ${discountPercentage}% off!`,
      images: [mainImage],
      creator: "@zmdeals",
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      "product:price:amount": res.price.toString(),
      "product:price:currency": "AED",
      "product:availability": res.inventory.stock > 0 ? "in stock" : "out of stock",
      "product:condition": "new",
      "product:retailer": "ZM Deals",
      "product:brand": "ZM Deals",
      "product:category": res.category?.name || "Deals",
      "product:discount": `${discountPercentage}%`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { product } = await params;

  // Fetch product data
  const res = await getProductBySlug(product);

  if (!res) {
    return notFound();
  }

  // Fetch combo deals that contain this product
  const actualComboDeals = await getComboDealsContainingProduct(res.id);

  const productUrl = `${env.BASE_URL}/${res.slug}`;
  const breadcrumbItems = [
    { name: "Home", url: env.BASE_URL },
    { name: "Deals", url: `${env.BASE_URL}/deals` },
    { name: res.title, url: productUrl },
  ];

  // Enhanced structured data for better SEO
  const enhancedProductSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: res.title,
    description: res.description || res.overview || "",
    image: res.images.map((img) => img.media?.url).filter(Boolean),
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: "ZM Deals",
    },
    category: res.category?.name || "Deals",
    offers: {
      "@type": "Offer",
      price: Number(res.price),
      priceCurrency: "AED",
      availability: res.inventory.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
      priceValidUntil: res.endsIn
        ? new Date(res.endsIn).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      seller: {
        "@type": "Organization",
        name: "ZM Deals",
        url: env.BASE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: res.isDeliveryFree ? 0 : res.deliveryFee || 0,
          currency: "AED",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
    },
    aggregateRating:
      res.reviews && res.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: res.reviews.reduce((acc, review) => acc + review.rating, 0) / res.reviews.length,
            reviewCount: res.reviews.length,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: res.reviews?.slice(0, 5).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.user?.name || "Anonymous",
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment,
      datePublished: review.createdAt.toISOString(),
    })),
  };

  console.log("Original Price: ", Number(res.compareAtPrice) > 1);

  return (
    <main className="">
      {/* Enhanced Structured Data */}
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(enhancedProductSchema) }} type="application/ld+json" />
      <BreadcrumbSchema items={breadcrumbItems} />

      <header className="container relative grid max-w-7xl grid-cols-1 gap-6 pt-6 pb-6 md:grid-cols-5 md:gap-8 md:pb-8 lg:gap-12 lg:pb-12">
        <div className="md:col-span-3">
          {/* Breadcrumb Section */}
          <Breadcrumb className="pb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/deals">Deals</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <Suspense fallback={<Skeleton className="h-4 w-24" />}>
                  <BreadcrumbPage>{res.title}</BreadcrumbPage>
                </Suspense>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Image Carousel Section - Optimized with priority loading for first image */}
          <ImageCarousel images={res.images} showThumbs={res.images.length > 1} thumbPosition="bottom" />

          {/* Product Overview Section */}
          <div className="mt-4 hidden space-y-2 md:block">
            <p className="font-medium text-gray-500 text-sm">Product Overview</p>
            <article className="prose" dangerouslySetInnerHTML={{ __html: res.description }} />
          </div>
        </div>

        {/* Product Details Section */}
        <div className="sticky top-24 h-fit space-y-4 py-2 md:col-span-2 md:space-y-5 md:py-6">
          {/* Countdown Banner */}
          {res.endsIn && <EndsInCounter endsIn={res.endsIn} />}

          {/* Product Title */}
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <h1 className="font-medium text-2xl sm:text-3xl">{res.title}</h1>
              <ShareCard
                description={`Check out this amazing deal: ${res.title} - Save ${calculateDiscount(Number(res.compareAtPrice), Number(res.price))}% off!`}
                link={`${env.BASE_URL}/${res.slug}`}
                title={res.title}
              />
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{res.overview}</p>
          </div>

          {/* Pricing Section */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="relative flex items-center gap-1 font-bold text-2xl text-brand-600 normal-nums">
              <span>
                <IconCurrency className="size-5 text-brand-400" />
              </span>
              <span>{res.price}</span>
            </p>

            {res.compareAtPrice && res.compareAtPrice !== null && Number(res.compareAtPrice) > 1 ? (
              <>
                <p className="text-muted-foreground text-xs line-through decoration-brand-500 sm:text-sm md:text-base">
                  {res.compareAtPrice}
                </p>
                <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />
                <Badge className="text-xs sm:text-sm" size="sm" variant="destructive">
                  Save {calculateDiscount(Number(res.compareAtPrice), Number(res.price))}% Today!
                </Badge>
              </>
            ) : null}

            <div className="size-0.5 rounded-full bg-gray-300 sm:size-1" />

            <Badge size="sm">
              Only <span className="font-medium">{res.inventory.stock}</span> left
              <InfoTooltip info="The Stock tag shows the available units for the selected item. Sellers control whether to display it and manage their own inventory." />
            </Badge>
          </div>

          {/* CTA Button */}
          <AddToCart data={res} />

          <SeparatorBox />
          <div className="space-y-4">
            <Banner
              className={cn(res.isDeliveryFree ? "bg-green-100" : null)}
              size={res.isDeliveryFree ? "sm" : "default"}
              variant={res.isDeliveryFree ? "success" : null}
            >
              <BannerContent className={cn(res.isDeliveryFree ? "items-center" : "items-start")}>
                <BannerIcon>
                  <IconPackage className="size-6" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium">
                    {res.isDeliveryFree ? "Free Shipping" : "Shipping Fee"}
                  </BannerTitle>
                  {!res.isDeliveryFree && (
                    <BannerDescription>
                      <p className="flex items-center gap-1">
                        Shipping fee of{" "}
                        <span className="inline-flex items-center font-medium">
                          <IconCurrency className="size-3.5" />
                          {res.deliveryFee}
                        </span>
                      </p>
                    </BannerDescription>
                  )}
                </BannerText>
              </BannerContent>
            </Banner>

            <Banner>
              <BannerContent>
                <BannerIcon>
                  <IconDocument className="size-5 text-gray-500" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium text-gray-500">Order Guarantee</BannerTitle>
                  <BannerDescription>
                    <div className="relative py-1">
                      <Carousel
                        className="w-full"
                        opts={{
                          align: "start",
                          loop: false,
                          dragFree: true,
                        }}
                      >
                        <CarouselContent className="-ml-1">
                          <CarouselItem className="basis-auto pl-1">
                            <div className="inline-flex h-9 items-center justify-center whitespace-nowrap">
                              <CheckboxBadge className="select-none">Free Returns</CheckboxBadge>
                            </div>
                          </CarouselItem>
                          <CarouselItem className="basis-auto pl-1">
                            <div className="inline-flex h-9 items-center justify-center whitespace-nowrap">
                              <CheckboxBadge className="select-none">Return if item damaged</CheckboxBadge>
                            </div>
                          </CarouselItem>
                          {!res.cashOnDelivery && (
                            <CarouselItem className="basis-auto pl-1">
                              <div className="inline-flex h-9 items-center justify-center whitespace-nowrap">
                                <CheckboxBadge className="select-none">Cash on Delivery</CheckboxBadge>
                              </div>
                            </CarouselItem>
                          )}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  </BannerDescription>
                </BannerText>
              </BannerContent>
            </Banner>

            <Banner variant="success">
              <BannerContent>
                <BannerIcon>
                  <IconShield className="size-5" />
                </BannerIcon>
                <BannerText>
                  <BannerTitle className="font-medium">Secure Payment</BannerTitle>
                  <BannerDescription>
                    <p className="text-xs">Secured by Stripe</p>
                  </BannerDescription>
                </BannerText>
                <div className="flex items-center gap-2">
                  <IconVisaCard className="size-8" />
                  <IconMasterCard className="size-8" />
                  <IconApplePay className="size-8" />
                </div>
              </BannerContent>
            </Banner>
          </div>
        </div>
      </header>

      <div className="container pb-6 md:hidden md:pb-8 lg:pb-12">
        <article className="prose" dangerouslySetInnerHTML={{ __html: res.description }} />
      </div>

      {/* Frequently Bought Together Section - Only show if combo deals exist */}
      {actualComboDeals.length > 0 && <FrequentlyBoughtTogether comboDeals={actualComboDeals} currentProduct={res} />}

      {/* Reviews Section */}
      <Reviews productId={res.id} reviews={res.reviews} />

      {/* Related Deals Section - Only show if category exists */}
      {res.category && (
        <Suspense fallback={<DealsSkeleton />}>
          <OtherDeals categoryName={res.category.name} categorySlug={res.category.slug} />
        </Suspense>
      )}
    </main>
  );
}

interface OtherDealsProps {
  categorySlug: string;
  categoryName: string;
}

async function OtherDeals({ categorySlug, categoryName }: OtherDealsProps) {
  const relatedDeals = await getProductsByCategorySlug(categorySlug);

  // Only show if we have related deals
  if (!relatedDeals || relatedDeals.length === 0) {
    return null;
  }

  return (
    <article className="container pb-12 md:pb-16 lg:pb-20">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg lg:text-xl">Related Deals in {categoryName}</h3>
        <Button asChild size="sm">
          <Link href={`/deals?category=${categorySlug}`}>View All</Link>
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
        {relatedDeals.slice(0, 8).map((deal) => (
          <ProductCard data={deal} key={deal.id} />
        ))}
      </div>
    </article>
  );
}

function DealsSkeleton() {
  return (
    <div className="container pb-12 md:pb-16 lg:pb-20">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-4 md:mt-10 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
