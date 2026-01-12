'use client';

import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import VetalGhost from './VetalGhost';

export default function AnnouncementBanner() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const fadeStart = 0;
      const fadeEnd = 300;

      if (scrollPosition <= fadeStart) {
        setScrollOpacity(1);
      } else if (scrollPosition >= fadeEnd) {
        setScrollOpacity(0);
      } else {
        const opacity = 1 - (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        setScrollOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (scrollOpacity === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-3xl animate-slideDown transition-opacity duration-300"
      style={{ opacity: scrollOpacity }}
    >
      <a
        href="/hackiiit"
        className="block bg-green-500/10 backdrop-blur-md border border-green-400/40 rounded-full px-6 py-3 shadow-lg shadow-green-500/20 hover:bg-green-500/15 hover:border-green-400/60 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10">
              <VetalGhost className="w-full h-full" />
            </div>
            <p className="text-sm md:text-base text-white font-oxanium font-semibold tracking-wide">
              <span className="text-green-400">HackIIIT 2026:</span> <span className="text-gray-300 font-normal">Yes, IIIT is looking up to you to make it better. Don&apos;t disappoint.</span>
            </p>
          </div>

          <div className="flex items-center flex-shrink-0">
            <ArrowRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </a>
    </div>
  );
}
