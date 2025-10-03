import { gql } from "graphql-tag";

export const GET_COLLECTIONS_QUERY = gql`
  query GetCollections {
    collections(first: 100) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          image {
            url
            width
            height
            altText
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_BY_HANDLE_WITH_PAGINATION_QUERY = gql`
  query GetCollectionByHandle(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
      ) {
        edges {
          node {
            id
            title
            vendor
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            featuredImage {
              url
            }
            options {
              name
              optionValues {
                id
                name
                swatch {
                  color
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  availableForSale
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
          hasPreviousPage
          startCursor
        }
      }
    }
  }
`;
