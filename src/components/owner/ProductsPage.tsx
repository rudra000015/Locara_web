'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Pencil, Plus, Trash2, CheckCircle2, XCircle, ShoppingBag, Search } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Product } from '@/types/shop';

export default function ProductsPage() {
  const { ownerShopId, shopProducts, setShopProducts, ownerNavTo, showToast } = useStore();
  const products = shopProducts[ownerShopId] ?? [];

  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const saveRemoteProductChange = async (productId: string, method: 'PATCH' | 'DELETE', body?: unknown) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    const response = await fetch(`/api/owner/products/${encodeURIComponent(productId)}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Unable to save product changes');
    return payload;
  };

  const toggleAvailability = async (prodId: string) => {
    const current = products.find((product) => product.id === prodId);
    if (!current) return;
    const inStock = !current.inStock;
    try {
      const payload = await saveRemoteProductChange(prodId, 'PATCH', { inStock });
      const updated = payload?.products ?? products.map((p) => p.id === prodId ? { ...p, inStock } : p);
      setShopProducts(ownerShopId, updated);
      showToast('Product stock status updated');
    } catch (error: any) {
      showToast(error?.message || 'Unable to update product');
    }
  };

  const deleteProduct = async (prodId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const payload = await saveRemoteProductChange(prodId, 'DELETE');
      const updated = payload?.products ?? products.filter((p) => p.id !== prodId);
      setShopProducts(ownerShopId, updated);
      showToast('Product removed');
    } catch (error: any) {
      showToast(error?.message || 'Unable to remove product');
    }
  };

  const saveProduct = async () => {
    if (!editing) return;
    try {
      const payload = await saveRemoteProductChange(editing.id, 'PATCH', editing);
      const updated = payload?.products ?? products.map((p) => p.id === editing.id ? editing : p);
      setShopProducts(ownerShopId, updated);
      setEditing(null);
      showToast('Product updated successfully');
    } catch (error: any) {
      showToast(error?.message || 'Unable to update product');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#171717]">
            Product Catalog ({products.length})
          </h1>
          <p className="text-xs text-[#666666] mt-0.5">
            Manage your store&apos;s in-stock items and in-store drop reservations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => ownerNavTo('addproduct')}
          className="px-4 py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-3 shadow-sm flex items-center gap-2 max-w-md">
        <Search className="w-4 h-4 text-[#8A8A8A]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your products..."
          className="w-full text-xs text-[#171717] outline-none bg-transparent placeholder:text-[#8A8A8A]"
        />
      </div>

      {/* Products Table (Desktop) */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-sm">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E5E5E5] text-[#666666] font-semibold">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-[#171717]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAFAF8] transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#F5F4F0] overflow-hidden border border-[#E5E5E5] shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-[#171717] block">{p.name}</span>
                      <span className="text-[11px] text-[#8A8A8A]">{p.unit || 'piece'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-[#666666] capitalize">
                    {p.category || 'Handicrafts'}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-sm text-[#171717]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(p.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 w-fit ${
                        p.inStock
                          ? 'bg-[#EBF8F0] text-[#16803C] border border-[#A7F3D0]'
                          : 'bg-[#FEF3F2] text-[#DC2626] border border-[#FECACA]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-[#16803C]' : 'bg-[#DC2626]'}`} />
                      <span>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ ...p })}
                      className="p-1.5 text-[#666666] hover:text-[#A85420] rounded hover:bg-[#F5F4F0]"
                      title="Edit Product"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(p.id, p.name)}
                      className="p-1.5 text-[#8A8A8A] hover:text-[#DC2626] rounded hover:bg-[#F5F4F0]"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Product Cards */}
        <div className="md:hidden divide-y divide-[#E5E5E5] p-3 space-y-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="p-3 bg-[#FAFAF8] rounded-lg space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg bg-white overflow-hidden border border-[#E5E5E5] shrink-0">
                  <img src={p.image || ''} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#171717] truncate">{p.name}</h4>
                  <p className="text-xs font-bold text-[#171717]">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => toggleAvailability(p.id)}
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    p.inStock ? 'bg-[#EBF8F0] text-[#16803C]' : 'bg-[#FEF3F2] text-[#DC2626]'
                  }`}
                >
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ ...p })}
                    className="p-1.5 text-[#666666]"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(p.id, p.name)}
                    className="p-1.5 text-[#DC2626]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-[#171717]">Edit Product</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666666] font-semibold mb-1">Product Name</label>
                <input
                  type="text"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#666666] font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#666666] font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    value={editing.unit || 'piece'}
                    onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666666] font-semibold mb-1">Image URL</label>
                <input
                  type="text"
                  value={editing.image || ''}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F5F4F0] border border-[#E5E5E5] rounded-lg text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-[#F5F4F0] text-[#171717] text-xs font-semibold rounded-lg hover:bg-[#EAE8E2]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveProduct}
                className="px-4 py-2 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
