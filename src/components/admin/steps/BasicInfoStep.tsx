"use client";

import { memo, useState, useMemo } from "react";
import { X, Upload, Layout, Plus, Trash2, GripVertical, MessageCircle } from "lucide-react";
import Image from "next/image";
import { BACKGROUND_COLORS, GRADIENT_HEX_MAP, DEFAULT_FOOTER_PHONE } from "../modal-constants";
import { TEMPLATE_OPTIONS, type TemplateKey } from "@/lib/templates/config";
import { TemplateSelector } from "../TemplateSelector";
import type { WhatsAppQuestion } from "@/components/public/WhatsAppQuestionModal";

interface BasicInfoStepProps {
  profileImagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  name: string;
  subtitle: string;
  slug: string;
  backgroundColor: string;
  templateKey: TemplateKey;
  footerText: string;
  footerPhone: string;
  footerHidden: boolean;
  whatsappModalTitle: string;
  whatsappModalSubtitle: string;
  whatsappQuestions: WhatsAppQuestion[];
  errors: {
    name?: string;
    slug?: string;
    backgroundColor?: string;
    templateKey?: string;
    footerPhone?: string;
    image?: string;
  };
  touched: {
    name?: boolean;
    slug?: boolean;
    backgroundColor?: boolean;
    templateKey?: boolean;
    footerPhone?: boolean;
  };
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onSubtitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onBackgroundColorBlur: () => void;
  onTemplateKeyChange: (value: TemplateKey) => void;
  onFooterTextChange: (value: string) => void;
  onFooterPhoneChange: (value: string) => void;
  onFooterHiddenChange: (value: boolean) => void;
  onWhatsappModalTitleChange: (value: string) => void;
  onWhatsappModalSubtitleChange: (value: string) => void;
  onWhatsappQuestionsChange: (questions: WhatsAppQuestion[]) => void;
}

// Memoized color button component
const ColorButton = memo(function ColorButton({
  color,
  isSelected,
  hasError,
  onClick,
  onBlur,
}: {
  color: typeof BACKGROUND_COLORS[0];
  isSelected: boolean;
  hasError: boolean;
  onClick: () => void;
  onBlur: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onBlur={onBlur}
      className={`relative h-8 w-full overflow-hidden rounded-md border-2 transition-all duration-200 ${
        isSelected
          ? "border-red-600 scale-110 ring-2 ring-red-600/50 shadow-lg shadow-red-600/30 z-10"
          : hasError
          ? "border-red-400 ring-2 ring-red-400/20"
          : "border-gray-300 hover:border-gray-400 hover:scale-105"
      }`}
      title={color.name}
    >
      {color.isSolid ? (
        <div 
          className="background-swatch h-full w-full rounded" 
          style={{ background: color.value }} 
        />
      ) : (
        <div
          className="background-swatch h-full w-full rounded"
          style={{
            background: GRADIENT_HEX_MAP[color.value]
              ? `linear-gradient(to bottom right, ${GRADIENT_HEX_MAP[color.value].from}, ${GRADIENT_HEX_MAP[color.value].via}, ${GRADIENT_HEX_MAP[color.value].to})`
              : color.value,
          }}
        />
      )}
    </button>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.hasError === nextProps.hasError &&
    prevProps.color.id === nextProps.color.id
  );
});

ColorButton.displayName = "ColorButton";

