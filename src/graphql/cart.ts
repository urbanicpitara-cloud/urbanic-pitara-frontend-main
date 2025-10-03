import { gql } from "graphql-tag";

const PRODUCT_FRAGMENT = gql`
  fragment product on Product {
    id
    title
    vendor
    handle
    description
    images(first: 1) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
  }
`;

const VARIANT_FRAGMENT = gql`
  fragment variant on ProductVariant {
    id
    title
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    product {
      ...product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

export const GET_CART = gql`
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      note
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
        totalTaxAmount {
          amount
          currencyCode
        }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
            merchandise {
              ... on ProductVariant {
                ...variant
              }
            }
          }
        }
      }
      totalQuantity
    }
  }
  ${VARIANT_FRAGMENT}
`;

export const ADD_TO_CART = gql`
  mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  ...variant
                }
              }
            }
          }
        }
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
  ${VARIANT_FRAGMENT}
`;

export const UPDATE_CART_ITEMS = gql`
  mutation updateCartItems($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  ...variant
                }
              }
            }
          }
        }
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
  ${VARIANT_FRAGMENT}
`;

export const REMOVE_FROM_CART = gql`
  mutation removeFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  ...variant
                }
              }
            }
          }
        }
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
  ${VARIANT_FRAGMENT}
`;

export const CREATE_CART = gql`
  mutation createCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        id
        checkoutUrl
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              merchandise {
                ... on ProductVariant {
                  ...variant
                }
              }
            }
          }
        }
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
  ${VARIANT_FRAGMENT}
`;
