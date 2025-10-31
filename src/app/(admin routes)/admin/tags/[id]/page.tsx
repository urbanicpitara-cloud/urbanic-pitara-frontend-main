"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tagsAPI } from "@/lib/api";
import { Tag } from "@/types/tags";
import { toast } from "sonner";

interface Props {
    initialTag?: Tag; // optional, if editing an existing tag
}

export default function TagEditPage({ initialTag }: Props) {
    const router = useRouter();
    const pathname = usePathname();

    const [tagName, setTagName] = useState(initialTag?.name || "");
    const [handle, setHandle] = useState(initialTag?.handle || "");
    const [description, setDescription] = useState(initialTag?.description || "");
    const [isHandleEdited, setIsHandleEdited] = useState(false);

    const [saving, setSaving] = useState(false);
    const [loadingTag, setLoadingTag] = useState(!initialTag);

    const tagIdFromUrl = pathname.split("/").pop(); // assumes /tags/edit/[id]

    // Fetch tag if no initialTag
    useEffect(() => {
        async function fetchTag() {
            if (!initialTag && tagIdFromUrl) {
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
    }, [initialTag, tagIdFromUrl]);

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
            let tagId = initialTag?.id || tagIdFromUrl;

            if (!tagId) {
                const res = await tagsAPI.create({ name: tagName, handle, description });
                tagId = res.data.id;
            } else {
                await tagsAPI.update(tagId, { name: tagName, handle, description });
            }

            toast.success("Tag saved!");
            // router.push("/tags");
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
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold">{tagIdFromUrl || initialTag ? "Edit Tag" : "Add New Tag"}</h1>

            <div className="space-y-4">
                <input
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Tag Name"
                    className="border p-3 rounded w-full focus:ring focus:ring-green-200"
                />
                <input
                    value={handle}
                    onChange={handleHandleChange}
                    placeholder="Handle (auto-generated)"
                    className="border p-3 rounded w-full focus:ring focus:ring-green-200"
                />
                <textarea
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="border p-3 rounded w-full focus:ring focus:ring-green-200"
                />

            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {saving ? "Saving..." : "Save Tag"}
            </button>
        </div>
    );
}
