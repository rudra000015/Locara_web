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
    <div key={pageKey} className="w-full">
      {children}
    </div>
  );
}
