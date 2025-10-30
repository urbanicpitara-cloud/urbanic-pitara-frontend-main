// app/product/[handle]/page.tsx
import ProductClient from "./ProductClient";
import { productsAPI } from "@/lib/api";
import { Product } from "@/types/products";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
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
        Product not found
      </div>
    );
  }
}

