"use client";
import { useState, useEffect } from "react";
import { collectionsAPI, productsAPI } from "@/lib/api";
import { Product, Collection } from "@/types/collections";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export default function CollectionAddPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [addingCollection, setAddingCollection] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterTag, setFilterTag] = useState("");

  const debouncedSearchText = useDebounce(searchText, 300);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await productsAPI.getAll({ all: true });
        setAllProducts(res.data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    fetchProducts();
  }, []);

  // Upload image
  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setImageUrl(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  // Create collection
  const handleAddCollection = async () => {
    if (!title.trim()) {
      toast.info("Title is required");
      return;
    }

    try {
      setAddingCollection(true);
      const res = await collectionsAPI.create({
        title,
        description,
        imageUrl,
        imageAlt,
      });

      const collection: Collection = res.data;

      if (selectedProductIds.length > 0) {
        await collectionsAPI.addProducts(collection.id, selectedProductIds);
      }

      toast.success("✅ Collection created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setImageUrl("");
      setImageAlt("");
      setSelectedProductIds([]);
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to create collection.");
    } finally {
      setAddingCollection(false);
    }
  };

  // Filter products
  const filteredProducts = allProducts
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

  // Select all filtered products
  const handleSelectAll = () => {
    const filteredIds = filteredProducts.map((p) => p.id);
    const allSelected = filteredIds.every((id) =>
      selectedProductIds.includes(id)
    );

    if (allSelected) {
      // Deselect all visible
      setSelectedProductIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Add all visible
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const allVisibleSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Add New Collection</h1>

      {/* Collection Info */}
      <div className="bg-white shadow p-6 rounded-md flex flex-col md:flex-row gap-6">
        {/* Image upload */}
        <div className="flex flex-col items-center gap-2">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={imageAlt || "Collection image"}
              className="w-48 h-48 object-cover rounded-md border"
            />
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
            onClick={handleAddCollection}
            disabled={addingCollection}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {addingCollection ? "Creating..." : "Create Collection"}
          </button>
        </div>
      </div>

      {/* Add Products */}
      <div className="bg-white shadow p-6 rounded-md space-y-4">
        <h2 className="text-xl font-semibold">Add Products to Collection</h2>

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
              {filteredProducts.map((product) => {
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
                        setSelectedProductIds([
                          ...selectedProductIds,
                          product.id,
                        ]);
                      }
                    }}
                  >
                    <td className="p-2">
                      <input type="checkbox" checked={isSelected} readOnly />
                    </td>
                    <td className="p-2">
                      <img
                        src={product.images?.[0]?.url || ""}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
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

        {filteredProducts.length === 0 && (
          <p className="text-gray-500 text-center py-4">No products found.</p>
        )}
      </div>
    </div>
  );
}
