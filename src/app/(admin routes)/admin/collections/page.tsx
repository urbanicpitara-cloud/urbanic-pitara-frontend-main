"use client";

import { useState, useEffect, useMemo } from "react";
import { collectionsAPI } from "@/lib/api";
import { Collection } from "@/types/collections";
import Link from "next/link";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all collections once
  useEffect(() => {
    async function fetchCollections() {
      setLoading(true);
      try {
        const res = await collectionsAPI.getAll();
        setCollections(res.data || []); // your data seems to be array directly
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCollections();
  }, []);

  // Filter collections based on search
  const filteredCollections = useMemo(
    () =>
      collections.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      ),
    [collections, search]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(start, start + itemsPerPage);
  }, [filteredCollections, currentPage]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Collections</h1>
        <Link
          href="/admin/collections/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold transition"
        >
          + Add Collection
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search collections..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to first page when searching
          }}
          className="border border-gray-300 rounded-md px-3 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <p className="text-gray-500">Loading collections...</p>
      ) : paginatedCollections.length === 0 ? (
        <p className="text-gray-500">No collections found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedCollections.map((c) => (
            <div
              key={c.id}
              className="border border-gray-200 rounded-md shadow-sm hover:shadow-lg transition p-4 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{c.title}</h2>
                <p className="text-gray-600 text-sm mb-2">
                  {c.productCount} product{c.productCount !== 1 ? "s" : ""}
                </p>
                {c.description && <p className="text-gray-500 text-sm">{c.description}</p>}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/collections/${c.handle}`}
                  className="text-green-600 hover:underline text-sm font-medium"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
