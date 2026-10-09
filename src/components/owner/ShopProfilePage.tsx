'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import AutoFillModal from './AutoFillModal';
import {
  BadgeCheck,
  Sparkles,
  Save,
  Clock,
  Phone,
  Mail,
  Globe,
  Plus,
  X,
} from 'lucide-react';

async function ownerFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Session expired. Please login again.');

  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

const SPECIALTY_SUGGESTIONS = [
  'Handmade Crafts',
  'Pure Desi Ghee',
  'Custom Tailoring',
  'Certified Heritage',
  'Festive Gifts',
  'Authentic Brassware',
  'Natural Fabrics',
  'Organic Sweets',
];

export default function ShopProfilePage() {
  const {
    ownerShopId,
    ownerShopName,
    shopProfiles,
    updateShopProfile,
    showToast,
  } = useStore();
  const profile = shopProfiles[ownerShopId];

  const [newSpecialty, setNewSpecialty] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);

  const [form, setForm] = useState({
    tagline: profile?.tagline ?? '',
    description: profile?.description ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
    website: profile?.website ?? '',
    openTime: profile?.openTime ?? '09:00',
    closeTime: profile?.closeTime ?? '21:30',
    isOpen: profile?.isOpen ?? true,
    specialties: profile?.specialties ?? [],
    coverImage: profile?.coverImage ?? '',
    profileImage: profile?.profileImage ?? '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        tagline: profile.tagline ?? '',
        description: profile.description ?? '',
        phone: profile.phone ?? '',
        email: profile.email ?? '',
        website: profile.website ?? '',
        openTime: profile.openTime ?? '09:00',
        closeTime: profile.closeTime ?? '21:30',
        isOpen: profile.isOpen ?? true,
        specialties: profile.specialties ?? [],
        coverImage: profile.coverImage ?? '',
        profileImage: profile.profileImage ?? '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await ownerFetch('/api/owner/shop', {
        method: 'PATCH',
        body: JSON.stringify(form),
      });

      updateShopProfile(ownerShopId, form);
      showToast('Shop profile saved successfully!');
    } catch (err: any) {
      updateShopProfile(ownerShopId, form);
      showToast('Shop profile updated locally');
    } finally {
      setSaving(false);
    }
  };

  const addSpecialty = (item: string) => {
    if (!item.trim() || form.specialties.includes(item.trim())) return;
    setForm((f) => ({ ...f, specialties: [...f.specialties, item.trim()] }));
    setNewSpecialty('');
  };

  const removeSpecialty = (item: string) => {
    setForm((f) => ({ ...f, specialties: f.specialties.filter((s) => s !== item) }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#A85420]">
            <BadgeCheck className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              STORE PROFILE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#171717]">
            Shop Information & Details
          </h2>
          <p className="text-xs text-[#666666] mt-0.5">
            Configure how your shop profile appears to local buyers on Locara.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAutoFill(true)}
          className="px-4 py-2.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-bold text-[#A85420] flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" /> AI Auto-Fill Helper
        </button>
      </div>

      {/* Main Settings Form */}
      <div className="p-6 rounded-2xl bg-white border border-[#E5E5E5] space-y-5 shadow-sm">
        {/* Cover Photo */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            Shop Cover Image URL
          </label>
          <input
            type="text"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420] transition-colors mb-2"
          />
          {form.coverImage && (
            <div className="h-36 rounded-xl overflow-hidden bg-[#FAFAF8] border border-[#E5E5E5]">
              <img src={form.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            Shop Tagline / Slogan
          </label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="e.g. Master Artisans Since 1952"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420] transition-colors"
          />
        </div>

        {/* Story Description */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-1.5">
            About the Shop
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your shop history, specialties, artisan background, and location landmarks..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#A85420]" /> Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-[#A85420]" /> Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="shop@example.com"
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#A85420]" /> Website
            </label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420]"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A85420]" /> Opening Time
            </label>
            <input
              type="time"
              value={form.openTime}
              onChange={(e) => setForm({ ...form, openTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] outline-none focus:border-[#A85420]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#A85420]" /> Closing Time
            </label>
            <input
              type="time"
              value={form.closeTime}
              onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] outline-none focus:border-[#A85420]"
            />
          </div>
        </div>

        {/* Specialties Tags */}
        <div>
          <label className="block text-xs font-bold text-[#171717] mb-2">
            Store Specialties & Badges
          </label>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.specialties.map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#A85420]/10 text-[#A85420] border border-[#A85420]/20 flex items-center gap-1.5"
              >
                <span>{spec}</span>
                <button
                  type="button"
                  onClick={() => removeSpecialty(spec)}
                  className="hover:text-[#DC2626]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSpecialty}
              onChange={(e) => setNewSpecialty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSpecialty(newSpecialty);
                }
              }}
              placeholder="Add specialty tag..."
              className="flex-1 px-3.5 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs text-[#171717] placeholder-[#8A8A8A] outline-none focus:border-[#A85420]"
            />
            <button
              type="button"
              onClick={() => addSpecialty(newSpecialty)}
              className="px-4 py-2 rounded-lg bg-[#F5F4F0] hover:bg-[#E5E5E5] text-xs font-bold text-[#171717] transition-colors"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {SPECIALTY_SUGGESTIONS.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => addSpecialty(sug)}
                className="px-2.5 py-0.5 rounded-md text-[11px] bg-[#FAFAF8] hover:bg-[#F5F4F0] text-[#666666] hover:text-[#171717] border border-[#E5E5E5] transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-[#A85420] hover:bg-[#873F17] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

      {/* AutoFill Modal */}
      {showAutoFill && (
        <AutoFillModal
          shopName={ownerShopName}
          onClose={() => setShowAutoFill(false)}
          onApply={(data) => {
            setForm((f) => ({
              ...f,
              tagline: data.tagline || f.tagline,
              description: data.story || f.description,
              specialties: Array.from(new Set([...f.specialties, ...(data.specialties || [])])),
            }));
            setShowAutoFill(false);
            showToast('Auto-fill suggestions applied!');
          }}
        />
      )}
    </div>
  );
}
