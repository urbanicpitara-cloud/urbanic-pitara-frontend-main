"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { variantGroupsAPI, productsAPI } from "@/lib/api";
import { toast } from "sonner";
import { VariantGroup } from "@/types/api";
import { Loader2, X } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: VariantGroup | null;
    onSuccess: () => void;
}

interface FormData {
    name: string;
    description: string;
}

export default function VariantGroupDialog({ open, onOpenChange, group, onSuccess }: Props) {
    const { register, handleSubmit, reset, setValue } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    // Product Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (group) {
            setValue("name", group.name);
            setValue("description", group.description || "");
            if (group.products) {
                setSelectedProductIds(group.products.map(p => p.id));
                // Pre-fill search results with existing products so they show up? 
                // Or we need a mechanism to show selected products.
                // For simplicity, we just keep IDs and maybe fetch detail if needed, 
                // but seeing names is better. The `group.products` already has title/id from the API.
            }
        } else {
            reset({ name: "", description: "" });
            setSelectedProductIds([]);
        }
    }, [group, setValue, reset, open]); // Added open to reset when opening fresh create

    // Search Products (Effect)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                // Fetch recent products if search is empty, otherwise search
                const res = await productsAPI.getAll({
                    search: searchTerm || undefined,
                    limit: 10,
                    sort: 'createdAt',
                    order: 'desc'
                });
                setSearchResults(res.data.products || res.data.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, open]); // Added open dependency to refresh when dialog opens

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (group) {
                await variantGroupsAPI.update(group.id, {
                    ...data,
                    productIds: selectedProductIds
                });
                toast.success("Group updated successfully");
            } else {
                await variantGroupsAPI.create({
                    ...data,
                    productIds: selectedProductIds
                });
                toast.success("Group created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to save group");
        } finally {
            setLoading(false);
        }
    };

    const toggleProduct = (id: string) => {
        setSelectedProductIds(prev =>
            prev.includes(id)
                ? prev.filter(pId => pId !== id)
                : [...prev, id]
        );
    };

    // Improved product display logic:
    // We need to show selected products. If we are editing, we have `group.products`.
    // If we just added one via search, we have it in `searchResults`.
    // We need a combined view of "Selected Products".
    // This is a bit complex for a simple dialog, let's simplify:
    // Just show search results and allow toggling.
    // And maybe show a list of "Selected Product IDs" (count) or list titles if available.

    // Use a map to store product titles for display
    const [productTitles, setProductTitles] = useState<Record<string, string>>({});

    useEffect(() => {
        if (group?.products) {
            const map: Record<string, string> = {};
            group.products.forEach(p => map[p.id] = p.title);
            setProductTitles(prev => ({ ...prev, ...map }));
        }
    }, [group]);

    // Update titles when search results come in
    useEffect(() => {
        if (searchResults.length) {
            const map: Record<string, string> = {};
            searchResults.forEach(p => map[p.id] = p.title);
            setProductTitles(prev => ({ ...prev, ...map }));
        }
    }, [searchResults]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{group ? "Edit Variant Group" : "Create Variant Group"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input id="name" {...register("name", { required: true })} placeholder="e.g. Summer Collection Colors" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" {...register("description")} placeholder="Optional description" />
                    </div>

                    <div className="space-y-2">
                        <Label>Products</Label>
                        <div className="border rounded-md p-3 space-y-3">
                            <Input
                                placeholder="Search products to add..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Search Results */}
                            {searching ? (
                                <div className="text-sm text-gray-500 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> {searchTerm ? "Searching..." : "Loading products..."}</div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-400 font-medium mb-1">{searchTerm ? "Search Results" : "Recent Products"}</p>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {searchResults.map(product => (
                                            <div key={product.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded cursor-pointer" onClick={() => toggleProduct(product.id)}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProductIds.includes(product.id)}
                                                    readOnly
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="truncate">{product.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400">No products found.</p>
                            )}

                            {/* Selected List Summary */}
                            {selectedProductIds.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs font-semibold mb-2">Selected ({selectedProductIds.length}):</p>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {selectedProductIds.map(id => (
                                            <div key={id} className="flex justify-between items-center text-xs bg-gray-100 p-1.5 rounded">
                                                <span className="truncate max-w-[80%]">{productTitles[id] || id}</span>
                                                <button type="button" onClick={() => toggleProduct(id)}><X size={12} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
