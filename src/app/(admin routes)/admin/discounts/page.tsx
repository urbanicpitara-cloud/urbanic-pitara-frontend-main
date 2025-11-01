'use client';

import { useEffect, useState } from 'react';
import { discountsAPI } from '@/lib/api';
import Link from 'next/link';

interface Discount {
  id: string;
  code: string;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED';
  value: string;
  minOrderAmount?: string;
  active: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  usageLimit?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await discountsAPI.getAll();
        setDiscounts(res.data);
      } catch (err) {
        console.error('Failed to fetch discounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDiscounts();
  }, []);

  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch = d.code.toLowerCase().includes(search.toLowerCase());
    const matchesActive =
      filterActive === 'ALL'
        ? true
        : filterActive === 'ACTIVE'
        ? d.active
        : !d.active;

    const matchesStartDate = startDate ? new Date(d.startsAt || '') >= new Date(startDate) : true;
    const matchesEndDate = endDate ? new Date(d.endsAt || '') <= new Date(endDate) : true;

    return matchesSearch && matchesActive && matchesStartDate && matchesEndDate;
  });

  if (loading)
    return <p className="text-gray-500 text-center mt-10">Loading discounts...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Discounts</h1>
        <Link
          href="/admin/discounts/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Add Discount
        </Link>
      </div>

      {/* --- Filters --- */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Search Code</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code..."
            className="border rounded-md px-3 py-1 w-full sm:w-60"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Status</label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            className="border rounded-md px-3 py-1 w-full sm:w-40"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-1 w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-gray-700 text-sm mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-3 py-1 w-full sm:w-40"
          />
        </div>
      </div>

      {/* --- Discounts Table --- */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full border-collapse divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Code</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Type</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Value</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Min Order</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Active</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Start Date</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">End Date</th>
              <th className="px-4 py-2 text-left text-gray-600 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDiscounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No discounts found.
                </td>
              </tr>
            ) : (
              filteredDiscounts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2 font-medium">{d.code}</td>
                  <td className="px-4 py-2">{d.type}</td>
                  <td className="px-4 py-2">{d.value}{d.type === 'PERCENTAGE' ? '%' : '₹'}</td>
                  <td className="px-4 py-2">{d.minOrderAmount ? `₹${d.minOrderAmount}` : '—'}</td>
                  <td className="px-4 py-2">{d.active ? '✅' : '❌'}</td>
                  <td className="px-4 py-2">{d.startsAt ? new Date(d.startsAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2">{d.endsAt ? new Date(d.endsAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/discounts/${d.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
