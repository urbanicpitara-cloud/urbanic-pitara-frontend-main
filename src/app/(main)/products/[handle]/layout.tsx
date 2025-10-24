import { Metadata } from "next";
import { productsAPI } from "@/lib/api";

interface Product {
  id: string;
  title: string;
  description?: string;
  images?: { url: string; altText?: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  try {
    const { data } = await productsAPI.getByHandle(handle);
    const product: Product | null = data?.product || data; // depending on your API shape

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found.",
      };
    }

    return {
      title: product.title,
      description: product.description?.substring(0, 160),
      openGraph: {
        title: product.title,
        description: product.description,
        images:
          product.images?.map((img) => ({
            url: img.url,
            alt: img.altText || product.title,
          })) || [],
      },
      twitter: {
        card: "summary_large_image",
        title: product.title,
        description: product.description,
        images:
          product.images && product.images.length > 0
            ? [product.images[0].url]
            : [],
      },
    };
  } catch (error) {
    console.error("Error generating product metadata:", error);
    return {
      title: "Error Loading Product",
      description: "An error occurred while loading this product.",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
