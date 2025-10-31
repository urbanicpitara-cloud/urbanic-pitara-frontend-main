"use client";

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
  }>({
    title: "",
    priceAmount: "",
    compareAmount: "",
    tags: [],
    published: undefined,
  });

  // 🆕 local textarea text (so user typing isn't disrupted)
  const [tagText, setTagText] = useState("");

  const handleChange = (key: string, value: any) => {
    setUpdates((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
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
