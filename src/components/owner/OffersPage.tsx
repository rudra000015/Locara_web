'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BadgePercent, Plus, Tag, Clock3, X } from 'lucide-react';
import { useStore } from '@/store/useStore';

type OfferItem = {
  id: string;
  title: string;
  description?: string;
  discountType: string;
  discountValue: number;
  endDate: string;
  flashSale?: boolean;
  status: string;
};

export default function OffersPage() {
  const { showToast } = useStore();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [endDate, setEndDate] = useState('');
  const [flashSale, setFlashSale] = useState(false);
  const [error, setError] = useState('');

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/offers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: 'no-store',
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not load offers');
      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load offers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadOffers(); }, [loadOffers]);

  const createOffer = async () => {
    if (!title.trim() || !discountValue || Number(discountValue) <= 0) {
      setError('Add an offer title and a positive discount amount.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token') || '';
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), discountType, discountValue: Number(discountValue), endDate: endDate || undefined, flashSale }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || 'Could not create offer');
      setOffers((current) => [data.offer, ...current]);
      setTitle(''); setDescription(''); setDiscountValue(''); setEndDate(''); setFlashSale(false); setShowForm(false);
      showToast('Offer published to marketplace');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 pb-12">
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#A85420]">
            <BadgePercent className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">OFFERS & PROMOTIONS</span>
          </div>
          <h2 className="text-2xl font-bold text-[#171717]">Shop Offers & Discounts ({offers.length})</h2>
          <p className="text-xs text-[#666666] mt-0.5">Publish offers to attract local customers browsing nearby shops.</p>
        </div>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="px-4 py-2.5 bg-[#A85420] hover:bg-[#873F17] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Close' : 'Create New Offer'}</span>
        </button>
      </div>

      {showForm && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-4 shadow-sm animate-fade-in">
          <h3 className="font-bold text-sm text-[#171717]">New Discount Offer</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1">Offer Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Festive 20% Discount on Brass Items"
                className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] focus:bg-white focus:border-[#A85420] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(event) => setDiscountType(event.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] focus:bg-white focus:border-[#A85420] outline-none"
              >
                <option value="PERCENTAGE">Percentage off (%)</option>
                <option value="FIXED_AMOUNT">Flat amount off (₹)</option>
                <option value="FLASH_SALE">Flash sale</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1">Discount Value</label>
              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                placeholder={discountType === 'FIXED_AMOUNT' ? '500' : '20'}
                className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] focus:bg-white focus:border-[#A85420] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#171717] block mb-1">Valid Until</label>
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] focus:bg-white focus:border-[#A85420] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Offer Details</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe terms and applicable products..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] focus:bg-white focus:border-[#A85420] outline-none resize-none"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#171717]">
            <input type="checkbox" checked={flashSale} onChange={(event) => setFlashSale(event.target.checked)} className="accent-[#A85420]" />
            Feature as a Flash Sale
          </label>
          {error && <p className="text-xs text-[#DC2626]">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-bold text-[#666666] bg-[#F5F4F0] hover:bg-[#E5E5E5] rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => void createOffer()}
              disabled={saving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#A85420] hover:bg-[#873F17] rounded-lg shadow-sm"
            >
              {saving ? 'Publishing...' : 'Publish Offer'}
            </button>
          </div>
        </div>
      )}

      {error && !showForm && <p className="text-xs text-[#DC2626]">{error}</p>}
      {loading ? (
        <div className="p-8 text-center text-xs text-[#666666] bg-white border border-[#E5E5E5] rounded-xl">
          Loading active offers...
        </div>
      ) : offers.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-[#E5E5E5] text-center">
          <Tag className="w-8 h-8 mx-auto text-[#A85420] mb-2" />
          <h4 className="font-bold text-base text-[#171717]">No active offers yet</h4>
          <p className="text-xs text-[#666666] mt-1">Create your first special promotion to boost store footfall.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <article key={offer.id} className="p-5 rounded-xl bg-white border border-[#E5E5E5] space-y-2 shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-bold text-sm text-[#171717]">{offer.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#16803C]/10 text-[#16803C]">
                  {offer.discountType === 'FIXED_AMOUNT' ? `₹${offer.discountValue} OFF` : `${offer.discountValue}% OFF`}
                </span>
              </div>
              <p className="text-xs text-[#666666]">{offer.description || 'Special store discount.'}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-[#A85420] font-semibold pt-2 border-t border-[#E5E5E5]">
                <Clock3 className="w-3.5 h-3.5" />
                Valid through {offer.endDate ? new Date(offer.endDate).toLocaleDateString('en-IN') : 'Ongoing'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
