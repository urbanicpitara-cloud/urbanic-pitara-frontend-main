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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X, GripVertical, Upload } from "lucide-react";

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
  const [collectionId, setCollectionId] = useState("");
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

  const [metafields, setMetafields] = useState({
    color: "",
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
          productsAPI.getByHandle(handlename),
        ]);

        setCollections(allCollections);

        if (product) {
          setProductId(product.id);
          setTitle(product.title || "");
          setHandle(product.handle || "");
          setHtmlDescription(product.descriptionHtml || "");

          setVariants(
            product.variants?.map((v: any) => ({
              id: v.id,
              size: v.selectedOptions?.size || "",
              price: v.priceAmount?.toString() || "",
              compare: v.compareAmount?.toString() || "",
              stock: v.inventoryQuantity?.toString() || "0",
            })) || []
          );

          setMetafields({
            color: product.metafields?.color || "",
            fabric: product.metafields?.fabric || "",
            targetGender: product.metafields?.targetGender || "",
          });

          setTags(product.tags?.map((t: any) => t.name).join(", ") || "");
          setCollectionId(product.collectionId || "");
          setPublished(product.published ?? true);
          setImages(product.images?.map((img: any) => img.url) || []);
          setMetaTitle(product.metaTitle || "");
          setMetaDescription(product.metaDescription || "");
        }
      } catch (err) {
        console.error("Failed to load product", err);
        alert("Failed to load product details");
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
      alert("Image upload failed.");
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

  // ---------- Update ----------
  const handleUpdate = async () => {
    if (!title || !collectionId) {
      alert("Title and Collection are required.");
      return;
    }
    if (!productId) {
      alert("Product ID missing — cannot update.");
      return;
    }

    setSaving(true);
    try {
      const textDescription = extractText(htmlDescription);

      const productData = {
        title,
        handle,
        collectionId,
        descriptionHtml: htmlDescription,
        description: textDescription,
        images: images.map((url) => ({ url })),
        variants: variants.map((v) => ({
          id: v.id,
          priceAmount: Number(v.price),
          compareAmount: v.compare ? Number(v.compare) : null,
          inventoryQuantity: Number(v.stock) || 0,
          priceCurrency: "INR",
          selectedOptions: { size: v.size },
        })),
        tags: tags
          ? tags.split(",").map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
          : [],
        metafields,
        published,
        metaTitle,
        metaDescription,
      };

      await productsAPI.update(productId, productData);
      alert("✅ Product updated successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  if (loading)
    return <p className="p-10 text-center text-gray-500">Loading product...</p>;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Button
          onClick={handleUpdate}
          disabled={saving || uploading}
          className="bg-black text-white hover:bg-gray-800"
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
                <Label>Collection</Label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">Select collection</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
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
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color</Label>
                <Input
                  value={metafields.color}
                  onChange={(e) =>
                    setMetafields((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
              </div>
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
                    <img src={img} alt="" className="object-cover w-full h-full" />
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
