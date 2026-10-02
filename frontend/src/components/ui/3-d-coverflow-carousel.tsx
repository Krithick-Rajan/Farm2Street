"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

// Inline Icons (Zero external dependencies)
const ChevronLeftIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export interface CarouselItem {
  tag?: string;
  titleLine1: string;
  titleLine2?: string;
  desc?: string;
  img: string;
  ctaText?: string;
  ctaUrl?: string;
}

export interface CoverFlowCarouselProps {
  items?: CarouselItem[];
  sectionLabel?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  onCtaClick?: (item: CarouselItem) => void;
}

export const defaultDishes: CarouselItem[] = [
  {
    tag: "#FarmHarvest",
    titleLine1: "HEIRLOOM TOMATOES",
    titleLine2: "– DEW PICKED",
    desc: "Naturally trellis-ripened with vibrant acidity and sweet juicy flesh",
    img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    ctaText: "Add To Cart",
    ctaUrl: "#",
  },
  {
    tag: "#ChefChoice",
    titleLine1: "OYSTER MUSHROOMS",
    titleLine2: "– SHROOMLOG CRAFT",
    desc: "Delicate forest-style cluster mushrooms grown in misted organic straw",
    img: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=800&q=80",
    ctaText: "Add To Cart",
    ctaUrl: "#",
  },
  {
    tag: "#RootVegetable",
    titleLine1: "SWEET CARROTS",
    titleLine2: "– CLAY ROAST GRADE",
    desc: "Crisp alluvial soil carrots washed pure with deep mineral borewell water",
    img: "https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=900&q=85",
    ctaText: "Add To Cart",
    ctaUrl: "#",
  },
  {
    tag: "#FreshGreens",
    titleLine1: "MALABAR SPINACH",
    titleLine2: "– MORNING CUT",
    desc: "Lush tender leaves packed with plant iron, harvested at sunrise",
    img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80",
    ctaText: "Add To Cart",
    ctaUrl: "#",
  },
  {
    tag: "#GreenhousePick",
    titleLine1: "BELL PEPPERS",
    titleLine2: "– TRICOLOR SWEET",
    desc: "Thick-walled crunchy peppers naturally protected inside aerated shade nets",
    img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80",
    ctaText: "Add To Cart",
    ctaUrl: "#",
  },
];

