"use client";

import { useState } from "react";
import { productsAPI } from "@/lib/api";
import { toast } from "sonner";

interface Product {
  id: string;
  title?: string;
  [key: string]: any;
}

interface UseBulkActionsResult {
  selected: string[];
  loading: boolean;
  selectedCount: number;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  bulkDelete: (onSuccess?: () => void) => Promise<void>;
  bulkUpdate: (updates: Record<string, any>, onSuccess?: () => void) => Promise<void>;
  clearSelection: () => void;
}

/**
 * Hook for managing bulk actions on product lists (select, delete, update, etc.)
 */

export function useBulkActions(products: Product[],  refresh?: () => Promise<void>): UseBulkActionsResult {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === products.length ? [] : products.map((p) => p.id)
    );
  };

  const clearSelection = () => setSelected([]);

const bulkDelete = async (): Promise<void> => {
  if (!selected.length) 
{
       toast.warning("No products selected");
       return;
}

  if (!confirm(`Delete ${selected.length} selected products?`)) return;

  try {
    setLoading(true);
    const res = await productsAPI.deleteMany(selected);
   if(res.data.success){
    toast.success(res.data.message);
    clearSelection();

    if (refresh) await refresh();
   }
  } catch (err) {
    toast.error("Failed to delete products");
  } finally {
    setLoading(false);
  }

};



  /**
   * Bulk update — uses the new /products/bulk API
   * Example usage: bulkUpdate({ published: false })
   */
const bulkUpdate = async (
  updates: Record<string, any>,
  onSuccess?: () => void
) => {
  if (selected.length === 0) return;

  const confirmUpdate = window.confirm(
    `Apply updates to ${selected.length} selected product${
      selected.length > 1 ? "s" : ""
    }?`
  );
  if (!confirmUpdate) return;

  try {
    setLoading(true);

    // ✅ Corrected call — send `selected` (ids) + `updates` object
    await productsAPI.updateMany(selected, updates);

    clearSelection();
    toast.success("✅ Bulk update applied successfully");
    onSuccess?.();
  } catch (err) {
    console.error("❌ Bulk update failed:", err);
    toast.error("❌ Failed to update some products. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return {
    selected,
    loading,
    selectedCount: selected.length,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    bulkUpdate,
  };
}
