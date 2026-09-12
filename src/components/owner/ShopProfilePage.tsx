'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import AutoFillModal from './AutoFillModal';
import {
  BadgeCheck,
  Sparkles,
  Camera,
  Upload,
  Save,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Globe,
  Plus,
  X,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

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
  'Generational Recipes',
  'Pure Desi Ghee',
  'Artisanal Handcraft',
  'Certified Heritage',
  'Festive Bundles',
  'No Preservatives',
  'Master Tailoring',
  'Heirloom Spices',
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

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
        method: 'PUT',
        body: JSON.stringify(form),
      });

      updateShopProfile(ownerShopId, form);
      showToast('Shop profile saved successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save shop profile');
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
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BadgeCheck className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
              HERITAGE IDENTITY
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
            Shop Profile & Story
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Customize how your store appears to explorers and cultural tourists across India.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAutoFill(true)}
          className="px-4 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#242424] border border-[#C9A96E]/30 text-xs font-bold text-[#C9A96E] flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" /> AI Heritage Assistant
        </button>
      </div>

      {/* Main Settings Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121212] border border-white/10 space-y-6 shadow-xl">
        {/* Cover Photo */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-2 font-bold">
            Cover Banner URL
          </label>
          <input
            type="text"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] transition-colors mb-2"
          />
          {form.coverImage && (
            <div className="h-40 rounded-2xl overflow-hidden bg-[#181818] border border-white/10">
              <img src={form.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold">
            Tagline / Motto
          </label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="e.g. Master Confectioners Since 1952"
            className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] transition-colors"
          />
        </div>

        {/* Story Description */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold">
            Generational Heritage Story
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detail your shop's founding history, ancestors, traditional processes, and legacy in the city..."
            className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Contact Info (Phone, Email, Website) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#C9A96E]" /> Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-[#C9A96E]" /> Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="owner@heritage.in"
              className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#C9A96E]" /> Website
            </label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
            />
          </div>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C9A96E]" /> Opening Time
            </label>
            <input
              type="time"
              value={form.openTime}
              onChange={(e) => setForm({ ...form, openTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs font-mono text-[#F5F5F5] outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-1.5 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#C9A96E]" /> Closing Time
            </label>
            <input
              type="time"
              value={form.closeTime}
              onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs font-mono text-[#F5F5F5] outline-none focus:border-[#C9A96E]"
            />
          </div>
        </div>

        {/* Specialties Tags */}
        <div>
          <label className="block text-[10px] font-mono uppercase text-[#71717A] mb-2 font-bold">
            Specialties & Heritage Highlights
          </label>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {form.specialties.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1 rounded-full text-xs font-bold bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 flex items-center gap-1.5"
              >
                <span>{spec}</span>
                <button
                  type="button"
                  onClick={() => removeSpecialty(spec)}
                  className="hover:text-white"
                >
                  ✕
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
              className="flex-1 px-4 py-2 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
            />
            <button
              type="button"
              onClick={() => addSpecialty(newSpecialty)}
              className="px-4 py-2 rounded-xl bg-[#202020] hover:bg-[#282828] border border-white/10 text-xs font-bold text-[#F5F5F5]"
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
                className="px-2.5 py-0.5 rounded-full text-[10px] bg-white/5 hover:bg-white/10 text-[#71717A] hover:text-[#A1A1AA] border border-white/5 transition-colors"
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10">
          <PremiumButton
            variant="gold"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            icon={Save}
            className="w-full"
            magnetic
          >
            {saving ? 'Saving Profile...' : 'Save Changes'}
          </PremiumButton>
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
            showToast('AI suggestions applied!');
          }}
        />
      )}
    </div>
  );
}