export const BasicInfoStep = memo(function BasicInfoStep({
  profileImagePreview,
  fileInputRef,
  name,
  subtitle,
  slug,
  backgroundColor,
  templateKey,
  footerText,
  footerPhone,
  footerHidden,
  whatsappModalTitle,
  whatsappModalSubtitle,
  whatsappQuestions,
  errors,
  touched,
  onImageChange,
  onRemoveImage,
  onNameChange,
  onNameBlur,
  onSubtitleChange,
  onSlugChange,
  onBackgroundColorChange,
  onBackgroundColorBlur,
  onTemplateKeyChange,
  onFooterTextChange,
  onFooterPhoneChange,
  onFooterHiddenChange,
  onWhatsappModalTitleChange,
  onWhatsappModalSubtitleChange,
  onWhatsappQuestionsChange,
}: BasicInfoStepProps) {
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  
  // Helper functions for managing WhatsApp questions
  const handleAddQuestion = () => {
    const newQuestion: WhatsAppQuestion = {
      id: `question_${Date.now()}`, // Dynamic ID
      text: "",
      message: "",
    };
    onWhatsappQuestionsChange([...whatsappQuestions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    onWhatsappQuestionsChange(whatsappQuestions.filter(q => q.id !== id));
  };

  const handleQuestionChange = (id: string, field: 'text' | 'message', value: string) => {
    onWhatsappQuestionsChange(
      whatsappQuestions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };
  
  // Memoize selected template lookup
  const selectedTemplate = useMemo(() => {
    return TEMPLATE_OPTIONS.find(t => t.id === templateKey);
  }, [templateKey]);

  return (
    <>
      <div className="space-y-5">
      {/* Profile Image Upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <label className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-gray-300 bg-white cursor-pointer transition-all duration-200 hover:border-gray-400 hover:scale-105 group block shadow-md">
            <Image
              src={profileImagePreview || "/images/DefaultAvatar.png"}
              alt="Profile preview"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
          {((profileImagePreview && profileImagePreview !== "/images/DefaultAvatar.png")) && (
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-10"
              aria-label="Remove image"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {errors.image && (
          <p className="text-xs text-red-600 text-center font-kurdish">{errors.image}</p>
        )}
        <label className="group relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg sm:rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-red-400 via-red-500 to-red-400 hover:from-red-500 hover:via-red-600 hover:to-red-500">
          <Upload className="h-4 w-4" />
          <span>وێنەی پڕۆفایل هەڵبژێرە</span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>
      </div>

      {/* Name and Subtitle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700">
            ناو <span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onNameBlur}
            required
            className={`w-full rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${
              errors.name && touched.name
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-gray-300 focus:border-red-500 focus:ring-red-500/30 hover:border-gray-400"
            }`}
            placeholder="ناوی لینک"
          />
          {errors.name && touched.name && (
            <p className="text-xs text-red-600 mt-1 font-kurdish">{errors.name}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="subtitle" className="block text-xs sm:text-sm font-medium text-gray-700">
            ناونیشانی کورت
          </label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400"
            placeholder="ناونیشانی کورت"
          />
        </div>
      </div>

      {/* Slug and Template Style - Side by Side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Slug */}
        <div className="space-y-1.5">
          <label htmlFor="slug" className="block text-xs sm:text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            disabled
            className={`w-full rounded-lg sm:rounded-xl border bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-500 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 cursor-not-allowed ${
              errors.slug && touched.slug
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                : "border-gray-300 focus:border-gray-400 focus:ring-gray-400/20"
            }`}
            placeholder="slug"
          />
          {errors.slug && touched.slug && (
            <p className="text-xs text-red-600 mt-1 font-kurdish">{errors.slug}</p>
          )}
        </div>

        {/* Template Style */}
        <div className="space-y-1.5" data-template-section>
          <label className="block text-xs sm:text-sm font-medium text-gray-700">
            شێوازی پەڕە <span className="text-red-600">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsTemplateSelectorOpen(true)}
            className={`relative w-full rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-left transition-all duration-200 flex items-center justify-between gap-2 ${
              errors.templateKey && touched.templateKey
                ? "border-red-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            {selectedTemplate ? (
              <span className="text-gray-900 truncate">{selectedTemplate.name}</span>
            ) : (
              <span className="text-gray-400">شێوازێک هەڵبژێرە</span>
            )}
            <Layout className="h-4 w-4 text-gray-500 flex-shrink-0" />
          </button>
          {errors.templateKey && touched.templateKey && (
            <p className="text-xs text-red-600 mt-1 font-kurdish">{errors.templateKey}</p>
          )}
        </div>
      </div>

      {/* Background Color */}
      <div className="space-y-1.5">
        <label className="block text-xs sm:text-sm font-medium text-gray-700">
          ڕەنگی پاشبنەوە
        </label>
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-14 gap-1.5">
          {BACKGROUND_COLORS.map((color) => (
            <ColorButton
              key={color.id}
              color={color}
              isSelected={backgroundColor === color.id}
              hasError={!!(errors.backgroundColor && touched.backgroundColor)}
              onClick={() => onBackgroundColorChange(color.id)}
              onBlur={onBackgroundColorBlur}
            />
          ))}
        </div>
        {errors.backgroundColor && touched.backgroundColor && (
          <p className="text-xs text-red-600 mt-1 font-kurdish">{errors.backgroundColor}</p>
        )}
      </div>

      {/* Footer Name and Phone */}
      <div className="space-y-3 sm:space-y-4">
        {/* Hide Footer Toggle - Custom Toggle Switch */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-gray-300 transition-all duration-200 touch-manipulation">
          <label 
            htmlFor="footerHidden" 
            className="text-xs sm:text-sm md:text-base font-medium text-gray-700 cursor-pointer flex-1 leading-tight sm:leading-normal pr-2 sm:pr-0"
            onClick={() => onFooterHiddenChange(!footerHidden)}
          >
            فوتەر بشارەوە (فوتەر لە پەڕەکە نیشان نادرێت)
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={footerHidden}
            aria-label={footerHidden ? "فوتەر شاردراوە" : "فوتەر نیشاندراوە"}
            onClick={() => onFooterHiddenChange(!footerHidden)}
            className={`relative inline-flex h-7 w-12 sm:h-8 sm:w-14 md:h-9 md:w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 touch-manipulation active:scale-95 ${
              footerHidden ? 'bg-red-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                footerHidden ? 'translate-x-5 sm:translate-x-6 md:translate-x-7' : 'translate-x-0.5 sm:translate-x-0.5 md:translate-x-1'
              }`}
            />
          </button>
        </div>

        {!footerHidden && (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
              <label htmlFor="footerText" className="block text-xs sm:text-sm font-medium text-gray-700">
            ناوی فوتەر (کلیک بکە بۆ واتساپ)
          </label>
          <input
            id="footerText"
            type="text"
            value={footerText}
            onChange={(e) => onFooterTextChange(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400"
            placeholder="Ali Network"
          />
        </div>
        <div className="space-y-1.5">
              <label htmlFor="footerPhone" className="block text-xs sm:text-sm font-medium text-gray-700">
            ژمارەی واتساپ (ئیختیاری)
          </label>
          <input
            id="footerPhone"
            type="text"
            value={footerPhone}
            onChange={(e) => onFooterPhoneChange(e.target.value)}
                className={`w-full rounded-lg sm:rounded-xl border bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:outline-none focus:ring-2 ${
              errors.footerPhone && touched.footerPhone
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : "border-gray-300 focus:border-red-500 focus:ring-red-500/30 hover:border-gray-400"
            }`}
            placeholder={DEFAULT_FOOTER_PHONE}
          />
          {errors.footerPhone && touched.footerPhone && (
                <p className="text-xs text-red-600 mt-1 font-kurdish">{errors.footerPhone}</p>
          )}
        </div>
          </div>
        )}
      </div>

      {/* WhatsApp Modal Questions Configuration */}
      <div className="space-y-3 p-4 sm:p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-green-50/30 to-green-50/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-100 to-green-50 border border-green-200">
            <MessageCircle className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 font-kurdish">
            پرسیارەکانی واتساپ
          </h3>
        </div>

        {/* Modal Title and Subtitle */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              سەردێڕی مۆدال
            </label>
            <input
              type="text"
              value={whatsappModalTitle}
              onChange={(e) => onWhatsappModalTitleChange(e.target.value)}
              placeholder="پەیوەندی کردن"
              className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
              ژێر سەردێڕ
            </label>
            <input
              type="text"
              value={whatsappModalSubtitle}
              onChange={(e) => onWhatsappModalSubtitleChange(e.target.value)}
              placeholder="پرسیارێک هەڵبژێرە"
              className="w-full rounded-lg sm:rounded-xl border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs sm:text-sm font-medium text-gray-700">
              پرسیارەکان ({whatsappQuestions.length})
            </label>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>زیادکردنی پرسیار</span>
            </button>
          </div>

          {whatsappQuestions.length === 0 ? (
            <div className="text-center py-6 text-xs sm:text-sm text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              هیچ پرسیارێک نییە. کلیک بکە بۆ زیادکردنی پرسیارێکی نوێ.
            </div>
          ) : (
            <div className="space-y-3">
              {whatsappQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600">
                        پرسیار #{index + 1}
                      </span>
                    </div>
                    {whatsappQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(question.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="سڕینەوەی پرسیار"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Question Text */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      دەقی پرسیار
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                      placeholder="داواکردن"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400"
                    />
                  </div>

                  {/* Question Message */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      پەیام (دەقی نێردراو بۆ واتساپ)
                    </label>
                    <textarea
                      value={question.message}
                      onChange={(e) => handleQuestionChange(question.id, 'message', e.target.value)}
                      placeholder="سڵاو بەڕێز دەمەوێت داوا بکەم."
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 hover:border-gray-400 resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    <TemplateSelector
      isOpen={isTemplateSelectorOpen}
      onClose={() => setIsTemplateSelectorOpen(false)}
      selectedTemplate={templateKey}
      onSelectTemplate={onTemplateKeyChange}
    />
    </>
  );
});
