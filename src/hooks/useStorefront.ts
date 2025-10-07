import { QueryKey, useMutation, useQuery } from "@tanstack/react-query";
import { GraphQLClient, RequestDocument } from "graphql-request";
import { parseCookies } from "nookies";

/* -------------------------------------------------------------------------- */
/* 🏪 Shopify Storefront GraphQL Client Setup                                 */
/* -------------------------------------------------------------------------- */

// Validate and get API endpoint
const getValidEndpoint = () => {
  const url = process.env.NEXT_PUBLIC_SHOPIFY_STORE_API_URL;
  if (!url) {
    throw new Error("Shopify Storefront API URL is not defined");
  }
  try {
    new URL(url); // Validate URL format
    return url;
  } catch {
    throw new Error("Invalid Shopify Storefront API URL");
  }
};

const endpoint = getValidEndpoint();
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error("Shopify Storefront access token is not defined");
}

// Create Shopify Storefront client
const client = new GraphQLClient(endpoint, {
  headers: {
    "X-Shopify-Storefront-Access-Token": accessToken,
  },
});

/* -------------------------------------------------------------------------- */
/* ⚙️ Types                                                                  */
/* -------------------------------------------------------------------------- */

interface QueryVariables {
  query: RequestDocument;
  variables?: Record<string, unknown>;
  enabled?: boolean;
  [key: string]: unknown;
}

interface MutationVariables {
  query: RequestDocument;
  variables: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* 🔍 Query Hook                                                             */
/* -------------------------------------------------------------------------- */

export function useStorefrontQuery<TData = unknown>(
  queryKey: QueryKey,
  { query, variables, enabled = true, ...options }: QueryVariables
) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await client.request<TData>(query, variables);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Failed to fetch data from Shopify Storefront API");
      }
    },
    enabled,
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/* 🧩 Mutation Hook                                                          */
/* -------------------------------------------------------------------------- */

export function useStorefrontMutation<
  TData = unknown,
  TVariables extends MutationVariables = MutationVariables
>() {
  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn: async ({ query, variables }) => {
      try {
        const response = await client.request<TData>(query, variables);
        return response;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unknown error occurred during mutation");
      }
    },
  });

  return {
    mutate: mutation.mutateAsync,
    mutateSync: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
    data: mutation.data,
  };
}

/* -------------------------------------------------------------------------- */
/* 🧠 Direct Client Access (for manual GraphQL queries)                      */
/* -------------------------------------------------------------------------- */

// ✅ Add this function — used for manual fetches (like infinite scroll)
export function useStorefrontClient() {
  return client;
}

/* -------------------------------------------------------------------------- */
/* 🔐 Authentication Helper                                                  */
/* -------------------------------------------------------------------------- */

export const isAuthenticated = () => {
  const token = parseCookies()?.customerAccessToken;
  return !!token;
};
