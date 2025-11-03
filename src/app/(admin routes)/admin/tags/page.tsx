"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tagsAPI } from "@/lib/api";
import { Tag } from "@/types/tags";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalTags, setTotalTags] = useState(0);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await tagsAPI.list();
      let allTags: Tag[] = res.data.tags || [];

      if (search) {
        const s = search.toLowerCase();
        allTags = allTags.filter(
          (t) => t.name.toLowerCase().includes(s) || t.handle.toLowerCase().includes(s)
        );
      }

      setTotalTags(allTags.length);
      const paginatedTags = allTags.slice((page - 1) * pageSize, page * pageSize);
      setTags(paginatedTags);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [page, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    setDeletingId(id);
    try {
      await tagsAPI.remove(id);
      setTags(tags.filter((t) => t.id !== id));
      setSelectedTags((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error(error);
      alert("Failed to delete tag");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectTag = (id: string) => {
    const newSet = new Set(selectedTags);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTags(newSet);
  };

  const handleSelectAll = () => {
    if (selectedTags.size === tags.length) setSelectedTags(new Set());
    else setSelectedTags(new Set(tags.map((t) => t.id)));
  };

  const handleBulkDelete = async () => {
    if (selectedTags.size === 0) return;
    if (!confirm(`Delete ${selectedTags.size} selected tags?`)) return;
    try {
      await tagsAPI.removeMany(Array.from(selectedTags));
      setTags(tags.filter((t) => !selectedTags.has(t.id)));
      setSelectedTags(new Set());
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected tags");
    }
  };

  const totalPages = Math.ceil(totalTags / pageSize);

  if (loading) return <div className="p-6">Loading tags...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tags</h1>
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Link
            href="/admin/tags/add"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Tag
          </Link>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
            onClick={handleBulkDelete}
            disabled={selectedTags.size === 0}
          >
            Delete Selected ({selectedTags.size})
          </button>
        </div>
      </div>

      {tags.length === 0 ? (
        <p className="text-gray-500">No tags found.</p>
      ) : (
        <table className="w-full border-collapse border rounded overflow-hidden shadow-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedTags.size === tags.length && tags.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Handle</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr
                key={tag.id}
                className="border-t hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedTags.has(tag.id)}
                    onChange={() => handleSelectTag(tag.id)}
                  />
                </td>
                <td className="p-3 font-medium">{tag.name}</td>
                <td className="p-3 text-gray-500">{tag.handle}</td>
                <td className="p-3 space-x-2">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
