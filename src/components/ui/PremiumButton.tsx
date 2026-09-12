'use client';

import React from 'react';
import MagneticButton from '@/components/motion/MagneticButton';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  showArrow?: boolean;
  magnetic?: boolean;
}

export default function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  showArrow = false,
  magnetic = false,
  className = '',
  ...props
}: PremiumButtonProps) {
  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#F5F5F5] text-[#080808] font-bold hover:bg-white shadow-[0_2px_12px_rgba(255,255,255,0.12)] hover:shadow-[0_4px_20px_rgba(255,255,255,0.22)]',
    gold:
      'bg-[#C9A96E] text-[#080808] font-bold hover:bg-[#DFC596] shadow-[0_2px_14px_rgba(201,169,110,0.25)] hover:shadow-[0_4px_22px_rgba(201,169,110,0.40)]',
    secondary:
      'bg-[#141414] text-[#F5F5F5] font-semibold border border-white/10 hover:border-white/20 hover:bg-[#1C1C1C]',
    ghost:
      'bg-transparent text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-white/5 font-semibold',
  };

  const btnContent = (
    <button
      className={`group relative inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />}
      <span>{children}</span>
      {showArrow && (
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
      )}
    </button>
  );

  if (magnetic) {
    return <MagneticButton>{btnContent}</MagneticButton>;
  }

  return btnContent;
}
