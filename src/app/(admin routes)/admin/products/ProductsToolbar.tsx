"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Filter, Plus, Trash2, Edit, Search } from "lucide-react";
import { useState } from "react";
import BulkEditProductsModal from "./BulkEditModal";
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
        <div className="relative w-full sm:w-96">
          <form onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-gray-100">
              <span className="text-sm text-gray-500 hidden sm:inline-block">{selectedCount} selected</span>

              <Button
                variant="destructive"
                size="icon"
                onClick={onBulkDelete}
                className="h-9 w-9"
                title="Delete Selected"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setEditModalOpen(true)}
                className="h-9 w-9 text-gray-600"
                title="Edit Selected"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="h-9 w-9 text-gray-600 hover:text-black"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          {onOpenFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={onOpenFilters}
              className="h-9 w-9 text-gray-600 hover:text-black"
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}

          <Link href="/admin/products/add">
            <Button className="h-9 px-4 shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      <BulkEditProductsModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleBulkEditSave}
        count={selectedCount}
      />
    </>
  );
}
