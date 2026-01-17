"use client";

import { memo, useCallback, useEffect } from "react";
import { X, MessageCircle } from "lucide-react";

// Export the question interface for use in other components
export interface WhatsAppQuestion {
  id: string; // Can be any string: "order", "delivery", "support", "custom1", etc.
  text: string; // Display text for the question
  message: string; // The message to send when this question is selected
}

interface WhatsAppQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (message: string) => void;
  whatsappUrl: string;
  // Dynamic props - all optional with defaults
  title?: string;
  subtitle?: string;
  questions?: WhatsAppQuestion[]; // Completely dynamic array
}

// Default fallbacks if no questions provided
const DEFAULT_QUESTIONS: WhatsAppQuestion[] = [
  { id: "order", text: "داواکردن", message: "سڵاو بەڕێز دەمەوێت داوا بکەم." },
  { id: "price", text: "زانینی نرخ", message: "سڵاو بەڕێز، نرخی چەندە ؟" },
  { id: "other", text: "پرسیارێکی تر", message: "سڵاو" },
];

const DEFAULT_TITLE = "پەیوەندی کردن";
const DEFAULT_SUBTITLE = "پرسیارێک هەڵبژێرە";

export const WhatsAppQuestionModal = memo(function WhatsAppQuestionModal({
  isOpen,
  onClose,
  onSelectQuestion,
  whatsappUrl: _whatsappUrl, // Prefixed with _ to indicate intentionally unused (kept for future use)
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  questions = DEFAULT_QUESTIONS,
}: WhatsAppQuestionModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleQuestionClick = useCallback(
    (message: string) => {
      // Directly use the message from the question object
      onSelectQuestion(message);
      onClose();
    },
    [onSelectQuestion, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  // Use provided questions or defaults (empty array means no questions)
  const displayQuestions = questions && questions.length > 0 ? questions : DEFAULT_QUESTIONS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
      role="dialog"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative p-4 sm:p-5 md:p-6 border-b border-gray-100/50 bg-gradient-to-r from-white to-red-50/20">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-50 border border-green-100 flex-shrink-0 shadow-sm">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="whatsapp-modal-title"
                  className="text-base sm:text-lg md:text-xl font-bold text-slate-800 font-kurdish"
                >
                  {title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-kurdish">
                  {subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 active:scale-95"
              aria-label="داخستن"
              title="داخستن"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Questions List - Completely dynamic, works with any number of questions */}
        <div className="p-4 sm:p-5 md:p-6 space-y-3">
          {displayQuestions.map((question, index) => (
            <button
              key={question.id} // ID is just for React key, can be any string
              type="button"
              onClick={() => handleQuestionClick(question.message)} // Direct message, no ID check
              className="w-full px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-white to-slate-50/50 hover:from-green-50 hover:to-green-50 border border-slate-200 hover:border-green-200 text-right text-sm sm:text-base font-medium text-slate-700 hover:text-green-700 transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.98] font-kurdish"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex-1 text-right">{question.text}</span>
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-green-50 border border-green-200 flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
