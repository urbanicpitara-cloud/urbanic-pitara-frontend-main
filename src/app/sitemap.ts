import { MetadataRoute } from 'next'
import { fetchGraphQL } from "@/shopify/client"
import { GET_ALL_PRODUCTS, GET_ALL_COLLECTIONS } from "@/graphql/products"

interface ProductNode {
  node: {
    handle: string;
    updatedAt: string;
  }
}

interface CollectionNode {
  node: {
    handle: string;
    updatedAt: string;
  }
}

interface ShopifyResponse {
  products?: {
    edges: ProductNode[];
  };
  collections?: {
    edges: CollectionNode[];
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Get all products and collections
  const productData = await fetchGraphQL<ShopifyResponse>(GET_ALL_PRODUCTS)
  const collectionData = await fetchGraphQL<ShopifyResponse>(GET_ALL_COLLECTIONS)

  // Static routes
  const routes = [
    '',
    '/about',
    '/faq',
    '/contact',
    '/privacy',
    '/returns',
    '/shipping',
    '/terms'
  ].map(route => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Product routes
  const productUrls = productData?.products?.edges?.map(({ node }: ProductNode) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${node.handle}`,
    lastModified: new Date(node.updatedAt),
    changeFrequency: 'daily' as const,
    priority: 0.9
  })) || []

  // Collection routes
  const collectionUrls = collectionData?.collections?.edges?.map(({ node }: CollectionNode) => ({
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${node.handle}`,
    lastModified: new Date(node.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  })) || []

  return [...routes, ...productUrls, ...collectionUrls]
}
