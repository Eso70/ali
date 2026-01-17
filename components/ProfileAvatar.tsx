"use client";

import Image from "next/image";

interface ProfileAvatarProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileAvatar({ size = "md", className = "" }: ProfileAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10 sm:h-12 sm:w-12",
    lg: "h-28 w-28 sm:h-36 sm:w-36",
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} ${className}`}
    >
      {/* Static glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background: `conic-gradient(from 90deg, var(--theme-logo-glow-from), var(--theme-logo-glow-via), var(--theme-logo-glow-to), var(--theme-logo-glow-from))`,
          opacity: `calc(var(--theme-logo-glow-opacity) / 100)`
        }}
      />

      {/* Static ring */}
      <div
        className="absolute inset-[-4%] rounded-full border border-white/15 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
      />

      {/* Avatar */}
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/30 bg-gray-900 shadow-2xl">
        <Image
          src="/images/Logo.jpg"
          alt="Profile"
          width={144}
          height={144}
          className="h-full w-full object-cover"
          priority
        />
      </div>
    </div>
  );
}

