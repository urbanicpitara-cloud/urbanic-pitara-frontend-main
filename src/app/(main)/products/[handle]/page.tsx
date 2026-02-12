// app/product/[handle]/page.tsx
import ProductClient from "./ProductClient";
import { productsAPI } from "@/lib/api";
import { Product } from "@/types/products";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

// ISR: Revalidate every 15 minutes (900 seconds)
export const revalidate = 900;

// Allow dynamic params not in generateStaticParams to be generated on-demand
export const dynamicParams = true;

// Pre-generate top 100 products at build time for instant first loads
export async function generateStaticParams() {
  try {
    const res = await productsAPI.getAll({
      limit: 100,
      published: true,
      sort: 'createdAt',
      order: 'desc'
    });

    // Backend returns { data: { products: [], pagination: {} } }
    const products = res.data?.products || [];

    if (products.length === 0) {
      console.warn('No products found for static generation');
      return [];
    }

    return products.map((product: Product) => ({
      handle: product.handle,
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  try {
    const productRes = await productsAPI.getByHandle(handle);
    const product: Product = productRes.data;

    const relatedRes = await productsAPI.getRelated(handle);
    const relatedProducts: Product[] = relatedRes.data;

    return <ProductClient product={product} relatedProducts={relatedProducts} />;
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {err instanceof Error ? err.message : "Product not found"}
      </div>
    );
  }
}

