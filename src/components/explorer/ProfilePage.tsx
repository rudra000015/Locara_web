'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  User,
  CalendarCheck,
  Store,
  Sliders,
  LogOut,
  Heart,
  ShoppingBag,
  MapPin,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, wishlist, cart, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations' | 'saved' | 'preferences'>('profile');
  const [selectedCity, setSelectedCity] = useState('Meerut');
  const [personalized, setPersonalized] = useState(true);

  const interests = ['Handicrafts', 'Home Decor', 'Traditional Jewellery', 'Ethnic Wear', 'Local Sweets & Food', 'Brassware'];

  return (
    <div className="py-6 pb-20 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#171717]">
          My Account
        </h1>
        <p className="text-xs text-[#666666] mt-0.5">
          Manage your profile, pickup reservations, and local shopping preferences
        </p>
      </div>

      {/* Split Interface */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar Navigation */}
        <div className="md:col-span-4 p-3 rounded-2xl bg-white border border-[#E5E5E5] space-y-1 shadow-sm">
          {[
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'reservations', label: 'My Reservations & Passes', icon: CalendarCheck, action: () => router.push('/reservations') },
            { id: 'saved', label: `Saved Wishlist (${wishlist.length})`, icon: Heart, action: () => router.push('/wishlist') },
            { id: 'cart', label: `Pickup Bag (${cart.length})`, icon: ShoppingBag, action: () => router.push('/cart') },
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#A85420] text-white shadow-sm'
                    : 'text-[#666666] hover:text-[#171717] hover:bg-[#F5F4F0]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="my-2 border-t border-[#E5E5E5] pt-2 space-y-1">
            <button
              onClick={() => router.push('/owner')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#A85420] hover:bg-[#A85420]/10 text-left cursor-pointer"
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Merchant / Shop Owner Portal</span>
            </button>

            <button
              onClick={() => {
                logout();
                showToast('Signed out successfully');
                router.push('/');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-[#DC2626]/10 text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-white border border-[#E5E5E5] shadow-sm space-y-6">
          {/* User Profile Card */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 pb-5 border-b border-[#E5E5E5]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#A85420]/10 border-2 border-[#A85420] flex items-center justify-center text-xl font-black text-[#A85420]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#171717]">
                  {user?.name || 'Rahul Sharma'}
                </h2>
                <p className="text-xs text-[#666666]">{user?.email || 'rahul.sharma@example.com'}</p>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#16803C]/10 text-[#16803C]">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Local Buyer
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast('Profile settings saved')}
              className="px-4 py-2 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] hover:bg-[#F5F4F0] text-xs font-bold text-[#171717] transition-colors flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#666666]" />
              <span>Edit Details</span>
            </button>
          </div>

          {/* Interests & Categories */}
          <div>
            <p className="text-xs uppercase tracking-wider text-[#666666] font-bold mb-2.5">
              Preferred Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-[#F5F4F0] border border-[#E5E5E5] text-xs font-medium text-[#171717]"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Default City */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#171717] block">
              Default City / Marketplace Region
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A85420]" />
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    showToast(`Location set to ${e.target.value}`);
                  }}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#FAFAF8] border border-[#E5E5E5] text-xs font-bold text-[#171717] outline-none focus:border-[#A85420] cursor-pointer"
                >
                  <option value="Meerut">Meerut (Sadar Bazaar, Abu Lane)</option>
                  <option value="Delhi">Delhi (Chandni Chowk, Dilli Haat)</option>
                  <option value="Noida">Noida (Sector 18)</option>
                  <option value="Lucknow">Lucknow (Hazratganj, Chowk)</option>
                  <option value="Jaipur">Jaipur (Johari Bazaar)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-4 rounded-xl bg-[#FAFAF8] border border-[#E5E5E5] flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#171717]">Pickup Pass Reminders & Notifications</p>
              <p className="text-[11px] text-[#666666]">
                Receive SMS and in-app alerts when your reserved items are ready for pickup.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPersonalized(!personalized)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                personalized ? 'bg-[#A85420]' : 'bg-[#E5E5E5]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  personalized ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
