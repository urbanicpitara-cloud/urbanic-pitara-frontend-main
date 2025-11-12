/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from 'next';
import { productsAPI, collectionsAPI } from '@/lib/api';
import { Product, ProductCollection } from '@/types/products';

// interface Product {
//   handle: string;
//   updatedAt: string;
// }

// interface Collection {
//   handle: string;
//   updatedAt: string;
// }

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Get all products and collections
    const [products, collections] = await Promise.all([
      productsAPI.getAll(),
      collectionsAPI.getAll()
    ]);

    // Static routes
    const routes = [
      '',
      '/about',
      '/faq',
      '/contact',
      '/privacy',
      '/returns',
      '/shipping',
      '/terms',
      '/cart',
      '/profile',
      '/checkout'
    ].map(route => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    }));

    // Product routes
    // productsAPI.getAll() returns an object like { products: Product[], pagination: ... }
    // but some endpoints or older implementations may return different shapes. Normalize safely.
    const productsArray: Product[] = Array.isArray(products)
      ? products
      : Array.isArray((products as any).products)
      ? (products as any).products
      : Array.isArray((products as any).data)
      ? (products as any).data
      : [];

    const productUrls = productsArray.map((product: Product) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    }));

    // Collection routes
    // collectionsAPI.getAll() typically returns an array, but normalize for safety
    const collectionsArray: ProductCollection[] = Array.isArray(collections)
      ? collections
      : Array.isArray((collections as any).data)
      ? (collections as any).data
      : Array.isArray((collections as any).collections)
      ? (collections as any).collections
      : [];

    const collectionUrls = collectionsArray.map((collection: ProductCollection) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collection.handle}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }));

    // Auth routes
    const authRoutes = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password'
    ].map(route => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

    // Admin routes
    const adminRoutes = [
      '/admin',
      '/admin/products',
      '/admin/collections',
      '/admin/orders',
      '/admin/users'
    ].map(route => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    return [...routes, ...productUrls, ...collectionUrls, ...authRoutes, ...adminRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least the static routes if API calls fail
    return [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL!,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
      }
    ];
  }
}
