import React, { useEffect, useRef, useState } from 'react';
import { Sprout, Zap, ShieldCheck, ChevronDown, Check } from 'lucide-react';

/* =========================================================================
   1. TRAILING CURSOR (Interactive 2D Canvas Cursor Tracker)
   ========================================================================= */

interface Point {
  x: number;
  y: number;
}

export function TrailingCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Disable on mobile/touch devices or small screen widths or reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      if (window.innerWidth < 768) {
        ctx.clearRect(0, 0, width, height);
        return;
      }
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const mouse = { x: width / 2, y: height / 2, active: false };
    const TRAIL_LENGTH = 14;
    const trail: Point[] = Array.from({ length: TRAIL_LENGTH }, () => ({
      x: width / 2,
      y: height / 2,
    }));

    let animationFrameId: number | null = null;
    let isAnimating = false;

    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      startAnimation();
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let maxDiff = 0;

      if (mouse.active) {
        // Smoothly interpolate points toward target
        const d0x = (mouse.x - trail[0].x) * 0.38;
        const d0y = (mouse.y - trail[0].y) * 0.38;
        trail[0].x += d0x;
        trail[0].y += d0y;
        maxDiff = Math.max(maxDiff, Math.abs(d0x), Math.abs(d0y));

        for (let i = 1; i < TRAIL_LENGTH; i++) {
          const dix = (trail[i - 1].x - trail[i].x) * 0.42;
          const diy = (trail[i - 1].y - trail[i].y) * 0.42;
          trail[i].x += dix;
          trail[i].y += diy;
          maxDiff = Math.max(maxDiff, Math.abs(dix), Math.abs(diy));
        }

        // Draw soft glow under primary cursor
        const gradient = ctx.createRadialGradient(
          trail[0].x,
          trail[0].y,
          0,
          trail[0].x,
          trail[0].y,
          14
        );
        gradient.addColorStop(0, 'rgba(197, 168, 128, 0.4)');
        gradient.addColorStop(1, 'rgba(24, 60, 42, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(trail[0].x, trail[0].y, 14, 0, Math.PI * 2);
        ctx.fill();

        // Draw connected spline/trail
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < TRAIL_LENGTH; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = 'rgba(197, 168, 128, 0.25)';
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw trailing dots with fading opacity
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          const ratio = (TRAIL_LENGTH - i) / TRAIL_LENGTH;
          const radius = i === 0 ? 3.2 : Math.max(1, 2.5 * ratio);
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
          ctx.fillStyle =
            i === 0
              ? 'rgba(24, 60, 42, 0.9)'
              : `rgba(197, 168, 128, ${0.4 * ratio})`;
          ctx.fill();
        }
      }

      // If trail has settled and mouse is not moving, stop RAF to conserve CPU/GPU
      if (maxDiff < 0.2 && mouse.active) {
        isAnimating = false;
        animationFrameId = null;
        return;
      }

      if (mouse.active) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        isAnimating = false;
        animationFrameId = null;
      }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
    />
  );
}

