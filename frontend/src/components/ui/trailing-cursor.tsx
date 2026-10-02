"use client";

import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
}

export function TrailingCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Disable on mobile/touch devices or small screen widths or reduced motion
    const isTouch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
    window.addEventListener("resize", handleResize, { passive: true });

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

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });

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
        gradient.addColorStop(0, "rgba(197, 168, 128, 0.4)");
        gradient.addColorStop(1, "rgba(24, 60, 42, 0)");

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
        ctx.strokeStyle = "rgba(197, 168, 128, 0.25)";
        ctx.lineWidth = 2.0;
        ctx.lineCap = "round";
        ctx.stroke();

        // Draw trailing dots with fading opacity
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          const ratio = (TRAIL_LENGTH - i) / TRAIL_LENGTH;
          const radius = i === 0 ? 3.2 : Math.max(1, 2.5 * ratio);
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, radius, 0, Math.PI * 2);
          ctx.fillStyle = i === 0 
            ? "rgba(24, 60, 42, 0.9)" 
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
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
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

export default TrailingCursor;
