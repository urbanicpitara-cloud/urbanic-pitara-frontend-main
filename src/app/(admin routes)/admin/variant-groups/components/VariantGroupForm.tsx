"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { variantGroupsAPI, productsAPI } from "@/lib/api";
import { toast } from "sonner";
import { VariantGroup } from "@/types/api";
import { Loader2, X, Search, ChevronLeft } from "lucide-react";
import Image from "next/image";

interface Props {
    group?: VariantGroup;
}

interface FormData {
    name: string;
    description: string;
}

export default function VariantGroupForm({ group }: Props) {
    const router = useRouter();
    const isEdit = !!group;
    const { register, handleSubmit } = useForm<FormData>({
        defaultValues: {
            name: group?.name || "",
            description: group?.description || "",
        }
    });

    const [loading, setLoading] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
        group?.products?.map(p => p.id) || []
    );

    // Product Search State
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);
    const [productTitles, setProductTitles] = useState<Record<string, { title: string, image?: string }>>({});

    // Initialize product info map
    useEffect(() => {
        if (group?.products) {
            const map: Record<string, { title: string, image?: string }> = {};
            group.products.forEach(p => {
                map[p.id] = {
                    title: p.title,
                    image: p.featuredImageUrl || (p.images && p.images[0]?.url)
                };
            });
            setProductTitles(prev => ({ ...prev, ...map }));
        }
    }, [group]);

    // Search Products
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await productsAPI.getAll({
                    search: searchTerm || undefined,
                    limit: 20,
                    sort: 'createdAt',
                    order: 'desc'
                });
                const items = res.data.products || res.data.items || [];
                setSearchResults(items);

                // Update titles map
                const newMap: Record<string, { title: string, image?: string }> = {};
                items.forEach((p: Product) => {
                    newMap[p.id] = {
                        title: p.title,
                        image: p.featuredImageUrl || (p.images && p.images[0]?.url)
                    };
                });
                setProductTitles(prev => ({ ...prev, ...newMap }));
            } catch (err) {
                console.error(err);
            } finally {
                setSearching(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            if (isEdit) {
                await variantGroupsAPI.update(group!.id, {
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
            router.push("/admin/variant-groups");
            router.refresh();
        } catch (err: unknown) {
            const error = err as Error;
            toast.error(error.message || "Failed to save group");
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

    return (
        <div className="max-w-5xl mx-auto py-6 px-4">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ChevronLeft size={20} />
                </Button>
                <h1 className="text-2xl font-bold">
                    {isEdit ? `Edit Group: ${group.name}` : "Create New Variant Group"}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Group Name</Label>
                            <Input
                                id="name"
                                {...register("name", { required: true })}
                                placeholder="e.g. Velvet Kurtis Colors"
                                className="font-medium"
                            />
                            <p className="text-xs text-gray-400">This name is for admin use to group related products.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="What is this group for?"
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <h3 className="font-semibold mb-4">Selected Products ({selectedProductIds.length})</h3>
                        {selectedProductIds.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No products selected yet.</p>
                        ) : (
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {selectedProductIds.map(id => (
                                    <div key={id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100 group">
                                        <div className="relative w-10 h-10 rounded bg-white overflow-hidden border flex-shrink-0">
                                            {productTitles[id]?.image ? (
                                                <Image
                                                    src={productTitles[id].image!}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    sizes="40px"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <X size={12} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium truncate flex-1">{productTitles[id]?.title || "Loading..."}</span>
                                        <button
                                            type="button"
                                            onClick={() => toggleProduct(id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button type="submit" className="w-full py-6 text-lg shadow-lg hover:shadow-xl transition-all" disabled={loading}>
                        {loading && <Loader2 className="animate-spin w-5 h-5 mr-2" />}
                        {isEdit ? "Update Variant Group" : "Create Variant Group"}
                    </Button>
                </div>

                {/* Right Column: Product Browser */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search products by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11"
                                />
                            </div>
                            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                {searchTerm ? "Search Results" : "Recent Products"}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto min-h-[500px]">
                            {searching ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                                    <Loader2 className="animate-spin" />
                                    <p>Searching products...</p>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {searchResults.map(product => {
                                        const isSelected = selectedProductIds.includes(product.id);
                                        const image = product.featuredImageUrl || (product.images && product.images[0]?.url);

                                        return (
                                            <div
                                                key={product.id}
                                                onClick={() => toggleProduct(product.id)}
                                                className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                    ? "border-blue-500 bg-blue-50/30 ring-1 ring-blue-500"
                                                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className="relative w-14 h-14 rounded-lg bg-white overflow-hidden border border-gray-100 flex-shrink-0">
                                                    {image ? (
                                                        <Image
                                                            src={image}
                                                            alt={product.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="56px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                            <Search size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold truncate text-gray-900">{product.title}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{product.vendor || "No Vendor"}</p>
                                                    <p className="text-xs font-bold text-gray-900 mt-0.5">₹{product.minPriceAmount}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
                                                    }`}>
                                                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <p>No products found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
