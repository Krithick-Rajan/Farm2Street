"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sprout, Zap, ShieldCheck } from "lucide-react";

export interface FarmHeroProps {
  imageSrc?: string;
  videoSrc?: string;
  posterSrc?: string;
  title?: string;
  scrollHint?: string;
  tagline?: string;
  signature?: { name: string; url: string } | false;
  /** Total input distance (px) needed to scrub the full experience. Tune to taste. */
  scrubDistance?: number;
  className?: string;
  style?: React.CSSProperties;
  onScrubComplete?: () => void;
}

const DEFAULT_IMAGE = "./images/hero-wheat.jpg";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=85";
const DEFAULT_SIGNATURE = { name: "Farm2Street.in", url: "#marketplace" };

const SANS = '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const COL_BG = "#07100b";
const COL_TEXT = "#f5f4ee";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function FarmHero({
  imageSrc = DEFAULT_IMAGE,
  videoSrc,
  posterSrc,
  title = "FROM FARM",
  scrollHint = "SCROLL TO HARVEST",
  tagline = "TO STREET — Fresh harvests from nearby farms.",
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

  // Expose smooth scroll function so users can skip or continue anytime
  const unlockAndScroll = () => {
    const target = document.getElementById("marketplace") || document.getElementById("fresh-harvests");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    let targetProgress = 0;
    let currentProgress = 0;
    let isRunning = false;

    function updateVisuals(p: number) {
      // Smooth golden wheat image subtle scale
      if (imageRef.current) {
        const scale = 1 + p * 0.06;
        imageRef.current.style.transform = `scale(${scale})`;
      }

      // 1. Opening Title ("FROM FARM") fade out + upward drift + blur
      if (titleRef.current) {
        const t = 1 - clamp(p / 0.36, 0, 1);
        titleRef.current.style.opacity = String(t);
        titleRef.current.style.transform = `translateY(${(1 - t) * -32}px) scale(${0.94 + t * 0.06})`;
        titleRef.current.style.filter = `blur(${(1 - t) * 12}px)`;
      }

      // 2. Midpoint Transition Waypoint (32% to 68%)
      if (waypointRef.current) {
        let midOpacity = 0;
        if (p >= 0.30 && p <= 0.70) {
          if (p < 0.5) {
            midOpacity = (p - 0.30) / 0.20;
          } else {
            midOpacity = (0.70 - p) / 0.20;
          }
        }
        waypointRef.current.style.opacity = String(clamp(midOpacity, 0, 1));
        waypointRef.current.style.transform = `translateY(${(1 - midOpacity) * 12}px) scale(${0.96 + midOpacity * 0.04})`;
      }

      // 3. Scroll hint indicator
      if (hintRef.current) {
        hintRef.current.style.opacity = p > 0.05 ? "0" : "1";
      }

      // 4. Climax Payoff Reveal ("TO STREET")
      if (taglineRef.current) {
        const t = clamp((p - 0.68) / 0.32, 0, 1);
        taglineRef.current.style.opacity = String(t);
        taglineRef.current.style.transform = `translateY(${(1 - t) * 24}px) scale(${0.95 + t * 0.05})`;
        taglineRef.current.style.filter = `blur(${(1 - t) * 8}px)`;
      }

      // 5. Progress bar & percentage counter
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`;
      }
      if (progressTextRef.current) {
        const pct = Math.round(p * 100);
        progressTextRef.current.textContent = `${pct}% HARVEST JOURNEY`;
      }
    }

    function wakeUpLoop() {
      if (!isRunning && !reduceMotion) {
        isRunning = true;
        rafId = requestAnimationFrame(frame);
      }
    }

    function frame() {
      const delta = targetProgress - currentProgress;
      if (Math.abs(delta) < 0.001) {
        currentProgress = targetProgress;
        updateVisuals(currentProgress);
        isRunning = false;
        return;
      }

      currentProgress += delta * 0.22;
      updateVisuals(currentProgress);
      rafId = requestAnimationFrame(frame);
    }

    // Natural window scroll observer (100% passive, zero layout locks)
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const h = window.innerHeight;
      if (rect.bottom > 0 && rect.top < h) {
        const p = clamp(-rect.top / (rect.height * 0.75), 0, 1);
        targetProgress = p;
        wakeUpLoop();
        if (p >= 0.95 && onScrubComplete) {
          onScrubComplete();
        }
      }
    };

    // Smooth wheel assistance at the top of the page (completely passive)
    const onWheel = (e: WheelEvent) => {
      if (window.scrollY <= 15) {
        targetProgress = clamp(targetProgress + e.deltaY / (scrubDistance * 0.5), 0, 1);
        wakeUpLoop();
        if (targetProgress >= 0.95 && onScrubComplete) {
          onScrubComplete();
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    // Initial check
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(rafId);
    };
  }, [scrubDistance, onScrubComplete]);

  return (
    <div
      ref={sectionRef}
      className={`relative h-[100svh] min-h-[580px] w-full overflow-hidden select-none ${className || ""}`}
      style={{
        background: COL_BG,
        touchAction: "pan-y",
        ...style,
      }}
    >
      {/* Pristine Golden Wheat Field Background (Exact UI/UX Theme from Image 1) */}
      <img
        ref={imageRef}
        src={finalImage}
        alt="Harvest Farm Golden Wheat Field"
        loading="eager"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transformOrigin: "center center",
          willChange: "transform",
          transition: "transform 0.08s ease-out",
          touchAction: "none",
          pointerEvents: "none",
        }}
        onError={(e) => {
          if (e.currentTarget.src !== FALLBACK_IMAGE) {
            e.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
      />

      {/* Atmospheric Sunrise & Organic Vignette Overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 75% 25%, rgba(220, 165, 80, 0.22) 0%, transparent 60%), linear-gradient(180deg, rgba(7,16,11,0.55) 0%, rgba(7,16,11,0.12) 35%, rgba(7,16,11,0.45) 70%, rgba(7,16,11,0.92) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top Left Organic Brand Pill */}
      <div
        style={{
          position: "absolute",
          top: "clamp(20px, 3vh, 36px)",
          left: "clamp(20px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          borderRadius: "9999px",
          background: "rgba(18, 36, 23, 0.65)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(197, 168, 128, 0.25)",
          color: "#c5a880",
          fontFamily: SANS,
          fontSize: "clamp(10px, 1.1vw, 12px)",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          zIndex: 25,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
        <span>DIRECT HARVEST PROTOCOL</span>
      </div>

      {/* Top Right Skip to Market Button */}
      <button
        onClick={unlockAndScroll}
        style={{
          position: "absolute",
          top: "clamp(20px, 3vh, 36px)",
          right: "clamp(20px, 4vw, 48px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 16px",
          borderRadius: "9999px",
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          color: "#f5f4ee",
          fontFamily: SANS,
          fontSize: "clamp(11px, 1.1vw, 13px)",
          fontWeight: 600,
          letterSpacing: "0.05em",
          cursor: "pointer",
          transition: "all 0.2s ease",
          zIndex: 25,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(197, 168, 128, 0.35)";
          e.currentTarget.style.borderColor = "#c5a880";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.25)";
        }}
      >
        <span>Skip to Market</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </button>

      {/* 1. Opening Title Scene ("FROM FARM") */}
      <div
        ref={titleRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6%",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(18, 36, 23, 0.5)",
            backdropFilter: "blur(8px)",
            padding: "6px 18px",
            borderRadius: "9999px",
            border: "1px solid rgba(197, 168, 128, 0.3)",
            marginBottom: "16px",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: "clamp(11px, 1.3vw, 14px)",
              fontWeight: 700,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#c5a880",
            }}
          >
            VERIFIED LOCAL & REGIONAL GROWERS
          </span>
        </div>

        <h1
          style={{
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: "clamp(38px, 11vw, 140px)",
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            color: COL_TEXT,
            textShadow: "0 8px 48px rgba(0,0,0,0.75)",
            margin: 0,
            textTransform: "uppercase",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: SANS,
            fontSize: "clamp(14px, 1.8vw, 20px)",
            color: "rgba(245, 244, 238, 0.85)",
            marginTop: "20px",
            maxWidth: "640px",
            lineHeight: 1.5,
            fontWeight: 400,
          }}
        >
          Harvested at sunrise across local sustainable farms. Zero middlemen, zero chemical cold-room ripening.
        </p>

        {/* Agricultural Highlights Pill Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          {[
            { icon: Sprout, label: "100% Residue-Tested" },
            { icon: Zap, label: "8-Hour Farm-to-Kitchen" },
            { icon: ShieldCheck, label: "QR Batch Provenance" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={i}
                style={{
                  fontFamily: SANS,
                  fontSize: "clamp(11px, 1.1vw, 13px)",
                  fontWeight: 600,
                  color: "#e8ede0",
                  background: "rgba(7, 16, 11, 0.65)",
                  backdropFilter: "blur(6px)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Icon style={{ width: "14px", height: "14px", color: "#c5a880" }} />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 2. Midpoint Transition Waypoint Scene */}
      <div
        ref={waypointRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 8%",
          textAlign: "center",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "rgba(7, 16, 11, 0.75)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(197, 168, 128, 0.4)",
            borderRadius: "24px",
            padding: "clamp(24px, 4vw, 40px)",
            maxWidth: "760px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          }}
        >
          <span
            style={{
              fontFamily: SANS,
              fontSize: "clamp(11px, 1.2vw, 13px)",
              fontWeight: 700,
              letterSpacing: "0.28em",
              color: "#c5a880",
              textTransform: "uppercase",
            }}
          >
            FIELD TO TABLE SPEEDWAY
          </span>
          <h2
            style={{
              fontFamily: SANS,
              fontSize: "clamp(28px, 4.5vw, 56px)",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              margin: "12px 0 16px 0",
              lineHeight: 1.1,
            }}
          >
            Cut at 5:00 AM. On Your Kitchen Counter by Afternoon.
          </h2>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(13px, 1.4vw, 16px)",
              color: "rgba(245, 244, 238, 0.8)",
              margin: 0,
            }}
          >
            Every harvest crate is digitally tagged with GPS, soil harvest timestamp, and pesticide laboratory report before departure.
          </p>
        </div>
      </div>

      {/* 3. Climax Payoff Reveal ("TO STREET") */}
      {tagline && (
        <div
          ref={taglineRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8%",
            textAlign: "center",
            opacity: 0,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "9999px",
              background: "rgba(197, 168, 128, 0.2)",
              border: "1px solid rgba(197, 168, 128, 0.4)",
              color: "#c5a880",
              fontFamily: SANS,
              fontSize: "clamp(11px, 1.2vw, 13px)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              marginBottom: "16px",
            }}
          >
            <span>DISPATCH COMPLETE</span>
          </div>

          <span
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: "clamp(34px, 6.5vw, 84px)",
              lineHeight: 1.0,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              textShadow: "0 6px 36px rgba(0,0,0,0.85)",
              maxWidth: "1000px",
              textTransform: "uppercase",
            }}
          >
            {tagline}
          </span>
          <p
            style={{
              fontFamily: SANS,
              fontSize: "clamp(14px, 1.8vw, 20px)",
              color: "rgba(245,244,238,0.88)",
              marginTop: "16px",
              maxWidth: "680px",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            No distributors, zero multi-tier markups. Farmers earn 80%+ of retail while you enjoy nutrient-dense fresh produce.
          </p>

          {/* Interactive Hero CTAs */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "center",
              marginTop: "32px",
            }}
          >
            <button
              onClick={unlockAndScroll}
              style={{
                fontFamily: SANS,
                fontSize: "clamp(14px, 1.2vw, 16px)",
                fontWeight: 700,
                color: "#183c2a",
                background: "#faf9f1",
                padding: "14px 32px",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.background = "#eef3e8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1.0)";
                e.currentTarget.style.background = "#faf9f1";
              }}
            >
              <span>Explore Fresh Harvests</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </button>

            <a
              href="#traceability"
              onClick={(e) => {
                e.preventDefault();
                unlockAndScroll();
                const elem = document.getElementById("traceability");
                if (elem) elem.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: SANS,
                fontSize: "clamp(14px, 1.2vw, 16px)",
                fontWeight: 600,
                color: "#ffffff",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                padding: "14px 28px",
                borderRadius: "9999px",
                border: "1px solid rgba(255, 255, 255, 0.28)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)";
                e.currentTarget.style.borderColor = "#c5a880";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.28)";
              }}
            >
              <span>Verify Batch QR</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Scroll indicator hint with bouncing harvest icon */}
      <div
        ref={hintRef}
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(24px, 5vh, 48px)",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          color: "rgba(245,244,238,0.85)",
          fontFamily: SANS,
          fontSize: "clamp(10px, 1.2vw, 12px)",
          fontWeight: 700,
          letterSpacing: "0.26em",
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        <span>{scrollHint}</span>
        <svg width="16" height="22" viewBox="0 0 16 22" style={{ animation: "farm-hero-bounce 1.6s ease-in-out infinite" }}>
          <style>{`
            @keyframes farm-hero-bounce {
              0%, 100% { transform: translateY(0); opacity: 0.6; }
              50% { transform: translateY(6px); opacity: 1; }
            }
          `}</style>
          <path d="M8 1 L8 21 M3 15 L8 21 L13 15" stroke="#c5a880" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Scrub timeline progress line with agricultural gradient */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 4,
          background: "rgba(255,255,255,0.14)",
          zIndex: 30,
        }}
      >
        <div
          ref={progressBarRef}
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, #52796f 0%, #c5a880 50%, #e9edc9 100%)",
            transform: "scaleX(0)",
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* Live Timeline Journey Indicator */}
      <div
        style={{
          position: "absolute",
          left: "clamp(16px, 3vw, 32px)",
          bottom: "clamp(12px, 2.5vw, 24px)",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: "clamp(10px, 1.1vw, 12px)",
          letterSpacing: "0.15em",
          color: "rgba(197, 168, 128, 0.8)",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <span ref={progressTextRef}>0% HARVEST JOURNEY</span>
      </div>

      {signature && (
        <span
          style={{
            position: "absolute",
            right: "clamp(16px, 3vw, 32px)",
            bottom: "clamp(12px, 2.5vw, 24px)",
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: "clamp(11px, 1.2vw, 13px)",
            letterSpacing: "0.04em",
            color: "rgba(245,244,238,0.6)",
            zIndex: 30,
          }}
        >
          <a
            href={signature.url}
            style={{
              color: "rgba(245,244,238,0.6)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#c5a880";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(245,244,238,0.6)";
            }}
          >
            {signature.name}
          </a>
        </span>
      )}
    </div>
  );
}
