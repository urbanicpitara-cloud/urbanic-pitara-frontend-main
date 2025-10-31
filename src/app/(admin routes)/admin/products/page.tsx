"use client";

import ProductsToolbar from "./ProductsToolbar";
import ProductsTable from "./ProductsTable";
import { useProducts } from "@/hooks/admin/useProducts";
import { useBulkActions } from "@/hooks/admin/useBulkActions";
import { Loader2 } from "lucide-react";

export default function AdminProductsPage() {
  const {
    products,
    loading,
    error,
    search,
    setSearch,
    refresh,
  } = useProducts();
  
const bulk = useBulkActions(products, refresh);


  return (
    <div className="p-6 space-y-6">
      <ProductsToolbar
        search={search}
        setSearch={setSearch}
        selectedCount={bulk.selected.length}
        onBulkDelete={bulk.bulkDelete}
        onBulkEdit={bulk.bulkUpdate}
        onRefresh={refresh}
      />

      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading products...
        </div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
          <ProductsTable
            products={products}
            selected={bulk.selected}
            onSelect={bulk.toggleSelect}
            onSelectAll={bulk.toggleSelectAll}
            onRefresh={refresh}
          />

      )}
    </div>
  );
}
