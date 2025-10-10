import { useEffect, useState } from "react";
import { menuRepository, type MenuItem } from "@/lib/api/repositories/menu";

export type { MenuItem };

export const useShopifyMenu = (handle: string) => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    menuRepository
      .getMenu(handle)
      .then((items) => {
        if (active) setMenu(items);
      })
      .catch((e) => active && setError(e?.message || "Failed to load menu"))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [handle]);

  return { menu, isLoading, error };
};
