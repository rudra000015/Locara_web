"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FancyShutterProps {
  children: React.ReactNode;
  onOpen?: () => void;
}

const TOTAL_SCROLL_NEEDED = 280;
const SHUTTER_ANIMATION_MS = 1800;
const OPEN_START_DELAY_MS = 80;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function FancyShutter({ children, onOpen }: FancyShutterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);

  const accumulatedScroll = useRef(0);
  const lastTouchY = useRef<number | null>(null);
  const hasTriggeredOpen = useRef(false);
  const hasCalledOnOpen = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ROPE_TOP = 80;
  const ROPE_BOTTOM = 320;
  const ringY = ROPE_TOP + (1 - pullProgress) * (ROPE_BOTTOM - ROPE_TOP);

  useEffect(() => {
    const audio = new Audio("/sounds/videoplayback.mp3");
    audio.volume = 0.6;
    audio.preload = "auto";
    audioRef.current = audio;

    const onError = () => {
      audioRef.current = null;
    };

    audio.addEventListener("error", onError);
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  const playOpenSound = useCallback(() => {
    if (soundStartedRef.current) return;

    const audio = audioRef.current;

    try {
      soundStartedRef.current = true;
      if (audio) {
        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.catch(() => {});
        }
        return;
      }

      const AudioCtor =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtor) return;

      const ctx = audioContextRef.current ?? new AudioCtor();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      const oscillator = ctx.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(1200, now);
      oscillator.frequency.exponentialRampToValueAtTime(160, now + 0.18);
      oscillator.connect(gain);
      oscillator.start(now);
      oscillator.stop(now + 0.22);
    } catch {
      // Audio is non-blocking
    }
  }, []);

  const stopOpenSound = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const triggerOpen = useCallback(() => {
    if (hasTriggeredOpen.current || isAnimating || isOpen) return;

    hasTriggeredOpen.current = true;
    setIsAnimating(true);
    playOpenSound();

    window.setTimeout(() => {
      setIsOpen(true);
      try {
        sessionStorage.setItem("shutter_opened", "true");
        sessionStorage.setItem("shutter_opened_at", String(Date.now()));
      } catch {
        // Storage fallback
      }
    }, OPEN_START_DELAY_MS);
  }, [isAnimating, isOpen, playOpenSound]);

  const updateProgressFromDelta = useCallback(
    (delta: number) => {
      if (isOpen || isAnimating || hasTriggeredOpen.current) return;

      accumulatedScroll.current = clamp(
        accumulatedScroll.current + delta,
        0,
        TOTAL_SCROLL_NEEDED
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
      if (typeof currentY !== "number") return;

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

    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: false });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    if (!isOpen) return;

    const stopAudioTimer = window.setTimeout(() => {
      stopOpenSound();
    }, SHUTTER_ANIMATION_MS);

    const onOpenTimer = window.setTimeout(() => {
      if (!hasCalledOnOpen.current) {
        hasCalledOnOpen.current = true;
        onOpen?.();
      }
    }, SHUTTER_ANIMATION_MS);

    return () => {
      window.clearTimeout(stopAudioTimer);
      window.clearTimeout(onOpenTimer);
    };
  }, [isOpen, onOpen, stopOpenSound]);

  const totalSlats = 14;
  const containerVariants = {
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 as const } },
  };
  const slatVariants = {
    initial: { y: 0 },
    exit: {
      y: "-110vh",
      transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#080808]"
    >
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="shutter-overlay"
            variants={containerVariants}
            initial="initial"
            animate="initial"
            exit="exit"
            className="fixed inset-0 z-[100] flex flex-col bg-[#080808]"
          >
            {Array.from({ length: totalSlats }).map((_, i) => (
              <motion.div
                key={i}
                variants={slatVariants}
                className="w-full flex-1 border-b border-black/40 relative"
                style={{
                  background:
                    i % 2 === 0
                      ? "linear-gradient(180deg, #181818 0%, #202020 40%, #121212 60%, #181818 100%)"
                      : "linear-gradient(180deg, #121212 0%, #1a1a1a 40%, #0d0d0d 60%, #121212 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)",
                }}
              >
                {[20, 50, 80].map((pct) => (
                  <div
                    key={pct}
                    className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{
                      left: `${pct}%`,
                      background: "#C9A96E",
                      opacity: 0.35,
                      boxShadow: "0 0 6px rgba(201,169,110,0.4)",
                    }}
                  />
                ))}
              </motion.div>
            ))}

            {/* Bottom Handle Bar */}
            <motion.div
              variants={slatVariants}
              className="h-14 w-full flex items-center justify-between px-8 bg-[#101010] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
            >
              <div className="h-1 w-16 rounded-full bg-[#C9A96E]/20" />
              <span className="text-[#C9A96E] text-[10px] font-mono tracking-[0.25em] uppercase font-bold">
                {pullProgress < 0.05
                  ? "SCROLL OR PULL TO UNVEIL"
                  : pullProgress < 0.8
                  ? "PULLING THE SHUTTER..."
                  : "UNVEILING LOCARA"}
              </span>
              <div className="h-1 w-16 rounded-full bg-[#C9A96E]/20" />
            </motion.div>

            {/* Center Unlock Prompt */}
            {pullProgress < 0.1 && !isAnimating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[105] flex flex-col items-center justify-center pointer-events-none"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#181818] border border-white/10 flex items-center justify-center shadow-glow-sm">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#F5F5F5] tracking-wide">
                      LOCARA
                    </h2>
                    <p className="text-xs uppercase font-mono tracking-[0.2em] text-[#C9A96E] mt-1">
                      Unveiling The Heritage Treasure
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerOpen}
                    className="pointer-events-auto mt-3 px-6 py-2.5 rounded-full bg-[#181818] border border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#080808] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-glow"
                  >
                    Enter Now →
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
