"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { productsAPI, collectionsAPI } from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select-custom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, GripVertical, Upload } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { PageLoadingSkeleton } from "@/components/ui/loading-states";
import { Checkbox } from "@/components/ui/checkbox";

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [handlename, setHandlename] = useState<string | null>(null);
  useEffect(() => {
    const resolveParam = async () => {
      const h =
        typeof params.handlename === "string"
          ? params.handlename
          : await params.handlename;
      setHandlename(h as string);
    };
    resolveParam();
  }, [params.handlename]);

  // ---------- States ----------
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [htmlDescription, setHtmlDescription] = useState("");
  const [tags, setTags] = useState("");
  const [collectionIds, setCollectionIds] = useState<string[]>([]);
  const [collections, setCollections] = useState<{ id: string; title: string }[]>([]);
  const [published, setPublished] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [productId, setProductId] = useState<string | null>(null);

  const [variants, setVariants] = useState<
    { id?: string; size: string; price: string; compare: string; stock: string }[]
  >([]);

  // New states for "Bulk/Global" controls
  const [globalPrice, setGlobalPrice] = useState("");
  const [globalStock, setGlobalStock] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [metafields, setMetafields] = useState({
    color: "",
    colorValue: "", // 🎨 Added colorValue
    fabric: "",
    targetGender: "",
  });

  // ---------- Load product + collections ----------
  useEffect(() => {
    if (!handlename) return;

    (async () => {
      try {
        const [{ data: allCollections }, { data: product }] = await Promise.all([
          collectionsAPI.getAll(),
          productsAPI.getByHandle(handlename + `?_t=${Date.now()}`), // Cache-busting
        ]);

        setCollections(allCollections);

        if (product) {
          setProductId(product.id);
          setTitle(product.title || "");
          setHandle(product.handle || "");
          setHtmlDescription(product.descriptionHtml || "");

          setVariants(
            product.variants?.map((v: any) => {
              const rawSize = v.selectedOptions?.Size || v.selectedOptions?.size || "";
              return {
                id: v.id,
                size: rawSize.toUpperCase(), // Normalize to uppercase for display
                price: v.priceAmount?.toString() || "",
                compare: v.compareAmount?.toString() || "",
                stock: v.inventoryQuantity?.toString() || "0",
              };
            }) || []
          );

          // Sync selectedSizes with loaded variants (normalize to uppercase)
          const existingSizes = product.variants?.map((v: any) => {
            const rawSize = v.selectedOptions?.Size || v.selectedOptions?.size;
            return rawSize ? rawSize.toUpperCase() : null;
          }).filter(Boolean) || [];
          setSelectedSizes(existingSizes);

          // Initialize global inputs from the first variant if available
          if (product.variants && product.variants.length > 0) {
            setGlobalPrice(product.variants[0].priceAmount?.toString() || "");
            setGlobalStock(product.variants[0].inventoryQuantity?.toString() || "");
          }

          setMetafields({
            color: product.metafields?.color || "",
            colorValue: product.metafields?.colorValue || "", // 🎨 Load colorValue
            fabric: product.metafields?.fabric || "",
            targetGender: product.metafields?.targetGender || "",
          });

          setTags(product.tags?.map((t: any) => t.name).join(", ") || "");
          setCollectionIds(product.collections?.map((c: any) => c.id) || []);
          setPublished(product.published ?? true);
          setImages(product.images?.map((img: any) => img.url) || []);
          setMetaTitle(product.metaTitle || "");
          setMetaDescription(product.metaDescription || "");
        }
      } catch (err) {
        console.error("Failed to load product", err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    })();
  }, [handlename]);

  // ---------- Image Handlers ----------
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
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (i: number) => setImages((p) => p.filter((_, idx) => idx !== i));

  const moveImage = (from: number, to: number) =>
    setImages((p) => {
      const arr = [...p];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });

  // ---------- Helpers ----------
  const extractText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  };

  // Toggle Size Logic
  const handleSizeToggle = (size: string, checked: boolean) => {
    if (checked) {
      // Add size -> Add variant (keep uppercase for display)
      setSelectedSizes((prev) => [...prev, size]);
      setVariants((prev) => [
        ...prev,
        {
          size: size, // Keep uppercase for display in variant list
          price: globalPrice || "0",
          compare: "",
          stock: globalStock || "0",
        },
      ]);
    } else {
      // Remove size -> Remove variant
      setSelectedSizes((prev) => prev.filter((s) => s !== size));
      setVariants((prev) => prev.filter((v) => v.size !== size));
    }
  };

  // Bulk Update
  const applyBulkPrice = () => {
    setVariants(prev => prev.map(v => ({ ...v, price: globalPrice })));
    toast.success("Applied price to all variants");
  };

  const applyBulkStock = () => {
    setVariants(prev => prev.map(v => ({ ...v, stock: globalStock })));
    toast.success("Applied stock to all variants");
  };

  // ---------- Update ----------
  const handleUpdate = async () => {
    if (!title) {
      toast.info("Title is required.");
      return;
    }
    if (!productId) {
      toast.info("Product ID missing — cannot update.");
      return;
    }

    // Validation
    const hasPrice = variants.some(v => Number(v.price) > 0);
    if (!hasPrice) {
      toast.error("At least one variant must have a valid price.");
      return;
    }

    // Check if we have sizes but no variants (shouldn't happen with sync logic, but safety)
    if (variants.length === 0) {
      toast.error("Product must have at least one size variant.");
      return;
    }

    // Validate Color Value if Color is present
    if (metafields.color && !metafields.colorValue) {
      toast.error("Please select a Color Value if Color Name is provided.");
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
        variants: variants.map((v) => ({
          id: v.id,
          priceAmount: Number(v.price),
          compareAmount: v.compare ? Number(v.compare) : null,
          inventoryQuantity: Number(v.stock) || 0,
          priceCurrency: "INR",
          selectedOptions: { size: v.size.toLowerCase() }, // Store as lowercase to match seeded products
        })),
        tags: tags
          ? tags.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
          : [],
        metafields,
        published,
        metaTitle,
        metaDescription,
      };

      // 🛠️ Construct options from variants (specifically for Size)
      const uniqueSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)));
      if (uniqueSizes.length > 0) {
        // @ts-expect-error options field is not in the type but is required by the API
        productData.options = [
          {
            name: "Size",
            values: uniqueSizes.map((s) => ({ name: s })),
          },
        ];
      }

      await productsAPI.update(productId, productData);
      toast.success("✅ Product updated successfully!");
      router.refresh(); // Force refresh to clear Next.js cache
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  if (loading) return <PageLoadingSkeleton />;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Button
          onClick={handleUpdate}
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-6">
          {/* Product Info */}
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
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="auto or custom slug"
                />
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
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants (Sizes)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <Input
                    value={v.size}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, size: e.target.value } : x
                        )
                      )
                    }
                    placeholder="Size"
                  />
                  <Input
                    type="number"
                    value={v.price}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, price: e.target.value } : x
                        )
                      )
                    }
                    placeholder="Price"
                  />
                  <Input
                    type="number"
                    value={v.compare}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, compare: e.target.value } : x
                        )
                      )
                    }
                    placeholder="Compare"
                  />
                  <Input
                    type="number"
                    value={v.stock}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, stock: e.target.value } : x
                        )
                      )
                    }
                    placeholder="Stock"
                  />
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setVariants((prev) => prev.filter((_, j) => j !== i))
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() =>
                  setVariants((p) => [
                    ...p,
                    { size: "", price: "", compare: "", stock: "" },
                  ])
                }
                className="w-full"
              >
                + Add Variant
              </Button>
            </CardContent>
          </Card>

          {/* Quick Size Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Sizes & Bulk Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Global Controls */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                <div>
                  <Label>Global Price</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={globalPrice}
                      onChange={(e) => setGlobalPrice(e.target.value)}
                      placeholder="Price"
                    />
                    <Button size="sm" variant="outline" onClick={applyBulkPrice}>Apply</Button>
                  </div>
                </div>
                <div>
                  <Label>Global Stock</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={globalStock}
                      onChange={(e) => setGlobalStock(e.target.value)}
                      placeholder="Stock"
                    />
                    <Button size="sm" variant="outline" onClick={applyBulkStock}>Apply</Button>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div>
                <Label className="mb-2 block">Standard Sizes</Label>
                <div className="flex flex-wrap gap-4">
                  {STANDARD_SIZES.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeToggle(size, checked as boolean)}
                      />
                      <label
                        htmlFor={`edit-size-${size}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {size}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
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
                  placeholder="SEO page title"
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="SEO meta description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Metafields */}
          <Card>
            <CardHeader>
              <CardTitle>Product Attributes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              {/* 🎨 Color & Color Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color Name</Label>
                  <Input
                    value={metafields.color}
                    onChange={(e) =>
                      setMetafields((prev) => ({ ...prev, color: e.target.value }))
                    }
                    placeholder="e.g. Red"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Value</Label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Input
                        value={metafields.colorValue}
                        onChange={(e) =>
                          setMetafields((prev) => ({ ...prev, colorValue: e.target.value }))
                        }
                        placeholder="#000000"
                      />
                      <div
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-gray-200"
                        style={{ backgroundColor: metafields.colorValue || 'transparent' }}
                      />
                    </div>
                    <input
                      type="color"
                      value={metafields.colorValue || "#000000"}
                      onChange={(e) =>
                        setMetafields((prev) => ({ ...prev, colorValue: e.target.value }))
                      }
                      className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fabric</Label>
                  <Input
                    value={metafields.fabric}
                    onChange={(e) =>
                      setMetafields((prev) => ({ ...prev, fabric: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>Target Gender</Label>
                  <select
                    value={metafields.targetGender}
                    onChange={(e) =>
                      setMetafields((prev) => ({
                        ...prev,
                        targetGender: e.target.value,
                      }))
                    }
                    className="border rounded-md p-2 w-full"
                  >
                    <option value="">Select</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Images */}
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
                    <Image src={img} fill sizes="80px" alt="product-image" className="object-cover w-full h-full" />
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

          {/* Tags + Publish */}
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
