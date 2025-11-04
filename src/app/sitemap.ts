import { MetadataRoute } from 'next';
import { productsAPI, collectionsAPI } from '@/lib/api';

interface Product {
  handle: string;
  updatedAt: string;
}

interface Collection {
  handle: string;
  updatedAt: string;
}

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
    const productUrls = (products.data || []).map((product: Product) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'daily' as const,
      priority: 0.9
    }));

    // Collection routes
    const collectionUrls = (collections.data || []).map((collection: Collection) => ({
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/collections/${collection.handle}`,
      lastModified: new Date(collection.updatedAt),
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
