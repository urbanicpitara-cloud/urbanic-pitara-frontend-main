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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

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
  const [vendor, setVendor] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  // 🎨 Color
  const [color, setColor] = useState("");
  const [colorValue, setColorValue] = useState("");

  // Images
  const [images, setImages] = useState<{ url: string; altText: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

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
      const uploaded: { url: string; altText: string }[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        uploaded.push({ url, altText: title || "Product image" });
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
  const updateImageAlt = (i: number, altText: string) =>
    setImages((p) => p.map((img, idx) => idx === i ? { ...img, altText } : img));

  // Extract text from HTML
  const extractText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  };

  // Submit
  const handleSubmit = async () => {
    // Validate inputs
    if (!title) {
      toast.info("Title is required.");
      return;
    }

    if (!priceAmount || Number(priceAmount) <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (selectedSizes.length === 0) {
      toast.error("Please select at least one size.");
      return;
    }

    if (color && !colorValue) {
      toast.error("Please select a Color Value if Color Name is provided.");
      return;
    }

    setSaving(true);
    try {
      const textDescription = extractText(htmlDescription);

      // Construct variants based on selected sizes
      const variants = selectedSizes.map(size => ({
        priceAmount: Number(priceAmount),
        compareAmount: compareAmount ? Number(compareAmount) : null,
        inventoryQuantity: Number(stock) || 0,
        priceCurrency: "INR",
        availableForSale: true,
        selectedOptions: {
          size: size.toLowerCase(), // Store as lowercase to match seeded products
        }
      }));

      // Construct options
      const options = [
        {
          name: "Size",
          values: selectedSizes.map(size => ({ name: size }))
        }
      ];

      const productData = {
        title,
        handle,
        vendor: vendor || null,
        collectionIds,
        descriptionHtml: htmlDescription,
        description: textDescription,
        images: images.map((img) => ({ url: img.url, altText: img.altText })),
        options,
        variants,
        tags: tags
          ? tags.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
          : [],
        published,
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords || null,
        // 🎨 Pass color info in metafields
        metafields: {
          color: color,
          colorValue: colorValue,
        },
      };

      await productsAPI.create(productData);
      toast.success("✅ Product created!");
      router.refresh(); // Force refresh to clear Next.js cache
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
                <Label>Vendor/Brand</Label>
                <Input
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Urbanic, Nike, Adidas"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional. Brand or manufacturer name.
                </p>
              </div>

              {/* 🎨 Color & Color Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color Name</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. Red"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Value</Label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Input
                        value={colorValue}
                        onChange={(e) => setColorValue(e.target.value)}
                        placeholder="#000000"
                      />
                      <div
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: colorValue || 'transparent' }}
                      />
                    </div>
                    <input
                      type="color"
                      value={colorValue || "#000000"}
                      onChange={(e) => setColorValue(e.target.value)}
                      className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>
                </div>
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

              <div className="col-span-2 space-y-3">
                <Label>Sizes</Label>
                <div className="flex flex-wrap gap-4">
                  {STANDARD_SIZES.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSizes([...selectedSizes, size]);
                          } else {
                            setSelectedSizes(selectedSizes.filter(s => s !== size));
                          }
                        }}
                      />
                      <label
                        htmlFor={`size-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
                {selectedSizes.length === 0 && (
                  <p className="text-xs text-red-500">At least one size is required.</p>
                )}
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
              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="e.g. women fashion, kurti, ethnic wear"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional. Comma-separated keywords for SEO.
                </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border rounded-lg overflow-hidden bg-gray-50"
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
                    <div className="aspect-square flex items-center justify-center">
                      <img src={img.url} alt={img.altText} className="object-cover w-full h-full" />
                    </div>
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute left-2 top-2 bg-white/80 rounded p-1 cursor-grab">
                      <GripVertical className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="p-2 bg-white border-t">
                      <Input
                        value={img.altText}
                        onChange={(e) => updateImageAlt(idx, e.target.value)}
                        placeholder="Image description (alt text)"
                        className="text-xs"
                      />
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
