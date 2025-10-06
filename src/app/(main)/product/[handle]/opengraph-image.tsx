import { ImageResponse } from 'next/og'
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products"
import { fetchGraphQL } from "@/shopify/client"

export const runtime = 'edge'
export const alt = 'Product Image'
export const size = {
  width: 1200,
  height: 630,
}

export default async function OpenImage({ params }: { params: { handle: string } }) {
  try {
    const data = await fetchGraphQL(GET_PRODUCT_BY_HANDLE_QUERY, {
      handle: params.handle
    })
    
    const product = data?.product
    if (!product) {
      throw new Error('Product not found')
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
          }}
        >
          {/* Product Image */}
          <div style={{ 
            width: '60%', 
            height: '60%', 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <img
              src={product.images?.edges[0]?.node?.url}
              alt={product.title}
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Product Title */}
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            {product.title}
          </div>

          {/* Brand Name */}
          <div style={{
            fontSize: '24px',
            color: '#666666',
          }}>
            Urbanic Pitara
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [
          {
            name: 'Inter',
            data: await fetch(
              new URL('/fonts/Inter-Bold.ttf', 'https://your-domain.com')
            ).then((res) => res.arrayBuffer()),
            weight: 700,
            style: 'normal',
          },
        ],
      }
    )
  } catch (error) {
    // Fallback image on error
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
            fontSize: '24px',
            color: '#666666',
          }}
        >
          Urbanic Pitara
        </div>
      ),
      size
    )
  }
}