export function CoverFlowCarousel({
  items = defaultDishes,
  sectionLabel = "FRESH HARVEST DISCOVERY",
  autoplay = true,
  autoplayDelay = 4500,
  className = "",
  onCtaClick,
}: CoverFlowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const containerRef = useRef<HTMLElement | null>(null);
  const pointerStartX = useRef(0);
  const pointerStartY = useRef(0);
  const isPointerDown = useRef(false);
  const hasDragged = useRef(false);
  const lastWheelTime = useRef<number>(0);
  const total = items.length;

  useEffect(() => {
    const updateDimensions = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions, { passive: true });
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((idx: number) => {
    setCurrentIndex(idx % total);
  }, [total]);

  useEffect(() => {
    if (!autoplay || isHovered || isDragging || total <= 1) return;
    const interval = setInterval(nextSlide, autoplayDelay);
    return () => clearInterval(interval);
  }, [autoplay, autoplayDelay, isHovered, isDragging, nextSlide, total]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touchpad / Mousepad 2-finger sweep listener (Wheel deltaX)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaX;
      const dy = e.deltaY;
      const isHorizontal = Math.abs(dx) > Math.abs(dy);

      if (isHorizontal && Math.abs(dx) > 16) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime.current > 360) {
          lastWheelTime.current = now;
          if (dx > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      } else if (e.shiftKey && Math.abs(dy) > 16) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastWheelTime.current > 360) {
          lastWheelTime.current = now;
          if (dy > 0) {
            nextSlide();
          } else {
            prevSlide();
          }
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [nextSlide, prevSlide]);

  // Pointer drag & mousepad click-sweep support with pointer capture
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    pointerStartX.current = e.clientX;
    pointerStartY.current = e.clientY;
    isPointerDown.current = true;
    hasDragged.current = false;
    setDragOffset(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore in environments without capture support
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPointerDown.current) return;
    const diffX = e.clientX - pointerStartX.current;
    if (Math.abs(diffX) > 8) {
      hasDragged.current = true;
      setIsDragging(true);
      setDragOffset(diffX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPointerDown.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    const diffX = e.clientX - pointerStartX.current;
    isPointerDown.current = false;
    setIsDragging(false);
    setDragOffset(0);

    if (Math.abs(diffX) > 35) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTimeout(() => {
      hasDragged.current = false;
    }, 60);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPointerDown.current) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    isPointerDown.current = false;
    setIsDragging(false);
    setDragOffset(0);
    hasDragged.current = false;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!items || items.length === 0) return null;

  return (
    <section
      ref={containerRef}
      className={`relative w-full min-h-[760px] flex items-center justify-center overflow-hidden py-12 select-none ${className}`}
      style={{
        backgroundColor: "#07100b",
        color: "#ffffff",
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "pan-y",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src={items[currentIndex]?.img}
          alt="ambience background"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85";
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.18) blur(36px)",
            transform: "scale(1.15)",
            transition: "opacity 1000ms ease, filter 1000ms ease",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, rgba(7,16,11,0.4) 0%, rgba(7,16,11,0.95) 100%)",
          }}
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 z-10 flex flex-col items-center">
        {/* Eyebrow */}
        {sectionLabel && (
          <div className="flex items-center gap-3 mb-8">
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, transparent, #c5a880)" }} />
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#c5a880",
                margin: 0,
              }}
            >
              {sectionLabel}
            </h3>
            <span style={{ width: "36px", height: "1px", background: "linear-gradient(90deg, #c5a880, transparent)" }} />
          </div>
        )}

        {/* 3D Coverflow Stage */}
        <div
          className="relative w-full flex justify-center items-center mb-8"
          style={{
            height: isMobile ? "440px" : isTablet ? "480px" : "520px",
            perspective: isMobile ? "800px" : "1400px",
            transform: dragOffset !== 0 ? `translateX(${dragOffset * 0.35}px)` : undefined,
            transition: isDragging ? "none" : "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {items.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;

            const cardWidth = isMobile ? 280 : isTablet ? 305 : 330;
            const cardHeight = isMobile ? 420 : isTablet ? 460 : 500;
            const off1X = isMobile ? 120 : isTablet ? 210 : 285;
            const off2X = isMobile ? 200 : isTablet ? 380 : 510;

            let transform = "translateX(0px) scale(0.4) rotateY(0deg)";
            let opacity = 0;
            let zIndex = 0;
            let filter = "brightness(0.4) blur(2px)";
            let isCenter = false;

            if (offset === 0) {
              isCenter = true;
              transform = "translateX(0px) scale(1) rotateY(0deg)";
              opacity = 1;
              zIndex = 30;
              filter = "brightness(1)";
            } else if (offset === 1) {
              transform = `translateX(${off1X}px) scale(${isMobile ? 0.8 : 0.84}) rotateY(-24deg)`;
              opacity = isMobile ? 0.35 : 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === 2) {
              transform = `translateX(${off2X}px) scale(${isMobile ? 0.6 : 0.68}) rotateY(-38deg)`;
              opacity = isMobile ? 0 : 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            } else if (offset === total - 1) {
              transform = `translateX(-${off1X}px) scale(${isMobile ? 0.8 : 0.84}) rotateY(24deg)`;
              opacity = isMobile ? 0.35 : 0.65;
              zIndex = 20;
              filter = "brightness(0.75)";
            } else if (offset === total - 2) {
              transform = `translateX(-${off2X}px) scale(${isMobile ? 0.6 : 0.68}) rotateY(38deg)`;
              opacity = isMobile ? 0 : 0.38;
              zIndex = 10;
              filter = "brightness(0.55) blur(1px)";
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!hasDragged.current && !isCenter) {
                    goToSlide(idx);
                  }
                }}
                style={{
                  position: "absolute",
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  borderRadius: "18px",
                  overflow: "hidden",
                  backgroundColor: "#111813",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  transform,
                  opacity,
                  zIndex,
                  filter,
                  transformOrigin: "center center",
                  transition: "all 800ms cubic-bezier(0.25, 1, 0.5, 1)",
                  boxShadow: isCenter
                    ? "0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(197,168,128,0.25)"
                    : "0 15px 35px rgba(0,0,0,0.5)",
                  cursor: isDragging ? "grabbing" : isCenter ? "grab" : "pointer",
                }}
              >
                {/* Photo */}
                <img
                  src={item.img}
                  alt={item.titleLine1}
                  draggable={false}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85";
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                  }}
                />

                {/* Dark Vignette Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(7,16,11,0.3) 0%, rgba(7,16,11,0.1) 25%, rgba(7,16,11,0.7) 60%, rgba(7,16,11,0.98) 100%)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                {/* Content Overlay */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    padding: "20px 18px 22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    textAlign: "center",
                    zIndex: 20,
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? "translateY(0px)" : "translateY(16px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                    pointerEvents: isCenter ? "auto" : "none",
                  }}
                >
                  {/* Tag */}
                  <div style={{ textAlign: "right", width: "100%", paddingRight: "4px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                      }}
                    >
                      {item.tag}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "3px",
                      marginTop: "auto",
                      paddingBottom: "4px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "1.65rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        color: "#ffffff",
                        margin: 0,
                        lineHeight: 1.1,
                        textShadow: "0 3px 12px rgba(0,0,0,0.95)",
                      }}
                    >
                      {item.titleLine1}
                    </h2>

                    {item.titleLine2 && (
                      <span
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#f3f0ea",
                          lineHeight: 1.2,
                          textShadow: "0 3px 10px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.titleLine2}
                      </span>
                    )}

                    <div
                      style={{
                        width: "34px",
                        height: "2px",
                        backgroundColor: "#c5a880",
                        borderRadius: "2px",
                        margin: "5px auto 4px",
                        boxShadow: "0 0 8px rgba(197,168,128,0.7)",
                      }}
                    />

                    {item.desc && (
                      <p
                        style={{
                          fontSize: "0.82rem",
                          fontStyle: "italic",
                          color: "rgba(255,255,255,0.9)",
                          maxWidth: "280px",
                          margin: "0 0 10px",
                          lineHeight: 1.3,
                          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                        }}
                      >
                        {item.desc}
                      </p>
                    )}

                    <a
                      href={item.ctaUrl || "#"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (hasDragged.current) {
                          e.preventDefault();
                          return;
                        }
                        if (onCtaClick) {
                          e.preventDefault();
                          onCtaClick(item);
                        }
                      }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 18px",
                        borderRadius: "9999px",
                        background: "linear-gradient(135deg, #c5a880 0%, #a48256 100%)",
                        color: "#110d0c",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.4), 0 0 15px rgba(197,168,128,0.3)",
                        cursor: "pointer",
                        transition: "transform 200ms ease, box-shadow 200ms ease",
                      }}
                    >
                      <span>{item.ctaText || "View Produce"}</span>
                      <ArrowRightIcon />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous produce"
          style={{
            position: "absolute",
            left: isMobile ? "8px" : "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: isMobile ? "44px" : "50px",
            height: isMobile ? "44px" : "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(18, 36, 23, 0.8)",
            border: "1.5px solid rgba(197, 168, 128, 0.5)",
            color: "#f5f4ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            zIndex: 50,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(197, 168, 128, 0.35)";
            e.currentTarget.style.borderColor = "#c5a880";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(18, 36, 23, 0.8)";
            e.currentTarget.style.borderColor = "rgba(197, 168, 128, 0.5)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.0)";
          }}
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next produce"
          style={{
            position: "absolute",
            right: isMobile ? "8px" : "20px",
            top: "50%",
            transform: "translateY(-50%)",
            width: isMobile ? "44px" : "50px",
            height: isMobile ? "44px" : "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(18, 36, 23, 0.8)",
            border: "1.5px solid rgba(197, 168, 128, 0.5)",
            color: "#f5f4ee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            zIndex: 50,
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(197, 168, 128, 0.35)";
            e.currentTarget.style.borderColor = "#c5a880";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(18, 36, 23, 0.8)";
            e.currentTarget.style.borderColor = "rgba(197, 168, 128, 0.5)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.0)";
          }}
        >
          <ChevronRightIcon />
        </button>

        {/* Pagination Dots */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", zIndex: 30 }}
        >
          {items.map((_, idx) => (
            <button
              key={idx}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                height: "8px",
                width: idx === currentIndex ? "28px" : "8px",
                borderRadius: "9999px",
                backgroundColor: idx === currentIndex ? "#c5a880" : "rgba(255,255,255,0.25)",
                border: "none",
                cursor: "pointer",
                boxShadow: idx === currentIndex ? "0 0 10px rgba(197,168,128,0.7)" : "none",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>

        {/* Mouse Pad / Sweep Gesture Affordance */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mt-4 text-[11px] font-medium uppercase tracking-wider text-stone-400 select-none opacity-75"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Trackpad sweep &bull; Drag &bull; Arrow keys</span>
        </div>
      </div>
    </section>
  );
}

export const Component = CoverFlowCarousel;
export default CoverFlowCarousel;
