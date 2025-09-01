import Script from "next/script";

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
}

interface ProductSchemaProps {
  name: string;
  description: string;
  image: string;
  url: string;
  price: number;
  currency?: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  brand?: string;
  category?: string;
  // Enhanced props for better SEO
  images?: string[];
  priceValidUntil?: string;
  seller?: {
    name: string;
    url: string;
  };
  shippingDetails?: {
    isFree: boolean;
    fee?: number;
    currency?: string;
  };
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating: number;
    worstRating: number;
  };
  reviews?: Array<{
    author: string;
    rating: number;
    reviewBody: string;
    datePublished: string;
  }>;
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function OrganizationSchema({ name, url, logo, description, sameAs = [] }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="organization-schema"
      type="application/ld+json"
    />
  );
}

export function ProductSchema({
  name,
  description,
  image,
  url,
  price,
  currency = "AED",
  availability = "InStock",
  brand = "ZM Deals",
  category = "Deals",
  images = [],
  priceValidUntil,
  seller,
  shippingDetails,
  aggregateRating,
  reviews = [],
}: ProductSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images.length > 0 ? images : image,
    url,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    category,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: `https://schema.org/${availability}`,
      url,
      ...(priceValidUntil && { priceValidUntil }),
      ...(seller && {
        seller: {
          "@type": "Organization",
          name: seller.name,
          url: seller.url,
        },
      }),
      ...(shippingDetails && {
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: shippingDetails.isFree ? 0 : shippingDetails.fee || 0,
            currency: shippingDetails.currency || currency,
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
      }),
    },
    ...(aggregateRating && { aggregateRating }),
    ...(reviews.length > 0 && { review: reviews }),
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="product-schema"
      type="application/ld+json"
    />
  );
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="breadcrumb-schema"
      type="application/ld+json"
    />
  );
}

export function WebsiteSchema({ name, url, description }: { name: string; url: string; description: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/deals?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <Script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      id="website-schema"
      type="application/ld+json"
    />
  );
}

export function FAQSchema({ questions }: { questions: Array<{ question: string; answer: string }> }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  return (
    <Script dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} id="faq-schema" type="application/ld+json" />
  );
}
