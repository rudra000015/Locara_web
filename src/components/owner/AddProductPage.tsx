'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { prodImg } from '@/utils/prodImg';
import {
  PlusCircle,
  Image as ImageIcon,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Tag,
  Palette,
  Maximize2,
} from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

const UNITS = ['piece', 'kg', 'pack', 'box', 'set', 'gram', 'metre', 'bottle', 'pair'] as const;

const CATEGORIES = [
  'Ethnic & Bridal Wear',
  'Sweets & Confectionery',
  'Fine Jewelry & Silver',
  'Handlooms & Textiles',
  'Spices & Heritage Pantry',
  'Handicrafts & Decor',
  'Traditional Perfumery (Attar)',
  'Footwear & Mojaris',
  'Specialty Artifacts',
];

const POPULAR_SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '250g', '500g', '1kg', 'Set of 2', 'Set of 6'];
const POPULAR_COLORS = ['Royal Gold', 'Crimson Red', 'Emerald Green', 'Midnight Blue', 'Ivory Cream', 'Heritage Brass', 'Saffron'];

async function createOwnerProduct(payload: Record<string, unknown>) {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Session expired. Please login again.');

  const res = await fetch('/api/owner/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Unable to add product');
  }
  return data;
}

export default function AddProductPage() {
  const router = useRouter();
  const { ownerShopId, addProduct, showToast, ownerNavTo } = useStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState<string>('piece');
  const [isNew, setIsNew] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Variants
  const [availableSizes, setAvailableSizes] = useState<string[]>(['M', 'L', 'XL']);
  const [availableColors, setAvailableColors] = useState<string[]>(['Royal Gold', 'Ivory Cream']);
  const [customSize, setCustomSize] = useState('');
  const [customColor, setCustomColor] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const toggleSize = (s: string) => {
    setAvailableSizes((prev) => (prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]));
  };

  const addCustomSize = () => {
    if (customSize.trim() && !availableSizes.includes(customSize.trim())) {
      setAvailableSizes((prev) => [...prev, customSize.trim()]);
      setCustomSize('');
    }
  };

  const toggleColor = (c: string) => {
    setAvailableColors((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]));
  };

  const addCustomColor = () => {
    if (customColor.trim() && !availableColors.includes(customColor.trim())) {
      setAvailableColors((prev) => [...prev, customColor.trim()]);
      setCustomColor('');
    }
  };

  const handleAdd = async () => {
    if (!name.trim() || !price.trim()) {
      setError('Please provide product title and selling price.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid positive price.');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: priceNum,
        unit,
        inStock,
        isNew,
        sizes: availableSizes,
        colors: availableColors,
        image: imageUrl || prodImg(name.trim(), 1),
      };

      const data = await createOwnerProduct(payload);

      const created = (data?.product as any) ?? {
        id: 'prod_' + Date.now(),
        ...payload,
      };

      addProduct(ownerShopId, created);
      showToast('Product published to physical showcase & explorer feed!');
      ownerNavTo('showcase');
      router.push('/owner');
    } catch (err: any) {
      setError(err?.message || 'Failed to add product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 shadow-2xl space-y-6 animate-scale-in">
        {/* Header */}
        <div className="border-b border-[#F6EAD7]/10 pb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <PlusCircle className="w-4 h-4 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
              PHYSICAL SHOWCASE CATALOG
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7]">
            Add Heritage Product
          </h2>
          <p className="text-xs text-[#9E8B75] mt-1">
            Publish authentic merchandise for 10% advance deposits, in-store trial, and navigation discovery.
          </p>
        </div>

        <div className="space-y-5">
          {/* Image Upload Box */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-2 font-bold">
              Product Photography
            </label>

            {imageUrl ? (
              <div className="relative h-56 rounded-2xl overflow-hidden bg-[#211A14] border border-[#F6EAD7]/10 group">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md text-[#C24136] flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-44 rounded-2xl border-2 border-dashed border-[#F6EAD7]/15 hover:border-[#C8893F]/50 bg-[#211A14] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#17120E] text-[#C8893F] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform border border-[#F6EAD7]/10">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#F6EAD7]">
                  Upload product photo or shoot from shop floor
                </p>
                <p className="text-[10px] text-[#9E8B75] mt-0.5 font-mono">PNG, JPG, WEBP up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
          </div>

          {/* Product Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Product Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hand-Embroidered Zari Lehenga"
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Heritage Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] outline-none focus:border-[#C8893F] transition-colors cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#17120E] text-[#F6EAD7]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
              Craftsmanship & Heritage Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail fabric authenticity, purity, artisan origin, or traditional recipe..."
              className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F] transition-colors resize-none"
            />
          </div>

          {/* Price & Unit Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Retail Price in ₹ (INR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2499"
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs font-mono font-bold text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F] transition-colors"
              />
              <span className="text-[10px] font-mono text-[#E0AF62] mt-1 block">
                10% Online Reservation Deposit: ₹{price ? Math.round(parseFloat(price || '0') * 0.1) : 0}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-1.5 font-bold">
                Measuring Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] outline-none focus:border-[#C8893F] transition-colors cursor-pointer"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} className="bg-[#17120E] text-[#F6EAD7]">
                    per {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Size Variants */}
          <div className="border-t border-[#F6EAD7]/10 pt-4">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-2 font-bold flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-[#C8893F]" /> Available Sizes / Portions
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {POPULAR_SIZES.map((sz) => {
                const isSelected = availableSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#C8893F] text-[#0E0B08]'
                        : 'bg-[#211A14] text-[#9E8B75] border border-[#F6EAD7]/10 hover:text-[#F6EAD7]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Custom size (e.g. 38/Large)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F]"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-3 py-1.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#E0AF62]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Color / Variant Palette */}
          <div className="border-t border-[#F6EAD7]/10 pt-4">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-[#9E8B75] mb-2 font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#C8893F]" /> Available Colors / Finishes
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {POPULAR_COLORS.map((col) => {
                const isSelected = availableColors.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleColor(col)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E0AF62] text-[#0E0B08]'
                        : 'bg-[#211A14] text-[#9E8B75] border border-[#F6EAD7]/10 hover:text-[#F6EAD7]'
                    }`}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="Custom color (e.g. Peacock Blue)"
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 text-xs text-[#F6EAD7] placeholder-[#736350] outline-none focus:border-[#C8893F]"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-3 py-1.5 rounded-xl bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 text-xs font-bold text-[#E0AF62]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Stock & Flags */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F6EAD7]/10">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 cursor-pointer">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="w-4 h-4 accent-[#C8893F]"
              />
              <span className="text-xs font-bold text-[#F6EAD7]">New Arrival Tag</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#211A14] border border-[#F6EAD7]/10 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 accent-[#2D7D64]"
              />
              <span className="text-xs font-bold text-[#F6EAD7]">In Stock at Shop</span>
            </label>
          </div>

          {error && (
            <p className="p-3 rounded-xl bg-[#C24136]/15 border border-[#C24136]/30 text-xs text-[#C24136]">
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-4 border-t border-[#F6EAD7]/10">
            <button
              type="button"
              onClick={() => router.push('/owner')}
              className="flex-1 py-3 rounded-xl border border-[#F6EAD7]/10 text-xs font-bold text-[#9E8B75] hover:bg-[#211A14] transition-all"
            >
              Cancel
            </button>

            <PremiumButton
              variant="gold"
              size="md"
              onClick={handleAdd}
              disabled={saving}
              className="flex-1"
              magnetic
            >
              {saving ? 'Publishing...' : 'Publish to Physical Showcase'}
            </PremiumButton>
          </div>
        </div>
      </div>
    </div>
  );
}
