export default function ProductStructuredData({ product }: { product: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images?.edges?.[0]?.node?.url,
    offers: {
      '@type': 'Offer',
      price: product.priceRange?.minVariantPrice?.amount,
      priceCurrency: product.priceRange?.minVariantPrice?.currencyCode,
      availability: product.availableForSale 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}