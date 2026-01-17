"use client";

import { memo } from "react";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteLinktreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  linktreeName: string;
  linktreeUid: string;
  isDeleting?: boolean;
}

export const DeleteLinktreeModal = memo(function DeleteLinktreeModal({
  isOpen,
  onClose,
  onConfirm,
  linktreeName,
  linktreeUid: _linktreeUid,
  isDeleting = false,
}: DeleteLinktreeModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4 bg-black/40 backdrop-blur-md overflow-y-auto"
      onClick={handleBackdropClick}
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-md my-2 sm:my-4 md:my-8 rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100 shadow-2xl overflow-hidden"
      >
        {/* Content */}
        <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-white to-slate-50/20">
          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100 flex items-center justify-center shadow-lg">
              <Trash2 className="h-10 w-10 sm:h-12 sm:w-12 text-rose-500" />
            </div>
          </div>

          {/* Simple Message */}
          <div className="text-center mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-700 font-kurdish mb-2">
              سڕینەوەی پەیج
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-kurdish">
              دڵنیایت لە سڕینەوەی <span className="font-semibold text-slate-700">{linktreeName}</span>؟
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 text-slate-600 hover:text-slate-700 font-medium font-kurdish transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-sm hover:shadow"
            >
              هەڵوەشاندنەوە
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-white font-semibold font-kurdish transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg hover:shadow-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  <span>دەسڕێتەوە...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>سڕینەوە</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

