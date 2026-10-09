'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Plus, Image as ImageIcon, CheckCircle2, ArrowLeft, Store } from 'lucide-react';

const CATEGORIES = [
  'Handicrafts & Decor',
  'Fashion & Apparel',
  'Jewellery & Silver',
  'Food & Sweets',
  'Home & Living',
  'Beauty & Wellness',
  'Electronics & Essentials',
];

export default function AddProductPage() {
  const router = useRouter();
  const { ownerShopId, addProduct, showToast, ownerNavTo } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [discountPct, setDiscountPct] = useState('10');
  const [unit, setUnit] = useState('piece');
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      showToast('Please provide a product name and price.');
      return;
    }

    setIsSubmitting(true);
    const newProd = {
      id: `prod_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      price: Number(price),
      discountPct: Number(discountPct) || 0,
      unit,
      inStock,
      isNew: true,
      image:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
    };

    try {
      const token = localStorage.getItem('auth_token');
      let product = newProd;
      if (token) {
        const response = await fetch('/api/owner/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newProd),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Unable to add product');
        product = payload.product;
      }
      addProduct(ownerShopId, product);
      showToast(`Added ${product.name} to catalog!`);
      ownerNavTo('products');
    } catch (error: any) {
      showToast(error?.message || 'Unable to add product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ownerNavTo('products')}
          className="p-2 bg-white border border-[#E5E5E5] rounded-lg text-[#666666] hover:text-[#171717] hover:bg-[#F5F4F0]"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
            Add New Product
          </h1>
          <p className="text-xs text-[#666666]">
            List an item for discovery and in-store pickup reservations.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-5 shadow-sm"
      >
        {/* Product Name */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            Product Title <span className="text-[#DC2626]">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Handmade Terracotta Vase"
            className="w-full px-3.5 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:text-[#8A8A8A]"
          />
        </div>

        {/* Category & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] rounded-lg text-xs outline-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Unit
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value="piece">piece</option>
              <option value="set">set</option>
              <option value="pair">pair</option>
              <option value="kg">kg</option>
              <option value="pack">pack</option>
            </select>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Selling Price (₹) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 1200"
              className="w-full px-3.5 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:text-[#8A8A8A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={discountPct}
              onChange={(e) => setDiscountPct(e.target.value)}
              placeholder="e.g. 20"
              className="w-full px-3.5 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:text-[#8A8A8A]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            Product Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the material, craft technique, dimensions or usage..."
            className="w-full px-3.5 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:text-[#8A8A8A]"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            Image URL
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 bg-[#F5F4F0] border border-[#E5E5E5] focus:border-[#A85420] focus:bg-white rounded-lg text-xs outline-none transition-all placeholder:text-[#8A8A8A]"
          />
          <p className="text-[11px] text-[#8A8A8A] mt-1">
            Leave blank to use an automatic high-resolution category stock image.
          </p>
        </div>

        {/* In-Stock Toggle */}
        <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#171717] block">In Stock & Ready for Pickup</span>
            <span className="text-[11px] text-[#666666]">Enable online 10% reservations for this item.</span>
          </div>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 rounded text-[#A85420] focus:ring-[#A85420] accent-[#A85420]"
          />
        </div>

        {/* Submit Buttons */}
        <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => ownerNavTo('products')}
            className="px-4 py-2.5 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#171717] font-semibold text-xs rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isSubmitting ? 'Adding...' : 'Save Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
