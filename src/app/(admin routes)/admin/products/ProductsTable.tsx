"use client";

import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
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
      <div className="text-center py-10 text-gray-500">
        No products found.
      </div>
    );

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-gray-600 bg-gray-50">
            <th className="px-4 py-3 w-10">
              <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
            </th>
            <th className="px-4 py-3 text-left">Image</th>
            <th className="px-4 py-3 text-left">
              <Button variant="ghost" className="flex items-center">
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </th>
            <th className="px-4 py-3 text-left">Collection</th>
            <th className="px-4 py-3 text-left">Tags</th>
            <th className="px-4 py-3 text-left">Price</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((p) => {
            const isSelected = selected.includes(p.id);

            return (
              <tr
                key={p.id}
                className={cn(
                  "border-b hover:bg-gray-50 transition-colors",
                  isSelected && "bg-gray-100"
                )}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(p.id)}
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md overflow-hidden bg-gray-100 border">
                    {p.images?.[0]?.url ? (
                      <Image
                        src={`${p.images[0].url}`}
                        alt={p.title || "Product image"}
                        width={48}
                        height={48}
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <Image
                        src="/placeholder.jpeg"
                        alt="Placeholder"
                        width={48}
                        height={48}
                        className="object-cover rounded-md"
                      />
                    )}
                  </div>
                </td>


                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.title}
                </td>
                <td className="px-4 py-3">{p.collection?.title || "-"}</td>
                <td className="px-4 py-3">
                  {p.tags?.map((t: any) => t.name).join(", ") || "-"}
                </td>
                <td className="px-4 py-3">
                  ₹{p.minPriceAmount}
                </td>
                <td className="px-4 py-3">
                  {p.published ? (
                    <span className="text-green-600 font-medium">Published</span>
                  ) : (
                    <span className="text-gray-400">Draft</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <Link href={`products/${p.handle}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button></Link>
                  {/* <Button onClick={()=>onDelete(p.id,onRefresh)} variant="destructive" size="sm">
                    Delete
                  </Button> */}
                  <AlertDialogConfirm
                    showBtnText="Delete"
                    id={p.id}
                    onConfirm={(id) => onDelete(id, onRefresh)}
                    description="This will permanently delete the product and its data."
                    variant="destructive"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
