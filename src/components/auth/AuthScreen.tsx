'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Sparkles,
  Tag,
  Building2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

interface AuthScreenProps {
  onLoginSuccess?: (role: 'explorer' | 'owner') => void;
  initialRole?: 'explorer' | 'owner';
}

function fallbackAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

export default function AuthScreen({
  onLoginSuccess,
  initialRole = 'explorer',
}: AuthScreenProps) {
  const router = useRouter();
  const { setUser, setMode, showToast } = useStore();

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<'explorer' | 'owner'>(initialRole);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlRole = new URLSearchParams(window.location.search).get('role');
        if (urlRole === 'owner' || urlRole === 'explorer') {
          setSelectedRole(urlRole);
        }
      }
    } catch {}
  }, []);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeCategory, setStoreCategory] = useState('Heritage Textiles');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long');
      return;
    }

    if (tab === 'register' && !name) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (tab === 'register' && selectedRole === 'owner' && !storeName) {
      setErrorMessage('Please enter your boutique or studio name');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userName = name || (email.split('@')[0]);
      const mockUser = {
        id: `usr_${Date.now()}`,
        name: userName,
        email,
        phone: phone || '+91 98450 12345',
        role: selectedRole,
        img: fallbackAvatar(userName),
        storeName: selectedRole === 'owner' ? (storeName || 'My Boutique') : undefined,
      };

      try {
        localStorage.setItem('auth_token', `demo_token_${Date.now()}`);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        sessionStorage.setItem('locara_shutter_opened', 'true');
      } catch {}

      setUser(mockUser, selectedRole);
      setMode(selectedRole);
      showToast(
        tab === 'signin'
          ? `Welcome back, ${userName}!`
          : `Account registered successfully as ${selectedRole === 'owner' ? 'Store Owner' : 'Explorer'}!`
      );

      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      } else {
        router.push(selectedRole === 'owner' ? '/owner' : '/');
      }
    }, 600);
  };

  const handleQuickDemo = (role: 'explorer' | 'owner') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const demoUser = role === 'owner'
        ? {
            id: 'usr_owner_maya',
            name: 'Maya Rao',
            email: 'maya@mayastudio.in',
            phone: '+91 98860 44321',
            role: 'owner' as const,
            img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
            storeName: 'Maya Studio Indiranagar',
          }
        : {
            id: 'usr_explorer_rohan',
            name: 'Rohan Mehta',
            email: 'rohan.mehta@gmail.com',
            phone: '+91 98450 99881',
            role: 'explorer' as const,
            img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=300&auto=format&fit=crop',
          };

      try {
        localStorage.setItem('auth_token', `demo_token_${Date.now()}`);
        localStorage.setItem('user_data', JSON.stringify(demoUser));
        sessionStorage.setItem('locara_shutter_opened', 'true');
      } catch {}

      setUser(demoUser, role);
      setMode(role);
      showToast(`Signed in as ${demoUser.name} (${role === 'owner' ? 'Store Owner' : 'Explorer'})`);

      if (onLoginSuccess) {
        onLoginSuccess(role);
      } else {
        router.push(role === 'owner' ? '/owner' : '/');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19] flex flex-col justify-between selection:bg-[#f0e9ba]">
      {/* Top Header */}
      <header className="px-6 py-5 sm:px-12 flex items-center justify-between border-b border-[#cbc6b8]/40 bg-[#faf9f4]/80 backdrop-blur-md sticky top-0 z-40">
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#54512d] flex items-center justify-center text-[#ffffff] shadow-sm group-hover:bg-[#3f3d22] transition-colors">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-[#1b1c19]">
              LOCARA
            </span>
            <span className="block text-[10px] font-mono tracking-widest text-[#6d6943] uppercase">
              Editorial Local Discovery
            </span>
          </div>
        </div>

        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-[#54512d] hover:text-[#1b1c19] underline underline-offset-4 decoration-[#c8a1b1] transition-colors"
        >
          Explore Bangalore Bazaar →
        </button>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Form Card */}
        <div className="lg:col-span-7 bg-[#ffffff] border border-[rgba(72,55,47,0.12)] rounded-2xl p-6 sm:p-10 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
          {/* Header & Mode Toggles */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efeee9] text-[#54512d] text-[11px] font-bold tracking-wider uppercase mb-2">
              <Sparkles className="w-3 h-3 text-[#6d6943]" />
              AUTHENTIC LOCAL COMMERCE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1b1c19] tracking-tight">
              {tab === 'signin' ? 'Welcome back to the Bazaar.' : 'Join the Locara Collective.'}
            </h1>
            <p className="text-xs sm:text-sm text-[#49473c] mt-1.5">
              {tab === 'signin'
                ? 'Sign in to access your offline reservation passes, saved gems, and secret city addresses.'
                : 'Create your account to unlock offline drops, counter pickup OTPs, or register your boutique.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#f5f4ef] p-1 rounded-xl border border-[#cbc6b8]/50 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-[#ffffff] text-[#1b1c19] shadow-sm'
                  : 'text-[#6e5a51] hover:text-[#1b1c19]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                tab === 'register'
                  ? 'bg-[#ffffff] text-[#1b1c19] shadow-sm'
                  : 'text-[#6e5a51] hover:text-[#1b1c19]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-2">
              Select Your Profile Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedRole('explorer')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedRole === 'explorer'
                    ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]'
                    : 'bg-[#f5f4ef] border-[#cbc6b8]/40 hover:border-[#54512d]/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'explorer'
                      ? 'bg-[#54512d] text-[#ffffff]'
                      : 'bg-[#e3e3de] text-[#6e5a51]'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c19]">Explorer</h4>
                  <p className="text-[11px] text-[#49473c] line-clamp-1">Shopper & Collector</p>
                </div>
              </div>

              <div
                onClick={() => setSelectedRole('owner')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  selectedRole === 'owner'
                    ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]'
                    : 'bg-[#f5f4ef] border-[#cbc6b8]/40 hover:border-[#54512d]/40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    selectedRole === 'owner'
                      ? 'bg-[#54512d] text-[#ffffff]'
                      : 'bg-[#e3e3de] text-[#6e5a51]'
                  }`}
                >
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1b1c19]">Store Owner</h4>
                  <p className="text-[11px] text-[#49473c] line-clamp-1">Boutique & Artisan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs font-medium flex items-center gap-2">
                <span>{errorMessage}</span>
              </div>
            )}

            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7a776b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Mehta"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] placeholder-[#7a776b] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {tab === 'register' && selectedRole === 'owner' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                    Boutique / Brand Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#7a776b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Maya Studio Indiranagar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] placeholder-[#7a776b] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                    Primary Craft Category
                  </label>
                  <select
                    value={storeCategory}
                    onChange={(e) => setStoreCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                  >
                    <option value="Heritage Textiles">Heritage Textiles & Silks</option>
                    <option value="Ceramics & Decor">Studio Pottery & Ceramics</option>
                    <option value="Fine Jewellery">Artisanal Jewellery</option>
                    <option value="Specialty Coffee">Artisanal Coffee & Roasters</option>
                    <option value="Antiques & Vintage">Antiques & Curiosities</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7a776b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] placeholder-[#7a776b] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-[10px] text-[#7a776b] font-normal">(For in-store pickup SMS)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#7a776b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] placeholder-[#7a776b] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#49473c] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7a776b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#cbc6b8] text-xs text-[#1b1c19] placeholder-[#7a776b] focus:bg-[#ffffff] focus:border-[#54512d] focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-full bg-[#48372f] hover:bg-[#3d2d26] text-[#faf9f4] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'signin'
                      ? `Sign In as ${selectedRole === 'owner' ? 'Store Owner' : 'Explorer'}`
                      : `Complete Registration`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-6 border-t border-[#cbc6b8]/40">
            <span className="block text-[11px] font-mono text-[#7a776b] uppercase text-center mb-3">
              — Instant Demo Credentials —
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('explorer')}
                className="py-2.5 px-3 rounded-xl bg-[#f5f4ef] hover:bg-[#efeee9] border border-[#cbc6b8] text-left flex items-center justify-between text-xs font-semibold text-[#1b1c19] transition-all cursor-pointer"
              >
                <div>
                  <span className="block text-[11px] font-bold text-[#54512d]">Demo Explorer</span>
                  <span className="text-[10px] text-[#7a776b]">Rohan Mehta (Level 3)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#54512d]" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('owner')}
                className="py-2.5 px-3 rounded-xl bg-[#f5f4ef] hover:bg-[#efeee9] border border-[#cbc6b8] text-left flex items-center justify-between text-xs font-semibold text-[#1b1c19] transition-all cursor-pointer"
              >
                <div>
                  <span className="block text-[11px] font-bold text-[#6e5a51]">Demo Store Owner</span>
                  <span className="text-[10px] text-[#7a776b]">Maya Rao (Maya Studio)</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#6e5a51]" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Editorial Vignette Card */}
        <div className="lg:col-span-5 h-[500px] lg:h-[620px] rounded-2xl overflow-hidden border border-[rgba(72,55,47,0.15)] shadow-xl relative flex flex-col justify-end p-8 sm:p-10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19] via-[#1b1c19]/60 to-transparent" />

          <div className="relative z-10 text-[#faf9f4] space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#faf9f4]/20 backdrop-blur-md text-[#f0e9ba] text-[10px] font-mono font-bold tracking-widest uppercase">
              BANGALORE ATELIER INDEX
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              &ldquo;Physical presence is the ultimate luxury.&rdquo;
            </h2>
            <p className="text-xs text-[#cec89b] font-serif italic">
              Locara connects discerning urbanites with verified offline ateliers, living bazaars, and generational masters.
            </p>

            <div className="pt-4 border-t border-[#cbc6b8]/30 flex items-center justify-between text-[11px] font-mono text-[#cec89b]">
              <span>VERIFIED IRL DROPS</span>
              <span>•</span>
              <span>COUNTER PICKUPS</span>
              <span>•</span>
              <span>COMMUNITY RADAR</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[#cbc6b8]/40 bg-[#faf9f4] text-center text-[11px] font-mono text-[#7a776b]">
        LOCARA INDEPENDENT EDITORIAL COMMERCE • BANGALORE • DELHI • MUMBAI
      </footer>
    </div>
  );
}
