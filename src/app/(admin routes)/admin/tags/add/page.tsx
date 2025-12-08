"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { productsAPI } from "@/lib/api";
import { Product } from "@/types/collections";
import { toast } from "sonner";

export default function TagAddPage() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [isHandleEdited, setIsHandleEdited] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getAll({ limit: 200 });
        setAllProducts(res.data.products);
        setFilteredProducts(res.data.products);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!isHandleEdited) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "");
      setHandle(generated);
    }
  }, [name, isHandleEdited]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = allProducts.filter((product) => {
      const nameMatch = product.title.toLowerCase().includes(term);
      const tagMatch = product.tags?.some((t) =>
        t.name.toLowerCase().includes(term)
      );
      return nameMatch || tagMatch;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, allProducts]);

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHandle(e.target.value);
    setIsHandleEdited(true);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.info("Name is required");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.info("Please select at least one product");
      return;
    }

    try {
      setSaving(true);
      const newTagName = name.toLocaleLowerCase();
      const ids = selectedProducts.map(p => p.id);
      const res = await productsAPI.updateMany(ids, { tags: [newTagName] });

      if (res.data.success) {
        toast.success("✅ Tag created and applied to selected products!");
        setName("");
        setHandle("");
        setDescription("");
        setSelectedProducts([]);
        setSearchTerm("");
        setIsHandleEdited(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("❌ Failed to create tag or update products");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAll = () => {
    const allFilteredSelected = filteredProducts.every((fp) =>
      selectedProducts.some((sp) => sp.id === fp.id)
    );

    if (allFilteredSelected) {
      setSelectedProducts((prev) =>
        prev.filter((sp) => !filteredProducts.some((fp) => fp.id === sp.id))
      );
    } else {
      const newProducts = filteredProducts.filter(
        (fp) => !selectedProducts.some((sp) => sp.id === fp.id)
      );
      setSelectedProducts((prev) => [...prev, ...newProducts]);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 max-w-5xl mx-auto w-full">
      <div className="flex-none flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Tag</h1>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-all font-medium text-sm shadow-sm"
        >
          {saving ? "Creating..." : "Create Tag"}
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-y-auto h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Tag Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Collection"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handle <span className="text-gray-400 font-normal">(Auto-generated)</span>
              </label>
              <input
                value={handle}
                onChange={handleHandleChange}
                placeholder="summer-collection"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-mono text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description for this tag..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm resize-none"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Apply to Products</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{selectedProducts.length} selected</p>
                {filteredProducts.length > 0 && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={handleSelectAll}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {filteredProducts.every(fp => selectedProducts.some(sp => sp.id === fp.id))
                        ? "Deselect All"
                        : "Select All Visible"}
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.some((p) => p.id === product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => toggleProductSelection(product)}
                    className={`group relative cursor-pointer rounded-lg border transition-all duration-200 overflow-hidden ${isSelected ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"}`}
                  >
                    <div className="aspect-square relative bg-gray-100">
                      {product.featuredImageUrl ? (
                        <Image
                          src={product.featuredImageUrl}
                          alt={product.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-black border-2 border-black" : "bg-white/80 border-2 border-gray-300 opacity-0 group-hover:opacity-100"}`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate" title={product.title}>
                        {product.title}
                      </h3>
                      {typeof product.minPriceAmount === "number" && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          ₹{product.minPriceAmount.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <p>No products found matching &quot;{searchTerm}&quot;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
