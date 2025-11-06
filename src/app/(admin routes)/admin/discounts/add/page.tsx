'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { discountsAPI } from '@/lib/api';

export default function AddDiscountPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'PERCENTAGE',
    value: '',
    minOrderAmount: '',
    startsAt: '',
    endsAt: '',
    active: true,
    usageLimit: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.code || !form.value) {
      setError('Code and Value are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await discountsAPI.create({
        ...form,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      });
      router.push('/admin/discounts');
    } catch (err) {
      console.error(err);
      setError('Failed to create discount.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Add New Discount</h1>
      {error && <p className="text-red-500">{error}</p>}

      <form className="space-y-3 bg-white p-4 rounded-lg shadow" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Code *</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className="input">
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Value *</label>
            <input
              type="number"
              name="value"
              value={form.value}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Minimum Order Amount</label>
          <input
            type="number"
            name="minOrderAmount"
            value={form.minOrderAmount}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startsAt"
              value={form.startsAt}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endsAt"
              value={form.endsAt}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Usage Limit</label>
          <input
            type="number"
            name="usageLimit"
            value={form.usageLimit}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Create Discount'}
          </button>
        </div>
      </form>
    </div>
  );
}
