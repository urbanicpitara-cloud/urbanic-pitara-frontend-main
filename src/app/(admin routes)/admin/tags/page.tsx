"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tagsAPI } from "@/lib/api";
import { Tag } from "@/types/tags";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagsAPI.list();
      setTags(res.data.tags);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    setDeletingId(id);
    try {
      await tagsAPI.remove(id);
      setTags(tags.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading tags...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tags</h1>
        <Link
          href="/admin/tags/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Tag
        </Link>
      </div>

      {tags.length === 0 ? (
        <p className="text-gray-500">No tags found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Handle</th>
              {/* <th className="p-2 text-left">Description</th> */}
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr key={tag.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{tag.name}</td>
                <td className="p-2 text-gray-500">{tag.handle}</td>
                {/* <td className="p-2">{tag.description || "—"}</td> */}
                <td className="p-2 space-x-2">
                  <Link
                    href={`/admin/tags/${tag.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    disabled={deletingId === tag.id}
                    className="text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === tag.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
