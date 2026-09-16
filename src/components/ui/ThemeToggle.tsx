'use client';

import { useStore } from '@/store/useStore';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useStore();
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme (White + Beige)' : 'Switch to Dark Theme (Black + Crimson Red)'}
      aria-label="Toggle theme"
      className={`relative flex items-center gap-2 p-2 rounded-xl transition-all duration-300 cursor-pointer ${
        isDark
          ? 'bg-[#141017] border border-rose-500/25 hover:border-rose-500/60 text-rose-400 hover:text-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.15)]'
          : 'bg-[#F4ECE1] border border-[#E6DDD0] hover:border-[#B87333]/50 text-[#8C501C] hover:text-[#1F1A16] shadow-sm'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-rose-500"
            >
              <Moon className="w-4 h-4 fill-rose-500/20" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center text-[#B87333]"
            >
              <Sun className="w-4 h-4 fill-[#B87333]/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-bold font-mono tracking-wide">
          {isDark ? 'Dark / Red' : 'Light / Beige'}
        </span>
      )}
    </button>
  );
}
