import { useStorefrontQuery } from "./useStorefront";
import { GET_MENU_QUERY, RawMenuItem, MenuItem } from "../graphql/menu";

export type { MenuItem }; // re-export clean type

export const useShopifyMenu = (handle: string) => {
  const { data, isLoading, error } = useStorefrontQuery<{ menu: { items: RawMenuItem[] } }>(
    ["menu", handle],
    {
      query: GET_MENU_QUERY,
      variables: { handle },
    }
  );

  // normalize Shopify URLs
  const normalizeUrl = (url?: string) => {
    if (!url) return "#";
    try {
      const u = new URL(url);
      return u.pathname; // keep only /collections/... etc
    } catch {
      return url; // already relative
    }
  };

  // convert Shopify's "items" → our "children"
  const transformItems = (items: RawMenuItem[]): MenuItem[] =>
    items.map((item) => ({
      id: item.id,
      title: item.title,
      url: normalizeUrl(item.url),
      children: item.items ? transformItems(item.items) : [],
    }));

  const menu: MenuItem[] = data?.menu?.items ? transformItems(data.menu.items) : [];

  return { menu, isLoading, error };
};
