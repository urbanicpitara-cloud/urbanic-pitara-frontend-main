"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { productsAPI, collectionsAPI } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { MultiSelect } from "@/components/ui/multi-select-custom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, GripVertical, Upload } from "lucide-react";
import { toast } from "sonner";

export default function AddProductPage() {
  const router = useRouter();

  // Basic product fields
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [handleTouched, setHandleTouched] = useState(false); // <-- new flag
  const [htmlDescription, setHtmlDescription] = useState("");
  const [priceAmount, setPriceAmount] = useState("");
  const [compareAmount, setCompareAmount] = useState("");
  const [stock, setStock] = useState("");
  const [tags, setTags] = useState("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>(
    []
  );
  const [published, setPublished] = useState(true);

  // Images
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  // Load collections
  useEffect(() => {
    (async () => {
      try {
        const { data } = await collectionsAPI.getAll();
        // Data shape: your API returns array (as in earlier messages), adjust if necessary
        setCollections(data || []);
      } catch (err) {
        console.error("Failed to load collections", err);
      }
    })();
  }, []);

  // Slugify helper
  const slugify = (s: string) => {
    return s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Auto-generate handle from title unless user manually edited it
  useEffect(() => {
    if (handleTouched) return; // user has edited the handle -> don't auto-update
    if (!title.trim()) {
      setHandle("");
      return;
    }
    const newSlug = slugify(title);
    setHandle(newSlug);
  }, [title, handleTouched]);

  // If user clears handle input, we should consider it not touched so auto-gen can resume
  // Optionally handle this: if user deletes handle completely, allow auto-gen again
  useEffect(() => {
    if (!handle) {
      setHandleTouched(false);
    }
  }, [handle]);

  // Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Remove & reorder
  const removeImage = (i: number) =>
    setImages((p) => p.filter((_, idx) => idx !== i));
  const moveImage = (from: number, to: number) =>
    setImages((p) => {
      const arr = [...p];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });

  // Extract text from HTML
  const extractText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  };

  // Submit
  const handleSubmit = async () => {
    if (!title) {
      toast.info("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const textDescription = extractText(htmlDescription);
      const productData = {
        title,
        handle,
        collectionIds,
        descriptionHtml: htmlDescription,
        description: textDescription,
        images: images.map((url) => ({ url })),
        variants: [
          {
            priceAmount: Number(priceAmount) || 0,
            compareAmount: compareAmount ? Number(compareAmount) : null,
            inventoryQuantity: Number(stock) || 0,
            priceCurrency: "INR",
          },
        ],
        tags: tags
          ? tags.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
          : [],
        published,
        metaTitle,
        metaDescription,
      };

      await productsAPI.create(productData);
      toast.success("✅ Product created!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      // Show server error message if available
      const message =
        (err as any)?.response?.data?.error ||
        (err as any)?.response?.data?.message ||
        "Failed to create product.";
      toast.info(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add New Product</h1>
        <Button
          onClick={handleSubmit}
          disabled={saving || uploading}
          className="bg-black text-white hover:bg-gray-800"
        >
          {saving ? "Saving..." : "Save Product"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT: Main details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Product title"
                />
              </div>

              <div>
                <Label>Handle (slug)</Label>
                <Input
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    setHandleTouched(true); // mark as manually edited
                  }}
                  placeholder="auto-generated-handle"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL handle / slug. If you edit it manually, auto-generation will stop.
                </p>
              </div>

              <div>
                <Label>Collections</Label>
                <MultiSelect
                  options={collections}
                  selected={collectionIds}
                  onChange={setCollectionIds}
                  placeholder="Select collections"
                />
              </div>

              <div>
                <Label>Description (HTML)</Label>
                <Textarea
                  rows={10}
                  value={htmlDescription}
                  onChange={(e) => setHtmlDescription(e.target.value)}
                  placeholder="<p>Write your product description...</p>"
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Compare At (₹)</Label>
                <Input
                  type="number"
                  value={compareAmount}
                  onChange={(e) => setCompareAmount(e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO Title (optional)"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Short SEO description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Images & publishing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border rounded-lg overflow-hidden aspect-square bg-gray-50 flex items-center justify-center"
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData("fromIndex", idx.toString())
                    }
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = Number(e.dataTransfer.getData("fromIndex"));
                      moveImage(from, idx);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <img src={img} alt={`Product ${idx}`} className="object-cover w-full h-full" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-500 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute left-1 top-1 bg-white/80 rounded p-1 cursor-grab">
                      <GripVertical className="w-4 h-4 text-gray-600" />
                    </div>
                  </div>
                ))}

                {/* Upload button */}
                <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-500 mb-1" />
                  <span className="text-xs text-gray-500">
                    {uploading ? "Uploading..." : "Upload"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags & Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. trending, new-arrival"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label>Published</Label>
                <Switch checked={published} onCheckedChange={setPublished} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
