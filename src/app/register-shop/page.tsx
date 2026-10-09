'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CITY_OPTIONS, getCityByName, getDefaultCity } from '@/lib/cities';
import { getShopCategoryChoices } from '@/lib/shopCategories';
import { Store, Sparkles, MapPin, Phone, Globe, ChevronLeft, CheckCircle2, LocateFixed } from 'lucide-react';
import PremiumButton from '@/components/ui/PremiumButton';

const LocationMapPicker = dynamic(() => import('@/components/owner/LocationMapPicker'), { ssr: false });

type CreatedShop = {
  id: string;
  name: string;
  addr: string;
  cat: string;
};

export default function RegisterShop() {
  const router = useRouter();
  const SHOP_CATEGORIES = useMemo(() => getShopCategoryChoices(), []);

  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [createdShop, setCreatedShop] = useState<CreatedShop | null>(null);

  const defaultCity = useMemo(() => getDefaultCity(), []);

  const [form, setForm] = useState({
    name: '',
    category: 'general',
    subcategory: '',
    businessType: 'Retail shop',
    ownerName: '',
    email: '',
    description: '',
    targetAudience: '',
    productsServices: '',
    priceRange: '',
    yearsInBusiness: '',
    shopStyle: '',
    area: '',
    pincode: '',
    photos: '',
    tagline: '',
    address: '',
    city: defaultCity.name,
    state: defaultCity.state,
    country: defaultCity.country,
    phone: '',
    website: '',
    openTime: '09:00',
    closeTime: '21:00',
    lat: String(defaultCity.lat),
    lng: String(defaultCity.lng),
    specialties: '',
    tags: '',
  });

  useEffect(() => {
    const localToken = localStorage.getItem('auth_token') || '';
    setToken(localToken);
    setBooting(false);
  }, []);

  const handleCityChange = (cityName: string) => {
    const nextCity = getCityByName(cityName);
    if (!nextCity) return;
    setForm((f) => ({
      ...f,
      city: nextCity.name,
      state: nextCity.state,
      country: nextCity.country,
      lat: String(nextCity.lat),
      lng: String(nextCity.lng),
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Location is not available in this browser. Enter coordinates manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setForm((f) => ({ ...f, lat: String(coords.latitude), lng: String(coords.longitude) })),
      () => setError('Could not access your location. Check browser permission or enter it manually.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAutoFill = async () => {
    if (!form.name.trim()) {
      setError('Please enter a shop name before generating auto-fill details.');
      return;
    }

    setAiLoading(true);
    setError('');

    try {
      const res = await fetch('/api/owner/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: form.category,
          shopName: form.name.trim(),
          subcategory: form.subcategory,
          shopStyle: form.shopStyle,
          speciality: form.specialties,
          targetAudience: form.targetAudience,
          products: form.productsServices,
          location: form.city,
          businessType: form.businessType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto-fill failed');

      setForm((f) => ({
        ...f,
        tagline: data.tagline || f.tagline,
        description: data.story || data.description || f.description,
        specialties: (data.specialties || []).join(', '),
      }));
    } catch (err: any) {
      setError(err.message || 'Auto-fill service unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push('/auth?role=owner&next=/owner/register-shop');
      return;
    }

    if (!form.name.trim() || !form.address.trim()) {
      setError('Shop name and address are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/shops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          lat: parseFloat(form.lat) || defaultCity.lat,
          lng: parseFloat(form.lng) || defaultCity.lng,
          specialties: form.specialties
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          keywords: `${form.tags},${form.subcategory},${form.productsServices}`.split(',').map((s) => s.trim()).filter(Boolean),
          photos: form.photos.split(',').map((s) => s.trim()).filter(Boolean),
          aiGeneratedDescription: form.description,
          tags: form.tags
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.shop) {
        throw new Error(data.error || 'Failed to register shop profile');
      }

      setCreatedShop({
        id: data.shop.id,
        name: data.shop.name,
        addr: data.shop.addr,
        cat: data.shop.cat,
      });
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (booting) return null;

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F5F5] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/explorer')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141414] border border-white/10 text-xs font-bold text-[#A1A1AA] hover:text-[#F5F5F5] transition-all mb-6 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Locara
        </button>

        {createdShop ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-[#121212] border border-white/10 shadow-2xl text-center animate-scale-in">
            <div className="w-16 h-16 rounded-3xl bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E] text-2xl mx-auto mb-4 shadow-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#F5F5F5] mb-2">
              Shop Registered Successfully!
            </h1>
            <p className="text-sm text-[#A1A1AA] max-w-md mx-auto mb-8">
              <strong className="text-[#C9A96E]">{createdShop.name}</strong> is live on Explorer. Your shop profile and products are ready for nearby customers.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <PremiumButton
                variant="gold"
                size="md"
                onClick={() => router.push('/owner')}
                magnetic
              >
                Go to Owner Dashboard
              </PremiumButton>
              <button
                onClick={() => router.push('/explorer')}
                className="px-5 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#242424] border border-white/10 text-xs font-bold text-[#F5F5F5]"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-10 rounded-3xl bg-[#121212] border border-white/10 shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Store className="w-4 h-4 text-[#C9A96E]" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                    MERCHANT ONBOARDING
                  </span>
                </div>
                <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#F5F5F5]">
                  Register Your Shop
                </h1>
                <p className="text-xs text-[#71717A] mt-1">
                  Help nearby customers discover your products, story and in-store availability.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoFill}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#C9A96E]/30 text-xs font-bold text-[#C9A96E] flex items-center gap-2 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiLoading ? 'Drafting...' : 'AI Auto-Fill'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs text-[#F5F5F5]">
              {/* Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                    Shop / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Hira Sweets & Sons"
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                    Heritage Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] outline-none focus:border-[#C9A96E] cursor-pointer"
                  >
                    {SHOP_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#181818] text-[#F5F5F5]">
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Owner name" value={form.ownerName} onChange={(ownerName) => setForm((f) => ({ ...f, ownerName }))} placeholder="Your full name" />
                <Field label="Owner email" type="email" value={form.email} onChange={(email) => setForm((f) => ({ ...f, email }))} placeholder="you@example.com" />
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">Business type</label>
                  <select value={form.businessType} onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5]">
                    {['Retail shop', 'Family business', 'Local artisan', 'Boutique', 'Market stall', 'Service business'].map((type) => <option key={type}>{type}</option>)}
                  </select>
                </div>
                <Field label="Subcategory / specialty" value={form.subcategory} onChange={(subcategory) => setForm((f) => ({ ...f, subcategory }))} placeholder="e.g. Wedding sherwanis" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                <Field label="Products or services" value={form.productsServices} onChange={(productsServices) => setForm((f) => ({ ...f, productsServices }))} placeholder="What customers can find here" />
                <Field label="Target customers" value={form.targetAudience} onChange={(targetAudience) => setForm((f) => ({ ...f, targetAudience }))} placeholder="Families, wedding shoppers" />
                <Field label="Price range" value={form.priceRange} onChange={(priceRange) => setForm((f) => ({ ...f, priceRange }))} placeholder="e.g. Rs. 500 to Rs. 5,000" />
                <Field label="Years in business" type="number" value={form.yearsInBusiness} onChange={(yearsInBusiness) => setForm((f) => ({ ...f, yearsInBusiness }))} placeholder="e.g. 12" />
                <Field label="Shop style" value={form.shopStyle} onChange={(shopStyle) => setForm((f) => ({ ...f, shopStyle }))} placeholder="Premium traditional, contemporary" />
                <Field label="Area / neighborhood" value={form.area} onChange={(area) => setForm((f) => ({ ...f, area }))} placeholder="Market or neighborhood" />
                <Field label="PIN code" value={form.pincode} onChange={(pincode) => setForm((f) => ({ ...f, pincode }))} placeholder="Postal code" />
              </div>

              {/* Tagline */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="e.g. Handcrafted Traditional Sweets Since 1912"
                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                  Heritage Story & Overview
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell your shop's generational story, founding year, techniques, and specialties..."
                  className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E] resize-none leading-relaxed"
                />
              </div>

              {/* Location & Address */}
              <div className="space-y-4 pt-2 border-t border-white/5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                      City Region
                    </label>
                    <select
                      value={form.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] outline-none focus:border-[#C9A96E] cursor-pointer"
                    >
                      {CITY_OPTIONS.map((c) => (
                        <option key={c.name} value={c.name} className="bg-[#181818] text-[#F5F5F5]">
                          {c.name}, {c.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                      Full Physical Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="e.g. 14 Sadar Bazaar, Clock Tower"
                      className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Latitude" value={form.lat} onChange={(lat) => setForm((f) => ({ ...f, lat }))} placeholder="28.9845" />
                  <Field label="Longitude" value={form.lng} onChange={(lng) => setForm((f) => ({ ...f, lng }))} placeholder="77.7064" />
                  <button type="button" onClick={useCurrentLocation} className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-[#C9A96E]/30 bg-[#C9A96E]/10 px-4 py-3 text-xs font-bold text-[#C9A96E] hover:bg-[#C9A96E]/15"><LocateFixed className="w-4 h-4" /> Use current location</button>
                </div>
                <LocationMapPicker
                  latitude={Number(form.lat) || defaultCity.lat}
                  longitude={Number(form.lng) || defaultCity.lng}
                  onSelect={(lat, lng, address) => setForm((f) => ({
                    ...f,
                    lat: String(lat.toFixed(6)),
                    lng: String(lng.toFixed(6)),
                    address: address || f.address,
                  }))}
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">
                    Specialties (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={form.specialties}
                    onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                    placeholder="Pure Ghee Jalebi, Gajak, Rewri"
                    className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Opening time" type="time" value={form.openTime} onChange={(openTime) => setForm((f) => ({ ...f, openTime }))} />
                <Field label="Closing time" type="time" value={form.closeTime} onChange={(closeTime) => setForm((f) => ({ ...f, closeTime }))} />
              </div>

              <div className="space-y-3 border-t border-white/5 pt-5">
                <Field label="Shop image URLs (comma separated)" value={form.photos} onChange={(photos) => setForm((f) => ({ ...f, photos }))} placeholder="https://…/shop-front.jpg" />
                <Field label="Search tags and keywords" value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="ethnic wear, wedding, sherwani, handcrafted" />
                {form.photos.split(',').map((url) => url.trim()).filter((url) => /^https?:\/\//i.test(url)).slice(0, 4).map((url) => <img key={url} src={url} alt="Shop preview" className="inline-block w-20 h-16 rounded-lg object-cover mr-2 border border-white/10" />)}
              </div>

              {error && (
                <p className="p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-xs text-[#ef4444]">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="pt-4 border-t border-white/10">
                <PremiumButton
                  variant="gold"
                  size="lg"
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                  magnetic
                >
                  {submitting ? 'Registering Heritage Profile...' : 'Complete Registration & Open Console'}
                </PremiumButton>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase text-[#71717A] mb-1.5 font-bold">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl bg-[#181818] border border-white/10 text-xs text-[#F5F5F5] placeholder-[#52525B] outline-none focus:border-[#C9A96E]" />
    </label>
  );
}
