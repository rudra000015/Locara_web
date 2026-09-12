'use client';

import { useCallback, useEffect, useState } from 'react';
import { Compass, Store, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, LogIn } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useT } from '@/i18n/useT';
import PremiumButton from '@/components/ui/PremiumButton';

declare global {
  interface Window {
    google?: any;
  }
}

interface AuthScreenProps {
  onLoginSuccess: (role: 'explorer' | 'owner') => void;
  initialRole?: 'explorer' | 'owner';
  initialMode?: 'login' | 'signup';
}

interface AuthApiResponse {
  user?: {
    id?: string;
    name: string;
    email?: string;
    role: 'explorer' | 'owner';
    img?: string;
  };
  token?: string;
  error?: string;
}

function fallbackAvatar(seed: string) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}`;
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_GSI_SCRIPT = 'https://accounts.google.com/gsi/client';

export default function AuthScreen({
  onLoginSuccess,
  initialRole = 'explorer',
  initialMode = 'login',
}: AuthScreenProps) {
  const [selectedRole, setSelectedRole] = useState<'explorer' | 'owner' | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleFallbackUrl, setGoogleFallbackUrl] = useState('');
  const { setUser, showToast } = useStore();
  const t = useT();

  const persistSession = useCallback(
    (payload: NonNullable<AuthApiResponse['user']>, token: string) => {
      const nextUser = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        img: payload.img || fallbackAvatar(payload.email || payload.name),
        role: payload.role,
      };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(nextUser));
      setUser(nextUser, payload.role);
      onLoginSuccess(payload.role);
    },
    [onLoginSuccess, setUser]
  );

  const loadGoogleScript = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (window.google?.accounts?.id) {
      setGoogleReady(true);
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-google-gsi="1"]') as HTMLScriptElement | null;
      if (existing) {
        if (window.google?.accounts?.id) {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Unable to load Google script')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_GSI_SCRIPT;
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = '1';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Unable to load Google script'));
      document.head.appendChild(script);
    });

    if (window.google?.accounts?.id) {
      setGoogleReady(true);
    }
  }, []);

  const signInWithGoogleCredential = useCallback(
    async (credential: string) => {
      const activeRole = selectedRole || 'explorer';
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, role: activeRole }),
      });
      const data = (await res.json()) as AuthApiResponse;
      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error || 'Google sign-in failed');
      }
      persistSession(data.user, data.token);
      showToast('Signed in successfully with Google');
    },
    [persistSession, selectedRole, showToast]
  );

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        const data = (await res.json()) as AuthApiResponse;

        if (!res.ok || !data.user) {
          throw new Error(data.error || 'Session expired');
        }

        persistSession(data.user, token);
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, [persistSession]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    void loadGoogleScript().catch(() => {
      setGoogleReady(false);
    });
  }, [loadGoogleScript]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    const activeRole = selectedRole || 'explorer';
    setError('');
    setLoading(true);
    showToast('Signing in to Locara...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: activeRole }),
      });
      const data = (await res.json()) as AuthApiResponse;

      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error || 'Unable to sign in');
      }

      persistSession(data.user, data.token);
      showToast('Welcome back to Locara');
    } catch (e: any) {
      setError(e?.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email || !password) {
      setError('Name, email and password are required.');
      return;
    }

    const activeRole = selectedRole || 'explorer';
    setError('');
    setLoading(true);
    showToast('Creating your account...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email,
          password,
          role: activeRole,
          img: fallbackAvatar(email),
        }),
      });

      const data = (await res.json()) as AuthApiResponse;
      if (!res.ok || !data.user || !data.token) {
        throw new Error(data.error || 'Unable to create account');
      }

      persistSession(data.user, data.token);
      showToast('Account created successfully');
    } catch (e: any) {
      setError(e?.message || 'Signup failed');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local');
      return;
    }

    setError('');
    setLoading(true);
    showToast('Connecting to Google...');

    try {
      await loadGoogleScript();

      if (!window.google?.accounts?.id) {
        throw new Error('Google SDK unavailable');
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          try {
            if (!response?.credential) {
              throw new Error('No Google credential received');
            }
            await signInWithGoogleCredential(response.credential);
          } catch (e: any) {
            setError(e?.message || 'Google sign-in failed');
            setLoading(false);
          }
        },
      });

      const fallback = window.setTimeout(() => {
        setLoading(false);
      }, 8000);

      window.google.accounts.id.prompt((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          clearTimeout(fallback);
          setLoading(false);
          setError('Google popup was blocked. Please allow popups.');
        }
      });
    } catch (e: any) {
      setError(e?.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0E0B08]">
        <div className="w-full max-w-md rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#211A14] border border-[#C8893F]/30 flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-[#C8893F] border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="font-serif font-bold text-xl text-[#F6EAD7]">LOCARA</h2>
          <p className="text-xs text-[#9E8B75] mt-1 font-mono tracking-wider uppercase">
            Restoring session...
          </p>
        </div>
      </div>
    );
  }

  // ── Step 1: Immersive Role Selection ──────────────────────────────
  if (!selectedRole) {
    return (
      <div className="min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-[#0E0B08] text-[#F6EAD7]">
        {/* Top Branding */}
        <div className="max-w-4xl mx-auto w-full pt-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#17120E] border border-[#C8893F]/30 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#C8893F]" />
            <span className="text-[10px] font-mono font-bold tracking-[0.25em] uppercase text-[#E0AF62]">
              LOCARA • HYPERLOCAL COMMERCE
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#F6EAD7] leading-tight">
            Discover Local. Reserve Smart. <br />
            <span className="italic text-[#E0AF62] font-normal">Shop Better.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#9E8B75] mt-3 max-w-xl mx-auto">
            Explore your city&apos;s physical local markets and iconic shops before walking into them.
          </p>
        </div>

        {/* The Two Large Immersive Role Cards */}
        <div className="max-w-4xl mx-auto w-full my-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: EXPLORE LOCAL */}
          <div
            onClick={() => {
              setSelectedRole('explorer');
              setError('');
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1B140F] to-[#140F0B] border border-[#F6EAD7]/10 hover:border-[#C8893F]/50 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-glow cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#C8893F]/10 rounded-full blur-3xl group-hover:bg-[#C8893F]/20 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#261D16] border border-[#C8893F]/30 flex items-center justify-center text-[#E0AF62] mb-6 group-hover:scale-110 transition-transform shadow-glow-sm">
                <Compass className="w-7 h-7 text-[#C8893F]" />
              </div>

              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#C8893F]">
                FOR SHOPPERS & EXPLORERS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7] mt-1 mb-3">
                Explore Local
              </h2>
              <p className="text-xs sm:text-sm text-[#9E8B75] leading-relaxed">
                Discover shops, products, collections and offers near you. Reserve with a 10% advance and pick up in store.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F6EAD7]/10 flex items-center justify-between">
              <span className="font-bold text-xs text-[#E0AF62] group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                Explore Locara <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-[#6E5D4B]">CONSUMER APP</span>
            </div>
          </div>

          {/* CARD 2: GROW YOUR SHOP */}
          <div
            onClick={() => {
              setSelectedRole('owner');
              setError('');
            }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#1B140F] to-[#140F0B] border border-[#F6EAD7]/10 hover:border-[#1E5544]/60 p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-glow-emerald cursor-pointer"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#1E5544]/15 rounded-full blur-3xl group-hover:bg-[#1E5544]/30 transition-all pointer-events-none" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#172620] border border-[#1E5544]/40 flex items-center justify-center text-[#2D7D64] mb-6 group-hover:scale-110 transition-transform shadow-glow-emerald">
                <Store className="w-7 h-7 text-[#2D7D64]" />
              </div>

              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2D7D64]">
                FOR LOCAL SHOP OWNERS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#F6EAD7] mt-1 mb-3">
                Grow Your Shop
              </h2>
              <p className="text-xs sm:text-sm text-[#9E8B75] leading-relaxed">
                Create your premium digital storefront, manage reservations, verify pickups, and drive verified local footfall.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-[#F6EAD7]/10 flex items-center justify-between">
              <span className="font-bold text-xs text-[#2D7D64] group-hover:translate-x-1 transition-transform flex items-center gap-1.5">
                Become a Seller <ArrowRight className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono text-[#6E5D4B]">MERCHANT WORKSPACE</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#6E5D4B] font-mono pb-4">
          LOCARA PLATFORM • SECURE HYPERLOCAL COMMERCE & DISCOVERY
        </div>
      </div>
    );
  }

  // ── Step 2: Authentication Modal / View ────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0E0B08]">
      <div className="w-full max-w-md rounded-3xl bg-[#17120E] border border-[#F6EAD7]/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-scale-in">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#C8893F]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Back to Role Selection */}
        <button
          onClick={() => {
            setSelectedRole(null);
            setError('');
          }}
          className="text-xs text-[#9E8B75] hover:text-[#F6EAD7] flex items-center gap-1 mb-4 cursor-pointer font-semibold"
        >
          ← Change Role
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#261D16] to-[#1B140F] border border-[#C8893F]/30 flex items-center justify-center mx-auto mb-3 shadow-glow-sm">
            {selectedRole === 'explorer' ? (
              <Compass className="w-6 h-6 text-[#C8893F]" />
            ) : (
              <Store className="w-6 h-6 text-[#2D7D64]" />
            )}
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#F6EAD7]">
            {selectedRole === 'explorer' ? 'Explore Local Markets' : 'Seller Workspace Access'}
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E0AF62] mt-1">
            {selectedRole === 'explorer' ? 'LOCARA • EXPLORER' : 'LOCARA • MERCHANT CONSOLE'}
          </p>
        </div>

        {/* Mode Toggle (Sign In / Sign Up) */}
        <div className="flex p-1 rounded-xl bg-[#211A14] border border-[#F6EAD7]/5 mb-5 relative z-10">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === m ? 'bg-[#C8893F] text-[#0E0B08] shadow-glow-sm' : 'text-[#9E8B75] hover:text-[#F6EAD7]'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Google Authentication */}
        <div className="space-y-3 relative z-10">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={!GOOGLE_CLIENT_ID}
            className="w-full py-3 rounded-xl font-bold text-xs bg-[#211A14] hover:bg-[#2A2119] border border-[#F6EAD7]/10 hover:border-[#F6EAD7]/20 text-[#F6EAD7] flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm"
          >
            <LogIn className="w-4 h-4 text-[#C8893F]" />
            <span>{GOOGLE_CLIENT_ID ? 'Continue with Google' : 'Google Sign-In'}</span>
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#F6EAD7]/10" />
            <span className="text-[10px] font-mono uppercase text-[#9E8B75] tracking-wider">
              OR EMAIL
            </span>
            <div className="flex-1 h-px bg-[#F6EAD7]/10" />
          </div>

          {/* Form Inputs */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Rudra Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] placeholder-[#6E5D4B] outline-none focus:border-[#C8893F] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
              Email Address
            </label>
            <input
              type="email"
              placeholder="explorer@locara.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] placeholder-[#6E5D4B] outline-none focus:border-[#C8893F] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono uppercase text-[#9E8B75] mb-1 font-bold">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-xs bg-[#211A14] border border-[#F6EAD7]/10 text-[#F6EAD7] placeholder-[#6E5D4B] outline-none focus:border-[#C8893F] transition-colors"
            />
          </div>

          <PremiumButton
            variant="gold"
            size="md"
            onClick={mode === 'login' ? handleLogin : handleSignup}
            className="w-full mt-2"
            magnetic
          >
            {mode === 'login'
              ? selectedRole === 'explorer'
                ? 'Start Exploring'
                : 'Access Seller Console'
              : selectedRole === 'explorer'
              ? 'Create Explorer Account'
              : 'Create Seller Account'}
          </PremiumButton>

          {error && (
            <p className="text-center text-xs text-[#C24136] bg-[#C24136]/10 p-3 rounded-xl border border-[#C24136]/20 mt-2">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
