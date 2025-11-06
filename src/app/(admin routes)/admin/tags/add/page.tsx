"use client";

import { useState, useEffect } from "react";
import {  productsAPI } from "@/lib/api";
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

  // Fetch products
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

  // Auto-generate handle
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

  // Filter products by search
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

  // Toggle product selection
  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHandle(e.target.value);
    setIsHandleEdited(true); // stop auto-generation
  };

  // Handle submit: create tag & update selected products
  const handleSubmit = async () => {
    if (!name.trim()) return alert("Name is required");
    if (selectedProducts.length === 0)
      return alert("Please select at least one product");

    try {
      setSaving(true);

      // 1️⃣ Create the tag
    //   const tagData = {
    //     name,
    //     handle: handle || undefined,
    //     description,
    //   };
    //   const res = await tagsAPI.create(tagData);
      const newTagName = name.toLocaleLowerCase();

      const ids = selectedProducts.map(p=>p.id);

      const res = await productsAPI.updateMany(ids, { tags: [newTagName] });

     if(res.data.success){
              toast.success("✅ Tag created and applied to selected products!");

      // Reset form
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Add New Tag</h1>

      {/* Tag form */}
      <div className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-3 rounded w-full focus:ring focus:ring-green-200"
        />
        <input
          value={handle}
          onChange={handleHandleChange}
          placeholder="Handle (auto-generated)"
          className="border p-3 rounded w-full focus:ring focus:ring-green-200"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-3 rounded w-full focus:ring focus:ring-green-200"
        />
      </div>

      {/* Search products */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name or tag..."
          className="border p-2 rounded flex-1 focus:ring focus:ring-green-200"
        />
      </div>

      {/* Product selection */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-semibold text-lg">Select Products for this Tag</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product)}
              className={`border p-2 rounded cursor-pointer hover:ring hover:ring-green-200 flex flex-col items-center text-center ${
                selectedProducts.find((p) => p.id === product.id)
                  ? "bg-green-100 border-green-400"
                  : "bg-white"
              }`}
            >
              {product.featuredImageUrl ? (
                <img
                  src={product.featuredImageUrl}
                  alt={product.title}
                  className="w-20 h-20 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              <span className="text-sm font-medium">{product.title}</span>
              {typeof product.minPriceAmount === "number" && (
                <span className="text-xs text-gray-500">
                  ${product.minPriceAmount.toFixed(2)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {saving ? "Creating..." : "Create Tag"}
      </button>
    </div>
  );
}
