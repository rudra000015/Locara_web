'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { Layers, Plus, Trash2, Calendar, Sparkles, FolderPlus, Image as ImageIcon, Tag, Check, X } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

const COLLECTION_TAGS = [
  'Festive Collection',
  'Wedding Collection',
  'Under ₹999',
  'Artisanal Keepsakes',
  'Masterworks',
  'Limited Edition',
  'Diwali Hampers',
];

export default function CollectionsPage() {
  const { ownerShopId, ownerShopName, shopProducts, showToast } = useStore();
  const products = shopProducts[ownerShopId] ?? [];

  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tag, setTag] = useState('Festive Collection');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/collections?shopId=${ownerShopId || ''}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (err) {
      console.error('Failed to load collections', err);
    } finally {
      setLoading(false);
    }
  }, [ownerShopId]);

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  const toggleProduct = (prodId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleCreateCollection = async () => {
    if (!title.trim()) {
      showToast('Please provide a collection title');
      return;
    }
    if (!coverImage.trim()) {
      showToast('Please provide a cover image URL');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      const selectedProds = products
        .filter((p) => selectedProductIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category || 'Specialty',
        }));

      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopId: ownerShopId,
          shopName: ownerShopName,
          title: title.trim(),
          description: description.trim(),
          coverImage: coverImage.trim(),
          tag,
          products: selectedProds,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Failed to create collection');
      }

      const data = await res.json();
      setCollections((prev) => [data.collection, ...prev]);
      showToast('Curated collection published to explorer lookbooks!');
      setShowForm(false);
      setTitle('');
      setDescription('');
      setCoverImage('');
      setSelectedProductIds([]);
    } catch (err: any) {
      showToast(err?.message || 'Error creating collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Layers className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              CURATED LOOKBOOKS & BUNDLES
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
            Editorial Collections ({collections.length})
          </h2>
          <p className="text-xs text-[#9E8B75] mt-1 max-w-xl">
            Bundle festive sweets, wedding attire, and gifts into featured editorial stories that appear directly on the explorer home feed.
          </p>
        </div>

        <PremiumButton
          variant="gold"
          size="md"
          onClick={() => setShowForm((v) => !v)}
          icon={Plus}
          magnetic
        >
          {showForm ? 'Close Form' : 'New Collection'}
        </PremiumButton>
      </div>

      {/* Creation Modal / Form */}
      {showForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#C8893F]/40 shadow-2xl space-y-6 animate-scale-in">
          <div className="flex items-center justify-between border-b border-[#F6EAD7]/10 pb-3">
            <h4 className="font-serif font-bold text-lg text-[#F6EAD7] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C8893F]" /> Create Editorial Lookbook
            </h4>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 text-[#9E8B75] hover:text-[#F6EAD7] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Collection Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Wedding Couture Edit 2026"
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F]"
              />
            </div>

            {/* Tag Selection */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Collection Theme Tag
              </label>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] outline-none focus:border-[#C8893F]"
              >
                {COLLECTION_TAGS.map((t) => (
                  <option key={t} value={t} className="bg-[#17120E] text-[#F6EAD7]">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
              Cover Image URL (Editorial Banner)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F]"
              />
              <button
                type="button"
                onClick={() =>
                  setCoverImage(
                    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
                  )
                }
                className="px-3.5 py-2.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-[11px] font-bold text-[#E0AF62]"
              >
                Sample Image
              </button>
            </div>
            {coverImage && (
              <div className="mt-2 h-32 rounded-xl overflow-hidden border border-[#F6EAD7]/10">
                <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
              Story / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the craftsmanship, heritage fabrics, or festival celebration for this edit..."
              className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F] resize-none"
            />
          </div>

          {/* Link Products from Catalog */}
          {products.length > 0 && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-2 font-bold">
                Link Products from Store Catalog ({selectedProductIds.length} Selected)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#211A14] border-[#C8893F]'
                          : 'bg-[#17120E] border-[#F6EAD7]/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=200'}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-[#F6EAD7] truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-[#E0AF62]">₹{p.price}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-[#C8893F] text-[#0E0B08]' : 'border border-[#F6EAD7]/20'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#F6EAD7]/10">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-3 rounded-xl border border-[#F6EAD7]/10 text-xs font-bold text-[#9E8B75] hover:bg-[#211A14]"
            >
              Cancel
            </button>
            <PremiumButton
              variant="gold"
              size="md"
              onClick={handleCreateCollection}
              disabled={saving}
              className="flex-1"
              magnetic
            >
              {saving ? 'Publishing Lookbook...' : 'Publish Collection to Feed'}
            </PremiumButton>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#F6EAD7]/10 bg-[#17120E] p-16 text-center shadow-sm">
          <Layers className="w-10 h-10 mx-auto text-[#736350] mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#F6EAD7] mb-1">
            No Editorial Collections Yet
          </h3>
          <p className="text-xs text-[#9E8B75] mb-6 max-w-sm mx-auto">
            Group your products by wedding season, festival occasions, or heritage gift boxes to attract physical shoppers.
          </p>
          <PremiumButton
            variant="gold"
            size="md"
            onClick={() => setShowForm(true)}
            icon={Plus}
            magnetic
          >
            Create Your First Lookbook
          </PremiumButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {collections.map((c) => (
            <div
              key={c.id || c.slug}
              className="rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 overflow-hidden group hover:border-[#C8893F]/40 transition-all shadow-lg flex flex-col"
            >
              <div className="relative h-44 overflow-hidden bg-[#211A14]">
                <img
                  src={c.coverImage}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E0B08] via-black/30 to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0E0B08]/80 backdrop-blur-md border border-[#F6EAD7]/20 text-[#E0AF62]">
                  {c.tag || 'Editorial'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#F6EAD7] group-hover:text-[#E0AF62] transition-colors">
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="text-xs text-[#9E8B75] mt-1.5 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#F6EAD7]/10 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#D8C4A7]">
                    {c.products?.length ?? 0} items curated
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D7D64] bg-[#1E5544]/20 px-2.5 py-1 rounded-lg border border-[#1E5544]/40">
                    Live on Feed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}