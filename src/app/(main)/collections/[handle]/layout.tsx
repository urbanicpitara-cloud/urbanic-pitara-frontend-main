import { Metadata } from 'next'
import { fetchGraphQL } from "@/shopify/client"
import { GET_COLLECTION_BY_HANDLE } from "@/graphql/collections"

interface Params {
  handle: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;

  const data = await fetchGraphQL(GET_COLLECTION_BY_HANDLE, { handle });

  const collection = data?.collection;

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
  };
}

export default function CollectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
}   