'use client';

import { Camera, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VisualSearch({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-white/10 p-6 md:p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-4">
          <Camera className="w-7 h-7" />
        </div>

        <h3 className="font-serif text-xl text-neutral-100 mb-2">
          Visual Discovery
        </h3>
        <p className="text-neutral-400 text-xs leading-relaxed mb-6">
          Use the camera lens icon in the search bar or header to identify heritage crafts and sweets instantly.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-full bg-amber-400 text-neutral-950 font-sans text-xs font-semibold tracking-wider uppercase hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(201,169,110,0.25)]"
        >
          Got It
        </button>
      </div>
    </motion.div>
  );
}