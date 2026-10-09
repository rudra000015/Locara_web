'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageTransition({
  children,
  pageKey,
}: {
  children: React.ReactNode;
  pageKey?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        className="w-full"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
