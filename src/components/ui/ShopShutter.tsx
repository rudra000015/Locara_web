'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Store, Compass, Sparkles, Key, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

interface ShopShutterProps {
  children: React.ReactNode;
  onOpen?: () => void;
  forceOpen?: boolean;
}

const TOTAL_SCROLL_NEEDED = 180;
const SHUTTER_ANIMATION_MS = 1400;

export default function ShopShutter({ children, onOpen, forceOpen = false }: ShopShutterProps) {
  const router = useRouter();
  const { user, setUser, setMode } = useStore();
  const [isOpen, setIsOpen] = useState(forceOpen);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [selectedRole, setSelectedRole] = useState<'explorer' | 'owner'>('explorer');

  const accumulatedScroll = useRef(0);
  const lastTouchY = useRef<number | null>(null);
  const hasTriggeredOpen = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check auth and session on mount
  useEffect(() => {
    try {
      const isShutterRoute = typeof window !== 'undefined' && (
        window.location.pathname === '/shutter' ||
        window.location.search.includes('shutter=closed')
      );
      if (isShutterRoute) {
        setIsOpen(false);
        hasTriggeredOpen.current = false;
        return;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const alreadyOpened = typeof window !== 'undefined' ? sessionStorage.getItem('locara_shutter_opened') : null;

      // Only stay open if user has an active auth session or forceOpen is explicitly true
      if (forceOpen || (token && alreadyOpened === 'true')) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } catch {}
  }, [forceOpen]);

  const triggerOpen = useCallback((role?: 'explorer' | 'owner') => {
    if (hasTriggeredOpen.current || isAnimating || isOpen) return;

    const chosenRole = role || selectedRole;
    hasTriggeredOpen.current = true;
    setIsAnimating(true);

    try {
      sessionStorage.setItem('locara_shutter_opened', 'true');
    } catch {}

    window.setTimeout(() => {
      setIsOpen(true);
      setIsAnimating(false);
      onOpen?.();
      router.push(`/auth?role=${chosenRole}`);
    }, SHUTTER_ANIMATION_MS);
  }, [isAnimating, isOpen, onOpen, router, selectedRole]);

  const updateProgressFromDelta = useCallback(
    (delta: number) => {
      if (isOpen || isAnimating || hasTriggeredOpen.current) return;

      accumulatedScroll.current = Math.min(
        TOTAL_SCROLL_NEEDED,
        Math.max(0, accumulatedScroll.current + delta)
      );

      const nextProgress = accumulatedScroll.current / TOTAL_SCROLL_NEEDED;
      setPullProgress(nextProgress);

      if (nextProgress >= 1) {
        triggerOpen();
      }
    },
    [isAnimating, isOpen, triggerOpen]
  );

  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (isOpen || isAnimating || hasTriggeredOpen.current) return;
      event.preventDefault();
      updateProgressFromDelta(event.deltaY);
    },
    [isAnimating, isOpen, updateProgressFromDelta]
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    lastTouchY.current = event.touches[0]?.clientY ?? null;
  }, []);

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (isOpen || isAnimating || hasTriggeredOpen.current) return;
      if (lastTouchY.current === null) return;

      const currentY = event.touches[0]?.clientY;
      if (typeof currentY !== 'number') return;

      event.preventDefault();
      const delta = lastTouchY.current - currentY;
      lastTouchY.current = currentY;
      updateProgressFromDelta(delta);
    },
    [isAnimating, isOpen, updateProgressFromDelta]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchY.current = null;
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || isOpen) return;

    element.addEventListener('wheel', handleWheel, { passive: false });
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('wheel', handleWheel);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  const totalSlats = 16;
  const containerVariants = {
    exit: { transition: { staggerChildren: 0.035, staggerDirection: -1 as const } },
  };
  const slatVariants = {
    initial: { y: 0 },
    exit: {
      y: '-110vh',
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-[#faf9f4]">
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="shutter-overlay"
            variants={containerVariants}
            initial="initial"
            animate="initial"
            exit="exit"
            className="fixed inset-0 z-[100] flex flex-col bg-[#1b1c19] select-none"
          >
            {/* Shutter Slats - Textured Espresso & Brass */}
            {Array.from({ length: totalSlats }).map((_, i) => (
              <motion.div
                key={i}
                variants={slatVariants}
                className="w-full flex-1 border-b border-[#30312e] relative"
                style={{
                  background:
                    i % 2 === 0
                      ? 'linear-gradient(180deg, #30312e 0%, #1b1c19 50%, #252623 100%)'
                      : 'linear-gradient(180deg, #252623 0%, #1b1c19 60%, #30312e 100%)',
                  boxShadow:
                    'inset 0 1px 0 rgba(203, 198, 184, 0.08), inset 0 -1px 0 rgba(0,0,0,0.8)',
                }}
              >
                {[12, 50, 88].map((pct) => (
                  <div
                    key={pct}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      left: `${pct}%`,
                      background: '#cec89b',
                      opacity: 0.35,
                      boxShadow: '0 0 6px rgba(206, 200, 155, 0.4)',
                    }}
                  />
                ))}
              </motion.div>
            ))}

            {/* Top Architectural Header Plaque */}
            <div className="absolute top-0 left-0 right-0 z-[102] px-6 py-4 flex items-center justify-between border-b border-[#49473c]/40 bg-[#1b1c19]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#54512d] flex items-center justify-center text-[#f0e9ba]">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-serif text-lg font-bold tracking-widest text-[#faf9f4]">
                    LOCARA
                  </span>
                  <span className="text-[10px] block font-mono text-[#cec89b] uppercase tracking-wider">
                    Editorial Local Discovery
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerOpen('explorer')}
                  className="px-4 py-1.5 rounded-full bg-[#30312e] hover:bg-[#54512d] text-[#f2f1ec] hover:text-[#ffffff] border border-[#7a776b]/40 text-xs font-semibold transition-all pointer-events-auto cursor-pointer"
                >
                  Quick Enter →
                </button>
              </div>
            </div>

            {/* Center Shutter Emblem & Interactive Controls */}
            <div className="absolute inset-0 z-[103] flex flex-col items-center justify-center pointer-events-none p-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col items-center max-w-lg w-full gap-6"
              >
                {/* Brand Moniker */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#54512d]/40 border border-[#cec89b]/30 text-[#f0e9ba] text-[11px] font-mono font-bold tracking-widest uppercase mb-3">
                    <Sparkles className="w-3 h-3 text-[#cec89b]" />
                    INDIAN SUBCONTINENT EDITION
                  </span>
                  <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-[#faf9f4] drop-shadow-md">
                    Locara
                  </h1>
                  <p className="text-xs sm:text-sm text-[#cec89b] font-serif italic mt-1 max-w-sm mx-auto">
                    The tactile discovery platform for verified offline drop ateliers, living bazaars, and neighborhood craft.
                  </p>
                </div>

                {/* Role Switcher */}
                <div className="pointer-events-auto flex items-center bg-[#30312e]/90 p-1.5 rounded-full border border-[#7a776b]/40 shadow-xl backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('explorer')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedRole === 'explorer'
                        ? 'bg-[#54512d] text-[#ffffff] shadow-md'
                        : 'text-[#cbc6b8] hover:text-[#faf9f4]'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Explorer Mode
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('owner')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedRole === 'owner'
                        ? 'bg-[#54512d] text-[#ffffff] shadow-md'
                        : 'text-[#cbc6b8] hover:text-[#faf9f4]'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    Store Owner
                  </button>
                </div>

                {/* Pull Ring Interaction */}
                <div className="flex flex-col items-center gap-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#cbc6b8]">
                    {pullProgress < 0.1
                      ? 'Scroll or pull handle to roll up the shutter'
                      : pullProgress < 0.8
                      ? 'Opening the City...'
                      : 'Welcome to Locara'}
                  </p>

                  <button
                    type="button"
                    onClick={() => triggerOpen(selectedRole)}
                    className="pointer-events-auto w-16 h-16 rounded-full bg-[#30312e] border-2 border-[#cec89b] text-[#f0e9ba] flex items-center justify-center shadow-[0_0_25px_rgba(206,200,155,0.25)] hover:scale-110 hover:bg-[#54512d] hover:text-[#ffffff] transition-all duration-300 cursor-pointer group"
                    title="Click or pull to open"
                  >
                    <ArrowDown className="w-6 h-6 animate-bounce text-[#f0e9ba] group-hover:text-[#ffffff]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => triggerOpen(selectedRole)}
                    className="pointer-events-auto mt-2 px-8 py-3 rounded-full bg-[#54512d] hover:bg-[#6d6943] text-[#ffffff] border border-[#cec89b]/40 text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Open Shutter & Enter ({selectedRole === 'owner' ? 'Store Owner' : 'Explorer'}) →
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Bottom Sill */}
            <motion.div
              variants={slatVariants}
              className="h-12 w-full flex items-center justify-between px-6 bg-[#1b1c19] border-t border-[#49473c]/50 z-[101]"
            >
              <span className="text-[10px] font-mono text-[#7a776b]">INDIAN BAZAAR NETWORK</span>
              <span className="text-[10px] font-mono text-[#cec89b] font-bold tracking-widest uppercase">
                EST. BANGALORE • DELHI • MUMBAI
              </span>
              <span className="text-[10px] font-mono text-[#7a776b]">2026</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
