'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function WeddingExpenseForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    budget: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setFormData({ amount: '', description: '', date: new Date().toISOString().split('T')[0], category: '', budget: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Add Wedding Expense</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        >
          <option value="">Select a category</option>
          <option value="venue">Venue</option>
          <option value="catering">Catering</option>
          <option value="decoration">Decoration</option>
          <option value="flowers">Flowers</option>
          <option value="photography">Photography</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Budget</label>
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <Button type="submit" variant="primary">
        Add Wedding Expense
      </Button>
    </form>
  );
}
