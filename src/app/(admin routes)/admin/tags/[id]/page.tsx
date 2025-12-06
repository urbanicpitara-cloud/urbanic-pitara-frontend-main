"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tagsAPI } from "@/lib/api";
// import { Tag } from "@/types/tags";
import { toast } from "sonner";

export default function TagEditPage() {
    const router = useRouter();
    const pathname = usePathname();

    const [tagName, setTagName] = useState("");
    const [handle, setHandle] = useState("");
    const [description, setDescription] = useState("");
    const [isHandleEdited, setIsHandleEdited] = useState(false);

    const [saving, setSaving] = useState(false);
    const [loadingTag, setLoadingTag] = useState(true);

    const tagIdFromUrl = pathname.split("/").pop(); // assumes /tags/edit/[id]

    // Fetch tag data
    useEffect(() => {
        async function fetchTag() {
            if (tagIdFromUrl) {
                try {
                    setLoadingTag(true);
                    const res = await tagsAPI.get(tagIdFromUrl);
                    const tag = res.data;
                    setTagName(tag.name);
                    setHandle(tag.handle);
                    setDescription(tag.description);
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to load tag info");
                } finally {
                    setLoadingTag(false);
                }
            }
        }
        fetchTag();
    }, [tagIdFromUrl]);

    // Auto-generate handle if not manually edited
    useEffect(() => {
        if (!isHandleEdited) {
            const generated = tagName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "");
            setHandle(generated);
        }
    }, [tagName, isHandleEdited]);

    const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHandle(e.target.value);
        setIsHandleEdited(true);
    };

    const handleSave = async () => {
        if (!tagName.trim()) return toast.error("Tag name is required");

        try {
            setSaving(true);
            if (tagIdFromUrl) {
                await tagsAPI.update(tagIdFromUrl, { name: tagName, handle, description });
            } else {
                await tagsAPI.create({ name: tagName, handle, description });
            }

            toast.success("Tag saved!");
            router.push("/admin/tags");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save tag");
        } finally {
            setSaving(false);
        }
    };

    if (loadingTag) {
        return <div className="p-6 text-center text-gray-500">Loading tag info...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 h-full flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">{tagIdFromUrl ? "Edit Tag" : "Add New Tag"}</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage tag details and visibility</p>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tag Name</label>
                        <input
                            value={tagName}
                            onChange={(e) => setTagName(e.target.value)}
                            placeholder="e.g. New Arrivals"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Handle <span className="text-gray-400 font-normal">(Auto-generated)</span>
                        </label>
                        <input
                            value={handle}
                            onChange={handleHandleChange}
                            placeholder="new-arrivals"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm font-mono text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description || ""}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description..."
                            rows={4}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 font-medium text-sm transition-all shadow-sm"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}
