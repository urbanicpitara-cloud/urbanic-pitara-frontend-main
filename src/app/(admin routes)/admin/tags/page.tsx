"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tagsAPI } from "@/lib/api";
import { Tag } from "@/types/tags";
import { toast } from "sonner";
import { PageLoadingSkeleton } from "@/components/ui/loading-states";

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
      toast.error("Failed to fetch tags");
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
      toast.error("Failed to delete tag");
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
      toast.error("Failed to delete selected tags");
    }
  };

  const totalPages = Math.ceil(totalTags / pageSize);

  if (loading) return <PageLoadingSkeleton />;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header & Toolbar */}
      <div className="flex-none flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Tags</h1>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-100 pl-2">
            {selectedTags.size > 0 && (
              <button
                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                onClick={handleBulkDelete}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedTags.size})
              </button>
            )}

            <Link
              href="/admin/tags/add"
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tag
            </Link>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col">
        {tags.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="font-medium text-gray-900">No tags found</p>
            <p className="text-sm mt-1">Get started by creating a new tag</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm border-b border-gray-200">
                <tr>
                  <th className="p-4 w-12">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-black focus:ring-black/5"
                      checked={selectedTags.size === tags.length && tags.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-semibold text-gray-600">Name</th>
                  <th className="p-4 font-semibold text-gray-600">Handle</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tags.map((tag) => (
                  <tr
                    key={tag.id}
                    className={`group transition-colors duration-150 hover:bg-gray-50 ${selectedTags.has(tag.id) ? 'bg-gray-50' : ''}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-black focus:ring-black/5"
                        checked={selectedTags.has(tag.id)}
                        onChange={() => handleSelectTag(tag.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                          #
                        </span>
                        {tag.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <code className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-mono">
                        {tag.handle}
                      </code>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/admin/tags/${tag.id}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        disabled={deletingId === tag.id}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-transparent text-xs font-medium text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"
                      >
                        {deletingId === tag.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="flex-none p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm">
            <span className="text-gray-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
