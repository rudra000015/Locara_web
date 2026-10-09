'use client';

import { useStore } from '@/store/useStore';
import { CheckCircle2, Heart, Trash2, Info, AlertCircle } from 'lucide-react';

export default function Toast() {
  const { toast } = useStore();

  if (!toast.visible) return null;

  const isHeart = toast.message.includes('❤️') || toast.message.toLowerCase().includes('saved');
  const isRemove = toast.message.toLowerCase().includes('removed') || toast.message.toLowerCase().includes('delete');
  const isError = toast.message.toLowerCase().includes('error') || toast.message.toLowerCase().includes('fail');
  const isSuccess = !isError && !isRemove;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#E5E5E5] text-[#171717] px-4 py-3 rounded-lg shadow-lg max-w-md animate-fade-up">
      {isHeart ? (
        <Heart className="w-5 h-5 text-[#DC2626] fill-[#DC2626] flex-shrink-0" />
      ) : isRemove ? (
        <Trash2 className="w-5 h-5 text-[#8A8A8A] flex-shrink-0" />
      ) : isError ? (
        <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
      ) : isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-[#16803C] flex-shrink-0" />
      ) : (
        <Info className="w-5 h-5 text-[#A85420] flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
}