"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { collectionsAPI, productsAPI } from "@/lib/api";
import { Collection, Product } from "@/types/collections";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Props {
  initialCollection: Collection;
}

export default function CollectionEditPage({ initialCollection }: Props) {
  const [collection, setCollection] = useState<Collection>(initialCollection);

  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");
  const [imageUrl, setImageUrl] = useState(collection.imageUrl || "");
  const [imageAlt, setImageAlt] = useState(collection.imageAlt || "");
  const [imageUploading, setImageUploading] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [addingProducts, setAddingProducts] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const debouncedSearchText = useDebounce(searchText, 300);

  // Fetch all products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await productsAPI.getAll({ all: true });
        setAllProducts(res.data.products);
      } catch (err) {
        console.error(err);
      }
    }
    fetchProducts();
  }, []);

  // Update collection info
  const handleUpdate = async () => {
    try {
      const res = await collectionsAPI.update(collection.id, {
        title,
        description,
        imageUrl,
        imageAlt,
      });
      setCollection({
        ...res.data,
        products: collection.products || [],
      });
      toast.success("✅ Collection updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to update collection.");
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      toast.info("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  // Add products to collection
  const handleAddProducts = async () => {
    if (selectedProductIds.length === 0) return;
    try {
      setAddingProducts(true);
      await collectionsAPI.addProducts(collection.id, selectedProductIds);

      const newProducts = allProducts.filter((p) =>
        selectedProductIds.includes(p.id)
      );
      setCollection({
        ...collection,
        products: [...(collection.products || []), ...newProducts],
      });
      setSelectedProductIds([]);
    } catch (err) {
      console.error(err);
      toast.info("Failed to add products.");
    } finally {
      setAddingProducts(false);
    }
  };

  // Remove product from collection
  const handleRemoveProduct = async (productId: string) => {
    try {
      await collectionsAPI.removeProducts(collection.id, [productId]);
      setCollection({
        ...collection,
        products: (collection.products || []).filter((p) => p.id !== productId),
      });
    } catch (err) {
      console.error(err);
      toast.info("Failed to remove product.");
    }
  };

  // Filter available products
  const availableProducts = allProducts
    .filter((p) => !(collection.products || []).some((cp) => cp.id === p.id))
    .filter((p) =>
      filterTag
        ? p.tags?.some((t) =>
            t.name.toLowerCase().includes(filterTag.toLowerCase())
          )
        : true
    )
    .filter((p) =>
      p.title.toLowerCase().includes(debouncedSearchText.toLowerCase())
    );

  // "Select All" logic
  const allVisibleSelected =
    availableProducts.length > 0 &&
    availableProducts.every((p) => selectedProductIds.includes(p.id));

  const handleSelectAll = () => {
    const visibleIds = availableProducts.map((p) => p.id);
    const allSelected = visibleIds.every((id) =>
      selectedProductIds.includes(id)
    );

    if (allSelected) {
      setSelectedProductIds((prev) =>
        prev.filter((id) => !visibleIds.includes(id))
      );
    } else {
      setSelectedProductIds((prev) =>
        Array.from(new Set([...prev, ...visibleIds]))
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">
        Edit Collection: {collection.title}
      </h1>

      {/* Collection Info */}
      <div className="bg-white shadow p-6 rounded-md flex flex-col md:flex-row gap-6">
        {/* Image Upload Section */}
        <div className="flex flex-col items-center gap-2">
          {imageUrl && (
            <div className="relative w-48 h-48 border rounded-md overflow-hidden bg-gray-50">
              <Button onClick={()=>setImageUrl("")} className="z-20 absolute right-1 bg-red-400 hover:bg-red-500 p-2 rounded-md">X</Button>
              <Image
                src={imageUrl}
                alt={imageAlt || "Collection image"}
                fill
                sizes="192px"
                className="object-contain"
              />
            </div>
          )}
          <label className="cursor-pointer bg-gray-100 border rounded px-3 py-1 hover:bg-gray-200 mt-2">
            {imageUploading ? "Uploading..." : "Upload Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleImageUpload(e.target.files[0])
              }
            />
          </label>
          <input
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Image Alt Text"
            className="border p-2 rounded w-full mt-2"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 rounded w-full"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleUpdate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Collection
          </button>
        </div>
      </div>

      {/* Add Products */}
      <div className="bg-white shadow p-6 rounded-md space-y-4">
        <h2 className="text-xl font-semibold">Add Products</h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            placeholder="Search by name..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <input
            placeholder="Filter by tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="border p-2 rounded flex-1"
          />
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto max-h-80 border rounded-md">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                  />{" "}
                  Select All
                </th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {availableProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`cursor-pointer transition ${
                      isSelected ? "bg-green-50" : "hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedProductIds(
                          selectedProductIds.filter((id) => id !== product.id)
                        );
                      } else {
                        setSelectedProductIds([...selectedProductIds, product.id]);
                      }
                    }}
                  >
                    <td className="p-2">
                      <input type="checkbox" checked={isSelected} readOnly />
                    </td>
                    <td className="p-2">
                      <div className="relative w-16 h-16 rounded overflow-hidden border bg-gray-50">
                        <Image
                          src={product.images?.[0]?.url || "/placeholder.png"}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-contain"
                        />
                      </div>
                    </td>
                    <td className="p-2">{product.title}</td>
                    <td className="p-2 text-sm text-gray-600">
                      {product.tags?.map((t) => t.name).join(", ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {availableProducts.length === 0 && (
          <p className="text-gray-500 text-center py-4">No products found.</p>
        )}

        <button
          onClick={handleAddProducts}
          disabled={addingProducts || selectedProductIds.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mt-2"
        >
          {addingProducts
            ? "Adding..."
            : `Add ${selectedProductIds.length} Products`}
        </button>
      </div>

      {/* Current Products */}
      <div className="bg-white shadow p-6 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Products in Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto h-[50vh]">
          {(collection.products || []).map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center border p-2 rounded relative hover:shadow-md transition"
            >
              <div className="relative w-24 h-24 border rounded-md overflow-hidden bg-gray-50">
                <Image
                  src={p.images?.[0]?.url || "/placeholder.png"}
                  alt={p.title}
                  fill
                  sizes="96px"
                  className="object-contain"
                />
              </div>
              <span className="mt-1 text-sm text-center">{p.title}</span>
              <button
                onClick={() => handleRemoveProduct(p.id)}
                className="absolute top-1 right-1 text-red-500 font-bold hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
