import { Metadata } from 'next'
import { fetchGraphQL } from "@/shopify/client"
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params;

  const data = await fetchGraphQL(GET_PRODUCT_BY_HANDLE_QUERY, { handle });

  if (!data?.product) {
    return {
      title: 'Product Not Found',
      description: 'The requested product could not be found.'
    }
  }

  return {
    title: data.product.title,
    description: data.product.description?.substring(0, 160),
    openGraph: {
      title: data.product.title,
      description: data.product.description,
      images: data.product.images?.edges?.map((edge: { node: { url: string; width: number; height: number; altText?: string } }) => ({
        url: edge.node.url,
        width: edge.node.width,
        height: edge.node.height,
        alt: edge.node.altText || data.product.title
      })) || []
    }
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}   