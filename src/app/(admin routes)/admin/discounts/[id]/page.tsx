'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { discountsAPI } from '@/lib/api';

export default function EditDiscountPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  // Ensure id is a string
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Invalid discount ID');
      setLoading(false);
      return;
    }

    const fetchDiscount = async () => {
      try {
        const res = await discountsAPI.getById(id);
        const discount = res.data;
        setForm({
          ...discount,
          minOrderAmount: discount.minOrderAmount || '',
          usageLimit: discount.usageLimit || '',
          startsAt: discount.startsAt ? discount.startsAt.split('T')[0] : '',
          endsAt: discount.endsAt ? discount.endsAt.split('T')[0] : '',
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch discount.');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id]);

  if (loading) return <p className="text-gray-500 mt-10 text-center">Loading...</p>;
  if (!form) return <p className="text-red-500 mt-10 text-center">{error || 'Discount not found.'}</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!id) return;
    if (!form.code || !form.value) {
      setError('Code and Value are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await discountsAPI.update(id, {
        ...form,
        value: parseFloat(form.value),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
      });
      router.push('/admin/discounts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update discount.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this discount?')) return;
    setDeleting(true);
    setError('');
    try {
      await discountsAPI.delete(id);
      router.push('/admin/discounts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete discount.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Edit Discount</h1>
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
            value={form.description || ''}
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
            <input type="number" name="value" value={form.value} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Minimum Order Amount</label>
          <input
            type="number"
            name="minOrderAmount"
            value={form.minOrderAmount || ''}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
            <input type="date" name="startsAt" value={form.startsAt} onChange={handleChange} className="input" />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">End Date</label>
            <input type="date" name="endsAt" value={form.endsAt} onChange={handleChange} className="input" />
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
            value={form.usageLimit || ''}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </form>
    </div>
  );
}
