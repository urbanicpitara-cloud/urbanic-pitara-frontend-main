import { Metadata } from 'next'
import { fetchGraphQL } from "@/shopify/client"
import { GET_COLLECTION_BY_HANDLE } from "@/graphql/collections"

interface Params {
  handle: string
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await fetchGraphQL(GET_COLLECTION_BY_HANDLE, { 
    handle: params.handle 
  })

  const collection = data?.collection

  return {
    title: collection?.title || 'Collection',
    description: collection?.description?.substring(0, 155) || 'Browse our collection',
    openGraph: {
      title: collection?.title,
      description: collection?.description,
      images: collection?.image
        ? [{ url: collection.image.url, width: 1200, height: 630, alt: collection.title }]
        : []
    }
  }
}

// Async layout now
export default async function CollectionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Params
}) {
  // You can fetch data here if needed
  const data = await fetchGraphQL(GET_COLLECTION_BY_HANDLE, { handle: params.handle })
  const collection = data?.collection

  return (
    <div>
      {/* Optional: use collection info in layout */}
      <h1 className="sr-only">{collection?.title}</h1>
      {children}
    </div>
  )
}
