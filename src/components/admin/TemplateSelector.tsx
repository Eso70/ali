"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layout, Check, Sparkles } from "lucide-react";
import { TEMPLATE_OPTIONS, type TemplateKey } from "@/lib/templates/config";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: TemplateKey;
  onSelectTemplate: (template: TemplateKey) => void;
}

// Compact template card - simple and small
const TemplateCard = memo(function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: (typeof TEMPLATE_OPTIONS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        isSelected
          ? "border-red-400 shadow-lg ring-2 ring-red-400/30 scale-105"
          : "border-slate-200 hover:border-red-200 hover:shadow-md hover:scale-102"
      }`}
      aria-pressed={isSelected}
    >
      {/* Background gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${template.previewGradient} transition-opacity duration-300 ${
          isSelected ? "opacity-95" : "opacity-70 group-hover:opacity-85"
        }`}
        aria-hidden
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" aria-hidden />
      
      {/* Content - more compact */}
      <div className="relative flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 h-full">
        {/* Icon */}
        <div className={`rounded-lg p-1 sm:p-1.5 backdrop-blur-sm transition-all duration-300 shadow-sm ${
          isSelected 
            ? "bg-white/40 scale-110" 
            : "bg-white/15 group-hover:bg-white/25 group-hover:scale-105"
        }`}>
          <Layout className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
        </div>
        
        {/* Template name */}
        <span className={`text-[9px] sm:text-[10px] font-semibold text-white text-center transition-colors duration-300 leading-tight ${
          isSelected ? "text-red-200" : ""
        }`}>
          {template.name}
        </span>
        
        {/* Selection checkmark */}
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 rounded-full bg-gradient-to-br from-red-400 to-red-500 p-0.5 shadow-lg">
            <Check className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-white" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.template.id === nextProps.template.id
  );
});

TemplateCard.displayName = "TemplateCard";

export const TemplateSelector = memo(function TemplateSelector({
  isOpen,
  onClose,
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  // Add keyframes to document if not already present - must be before any conditional returns
  useEffect(() => {
    if (!isOpen || !mounted) return;
    
    const styleId = 'template-selector-keyframes';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      // Don't remove style on cleanup to avoid flicker
    };
  }, [isOpen, mounted]);

  const handleSelect = useCallback((templateId: TemplateKey) => {
    onSelectTemplate(templateId);
    onClose();
  }, [onSelectTemplate, onClose]);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-lg animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden
      />
      
      {/* Modal container - Smaller and fit to template count */}
      <div 
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] sm:w-[85vw] md:w-[75vw] max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        dir="ltr"
      >
        {/* Header - Compact */}
        <div className="border-b border-gray-100/50 bg-gradient-to-r from-white to-red-50/20">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-50 border border-red-100 p-1.5 sm:p-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-700">
                  شێوازی پەڕە هەڵبژێرە
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
                  {TEMPLATE_OPTIONS.length} شێواز
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 rounded-xl p-1.5 sm:p-2 bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 text-slate-500 hover:text-slate-700 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content - Compact and fit to templates */}
        <div 
          className="overflow-y-auto p-3 sm:p-4 flex items-center justify-center bg-gradient-to-br from-white to-slate-50/20"
          style={{ 
            scrollbarWidth: "thin", 
            scrollbarColor: "rgba(156,163,175,0.5) transparent",
          }}
        >
          <div className="w-full">
            {/* Grid: 3 columns on mobile, 4 on tablet, 5 on desktop - fits 10 templates perfectly */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3 justify-items-center">
              {TEMPLATE_OPTIONS.map((template, index) => (
                <div
                  key={template.id}
                  className="w-full max-w-[90px] sm:max-w-[95px] md:max-w-[100px]"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.03}s both`,
                  }}
                >
                  <TemplateCard
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={() => handleSelect(template.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.selectedTemplate === nextProps.selectedTemplate
  );
});

TemplateSelector.displayName = "TemplateSelector";
