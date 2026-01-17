"use client";

import { memo, ReactNode } from "react";

interface LinkButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
}

export const LinkButton = memo(function LinkButton({
  children,
  onClick,
  className = "",
  gradientFrom = "rgba(59, 130, 246, 0.5)",
  gradientVia = "rgba(59, 130, 246, 0.4)",
  gradientTo = "rgba(59, 130, 246, 0.3)",
}: LinkButtonProps) {
  return (
    <button
      type="button"
      dir="ltr"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onTouchStart={() => {
        // iOS Safari: Ensure touch events work properly
        // Don't prevent default - let the click handler work
        // This ensures buttons respond to taps on iPhone
        // The touch event helps iOS recognize the element as interactive
      }}
      className={`group btn-spotlight relative mt-2 w-full overflow-hidden rounded-2xl sm:rounded-3xl px-4 py-3.5 sm:px-5 sm:py-4 md:px-6 md:py-4.5 lg:px-7 lg:py-5 text-sm sm:text-base md:text-lg font-medium text-white text-left backdrop-blur-sm sm:backdrop-blur-md shadow-[0_4px_16px_rgba(59,130,246,0.12)] sm:shadow-[0_4px_20px_rgba(59,130,246,0.15)] transition-all duration-200 sm:duration-300 ease-out active:scale-[0.98] sm:hover:scale-[1.02] hover:shadow-[0_6px_24px_rgba(59,130,246,0.2)] sm:hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)] touch-manipulation ${className}`}
      style={{
        background: `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`,
        contain: "layout style paint",
        transform: "translateZ(0)",
        willChange: "transform",
        backfaceVisibility: "hidden"
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        requestAnimationFrame(() => {
          if (!target || !target.isConnected) return;
          const hoverFrom = gradientFrom.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
          const hoverVia = gradientVia.replace("0.9", "1.0").replace("0.85", "0.95").replace("0.8", "0.9");
          const hoverTo = gradientTo.replace("0.85", "0.95").replace("0.9", "1.0").replace("0.8", "0.9");
          target.style.background = `linear-gradient(to bottom right, ${hoverFrom || gradientFrom}, ${hoverVia || gradientVia}, ${hoverTo || gradientTo})`;
        });
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        requestAnimationFrame(() => {
          if (!target || !target.isConnected) return;
          target.style.background = `linear-gradient(to bottom right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`;
        });
      }}
    >
      {/* Spotlight effect - moves from left to right - reduced on mobile */}
      <div 
        className="absolute inset-0 overflow-hidden"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        <div 
          className="absolute inset-0 w-1/3 animate-spotlight hidden sm:block"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
            filter: 'blur(8px)',
            transform: "translateZ(0)",
            willChange: "transform",
            backfaceVisibility: "hidden"
          }}
        />
      </div>
      
      {/* Additional spotlight on hover - desktop only */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full sm:group-hover:translate-x-full transition-transform duration-500 sm:duration-700 ease-in-out hidden sm:block"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      />
      
      {/* Top gradient overlay - desktop only */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/8 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 sm:duration-500 hidden sm:block"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      />
      
      <div className="relative z-10 flex w-full items-center justify-between">
        {children}
      </div>
    </button>
  );
});
