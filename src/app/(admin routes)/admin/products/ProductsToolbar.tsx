"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Filter, Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import BulkEditProductsModal from "./BulkEditModal"; // ✅ make sure the path matches your file name
import Link from "next/link";

interface ProductsToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  selectedCount: number;
  onBulkDelete: () => Promise<void> | void;
  onBulkEdit: (updates: Record<string, any>, onSuccess?: () => void) => Promise<void>;
  onRefresh: () => Promise<void> | void;
  onOpenFilters?: () => void;
}

export default function ProductsToolbar({
  search,
  setSearch,
  selectedCount,
  onBulkDelete,
  onBulkEdit,
  onRefresh,
  onOpenFilters,
}: ProductsToolbarProps) {
  const [searchValue, setSearchValue] = useState(search);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchValue);
  };

  const handleBulkEditSave = async (updates: Record<string, any>) => {
    await onBulkEdit(updates, onRefresh);
    setEditModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 w-full sm:w-1/2"
        >
          <Input
            placeholder="Search products..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full"
          />
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={onBulkDelete}
                title="Delete selected"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete ({selectedCount})
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                title="Bulk edit selected"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit ({selectedCount})
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="icon"
            title="Refresh"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {onOpenFilters && (
            <Button
              variant="outline"
              size="icon"
              title="Filters"
              onClick={onOpenFilters}
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}

        <Link href="products/add">
          <Button className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-1" />
            Add Product
          </Button>
          </Link>
        </div>
      </div>

      {/* ✅ Bulk Edit Modal */}
      <BulkEditProductsModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleBulkEditSave}
        count={selectedCount}
      />
    </>
  );
}
