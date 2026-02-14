"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export const Atmosphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    // Premium Palette: Gold, Pale Gold, White (Snow/Sparkle), Deep Red
    const colors = ["#fbbf24", "#fcd34d", "#ffffff", "#dc2626"];

    let animationFrameId;
    let lastFire = 0;

    const frame = (now) => {
      // Slower, more elegant atmosphere
      if (now - lastFire > 300) { // Every 300ms
          
        // Left side gentle drift
        myConfetti({
          particleCount: 1,
          angle: 60,
          spread: 55,
          origin: { x: -0.1, y: 0.3 }, // From left
          colors: colors,
          drift: 0.5,
          gravity: 0.8,
          ticks: 400, // Last longer
          scalar: Math.random() * 0.4 + 0.4, // Smaller, dust-like
          shapes: ["square"], // Square rotates nicely like paper/dust
          disableForReducedMotion: true,
        });

        // Right side gentle drift
        myConfetti({
          particleCount: 1,
          angle: 120,
          spread: 55,
          origin: { x: 1.1, y: 0.3 }, // From right
          colors: colors,
          drift: -0.5,
          gravity: 0.8,
          ticks: 400,
          scalar: Math.random() * 0.4 + 0.4,
          shapes: ["circle"],
          disableForReducedMotion: true,
        });

        lastFire = now;
      }
      
      animationFrameId = requestAnimationFrame(frame);
    };

    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      myConfetti.reset();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-60" // Lower opacity for subtlety
      style={{ width: "100%", height: "100%" }}
    />
  );
};
