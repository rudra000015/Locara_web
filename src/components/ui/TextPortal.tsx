"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function TextPortal({ show, onComplete }: { show: boolean; onComplete: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] bg-[#080808] flex items-center justify-center overflow-hidden select-none"
        >
          <div className="text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-[#71717A] font-mono tracking-[0.4em] uppercase text-xs mb-3"
            >
              Pride in Heritage
            </motion.h2>

            <motion.h1
              initial={{ scale: 1, opacity: 0 }}
              animate={{
                scale: [1, 1.05, 24],
                opacity: [0, 1, 1],
              }}
              transition={{
                duration: 2.6,
                times: [0, 0.25, 1],
                ease: [0.16, 1, 0.3, 1],
              }}
              onAnimationComplete={onComplete}
              className="font-serif font-bold text-[#C9A96E] text-6xl sm:text-8xl tracking-wider"
              style={{
                textShadow: '0 0 40px rgba(201,169,110,0.3)',
              }}
            >
              Locara
            </motion.h1>
          </div>

          {/* Flash smoothly to dark background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1] }}
            transition={{ duration: 2.6, times: [0, 0.85, 1] }}
            className="absolute inset-0 bg-[#080808] pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
