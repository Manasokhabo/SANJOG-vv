import React, { useState, useEffect, useRef } from 'react';
import { useCms } from '../context/CmsContext';
import { PageType } from './Navbar';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  PhoneCall
} from 'lucide-react';

interface HeroCarouselProps {
  onNavigate: (page: PageType) => void;
  onEnquireProduct: (productName: string) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate, onEnquireProduct }) => {
  const { heroSlides } = useCms();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const slideDuration = 4500; // 4.5 seconds per slide

  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [];

  // Smooth slide advance
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [slides.length, isPaused, slideDuration]);

  if (slides.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 40) {
      handleNext();
    }
    if (touchStartX.current - touchEndX.current < -40) {
      handlePrev();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-2 sm:my-4">
      <div
        className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center select-none group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Kinetic Horizontal Slide Track */}
        <div 
          className="absolute inset-0 flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id || idx}
                className="relative min-w-full w-full h-full shrink-0 flex items-center overflow-hidden"
              >
                {/* Background Image with Cinematic Subtle Contrast */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.1] transition-transform duration-[7000ms] ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                />

                {/* Scrim Gradient for Crystal-Clear Typography */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

                {/* Hero Slide Content */}
                <div className="relative max-w-4xl mx-auto px-6 sm:px-14 lg:px-20 w-full z-20 py-12 sm:py-16 pb-16 sm:pb-20 text-left">
                  <div className="space-y-4 max-w-2xl">
                    {/* Slide Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-slate-200 backdrop-blur-md shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                      <span className="font-semibold text-white tracking-wide">{slide.badge}</span>
                      <span className="text-slate-500">&middot;</span>
                      <span className="text-[11px] font-mono text-cyan-300">MoRTH Certified</span>
                    </div>

                    {/* Slide Title */}
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.14] font-display drop-shadow-xl">
                      {slide.title}{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-lime-400 block mt-1.5">
                        {slide.highlightText}
                      </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-sm lg:text-base text-slate-300 leading-relaxed font-normal drop-shadow-sm max-w-xl line-clamp-3 sm:line-clamp-none">
                      {slide.subtitle}
                    </p>

                    {/* Action Buttons - Clean, Spacious, Never Cut Off */}
                    <div className="flex flex-wrap items-center gap-3.5 pt-4">
                      <button
                        onClick={() => onNavigate(slide.primaryBtnAction)}
                        className="flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-lime-400 hover:from-cyan-300 hover:to-lime-300 rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        <span>{slide.primaryBtnText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onNavigate('contact')}
                        className="flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-xl transition-all whitespace-nowrap cursor-pointer backdrop-blur-md active:scale-95 shadow-md"
                      >
                        <PhoneCall className="w-4 h-4 text-cyan-400" />
                        <span>{slide.secondaryBtnText}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrows - Clean Floating Glass Rings */}
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Minimal Clean Slide Dots (No Extra Liners, No Extra Boxes) */}
        <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2 pointer-events-auto">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 h-1.5 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-sm'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Jump to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
