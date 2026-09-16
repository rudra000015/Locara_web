'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Clock, ArrowRight, Sparkles, User, MapPin } from 'lucide-react';

export default function StoriesPage() {
  const router = useRouter();

  const stories = [
    {
      id: 'chandni-chowk-soul',
      num: '01',
      title: 'The Artisans Keeping an Ancient Craft Alive',
      subtitle: 'In the narrow lanes of Kinari Bazaar, four generations of hand-embroiders continue Mughal zari heritage.',
      author: 'Ayesha Siddiqui',
      readTime: '6 min read',
      market: 'Chandni Chowk, Old Delhi',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'khari-baoli-sunrise',
      num: '02',
      title: 'Why Asia’s Largest Spice Market Wakes Before Sunrise',
      subtitle: 'Inside the 300-year-old trade routes of Khari Baoli, where pure Kashmiri saffron and Malabar pepper change hands.',
      author: 'Vikram Sethi',
      readTime: '4 min read',
      market: 'Khari Baoli, Delhi',
      image: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'century-old-halwai',
      num: '03',
      title: 'The Family Behind a 96-Year-Old Sweet Legacy',
      subtitle: 'How pure desi ghee, slow brass simmer, and unaltered heirloom secret recipes withstand modern industrialization.',
      author: 'Meenakshi Sundaram',
      readTime: '5 min read',
      market: 'Dariba Kalan, Delhi',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 'streets-that-shaped-delhi',
      num: '04',
      title: 'The Streets That Shaped the Soul of Delhi',
      subtitle: 'Walking through Ajmal Khan Road, Hazratganj, and Sadar Bazaar to understand how physical commerce builds communities.',
      author: 'Locara Editorial Guild',
      readTime: '7 min read',
      market: 'Citywide Cultural Survey',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="py-2 sm:py-4 pb-32 space-y-6 sm:space-y-10">
      {/* Header matching Section 13 */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <BookOpen className="w-4 h-4 text-[#C8893F]" />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#C8893F]">
            LOCARA MAGAZINE • PLACES • PEOPLE • STORIES
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-fg-heading">
          Locara Stories
        </h1>
        <p className="text-xs sm:text-sm text-fg-secondary mt-1 max-w-xl font-serif italic">
          Documenting the living history, multi-generational families, and artisan culture of local Indian bazaars.
        </p>
      </div>

      {/* Hero Magazine Feature with responsive layout on mobile */}
      <div className="relative rounded-3xl bg-[#14100C] border border-[#C8893F]/30 p-5 sm:p-12 shadow-2xl overflow-hidden min-h-[340px] sm:min-h-[440px] flex flex-col justify-end">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1600&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0806] via-[#0A0806]/85 to-black/40" />

        <div className="relative z-10 max-w-2xl">
          <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#E0AF62]">
            FEATURED COVER STORY
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-[#FAF4EB] mt-1 mb-2.5 sm:mb-4 leading-tight">
            The Soul of Chandni Chowk
          </h2>
          <p className="text-xs sm:text-sm text-[#D8C4A7] leading-relaxed mb-4 sm:mb-6 font-serif italic">
            &ldquo;Behind every wooden shopfront and hand-beaten silver tray in Dariba Kalan lies five generations of uninterrupted mastery. This is not fast retail — this is living history.&rdquo;
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[#E0AF62] font-mono">
            <span>By Ayesha Siddiqui</span>
            <span>•</span>
            <span>8 min read</span>
            <span>•</span>
            <span>Old Delhi</span>
          </div>
        </div>
      </div>

      {/* Numbered Story List */}
      <div className="space-y-4 sm:space-y-6">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C8893F] font-bold">
          CURATED ESSAYS & DOCUMENTARIES
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {stories.map((story) => (
            <div
              key={story.id}
              className="p-4 sm:p-6 rounded-3xl bg-bg-card border border-border hover:border-[#C8893F] transition-all cursor-pointer shadow-md hover:shadow-xl group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-xl sm:text-3xl font-bold text-[#C8893F]">
                    {story.num}
                  </span>
                  <span className="text-[10px] font-mono text-fg-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#C8893F]" /> {story.readTime}
                  </span>
                </div>

                <div className="aspect-video rounded-2xl overflow-hidden mb-3 bg-bg-subtle border border-border">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <p className="text-[9px] sm:text-[10px] font-mono uppercase text-[#C8893F] font-bold mb-1">
                  {story.market}
                </p>
                <h3 className="font-serif text-base sm:text-xl font-bold text-fg-heading group-hover:text-[#C8893F] transition-colors mb-1.5">
                  {story.title}
                </h3>
                <p className="text-xs text-fg-secondary leading-relaxed font-serif italic line-clamp-2 sm:line-clamp-none">
                  {story.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border text-xs font-bold text-[#C8893F]">
                <span>Read Story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
