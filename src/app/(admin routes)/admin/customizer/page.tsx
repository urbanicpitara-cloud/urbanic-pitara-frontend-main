"use client";
import React, { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

interface ProductVariant {
    id: string;
    colorName: string;
    colorHex: string;
    views: ProductView[];
}

interface ProductView {
    id: string;
    side: string;
    imageUrl: string;
}

interface Product {
    id: string;
    name: string;
    basePrice: number;
    variants: ProductVariant[];
}

interface Asset {
    id: string;
    url: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    assets: Asset[];
}

export default function AdminCustomizerPage() {
    const [activeTab, setActiveTab] = useState<"products" | "arts">("products");

    // Products State
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [newProductName, setNewProductName] = useState("");
    const [newProductPrice, setNewProductPrice] = useState("899");

    // Arts State
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Fetch Data
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/products`);
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/categories`);
            if (res.ok) setCategories(await res.json());
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch categories");
        } finally {
            // Categories loaded
        }
    };

    // --- Product Handlers ---
    const createProduct = async () => {
        if (!newProductName) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/products`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newProductName, basePrice: parseFloat(newProductPrice) })
            });
            if (res.ok) {
                toast.success("Product created");
                setNewProductName("");
                fetchProducts();
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to create product");
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm("Are you sure? This will delete all variants and views.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/products/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Product deleted");
                fetchProducts();
            } else {
                toast.error(data.error || "Failed to delete product");
            }
        } catch (error) {
            console.error("Delete product error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete product");
        }
    };

    const addVariant = async (productId: string, colorName: string, colorHex: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/products/${productId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ colorName, colorHex })
            });
            if (res.ok) {
                toast.success("Variant added");
                fetchProducts();
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to add variant");
        }
    };

    const addView = async (variantId: string, side: string, file: File) => {
        try {
            const imageUrl = await uploadToCloudinary(file);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/variants/${variantId}/views`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ side, imageUrl })
            });
            if (res.ok) {
                toast.success("View added");
                fetchProducts();
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to add view");
        }
    };

    const deleteVariant = async (id: string) => {
        if (!confirm("Delete this variant? All views will be deleted.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/variants/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Variant deleted");
                fetchProducts();
            } else {
                toast.error(data.error || "Failed to delete variant");
            }
        } catch (error) {
            console.error("Delete variant error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete variant");
        }
    };

    const deleteView = async (id: string) => {
        if (!confirm("Delete this view?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/views/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("View deleted");
                fetchProducts();
            } else {
                toast.error(data.error || "Failed to delete view");
            }
        } catch (error) {
            console.error("Delete view error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete view");
        }
    };

    // --- Art Handlers ---
    const createCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                toast.success("Category created");
                setNewCategoryName("");
                fetchCategories();
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to create category");
        }
    };

    const addAssets = async (categoryId: string, files: FileList) => {
        let successCount = 0;
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const url = await uploadToCloudinary(file);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/categories/${categoryId}/assets`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url, name: file.name })
                });
                if (res.ok) successCount++;
            }

            if (successCount > 0) {
                toast.success(`${successCount} assets added`);
                fetchCategories();
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to add assets");
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm("Are you sure? This will delete the category and all its assets.")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/categories/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Category deleted");
                fetchCategories();
            } else {
                toast.error(data.error || "Failed to delete category");
            }
        } catch (error) {
            console.error("Delete category error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete category");
        }
    };

    const deleteAsset = async (id: string) => {
        if (!confirm("Delete this asset?")) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/customizer/assets/${id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Asset deleted");
                fetchCategories();
            } else {
                toast.error(data.error || "Failed to delete asset");
            }
        } catch (error) {
            console.error("Delete asset error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to delete asset");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Customizer Manager</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("products")}
                        className={`px-4 py-2 rounded-lg ${activeTab === "products" ? "bg-black text-white" : "bg-gray-100"}`}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab("arts")}
                        className={`px-4 py-2 rounded-lg ${activeTab === "arts" ? "bg-black text-white" : "bg-gray-100"}`}
                    >
                        Art Assets
                    </button>
                </div>
            </div>

            {activeTab === "products" && (
                <div className="space-y-8">
                    {/* Create Product */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Product Name</label>
                            <input
                                value={newProductName}
                                onChange={(e) => setNewProductName(e.target.value)}
                                placeholder="e.g. Premium Hoodie"
                                className="border rounded px-3 py-2 w-64"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Base Price</label>
                            <input
                                type="number"
                                value={newProductPrice}
                                onChange={(e) => setNewProductPrice(e.target.value)}
                                className="border rounded px-3 py-2 w-32"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={createProduct} className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add Product
                            </Button>
                        </div>
                    </div>

                    {/* Product List */}
                    {loadingProducts ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <div className="space-y-6">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white border rounded-lg overflow-hidden">
                                    <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-lg">{product.name}</h3>
                                            <p className="text-sm text-gray-500">Base Price: ₹{product.basePrice}</p>
                                        </div>
                                        <button onClick={() => deleteProduct(product.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="p-4">
                                        <h4 className="font-medium mb-3 flex items-center gap-2"><Palette size={16} /> Color Variants</h4>

                                        {/* Add Variant */}
                                        <div className="flex gap-2 mb-4">
                                            <input id={`color-${product.id}`} placeholder="Color Name (e.g. Red)" className="border rounded px-2 py-1 text-sm" />
                                            <input id={`hex-${product.id}`} type="color" className="w-8 h-8 rounded cursor-pointer" />
                                            <button
                                                onClick={() => {
                                                    const nameInput = document.getElementById(`color-${product.id}`) as HTMLInputElement;
                                                    const hexInput = document.getElementById(`hex-${product.id}`) as HTMLInputElement;
                                                    if (nameInput.value) addVariant(product.id, nameInput.value, hexInput.value);
                                                }}
                                                className="text-sm bg-gray-900 text-white px-3 py-1 rounded"
                                            >
                                                Add Variant
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {product.variants.map((variant) => (
                                                <div key={variant.id} className="border rounded p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: variant.colorHex }} />
                                                            <span className="font-medium">{variant.colorName}</span>
                                                        </div>
                                                        <button onClick={() => deleteVariant(variant.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Views */}
                                                    <div className="space-y-2">
                                                        {variant.views.map((view) => (
                                                            <div key={view.id} className="flex items-center justify-between gap-2 text-sm bg-gray-50 p-1 rounded">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="uppercase text-xs font-bold w-12">{view.side}</span>
                                                                    <img src={view.imageUrl} className="w-8 h-8 object-contain" alt={view.side} />
                                                                </div>
                                                                <button onClick={() => deleteView(view.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ))}

                                                        <div className="flex gap-2 items-center mt-2">
                                                            <select id={`side-${variant.id}`} className="text-sm border rounded px-1 py-1">
                                                                <option value="front">Front</option>
                                                                <option value="back">Back</option>
                                                                <option value="left">Left</option>
                                                                <option value="right">Right</option>
                                                            </select>
                                                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                                                <ImageIcon size={12} /> Upload
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files?.[0]) {
                                                                            const sideSelect = document.getElementById(`side-${variant.id}`) as HTMLSelectElement;
                                                                            addView(variant.id, sideSelect.value, e.target.files[0]);
                                                                        }
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "arts" && (
                <div className="space-y-8">
                    {/* Create Category */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-1">Category Name</label>
                            <input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="e.g. Memes"
                                className="border rounded px-3 py-2 w-64"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={createCategory} className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Create Category
                            </Button>
                        </div>
                    </div>

                    {/* Categories List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {categories.map((cat) => (
                            <div key={cat.id} className="bg-white border rounded-lg p-4">
                                <h3 className="font-bold mb-4 flex justify-between items-center">
                                    <div className="flex-1">
                                        {cat.name}
                                        <span className="text-xs font-normal text-gray-500 ml-2">{cat.assets.length} assets</span>
                                    </div>
                                    <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:bg-red-50 p-2 rounded flex-shrink-0">
                                        <Trash2 size={18} />
                                    </button>
                                </h3>

                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {cat.assets.map((asset) => (
                                        <div key={asset.id} className="aspect-square border rounded p-1 flex items-center justify-center bg-gray-50 relative group">
                                            <img src={asset.url} className="max-w-full max-h-full" alt={asset.name || "Asset"} />
                                            <button
                                                onClick={() => deleteAsset(asset.id)}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete asset"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}

                                    <label className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                        <Plus size={20} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 mt-1">Add</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".svg,.png,.jpg,.jpeg,.webp"
                                            multiple
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    addAssets(cat.id, e.target.files);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
