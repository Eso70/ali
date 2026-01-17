"use client";

import { FaSignOutAlt, FaUser } from "react-icons/fa";

interface ProfileDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  onLogout: () => void;
  onProfileClick: () => void;
}

export function ProfileDropdown({
  isOpen,
  isLoading,
  onLogout,
  onProfileClick,
}: ProfileDropdownProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 bg-white/95 backdrop-blur-sm border border-gray-100/50 shadow-2xl"
    >
      <div className="p-2 bg-gradient-to-br from-white to-slate-50/30">
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl bg-gradient-to-r from-white to-red-50/30 hover:from-red-50 hover:to-red-50 border border-transparent hover:border-red-100 text-slate-700 hover:text-red-700 transition-all duration-300 group shadow-sm hover:shadow-md"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-red-50 to-red-50 border border-red-100 group-hover:scale-110 transition-transform duration-300">
            <FaUser className="text-base text-red-600 group-hover:text-red-700 transition-colors duration-300" />
          </div>
          <span className="font-medium">پڕۆفایل</span>
        </button>
        
        <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-2" />
        
        <button
          onClick={onLogout}
          disabled={isLoading}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl bg-gradient-to-r from-white to-rose-50/30 hover:from-rose-50 hover:to-pink-50 border border-transparent hover:border-rose-100 text-slate-700 hover:text-rose-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md disabled:hover:shadow-sm"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100 group-hover:scale-110 transition-transform duration-300 disabled:group-hover:scale-100">
            <FaSignOutAlt className="text-base text-rose-500 group-hover:text-rose-600 transition-colors duration-300" />
          </div>
          <span className="font-medium">
            {isLoading ? "دەرچوون..." : "دەرچوون"}
          </span>
        </button>
      </div>
    </div>
  );
}

