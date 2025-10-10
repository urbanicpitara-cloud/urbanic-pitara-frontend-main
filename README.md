Environment

Add your backend base URL to `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com
```

The Shopify Storefront client is now deprecated in favor of the new REST client in `src/lib/api/client.ts` and repositories in `src/lib/api/repositories/`.
