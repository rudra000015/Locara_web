import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle ambient gold radial background */}
      <div className="absolute w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative flex flex-col items-center text-center z-10">
        <div className="relative w-16 h-16 mb-8">
          <div className="absolute inset-0 rounded-full border border-white/5" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-400/50 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-amber-400/10" />
        </div>
        
        <h2 className="font-serif text-3xl font-light tracking-wide text-neutral-100 mb-2">
          LOCARA
        </h2>
        <p className="font-sans text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}
