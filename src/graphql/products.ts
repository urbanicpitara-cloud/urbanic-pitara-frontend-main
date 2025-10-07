import { gql } from "graphql-tag";

export const GET_PRODUCT_BY_HANDLE_QUERY = gql`
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      descriptionHtml
      productType
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

      images(first: 10) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
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
      seo {
        title
        description
      }
    }
  }
`;

export const GET_ALL_PRODUCTS = gql`
  query GetAllProducts {
    products(first: 250) {
      edges {
        node {
          id
          handle
          updatedAt
        }
      }
    }
  }
`;

export const GET_ALL_COLLECTIONS = gql`
  query GetAllCollections {
    collections(first: 250) {
      edges {
        node {
          id
          handle
          updatedAt
        }
      }
    }
  }
`;
