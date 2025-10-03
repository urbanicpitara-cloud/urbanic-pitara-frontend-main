import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    {
      [`${process.env.NEXT_PUBLIC_SHOPIFY_STORE_API_URL}`]: {
        headers: {
          "X-Shopify-Storefront-Access-Token":
            process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
          "Content-Type": "application/json",
        },
      },
    },
  ],
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/types/shopify-graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
      ],
      config: {
        fetcher: {
          endpoint: process.env.NEXT_PUBLIC_SHOPIFY_STORE_API_URL,
          fetchParams: {
            headers: {
              "X-Shopify-Storefront-Access-Token":
                process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
            },
          },
        },
      },
    },
  },
};

export default config;
