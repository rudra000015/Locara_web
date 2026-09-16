'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  User,
  CalendarCheck,
  Store,
  Sliders,
  Globe,
  HelpCircle,
  LogOut,
  Sparkles,
  MapPin,
  Heart,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, wishlist, cart, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations' | 'saved' | 'preferences'>('profile');
  const [selectedCity, setSelectedCity] = useState('Delhi');
  const [personalized, setPersonalized] = useState(true);

  const interests = ['Handlooms', 'Jewelry', 'Street Food', 'Handicrafts', 'Pure Ghee Sweets', 'Heritage Books'];

  return (
    <div className="py-4 pb-20 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <User className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
            ACCOUNT & SETTINGS
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-black text-fg-heading">
          Explorer Profile
        </h1>
      </div>

      {/* Split Interface matching Mockup Screen 14 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <div className="md:col-span-4 p-4 rounded-3xl bg-bg-card border border-border space-y-1.5 shadow-sm">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'reservations', label: 'My Reservations', icon: CalendarCheck, action: () => router.push('/reservations') },
            { id: 'saved', label: 'Saved Shops & Items', icon: Heart },
            { id: 'preferences', label: 'Preferences', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.action) tab.action();
                  else setActiveTab(tab.id as any);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${isSelected
                    ? 'bg-[#C8893F] text-[#0E0B08] shadow-md'
                    : 'text-fg-secondary hover:text-fg hover:bg-bg-cardHover'
                  }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="my-2 border-t border-border pt-2">
            <button
              onClick={() => router.push('/owner')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#C8893F] hover:bg-bg-cardHover text-left cursor-pointer"
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Shop Owner Workspace</span>
            </button>

            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-[#E11D48] hover:bg-bg-cardHover text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Panel matching Mockup Screen 14 */}
        <div className="md:col-span-8 p-6 sm:p-8 rounded-3xl bg-bg-card border border-border shadow-xl space-y-6">
          {/* User Profile Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <img
                src={
                  user?.img ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
                }
                alt={user?.name || 'Explorer'}
                className="w-20 h-20 rounded-3xl object-cover border-2 border-[#C8893F]/50 shadow-md bg-bg-subtle"
              />
              <div>
                <h2 className="font-serif text-2xl font-bold text-fg-heading">
                  {user?.name || 'Rohan Mehta'}
                </h2>
                <p className="text-xs text-fg-muted font-mono">{user?.email || 'rohan.mehta@gmail.com'}</p>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C8893F]/15 text-[#C8893F] border border-[#C8893F]/30 uppercase">
                  Verified Heritage Explorer
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast('Profile edit modal coming soon')}
              className="btn-secondary text-xs px-4 py-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Interests & Specialties */}
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-fg-muted font-bold mb-3">
              Cultural Interests & Crafts
            </p>
            <div className="flex flex-wrap gap-2">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-xl bg-bg-pill border border-border text-xs font-bold text-fg"
                >
                  ✦ {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Location */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-fg-muted font-bold block">
              Preferred City Region
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                showToast(`City changed to ${e.target.value}`);
              }}
              className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-bg-subtle border border-border text-xs font-bold text-fg outline-none focus:border-[#C8893F] cursor-pointer"
            >
              <option value="Delhi">Delhi (Chandni Chowk, Karol Bagh, etc.)</option>
              <option value="Meerut">Meerut (Sadar Bazaar)</option>
              <option value="Noida">Noida (Sector 18)</option>
              <option value="Ghaziabad">Ghaziabad (Traditional Markets)</option>
              <option value="Lucknow">Lucknow (Hazratganj)</option>
            </select>
          </div>

          {/* Personalization Toggle */}
          <div className="p-4 rounded-2xl bg-bg-subtle border border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-fg-heading">Personalized Recommendations</p>
              <p className="text-[11px] text-fg-muted">
                Receive live inventory updates and artisan arrivals based on your saved shops.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPersonalized(!personalized)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${personalized ? 'bg-[#C8893F]' : 'bg-border'
                }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${personalized ? 'left-7' : 'left-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
