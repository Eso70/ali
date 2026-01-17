"use client";

import { memo } from "react";

export const AnimatedGradientOverlay = memo(function AnimatedGradientOverlay() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none opacity-45"
      style={{
        background: `linear-gradient(135deg,
          rgba(11, 18, 36, 0.35) 0%,
          rgba(27, 42, 69, 0.32) 20%,
          rgba(45, 33, 71, 0.28) 45%,
          rgba(247, 189, 67, 0.22) 65%,
          rgba(27, 42, 69, 0.32) 82%,
          rgba(11, 18, 36, 0.35) 100%)`,
        backgroundSize: '400% 400%',
      }}
    />
  );
});
