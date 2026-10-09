'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Compass, Loader2, Store } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface AuthScreenProps {
  onLoginSuccess?: (role: 'explorer' | 'owner') => void;
  initialRole?: 'explorer' | 'owner';
}

export default function AuthScreen({ onLoginSuccess, initialRole = 'explorer' }: AuthScreenProps) {
  const router = useRouter();
  const { setUser, setMode, showToast } = useStore();
  const [loadingRole, setLoadingRole] = useState<'explorer' | 'owner' | null>(null);
  const [error, setError] = useState('');

  const enterDemo = async (role: 'explorer' | 'owner') => {
    setLoadingRole(role);
    setError('');
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.user || !data?.token) {
        throw new Error(data?.error || 'Could not open the demo profile. Please try again.');
      }

      const user = {
        ...data.user,
        phone: role === 'owner' ? '+91 98860 44321' : '+91 98450 99881',
        storeName: role === 'owner' ? 'Maya Studio & Atelier' : undefined,
      };
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(user));
      sessionStorage.setItem('locara_shutter_opened', 'true');
      setUser(user, role);
      setMode(role);
      showToast(`Demo ${role === 'owner' ? 'Store Owner' : 'Explorer'} is ready`);

      if (onLoginSuccess) onLoginSuccess(role);
      else router.push(role === 'owner' ? '/owner' : '/explorer');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open the demo profile. Please try again.');
      setLoadingRole(null);
    }
  };

  const selectedRole = initialRole;

  return (
    <div className="min-h-screen bg-[#faf9f4] text-[#1b1c19] flex flex-col justify-between selection:bg-[#f0e9ba]">
      <header className="px-6 py-5 sm:px-12 flex items-center justify-between border-b border-[#cbc6b8]/40 bg-[#faf9f4]/80 backdrop-blur-md">
        <button onClick={() => router.push('/')} className="flex items-center gap-3 group text-left">
          <span className="w-9 h-9 rounded-full bg-[#54512d] flex items-center justify-center text-white shadow-sm"><Store className="w-4 h-4" /></span>
          <span><span className="block font-serif text-xl font-bold tracking-tight">LOCARA</span><span className="block text-[10px] font-mono tracking-widest text-[#6d6943] uppercase">Editorial Local Discovery</span></span>
        </button>
        <button onClick={() => router.push('/explorer')} className="text-xs font-semibold text-[#54512d] hover:text-[#1b1c19] underline underline-offset-4">Explore Locara →</button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <section className="lg:col-span-7 bg-white border border-[rgba(72,55,47,0.12)] rounded-2xl p-6 sm:p-10 shadow-[0_12px_32px_-4px_rgba(72,55,47,0.06)]">
          <div className="mb-7">
            <span className="inline-flex px-3 py-1 rounded-full bg-[#efeee9] text-[#54512d] text-[11px] font-bold tracking-wider uppercase mb-3">LOCARA DEMO ACCESS</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">Choose a demo profile.</h1>
            <p className="text-sm text-[#49473c] mt-2">No account form or password. Select a profile once to open the working Explorer or Owner dashboard.</p>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => void enterDemo('explorer')} disabled={loadingRole !== null} className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all disabled:opacity-60 ${selectedRole === 'explorer' ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]' : 'bg-[#f5f4ef] border-[#cbc6b8]/50 hover:border-[#54512d]/50'}`}>
              <span className="w-12 h-12 rounded-xl bg-[#54512d] text-white flex items-center justify-center shrink-0"><Compass className="w-5 h-5" /></span>
              <span className="flex-1"><span className="block text-sm font-bold">Demo Explorer</span><span className="block text-xs text-[#6e5a51] mt-1">Rohan Mehta · discover shops, products, offers and markets</span></span>
              {loadingRole === 'explorer' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>

            <button type="button" onClick={() => void enterDemo('owner')} disabled={loadingRole !== null} className={`w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center gap-4 transition-all disabled:opacity-60 ${selectedRole === 'owner' ? 'bg-[#f0e9ba]/30 border-[#54512d] ring-1 ring-[#54512d]' : 'bg-[#f5f4ef] border-[#cbc6b8]/50 hover:border-[#54512d]/50'}`}>
              <span className="w-12 h-12 rounded-xl bg-[#6e5a51] text-white flex items-center justify-center shrink-0"><Store className="w-5 h-5" /></span>
              <span className="flex-1"><span className="block text-sm font-bold">Demo Store Owner</span><span className="block text-xs text-[#6e5a51] mt-1">Maya Rao · manage products, collections, offers and shop activity</span></span>
              {loadingRole === 'owner' ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>

          {error && <p role="alert" className="p-3 mt-4 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs font-medium">{error}</p>}
          <p className="text-center text-[11px] text-[#7a776b] mt-5">Demo changes are saved to demo profiles. Real owner accounts stay separate.</p>
        </section>

        <aside className="lg:col-span-5 min-h-[420px] lg:min-h-[560px] rounded-2xl overflow-hidden border border-[rgba(72,55,47,0.15)] shadow-xl relative flex flex-col justify-end p-8 sm:p-10">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=1200&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19] via-[#1b1c19]/60 to-transparent" />
          <div className="relative z-10 text-[#faf9f4] space-y-3">
            <span className="inline-flex px-3 py-1 rounded-full bg-[#faf9f4]/20 text-[#f0e9ba] text-[10px] font-mono font-bold tracking-widest uppercase">Local commerce, closer</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">“Physical presence is the ultimate luxury.”</h2>
            <p className="text-xs text-[#cec89b] font-serif italic">Discover neighborhood ateliers, living bazaars, and generational makers with Locara.</p>
          </div>
        </aside>
      </main>

      <footer className="px-6 py-4 border-t border-[#cbc6b8]/40 bg-[#faf9f4] text-center text-[11px] font-mono text-[#7a776b]">LOCARA INDEPENDENT EDITORIAL COMMERCE</footer>
    </div>
  );
}
