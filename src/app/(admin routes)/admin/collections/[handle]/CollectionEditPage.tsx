"use client";
import { useState, useEffect } from "react";
import { collectionsAPI, productsAPI } from "@/lib/api";
import { Collection, Product } from "@/types/collections";
import { useDebounce } from "@/hooks/useDebounce";

interface Props {
  initialCollection: Collection;
}

export default function CollectionEditPage({ initialCollection }: Props) {
  const [collection, setCollection] = useState<Collection>(initialCollection);

  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");

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
      });
      setCollection({
        ...res.data,
        products: collection.products || [],
      });
      alert("Collection updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update collection.");
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
      alert("Failed to add products.");
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
      alert("Failed to remove product.");
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Edit Collection: {collection.title}</h1>

      {/* Collection Info */}
      <div className="bg-white shadow p-6 rounded-md flex flex-col gap-4">
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
        <div className="overflow-x-auto max-h-80">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="p-2 text-left">Select</th>
                <th className="p-2 text-left">Image</th>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {availableProducts.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (selectedProductIds.includes(product.id)) {
                      setSelectedProductIds(
                        selectedProductIds.filter((id) => id !== product.id)
                      );
                    } else {
                      setSelectedProductIds([...selectedProductIds, product.id]);
                    }
                  }}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      readOnly
                    />
                  </td>
                  <td className="p-2">
                    <img
                      src={product.images?.[0]?.url || ""}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="p-2">{product.title}</td>
                  <td className="p-2">{product.tags?.map((t) => t.name).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleAddProducts}
          disabled={addingProducts || selectedProductIds.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 mt-2"
        >
          {addingProducts ? "Adding..." : `Add ${selectedProductIds.length} Products`}
        </button>
      </div>

      {/* Current Products */}
      <div className="bg-white shadow p-6 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Products in Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(collection.products || []).map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center border p-2 rounded relative hover:shadow-md transition"
            >
              {p.images?.[0]?.url && (
                <img
                  src={p.images[0].url}
                  alt={p.title}
                  className="w-24 h-24 object-cover rounded"
                />
              )}
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
