"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { productsAPI } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { AlertDialogConfirm } from "@/components/ConfirmBox";

const onDelete = async (id: string, onRefresh: () => Promise<void> | void) => {
  const res = await productsAPI.delete(id);
  if (res.data.message) {
    toast.success(res.data.message)
    onRefresh();
  }
}

interface ProductsTableProps {
  products: any[];
  selected: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onRefresh: () => Promise<void> | void;
}

export default function ProductsTable({
  products,
  selected,
  onSelect,
  onSelectAll,
  onRefresh
}: ProductsTableProps) {
  const allSelected =
    products.length > 0 && selected.length === products.length;

  if (!products.length)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No products found</h3>
        <p className="text-sm text-gray-500">Get started by adding your first product to the inventory.</p>
      </div>
    );

  return (
    <div className="h-full overflow-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full">
        <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
          <tr className="border-b border-gray-200">
            <th className="px-6 py-4 w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onSelectAll}
                className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
              />
            </th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Collection</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tags</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {products.map((p) => {
            const isSelected = selected.includes(p.id);

            return (
              <tr
                key={p.id}
                className={cn(
                  "group transition-all duration-150",
                  "hover:bg-gray-50/80",
                  isSelected && "bg-indigo-50/40 hover:bg-indigo-50/60"
                )}
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(p.id)}
                    className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm shrink-0 group-hover:shadow-md transition-shadow">
                      {p.images?.[0]?.url ? (
                        <Image
                          src={`${p.images[0].url}`}
                          alt={p.title || "Product image"}
                          fill
                          sizes="90px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`products/${p.handle}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 block"
                        title={p.title}
                      >
                        {p.title}
                      </Link>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {p.collection?.title || "Uncategorized"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 max-w-[220px]">
                    {p.tags?.length > 0 ? (
                      <>
                        {p.tags.slice(0, 3).map((t: any, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-300 shadow-sm hover:border-indigo-300 transition-colors cursor-default"
                            title={t.name}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                            {t.name}
                          </span>
                        ))}
                        {p.tags.length > 3 && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200"
                            title={p.tags.slice(3).map((t: any) => t.name).join(', ')}
                          >
                            +{p.tags.length - 3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs italic pl-1">No tags</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{Number(p.minPriceAmount).toLocaleString("en-IN")}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  {p.published ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                      Draft
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`products/${p.handle}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                      >
                        Edit
                      </Button>
                    </Link>
                    <AlertDialogConfirm
                      showBtnText="Delete"
                      id={p.id}
                      onConfirm={(id) => onDelete(id, onRefresh)}
                      description="This will permanently delete the product and its data."
                      variant="destructive"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
