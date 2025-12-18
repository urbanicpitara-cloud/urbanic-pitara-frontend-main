"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface BulkEditProductsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (updates: Record<string, any>) => Promise<void> | void;
  count?: number;
}

export default function BulkEditProductsModal({
  open,
  onClose,
  onSave,
  count = 0,
}: BulkEditProductsModalProps) {
  const [updates, setUpdates] = useState<{
    title?: string;
    priceAmount?: string;
    compareAmount?: string;
    tags?: string[];
    published?: boolean;
    color?: string;
    colorValue?: string;
    stockValue?: string;
    stockOperation?: 'add' | 'subtract';
  }>({
    title: "",
    priceAmount: "",
    compareAmount: "",
    tags: [],
    published: undefined,
    color: "",
    colorValue: "#000000",
    stockValue: "",
    stockOperation: 'add',
  });

  // 🆕 local textarea text (so user typing isn't disrupted)
  const [tagText, setTagText] = useState("");

  const handleChange = (key: string, value: any) => {
    setUpdates((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    // 🛑 Validation: Cannot have Color Name without Color Value
    if (updates.color?.trim() && !updates.colorValue) {
      alert("Please select a Color Value for the Color Name.");
      return;
    }

    const cleanUpdates: Record<string, any> = {};

    if (updates.title?.trim()) cleanUpdates.title = updates.title.trim();
    if (updates.priceAmount)
      cleanUpdates.priceAmount = Number(updates.priceAmount);
    if (updates.compareAmount)
      cleanUpdates.compareAmount = Number(updates.compareAmount);

    // ✅ parse final tags from tagText when submitting
    const parsedTags = tagText
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter(Boolean);
    if (parsedTags.length > 0) cleanUpdates.tags = parsedTags;

    if (typeof updates.published === "boolean")
      cleanUpdates.published = updates.published;

    // ✅ Add color name
    if (updates.color?.trim()) {
      cleanUpdates.color = updates.color.trim();
    }

    // ✅ Add color value (hex) - Allow plain colorValue or paired with name
    if (updates.colorValue) {
      cleanUpdates.colorValue = updates.colorValue;
    }

    // ✅ Add stock adjustment
    if (updates.stockValue && Number(updates.stockValue) !== 0) {
      const value = Number(updates.stockValue);
      cleanUpdates.stockAdjustment = updates.stockOperation === 'subtract' ? -value : value;
    }

    await onSave(cleanUpdates);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            ✏️ Bulk Edit {count ? `(${count} selected)` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label>Title (optional)</Label>
            <Input
              value={updates.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Leave blank to skip"
            />
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Price Amount (₹)</Label>
              <Input
                type="number"
                value={updates.priceAmount}
                onChange={(e) => handleChange("priceAmount", e.target.value)}
                placeholder="e.g. 499"
              />
            </div>
            <div className="space-y-1">
              <Label>Compare At (₹)</Label>
              <Input
                type="number"
                value={updates.compareAmount}
                onChange={(e) => handleChange("compareAmount", e.target.value)}
                placeholder="e.g. 699"
              />
            </div>
          </div>

          {/* Color */}
          <div className="space-y-1">
            <Label>Color (optional)</Label>
            <div className="flex gap-2">
              <Input
                value={updates.color}
                onChange={(e) => handleChange("color", e.target.value)}
                placeholder="e.g. Red, Blue"
                className="flex-1"
              />
              <div className="flex items-center gap-2 border rounded-md px-2 bg-gray-50">
                <span className="text-xs text-gray-500">Value:</span>
                <input
                  type="color"
                  value={updates.colorValue}
                  onChange={(e) => handleChange("colorValue", e.target.value)}
                  className="h-8 w-8 cursor-pointer bg-transparent border-none"
                  title="Pick a color value"
                />
              </div>
            </div>
          </div>

          {/* Stock Adjustment */}
          <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
            <Label>Stock Adjustment (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={updates.stockValue}
                onChange={(e) => handleChange("stockValue", e.target.value)}
                placeholder="e.g. 20"
                className="flex-1"
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant={updates.stockOperation === 'add' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleChange("stockOperation", 'add')}
                  className="px-3"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant={updates.stockOperation === 'subtract' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleChange("stockOperation", 'subtract')}
                  className="px-3"
                >
                  Subtract
                </Button>
              </div>
            </div>
            {updates.stockValue && Number(updates.stockValue) > 0 && (
              <p className="text-xs text-gray-600">
                ℹ️ Will <strong>{updates.stockOperation === 'add' ? 'add' : 'subtract'} {updates.stockValue}</strong> {updates.stockOperation === 'add' ? 'to' : 'from'} stock of all variants in selected products
              </p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <Label>Tags (comma separated)</Label>
            <Textarea
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
              placeholder="example: trending, summer, best-seller"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between border-t pt-3">
            <Label>Published</Label>
            <Switch
              checked={updates.published ?? false}
              onCheckedChange={(checked) => handleChange("published", checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
