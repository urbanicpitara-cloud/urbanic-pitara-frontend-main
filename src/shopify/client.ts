/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/shopify/client.ts
import { GET_PRODUCT_BY_HANDLE_QUERY } from "@/graphql/products";
import { DocumentNode } from "graphql";
import { GraphQLClient } from "graphql-request";

const graphqlEndpoint = process.env.NEXT_PUBLIC_SHOPIFY_STORE_API_URL || "";

const client = new GraphQLClient(graphqlEndpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token":
      process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "",
  },
});

export const fetchGraphQL = async <T = any>(
  query: DocumentNode,
  variables?: Record<string, any>
): Promise<T> => {
  try {
    // graphql-request handles both string and gql template literal queries
    return await client.request<T>(query, variables);
  } catch (error) {
    console.error("GraphQL Request Error:", error);
    throw error;
  }
};

export const getProduct = async (handle: string) => {
  const data = await fetchGraphQL(GET_PRODUCT_BY_HANDLE_QUERY, { handle });
  return data?.product;
};
