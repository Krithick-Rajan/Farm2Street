import React, { useEffect, useRef } from 'react';

export const CropCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stalk definition
    const stalkCount = Math.floor(width / 16);
    const stalks = Array.from({ length: stalkCount }, (_, i) => ({
      x: (i / stalkCount) * width + Math.random() * 8,
      height: height * (0.35 + Math.random() * 0.45),
      lean: (Math.random() - 0.5) * 20,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.01,
      color: Math.random() > 0.4 ? '#c5a880' : '#4a7051',
    }));

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      stalks.forEach((stalk) => {
        const sway = Math.sin(time * stalk.speed + stalk.phase) * 18;
        const tipX = stalk.x + stalk.lean + sway;
        const tipY = height - stalk.height;

        ctx.beginPath();
        ctx.moveTo(stalk.x, height);
        ctx.quadraticCurveTo(
          stalk.x + sway * 0.5,
          height - stalk.height * 0.5,
          tipX,
          tipY
        );
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = stalk.color;
        ctx.globalAlpha = 0.4;
        ctx.stroke();

        // Grain ear head
        ctx.beginPath();
        ctx.ellipse(tipX, tipY, 3, 7, (sway * Math.PI) / 180, 0, Math.PI * 2);
        ctx.fillStyle = '#c5a880';
        ctx.globalAlpha = 0.6;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
