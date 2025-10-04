import { ImageResponse } from 'next/og'
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products"
import { fetchGraphQL } from "@/shopify/client"

export const runtime = 'edge'
export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image({ params }: { params: { handle: string } }) {
  const data = await fetchGraphQL(GET_PRODUCT_BY_HANDLE_QUERY, {
    handle: params.handle
  })
  
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={data?.product?.images?.edges[0]?.node?.url}
          alt={data?.product?.title}
          style={{ width: '60%', height: '60%', objectFit: 'contain' }}
        />
      </div>
    )
  )
}