/* =========================================================================
   2. CUSTOM SELECT DROPDOWN COMPONENT
   ========================================================================= */

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-lg',
    md: 'h-11 sm:h-12 px-3.5 text-xs sm:text-[13px] rounded-xl',
    lg: 'h-13 px-4 text-sm rounded-xl',
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full ${sizeClasses[size]} flex items-center justify-between border bg-white font-medium text-[#182019] outline-none transition-all shadow-2xs ${
          isOpen
            ? 'border-[#183c2a] ring-2 ring-[#183c2a]/20'
            : 'border-[#183c2a]/20 hover:border-[#183c2a]/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-stone-50' : 'cursor-pointer'}`}
      >
        <span
          className={`truncate text-left ${
            !selectedOption ? 'text-stone-400 font-normal' : 'font-semibold text-[#182019]'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#183c2a] shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'opacity-70'
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-[#183c2a]/15 bg-white py-1.5 shadow-[0_12px_30px_rgba(24,60,42,0.12)] transition-all">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-[13px] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#183c2a] text-white font-bold'
                    : 'text-[#182019] hover:bg-[#dfe8d7]/50 hover:text-[#183c2a]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#c5a880] shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   3. FARM HERO (Interactive Cinematic Scrub Hero)
   ========================================================================= */

export interface FarmHeroProps {
  imageSrc?: string;
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  scrollHint?: string;
  tagline?: string;
  signature?: { name: string; url: string } | false;
  scrubDistance?: number;
  className?: string;
  style?: React.CSSProperties;
  onScrubComplete?: () => void;
}

const DEFAULT_IMAGE = '/images/hero-wheat.jpg';
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=85';
const DEFAULT_SIGNATURE = { name: 'Farm2Street.in', url: '#marketplace' };

const SANS = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const COL_BG = '#07100b';
const COL_TEXT = '#f5f4ee';

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function FarmHero({
  imageSrc = DEFAULT_IMAGE,
  videoSrc,
  posterSrc,
  title = 'FROM FARM',
  scrollHint = 'SCROLL TO HARVEST',
  tagline = 'TO STREET — Fresh harvests from nearby farms.',
  signature = DEFAULT_SIGNATURE,
  scrubDistance = 2200,
  className,
  style,
  onScrubComplete,
}: FarmHeroProps) {
  const finalImage = posterSrc || imageSrc || DEFAULT_IMAGE;
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const waypointRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);

  const releaseLockRef = useRef<() => void>(() => {});

  const unlockAndScroll = () => {
    releaseLockRef.current();
    const target =
      document.getElementById('fresh-harvests') || document.getElementById('marketplace');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let hasStartedScrolling = false;
    let locked = false;
    let lockedScrollY = 0;
    let touchStartY = 0;

    let isRunning = false;

    function engageLock() {
      if (locked || typeof document === 'undefined') return;
      locked = true;
      lockedScrollY = window.scrollY;
      const b = document.body.style;
      b.position = 'fixed';
      b.top = `-${lockedScrollY}px`;
      b.left = '0';
      b.right = '0';
      b.width = '100%';
      b.height = '100%';
      b.overscrollBehavior = 'none';
    }

    function releaseLock() {
      if (!locked || typeof document === 'undefined') return;
      locked = false;
      const y = lockedScrollY;
      const b = document.body.style;
      b.position = '';
      b.top = '';
      b.left = '';
      b.right = '';
      b.width = '';
      b.height = '';
      b.overscrollBehavior = '';
      window.scrollTo(0, y);
    }

    releaseLockRef.current = releaseLock;

    if (window.scrollY <= 10) {
      engageLock();
    }

    function wakeUpLoop() {
      if (!isRunning && !reduceMotion) {
        isRunning = true;
        rafId = requestAnimationFrame(frame);
      }
    }

    function updateVisuals(p: number) {
      if (imageRef.current) {
        const scale = 1 + p * 0.06;
        imageRef.current.style.transform = `scale(${scale})`;
      }

      if (titleRef.current) {
        const t = 1 - clamp(p / 0.35, 0, 1);
        titleRef.current.style.opacity = String(t);
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px) scale(${0.96 + t * 0.04})`;
        titleRef.current.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      }

      if (waypointRef.current) {
        let midOpacity = 0;
        if (p >= 0.26 && p <= 0.72) {
          if (p < 0.48) {
            midOpacity = (p - 0.26) / 0.22;
          } else {
            midOpacity = (0.72 - p) / 0.24;
          }
        }
        waypointRef.current.style.opacity = String(clamp(midOpacity, 0, 1));
        waypointRef.current.style.transform = `translateY(${(1 - midOpacity) * 12}px) scale(${0.96 + midOpacity * 0.04})`;
      }

      if (hintRef.current) {
        hintRef.current.style.opacity = hasStartedScrolling ? '0' : '1';
      }

      if (taglineRef.current) {
        const t = clamp((p - 0.65) / 0.35, 0, 1);
        taglineRef.current.style.opacity = String(t);
        taglineRef.current.style.transform = `translateY(${(1 - t) * 16}px) scale(${0.96 + t * 0.04})`;
        taglineRef.current.style.pointerEvents = t > 0.5 ? 'auto' : 'none';
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`;
      }
      if (progressTextRef.current) {
        const pct = Math.round(p * 100);
        progressTextRef.current.textContent = `${pct}% HARVEST JOURNEY`;
      }
    }

    function frame() {
      const delta = targetProgress - currentProgress;
      if (Math.abs(delta) < 0.0005) {
        currentProgress = targetProgress;
        updateVisuals(currentProgress);
        isRunning = false;
        return;
      }

      currentProgress += delta * 0.38;
      updateVisuals(currentProgress);
      rafId = requestAnimationFrame(frame);
    }

    function addDelta(deltaY: number) {
      if (targetProgress >= 0.98 && deltaY > 0) {
        releaseLock();
        const target =
          document.getElementById('fresh-harvests') || document.getElementById('marketplace');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
        }
        if (onScrubComplete) onScrubComplete();
        return false;
      }

      if (targetProgress <= 0.01 && deltaY < 0) {
        return false;
      }

      const next = clamp(targetProgress + deltaY / scrubDistance, 0, 1);
      targetProgress = next;
      if (targetProgress > 0.001) hasStartedScrolling = true;
      wakeUpLoop();
      return true;
    }

    const onWheel = (e: WheelEvent) => {
      if (!locked) {
        if (window.scrollY <= 5 && e.deltaY < 0) {
          engageLock();
          targetProgress = 1;
          currentProgress = 1;
          wakeUpLoop();
        }
        return;
      }
      const consumed = addDelta(e.deltaY);
      if (consumed) {
        e.preventDefault();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchStartY;
      const deltaY = touchStartY - y;
      touchStartY = y;
      if (!locked) {
        if (window.scrollY <= 5 && deltaY < 0) {
          engageLock();
          targetProgress = 1;
          currentProgress = 1;
          wakeUpLoop();
        }
        return;
      }
      const consumed = addDelta(deltaY);
      if (consumed) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    section.addEventListener('touchstart', onTouchStart, { passive: true, capture: true });
    section.addEventListener('touchmove', onTouchMove, { passive: false, capture: true });

    const onWindowScroll = () => {
      if (!locked && window.scrollY <= 5) {
        engageLock();
      }
    };
    window.addEventListener('scroll', onWindowScroll, { passive: true });

    wakeUpLoop();

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      section.removeEventListener('touchstart', onTouchStart, true);
      section.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('scroll', onWindowScroll);
      cancelAnimationFrame(rafId);
      releaseLock();
    };
  }, [scrubDistance, onScrubComplete]);

  return (
    <div
      ref={sectionRef}
      className={className}
      style={{
        position: 'relative',
        height: '100dvh',
        minHeight: '560px',
        width: '100%',
        overflow: 'hidden',
        background: COL_BG,
        touchAction: 'none',
        ...style,
      }}
    >
      <img
        ref={imageRef}
        src={finalImage}
        alt="Harvest Farm Golden Wheat Field"
        loading="eager"
        decoding="async"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transformOrigin: 'center center',
          willChange: 'transform',
          transition: 'transform 0.08s ease-out',
          touchAction: 'none',
          pointerEvents: 'none',
        }}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_IMAGE) {
            e.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 75% 25%, rgba(220, 165, 80, 0.22) 0%, transparent 60%), linear-gradient(180deg, rgba(7,16,11,0.55) 0%, rgba(7,16,11,0.12) 35%, rgba(7,16,11,0.45) 70%, rgba(7,16,11,0.92) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 'clamp(80px, 10vh, 108px)',
          left: 'clamp(20px, 4vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          background: 'rgba(18, 36, 23, 0.65)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(197, 168, 128, 0.25)',
          color: '#c5a880',
          fontFamily: SANS,
          fontSize: 'clamp(10px, 1.1vw, 12px)',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          zIndex: 25,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span>DIRECT HARVEST PROTOCOL</span>
      </div>

      <button
        onClick={unlockAndScroll}
        style={{
          position: 'absolute',
          top: 'clamp(80px, 10vh, 108px)',
          right: 'clamp(20px, 4vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 16px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#f5f4ee',
          fontFamily: SANS,
          fontSize: 'clamp(11px, 1.1vw, 13px)',
          fontWeight: 600,
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          zIndex: 25,
        }}
      >
        <span>Skip to Market</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </button>

      <div
        ref={titleRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 6%',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(18, 36, 23, 0.5)',
            backdropFilter: 'blur(8px)',
            padding: '6px 18px',
            borderRadius: '9999px',
            border: '1px solid rgba(197, 168, 128, 0.3)',
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(11px, 1.3vw, 14px)',
              fontWeight: 700,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: '#c5a880',
            }}
          >
            VERIFIED LOCAL & REGIONAL GROWERS
          </span>
        </div>

        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 'clamp(38px, 11vw, 140px)',
            lineHeight: 0.92,
            letterSpacing: '-0.04em',
            color: COL_TEXT,
            textShadow: '0 8px 48px rgba(0,0,0,0.75)',
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: SANS,
            fontSize: 'clamp(14px, 1.8vw, 20px)',
            color: 'rgba(245, 244, 238, 0.85)',
            marginTop: '20px',
            maxWidth: '640px',
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          Harvested at sunrise across local sustainable farms. Zero middlemen, zero chemical cold-room ripening.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '24px',
          }}
        >
          {[
            { icon: Sprout, label: '100% Residue-Tested' },
            { icon: Zap, label: '8-Hour Farm-to-Kitchen' },
            { icon: ShieldCheck, label: 'QR Batch Provenance' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={i}
                style={{
                  fontFamily: SANS,
                  fontSize: 'clamp(11px, 1.1vw, 13px)',
                  fontWeight: 600,
                  color: '#e8ede0',
                  background: 'rgba(7, 16, 11, 0.65)',
                  backdropFilter: 'blur(6px)',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon style={{ width: '14px', height: '14px', color: '#c5a880' }} />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div
        ref={waypointRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 8%',
          textAlign: 'center',
          opacity: 0,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(7, 16, 11, 0.75)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(197, 168, 128, 0.4)',
            borderRadius: '24px',
            padding: 'clamp(24px, 4vw, 40px)',
            maxWidth: '760px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(11px, 1.2vw, 13px)',
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: '#c5a880',
              textTransform: 'uppercase',
            }}
          >
            FIELD TO TABLE SPEEDWAY
          </span>
          <h2
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(28px, 4.5vw, 56px)',
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '12px 0 16px 0',
              lineHeight: 1.1,
            }}
          >
            Cut at 5:00 AM. On Your Kitchen Counter by Afternoon.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(13px, 1.4vw, 16px)',
              color: 'rgba(245, 244, 238, 0.8)',
              margin: 0,
            }}
          >
            Every harvest crate is digitally tagged with GPS, soil harvest timestamp, and pesticide laboratory report before departure.
          </p>
        </div>
      </div>

      {tagline && (
        <div
          ref={taglineRef}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8%',
            textAlign: 'center',
            opacity: 0,
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(197, 168, 128, 0.2)',
              border: '1px solid rgba(197, 168, 128, 0.4)',
              color: '#c5a880',
              fontFamily: SANS,
              fontSize: 'clamp(11px, 1.2vw, 13px)',
              fontWeight: 700,
              letterSpacing: '0.2em',
              marginBottom: '16px',
            }}
          >
            <span>DISPATCH COMPLETE</span>
          </div>

          <span
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 'clamp(34px, 6.5vw, 84px)',
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#ffffff',
              textShadow: '0 6px 36px rgba(0,0,0,0.85)',
              maxWidth: '1000px',
              textTransform: 'uppercase',
            }}
          >
            {tagline}
          </span>
          <p
            style={{
              fontFamily: SANS,
              fontSize: 'clamp(14px, 1.8vw, 20px)',
              color: 'rgba(245,244,238,0.88)',
              marginTop: '16px',
              maxWidth: '680px',
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            No distributors, zero multi-tier markups. Farmers earn 80%+ of retail while you enjoy nutrient-dense fresh produce.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              justifyContent: 'center',
              marginTop: '32px',
            }}
          >
            <button
              onClick={unlockAndScroll}
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                fontWeight: 700,
                color: '#183c2a',
                background: '#faf9f1',
                padding: '14px 32px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.25s ease',
              }}
            >
              <span>Explore Fresh Harvests</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </button>

            <a
              href="#traceability"
              onClick={(e) => {
                e.preventDefault();
                unlockAndScroll();
                const elem = document.getElementById('traceability');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                fontFamily: SANS,
                fontSize: 'clamp(14px, 1.2vw, 16px)',
                fontWeight: 600,
                color: '#ffffff',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '14px 28px',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.25s ease',
              }}
            >
              <span>Verify Batch QR</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </a>
          </div>
        </div>
      )}

      <div
        ref={hintRef}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 'clamp(24px, 5vh, 48px)',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          color: 'rgba(245,244,238,0.85)',
          fontFamily: SANS,
          fontSize: 'clamp(10px, 1.2vw, 12px)',
          fontWeight: 700,
          letterSpacing: '0.26em',
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      >
        <span>{scrollHint}</span>
        <svg
          width="16"
          height="22"
          viewBox="0 0 16 22"
          style={{ animation: 'farm-hero-bounce 1.6s ease-in-out infinite' }}
        >
          <style>{`
            @keyframes farm-hero-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.6; }
              50% { transform: translateY(6px); opacity: 1; }
            }
          `}</style>
          <path
            d="M8 1 L8 21 M3 15 L8 21 L13 15"
            stroke="#c5a880"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          background: 'rgba(255,255,255,0.14)',
          zIndex: 30,
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #52796f 0%, #c5a880 50%, #e9edc9 100%)',
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 'clamp(16px, 3vw, 32px)',
          bottom: 'clamp(12px, 2.5vw, 24px)',
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 'clamp(10px, 1.1vw, 12px)',
          letterSpacing: '0.15em',
          color: 'rgba(197, 168, 128, 0.8)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        <span ref={progressTextRef}>0% HARVEST JOURNEY</span>
      </div>

      {signature && (
        <span
          style={{
            position: 'absolute',
            right: 'clamp(16px, 3vw, 32px)',
            bottom: 'clamp(12px, 2.5vw, 24px)',
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 'clamp(11px, 1.2vw, 13px)',
            letterSpacing: '0.04em',
            color: 'rgba(245,244,238,0.6)',
            zIndex: 30,
          }}
        >
          <a
            href={signature.url}
            style={{
              color: 'rgba(245,244,238,0.6)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c5a880';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(245,244,238,0.6)';
            }}
          >
            {signature.name}
          </a>
        </span>
      )}
    </div>
  );
}

export default FarmHero;
