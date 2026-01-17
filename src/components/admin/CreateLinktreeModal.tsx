"use client";

import { memo, useState, useEffect, useMemo, useCallback, useRef, startTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PlatformSelectionStep } from "./steps/PlatformSelectionStep";
import { LinksStep } from "./steps/LinksStep";
import { 
  BACKGROUND_COLORS, 
  DEFAULT_SUBTITLE, 
  DEFAULT_FOOTER_TEXT, 
  DEFAULT_FOOTER_PHONE,
  getDefaultExpireDate,
  getPlatformNameKurdish
} from "./modal-constants";
import { buildSlugFromName, generateUrl, extractValueFromUrl } from "./modal-utils";
import { TEMPLATE_DEFAULT_ID, isTemplateKey, normalizeTemplateConfig, type TemplateKey } from "@/lib/templates/config";
import { debounce } from "@/lib/utils/debounce";
import type { WhatsAppQuestion } from "@/components/public/WhatsAppQuestionModal";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  value?: string;
  countryCode?: string;
  displayName?: string;
  enabled: boolean;
  order?: number;
}


interface EditLinkData {
  linktree: {
    id: string;
    name: string;
    subtitle?: string;
    seo_name?: string;
    uid: string;
    image?: string;
    background_color: string;
    template_config?: Record<string, unknown> | null;
    expire_date?: string;
    footer_text?: string;
    footer_phone?: string;
    footer_hidden?: boolean;
    status?: string;
  };
  links: Array<{
    id: string;
    platform: string;
    url: string;
    display_name?: string | null;
    description?: string | null;
    default_message?: string | null;
    display_order: number;
    metadata?: Record<string, unknown> | null;
  }>;
}

interface CreateLinktreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    subtitle?: string;
    slug: string;
    image: string | null;
    background_color: string;
    templateKey: TemplateKey;
    templateConfig: Record<string, unknown>;
    expire_date?: string;
    footer_text?: string;
    footer_phone?: string;
    footer_hidden?: boolean;
    platforms: string[];
    links: Record<string, string[]>;
    linkMetadata?: Record<string, Array<{display_name?: string; description?: string; default_message?: string; metadata?: Record<string, unknown>}>>;
  }, editId?: string) => void;
  editData?: EditLinkData | null;
  isLoadingEditData?: boolean;
}

export const CreateLinktreeModal = memo(function CreateLinktreeModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isLoadingEditData = false,
}: CreateLinktreeModalProps) {
  const [currentStep, setCurrentStep] = useState<"basic" | "select" | "links">("basic");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);
  const [slug, setSlug] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("pure-black");
  const [templateKey, setTemplateKey] = useState<TemplateKey>(TEMPLATE_DEFAULT_ID);
  const [expiresAt, setExpiresAt] = useState(getDefaultExpireDate());
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [footerText, setFooterText] = useState(DEFAULT_FOOTER_TEXT);
  const [footerPhone, setFooterPhone] = useState(DEFAULT_FOOTER_PHONE);
  const [footerHidden, setFooterHidden] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<Record<string, unknown>>(() => normalizeTemplateConfig(TEMPLATE_DEFAULT_ID, null));
  
  // WhatsApp modal questions state
  const [whatsappModalTitle, setWhatsappModalTitle] = useState("پەیوەندی کردن");
  const [whatsappModalSubtitle, setWhatsappModalSubtitle] = useState("پرسیارێک هەڵبژێرە");
  const [whatsappQuestions, setWhatsappQuestions] = useState<WhatsAppQuestion[]>([
    { id: "order", text: "داواکردن", message: "سڵاو بەڕێز دەمەوێت داوا بکەم." },
    { id: "price", text: "زانینی نرخ", message: "سڵاو بەڕێز، نرخی چەندە ؟" },
    { id: "other", text: "پرسیارێکی تر", message: "سڵاو" },
  ]);
  
  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string;
    slug?: string;
    backgroundColor?: string;
    templateKey?: string;
    platforms?: string;
    links?: string;
    footerPhone?: string;
    image?: string;
  }>({});
  
  // Per-link validation errors: { platformId_linkIndex: errorMessage }
  const [linkErrors, setLinkErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    slug?: boolean;
    backgroundColor?: boolean;
    templateKey?: boolean;
    platforms?: boolean;
    links?: boolean;
    footerPhone?: boolean;
  }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = !!editData;
  const initializedLinktreeIdRef = useRef<string | null>(null);
  const submitAttemptedRef = useRef(false); // Prevent duplicate form submissions

  // Generate unique ID for links - memoized to prevent dependency issues
  const generateLinkId = useCallback((platformId: string): string => {
    return `${platformId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Real-time validation functions
  const validateName = useCallback((value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 1) {
      return "تکایە ناو بنووسە";
    }
    if (trimmed.length > 100) {
      return "ناو دەبێت کەمتر لە ١٠٠ پیت بێت";
    }
    return undefined;
  }, []);

  const validateSlug = useCallback((value: string): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length < 1) {
      return "تکایە slug بنووسە";
    }
    if (trimmed.length > 100) {
      return "Slug دەبێت کەمتر لە ١٠٠ پیت بێت";
    }
    if (!/^[a-z0-9-]+$/.test(trimmed)) {
      return "Slug دەبێت تەنها پیتی بچووک، ژمارە و هێڵ بێت";
    }
    return undefined;
  }, []);

  const validateBackgroundColor = useCallback((value: string): string | undefined => {
    const selectedBgColor = BACKGROUND_COLORS.find(c => c.id === value)?.value || value;
    if (!selectedBgColor) {
      return "تکایە ڕەنگی پاشبنەوە هەڵبژێرە";
    }
    return undefined;
  }, []);

  const validateTemplateKey = useCallback((value: string): string | undefined => {
    if (!value || !isTemplateKey(value)) {
      return "تکایە شێوازی پەڕە هەڵبژێرە";
    }
    return undefined;
  }, []);

  const validatePlatforms = useCallback((platforms: string[]): string | undefined => {
    if (!platforms || platforms.length === 0) {
      return "لانیکەم یەک پلاتفۆرم هەڵبژێرە";
    }
    return undefined;
  }, []);

  const validateLinks = useCallback((links: SocialLink[], selected: string[]): string | undefined => {
    if (!selected || selected.length === 0) {
      return "لانیکەم یەک پلاتفۆرم هەڵبژێرە";
    }
    
    // Validate each link
    for (const linkId of selected) {
      const link = links.find(l => l.id === linkId);
      if (!link) continue;
      
      const linkValue = link.value?.trim() || "";
      const linkUrl = link.url?.trim() || "";
      
      // Must have either value or URL
      if (!linkValue && !linkUrl) {
        return "تکایە بەروارەکان بۆ لینکەکان بنووسە";
      }
      
      // For phone-based platforms, validate phone number format
      const isPhoneBased = link.platform === "whatsapp" || link.platform === "phone" || link.platform === "viber";
      if (isPhoneBased && linkValue) {
        // Remove all non-digits to check if we have enough digits
        const digitsOnly = linkValue.replace(/\D/g, "");
        // Phone number should have at least 7 digits (after country code removal)
        // Country codes are 1-3 digits, so total should be at least 8-10 digits
        if (digitsOnly.length < 7) {
          return "ژمارەی مۆبایل نادروستە (دەبێت لانیکەم ٧ ژمارە بێت)";
        }
        
        // Validate country code exists and is not empty
        const countryCode = link.countryCode?.trim() || "";
        if (!countryCode) {
          return "تکایە وڵات هەڵبژێرە";
        }
        
        // Validate country code format (should be numeric, 1-3 digits)
        if (!/^\d{1,3}$/.test(countryCode)) {
          return "کۆدی وڵات نادروستە";
        }
      }
    }
    
    return undefined;
  }, []);

  const validateFooterPhone = useCallback((value: string): string | undefined => {
    const trimmed = value.trim();
    if (trimmed && !/^\+?\d{10,15}$/.test(trimmed)) {
      return "ژمارەی مۆبایلی دەستپێکردن نادروستە (دەبێت ١٠-١٥ ژمارە بێت)";
    }
    return undefined;
  }, []);

  // Validate all fields before submission
  const validateAllFields = useCallback((): boolean => {
    const newErrors: typeof errors = {};
    
    newErrors.name = validateName(name);
    newErrors.slug = validateSlug(slug);
    newErrors.backgroundColor = validateBackgroundColor(backgroundColor);
    newErrors.templateKey = validateTemplateKey(templateKey);
    newErrors.platforms = validatePlatforms(selectedPlatforms);
    newErrors.links = validateLinks(socialLinks, selectedPlatforms);
    if (footerPhone.trim()) {
      newErrors.footerPhone = validateFooterPhone(footerPhone);
    }
    
    setErrors(newErrors);
    setTouched({
      name: true,
      slug: true,
      backgroundColor: true,
      templateKey: true,
      platforms: true,
      links: true,
      footerPhone: true,
    });
    
    return !Object.values(newErrors).some(error => error !== undefined);
  }, [name, slug, backgroundColor, templateKey, selectedPlatforms, socialLinks, footerPhone, validateName, validateSlug, validateBackgroundColor, validateTemplateKey, validatePlatforms, validateLinks, validateFooterPhone]);

  // Debounced name validation
  const debouncedNameValidation = useMemo(
    () => debounce((value: unknown) => {
      if (touched.name && typeof value === 'string') {
        setErrors(prev => ({ ...prev, name: validateName(value) }));
      }
    }, 200),
    [touched.name, validateName]
  );

  // Update validation on field changes - optimized
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    debouncedNameValidation(value);
  }, [debouncedNameValidation]);

  const handleNameBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, name: true }));
    setErrors(prev => ({ ...prev, name: validateName(name) }));
  }, [name, validateName]);

  const handleBackgroundColorChange = useCallback((value: string) => {
    setBackgroundColor(value);
    if (touched.backgroundColor) {
      setErrors(prev => ({ ...prev, backgroundColor: validateBackgroundColor(value) }));
    }
  }, [touched.backgroundColor, validateBackgroundColor]);

  const handleBackgroundColorBlur = useCallback(() => {
    setTouched(prev => ({ ...prev, backgroundColor: true }));
    setErrors(prev => ({ ...prev, backgroundColor: validateBackgroundColor(backgroundColor) }));
  }, [backgroundColor, validateBackgroundColor]);

  const handleTemplateKeyChange = useCallback((value: TemplateKey) => {
    setTemplateKey(value);
    setTemplateConfig((prev) => normalizeTemplateConfig(value, prev));
    setTouched(prev => ({ ...prev, templateKey: true }));
    setErrors(prev => ({ ...prev, templateKey: validateTemplateKey(value) }));
  }, [validateTemplateKey]);

  // Handle image upload - memoized for performance
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (500KB = 512000 bytes)
      const maxSizeBytes = 512000;
      if (file.size > maxSizeBytes) {
        setErrors(prev => ({
          ...prev,
          image: `قەبارەی وێنە نابێت لە  500kb زیاتر بێت.`
        }));
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      
      // Clear any previous image errors
      setErrors(prev => ({ ...prev, image: undefined }));
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setProfileImage(null);
    setProfileImagePreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "linktrees");

      const response = await fetch("/api/linktrees/upload", {
        method: "POST",
        cache: 'no-store', // Always fetch fresh data
        credentials: 'include', // Include cookies for authentication
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      return result.url || null;
    } catch (error) {
      console.error("Error uploading image:", error);
      console.error("Failed to upload image, using base64 fallback");
      // If upload fails, convert to base64 as fallback
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Removed processedLinks memo - now computed inline in useEffect to avoid dependency issues

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedLinktreeIdRef.current = null;
      setIsSubmitting(false);
      submitAttemptedRef.current = false;
      setLinkErrors({});
      setTemplateKey(TEMPLATE_DEFAULT_ID);
      setTemplateConfig(normalizeTemplateConfig(TEMPLATE_DEFAULT_ID, null));
    }
  }, [isOpen]);

  // Initialize form data when editing (optimized - only runs when editData changes)
  useEffect(() => {
    if (!isOpen || isLoadingEditData) {
      return;
    }

    // Initialize only once when editData is first loaded or when switching between edit/create modes
    const shouldInitialize = editData 
      ? (initializedLinktreeIdRef.current !== editData.linktree.id)
      : (initializedLinktreeIdRef.current !== "create");

    if (!shouldInitialize) {
      return;
    }

    if (editData) {
      // ============================================
      // VALIDATE AND SANITIZE EDIT DATA
      // ============================================
      const linktree = editData.linktree;
      
      // Validate linktree ID
      if (!linktree.id || typeof linktree.id !== "string") {
        console.error("Invalid linktree ID in edit data");
        console.error("Invalid linktree data");
        return;
      }
      
      // Sanitize and set name (max 100 chars)
      const sanitizedName = (linktree.name || "").trim().slice(0, 100);
      if (!sanitizedName) {
        setName("Untitled Linktree");
      } else {
        setName(sanitizedName);
      }
      
      // Sanitize and set subtitle (max 200 chars)
      const sanitizedSubtitle = (linktree.subtitle || "").trim().slice(0, 200);
      setSubtitle(sanitizedSubtitle || DEFAULT_SUBTITLE);
      
      // Sanitize and set slug (max 100 chars, validate format)
      const sanitizedSlug = (linktree.seo_name || buildSlugFromName(sanitizedName)).trim().slice(0, 100);
      setSlug(sanitizedSlug || buildSlugFromName(sanitizedName));
      
      // Validate and set background color
      const bgColor = linktree.background_color || "#eab308";
      const presetColor = BACKGROUND_COLORS.find(c => c.id === bgColor || c.value === bgColor);
      setBackgroundColor(presetColor ? presetColor.id : "default");

      const normalizedConfig = normalizeTemplateConfig(undefined, (linktree.template_config as Record<string, unknown> | null) ?? null);
      const configTemplateKey = normalizedConfig["templateKey"];
      const sanitizedTemplate = (typeof configTemplateKey === "string" && isTemplateKey(configTemplateKey))
        ? configTemplateKey
        : TEMPLATE_DEFAULT_ID;
      setTemplateKey(sanitizedTemplate);
      setTemplateConfig(normalizedConfig);
      
      // Load WhatsApp modal config from template_config
      const whatsappModal = (linktree.template_config as Record<string, unknown> | null)?.whatsapp_modal;
      if (whatsappModal && typeof whatsappModal === 'object' && !Array.isArray(whatsappModal)) {
        const modal = whatsappModal as Record<string, unknown>;
        if (typeof modal.title === 'string') setWhatsappModalTitle(modal.title);
        if (typeof modal.subtitle === 'string') setWhatsappModalSubtitle(modal.subtitle);
        if (Array.isArray(modal.questions)) {
          const questions = modal.questions
            .filter((q): q is WhatsAppQuestion => {
              if (!q || typeof q !== 'object') return false;
              const obj = q as unknown as Record<string, unknown>;
              return (
                typeof obj.id === 'string' &&
                typeof obj.text === 'string' &&
                typeof obj.message === 'string'
              );
            })
            .map(q => {
              const obj = q as unknown as Record<string, unknown>;
              return {
                id: obj.id as string,
                text: obj.text as string,
                message: obj.message as string,
              };
            });
          if (questions.length > 0) setWhatsappQuestions(questions);
        }
      }
      
      // Validate and set expiry date
      let expiryDate: string;
      if (linktree.expire_date) {
        try {
          const dateObj = new Date(linktree.expire_date);
          if (isNaN(dateObj.getTime())) {
            expiryDate = getDefaultExpireDate();
          } else {
            expiryDate = dateObj.toISOString().slice(0, 16);
          }
        } catch {
          expiryDate = getDefaultExpireDate();
        }
      } else {
        expiryDate = getDefaultExpireDate();
      }
      setExpiresAt(expiryDate);
      
      // Sanitize footer text (max 200 chars)
      const sanitizedFooterText = (linktree.footer_text || "").trim().slice(0, 200);
      // Always default to "Ali Network" if empty
      setFooterText(sanitizedFooterText || DEFAULT_FOOTER_TEXT);
      
      // Validate and sanitize footer phone
      const footerPhoneValue = (linktree.footer_phone || "").trim();
      if (footerPhoneValue && /^\+?\d{10,15}$/.test(footerPhoneValue)) {
        setFooterPhone(footerPhoneValue);
      } else {
        setFooterPhone(DEFAULT_FOOTER_PHONE);
      }

      // Set footer hidden
      setFooterHidden(linktree.footer_hidden ?? false);

      
      // Validate and set image
      if (linktree.image && typeof linktree.image === "string") {
        const imageUrl = linktree.image.trim();
        // Accept valid URLs (absolute or relative) and Supabase storage URLs
        if (
          imageUrl.startsWith("http://") ||
          imageUrl.startsWith("https://") ||
          imageUrl.startsWith("/") ||
          imageUrl.startsWith("data:image/") ||
          imageUrl.includes("supabase.co/storage")
        ) {
          setProfileImagePreview(imageUrl);
        } else {
          // Silently handle invalid URLs - don't log warnings for edge cases
          setProfileImagePreview(null);
        }
      } else {
        setProfileImagePreview(null);
      }
      
      // Use memoized processed links (already validated in useMemo)
      // Access processedLinks directly from the memoized value
      const currentProcessedLinks = editData.links && editData.links.length > 0
        ? (() => {
            const sortedLinks = [...editData.links].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
            return sortedLinks.map((link, index) => {
              const linkId = `${link.platform}-${link.id}-${index}`;
              const extracted = extractValueFromUrl(link.platform, link.url, link.metadata || null);
              return {
                id: linkId,
                platform: link.platform,
                url: link.url,
                value: extracted.value,
                countryCode: extracted.countryCode,
                displayName: link.display_name || getPlatformNameKurdish(link.platform), // Pre-fill with Kurdish if not set
                enabled: true,
                order: link.display_order || index,
              };
            });
          })()
        : [];
      
      if (currentProcessedLinks.length > 0) {
        setSocialLinks(currentProcessedLinks);
        setSelectedPlatforms(currentProcessedLinks.map(l => l.id));
      } else {
        setSocialLinks([]);
        setSelectedPlatforms([]);
      }
      
      // Only reset to first step when first opening edit mode, not on subsequent renders
      if (initializedLinktreeIdRef.current === null) {
        setCurrentStep("basic");
        setIsSubmitting(false);
        submitAttemptedRef.current = false;
      }
      
      initializedLinktreeIdRef.current = editData.linktree.id;
    } else if (!editData) {
      // Reset form for create mode
      setName("");
      setSubtitle(DEFAULT_SUBTITLE);
      setSlug("");
      setBackgroundColor("pure-black");
      setTemplateKey(TEMPLATE_DEFAULT_ID);
      setTemplateConfig(normalizeTemplateConfig(TEMPLATE_DEFAULT_ID, null));
      setExpiresAt(getDefaultExpireDate());
      setProfileImage(null);
      setProfileImagePreview(null);
      setSelectedPlatforms([]);
      setSocialLinks([]);
      setFooterText(DEFAULT_FOOTER_TEXT);
      setFooterPhone(DEFAULT_FOOTER_PHONE);
      setWhatsappModalTitle("پەیوەندی کردن");
      setWhatsappModalSubtitle("پرسیارێک هەڵبژێرە");
      setWhatsappQuestions([
        { id: "order", text: "داواکردن", message: "سڵاو بەڕێز دەمەوێت داوا بکەم." },
        { id: "price", text: "زانینی نرخ", message: "سڵاو بەڕێز، نرخی چەندە ؟" },
        { id: "other", text: "پرسیارێکی تر", message: "سڵاو" },
      ]);
      setCurrentStep("basic");
      setIsSubmitting(false);
      submitAttemptedRef.current = false;
      initializedLinktreeIdRef.current = "create";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.linktree.id, isOpen, isLoadingEditData]);

  // Debounced slug generation - optimized for performance
  const debouncedSlugUpdate = useMemo(
    () => debounce((newName: unknown) => {
      if (typeof newName === 'string' && newName && !isEditMode) {
        const generatedSlug = buildSlugFromName(newName);
        startTransition(() => {
          setSlug(generatedSlug);
          // Validate auto-generated slug
          if (touched.slug) {
            setErrors(prev => ({ ...prev, slug: validateSlug(generatedSlug) }));
          }
        });
      }
    }, 300),
    [isEditMode, touched.slug, validateSlug]
  );

  // Auto-generate slug from name
  useEffect(() => {
    debouncedSlugUpdate(name);
  }, [name, debouncedSlugUpdate]);

  // Note: platformMap removed - using functional state updates instead for better reliability

  // Toggle platform selection - optimized with startTransition
  const togglePlatform = useCallback((platformId: string) => {
    startTransition(() => {
      // Use functional updates to always get the latest state
      setSocialLinks(prevLinks => {
        // Check if platform is already selected by looking at current links
        const existingLinks = prevLinks.filter(l => l.platform === platformId);
        const isSelected = existingLinks.length > 0;
        
        if (isSelected) {
          // Remove all instances of this platform
          const remainingLinks = prevLinks.filter(l => l.platform !== platformId);
          const removedLinkIds = existingLinks.map(l => l.id);
          
          // Update selected platforms
          setSelectedPlatforms(prevSelected => {
            const newSelectedPlatforms = prevSelected.filter(id => !removedLinkIds.includes(id));
            
            // Validate platforms after removal
            if (touched.platforms) {
              setErrors(prevErrors => ({ ...prevErrors, platforms: validatePlatforms(newSelectedPlatforms) }));
            }
            
            return newSelectedPlatforms;
          });
          
          return remainingLinks;
        } else {
          // Add new instance
          const newLinkId = generateLinkId(platformId);
          const newLink: SocialLink = {
            id: newLinkId,
            platform: platformId,
            url: "",
            value: "",
            displayName: getPlatformNameKurdish(platformId), // Pre-fill with Kurdish
            enabled: true,
            order: prevLinks.length,
          };
          
          // Update selected platforms
          setSelectedPlatforms(prevSelected => {
            const newSelectedPlatforms = [...prevSelected, newLinkId];
            
            // Clear platforms error if at least one is selected
            if (touched.platforms && newSelectedPlatforms.length > 0) {
              setErrors(prevErrors => ({ ...prevErrors, platforms: undefined }));
            }
            
            return newSelectedPlatforms;
          });
          
          return [...prevLinks, newLink];
        }
      });
    });
  }, [touched.platforms, validatePlatforms, generateLinkId]);

  // Add another instance of a platform - memoized for performance
  const addPlatformInstance = useCallback((platformId: string) => {
    const newLinkId = generateLinkId(platformId);
    setSocialLinks(prev => {
      const newLink: SocialLink = {
        id: newLinkId,
        platform: platformId,
        url: "",
        value: "",
        displayName: getPlatformNameKurdish(platformId), // Pre-fill with Kurdish
        enabled: true,
        order: prev.length,
      };
      return [...prev, newLink];
    });
    setSelectedPlatforms(prev => [...prev, newLinkId]);
  }, [generateLinkId]);

  // Remove a link instance - memoized for performance
  const removeLinkInstance = useCallback((linkId: string) => {
    setSocialLinks(prev => prev.filter(link => link.id !== linkId));
    setSelectedPlatforms(prev => prev.filter(id => id !== linkId));
  }, []);

  // Update social link
  const updateSocialLink = useCallback((id: string, value: string) => {
    // Clear error if exists
    if (linkErrors[id]) {
      setLinkErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }

    setSocialLinks(prev => {
      const existing = prev.find(link => link.id === id);
      if (!existing) {
        // Create new link if it doesn't exist
        const platformId = id.includes('-') ? id.split('-')[0] : id;
        const isPhoneBased = platformId === "whatsapp" || platformId === "phone" || platformId === "viber";
        const code = isPhoneBased ? "964" : "";
        const url = generateUrl(platformId, value || "", isPhoneBased ? code : undefined);
        const newLink: SocialLink = {
          id,
          platform: platformId,
          url,
          value: value || "",
          countryCode: code,
          displayName: getPlatformNameKurdish(platformId), // Pre-fill with Kurdish
          enabled: true,
          order: prev.length,
        };
        return [...prev, newLink];
      }

      // Update existing link
      const platformId = existing.platform;
      const isPhoneBased = platformId === "whatsapp" || platformId === "phone" || platformId === "viber";
      const code = isPhoneBased ? (existing.countryCode || "964") : "";

      // Generate URL with current values
      const url = generateUrl(platformId, value || "", isPhoneBased ? code : undefined);

      // Create updated link object
      const updatedLink: SocialLink = {
        id: existing.id,
        platform: existing.platform,
        url,
        value: value || "",
        countryCode: code,
        displayName: existing.displayName,
        enabled: existing.enabled,
        order: existing.order ?? 0,
      };

      // Return new array with updated link
      return prev.map(link => (link.id === id ? updatedLink : link));
    });
  }, [linkErrors]);

  // Update display name for a link
  const updateDisplayName = useCallback((id: string, displayName: string) => {
    setSocialLinks(prev => {
      const existing = prev.find(link => link.id === id);
      if (!existing) {
        return prev; // Link doesn't exist
      }

      // Create updated link object
      const updatedLink: SocialLink = {
        ...existing,
        displayName: displayName.trim() || undefined,
      };

      // Return new array with updated link
      return prev.map(link => (link.id === id ? updatedLink : link));
    });
  }, []);

  const updateCountryCode = useCallback((id: string, countryCode: string) => {
    if (!countryCode || !/^\d{1,3}$/.test(countryCode.trim())) {
      return;
    }

    const trimmedCode = countryCode.trim();

    // Clear error if exists
    if (linkErrors[id]) {
      setLinkErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }

    // Update the link with new country code
    setSocialLinks(prev => {
      const existing = prev.find(link => link.id === id);
      if (!existing) {
        return prev; // Link doesn't exist
      }

      // Only update country code for phone-based platforms
      const isPhoneBased = existing.platform === "whatsapp" || existing.platform === "phone" || existing.platform === "viber";
      if (!isPhoneBased) {
        return prev; // Not a phone-based platform
      }

      // Generate new URL with updated country code and current value
      const newUrl = generateUrl(existing.platform, existing.value || "", trimmedCode);

      // Create updated link object
      const updatedLink: SocialLink = {
        ...existing,
        url: newUrl,
        countryCode: trimmedCode,
      };

      // Return new array with updated link
      return prev.map(link => (link.id === id ? updatedLink : link));
    });
  }, [linkErrors]);

  // Handle next step with validation - memoized for performance
  const handleNextStep = useCallback(() => {
    if (currentStep === "basic") {
      // Validate basic fields before moving to next step
      const nameError = validateName(name);
      const slugError = slug.trim() ? validateSlug(slug) : undefined;
      const bgError = validateBackgroundColor(backgroundColor);
      const templateError = validateTemplateKey(templateKey);
      
      if (nameError || bgError || templateError) {
        setErrors(prev => ({
          ...prev,
          name: nameError,
          slug: slugError,
          backgroundColor: bgError,
          templateKey: templateError,
        }));
        setTouched(prev => ({
          ...prev,
          name: true,
          slug: slug.trim() ? true : false,
          backgroundColor: true,
          templateKey: true,
        }));
        
        if (nameError) {
          console.error(nameError);
          document.getElementById("name")?.focus();
        } else if (bgError) {
          console.error(bgError);
        } else if (templateError) {
          console.error(templateError);
        }
        return;
      }
      
      // Clear errors if validation passes
      setErrors(prev => ({ ...prev, name: undefined, slug: slugError, backgroundColor: undefined, templateKey: undefined }));
      setCurrentStep("select");
    } else if (currentStep === "select") {
      // Validate platforms before moving to links step
      const platformsError = validatePlatforms(selectedPlatforms);
      
      if (platformsError) {
        setErrors(prev => ({ ...prev, platforms: platformsError }));
        setTouched(prev => ({ ...prev, platforms: true }));
        console.error(platformsError);
        return;
      }
      
      // Clear errors if validation passes
      setErrors(prev => ({ ...prev, platforms: undefined }));
      setCurrentStep("links");
    }
  }, [currentStep, name, slug, backgroundColor, templateKey, selectedPlatforms, validateName, validateSlug, validateBackgroundColor, validateTemplateKey, validatePlatforms]);

  // Handle back step - memoized for performance
  const handleBackStep = useCallback(() => {
    if (currentStep === "select") {
      setCurrentStep("basic");
    } else if (currentStep === "links") {
      setCurrentStep("select");
    }
  }, [currentStep]);

  // Handle submit - ONLY called when "نوێکردنەوە" button is clicked
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // CRITICAL: Prevent duplicate submissions
    if (submitAttemptedRef.current || isSubmitting) {
      return; // Silently prevent duplicate submissions
    }
    
    // CRITICAL: Only allow submission on the links step
    if (currentStep !== "links") {
      return;
    }
    
    // Mark as submitting immediately
    setIsSubmitting(true);
    submitAttemptedRef.current = true;
    
    try {
      // ============================================
      // VALIDATION CHECKS
      // ============================================
      
      // Validate all fields before submission
      if (!validateAllFields()) {
        // Focus first invalid field
        if (errors.name) {
          document.getElementById("name")?.focus();
        } else if (errors.slug) {
          document.getElementById("slug")?.focus();
        } else if (errors.backgroundColor) {
          // Scroll to background color section
          document.querySelector('[data-bg-color-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.templateKey || !templateKey || !isTemplateKey(templateKey)) {
          document.querySelector('[data-template-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (errors.platforms) {
          // Scroll to platforms section
          if (currentStep === "links") {
            setCurrentStep("select");
          }
        } else if (errors.links) {
          // Already on links step - validation will show inline
        }
        throw new Error("Validation failed");
      }
      
      // Validate name
      const sanitizedName = name.trim();
      
      // Validate slug
      const sanitizedSlug = slug.trim() || buildSlugFromName(sanitizedName);
      
      // Validate background color
      const selectedBgColor = BACKGROUND_COLORS.find(c => c.id === backgroundColor)?.value || backgroundColor;

      const selectedTemplateKey = isTemplateKey(templateKey) ? templateKey : TEMPLATE_DEFAULT_ID;
      
      // Validate links
      if (!selectedPlatforms || selectedPlatforms.length === 0) {
        console.error("لانیکەم یەک پلاتفۆرم هەڵبژێرە");
        throw new Error("No platforms selected");
      }
      
      // ============================================
      // IMAGE UPLOAD
      // ============================================
      let imageUrl: string | null = null;
      if (profileImage) {
        try {
          imageUrl = await uploadImage(profileImage);
          if (!imageUrl) {
            console.error("هەڵە لە بارکردنی وێنە");
            throw new Error("Image upload failed");
          }
        } catch (imageError) {
          console.error("Image upload error:", imageError);
          console.error("هەڵە لە بارکردنی وێنە");
          throw imageError;
        }
      } else if (profileImagePreview && !profileImage) {
        // Use existing image URL (only if it's not the default avatar)
        // Don't store default avatar in database - UI will handle it
        if (profileImagePreview !== "/images/DefaultAvatar.png") {
          imageUrl = profileImagePreview;
        }
        // If preview is default avatar, leave imageUrl as null
      }
      // If no image provided, imageUrl stays null - UI will show default avatar

      // ============================================
      // PROCESS LINKS DATA
      // ============================================
      const processedLinks: Record<string, string[]> = {};
      const linkMetadata: Record<string, Array<{display_name?: string; description?: string; default_message?: string; metadata?: Record<string, unknown>}>> = {};
      
      selectedPlatforms.forEach(linkId => {
        const link = socialLinks.find(l => l.id === linkId);
        if (!link) return;
        
        // Sanitize and validate link value
        const linkValue = link.value?.trim() || "";
        const hasValue = linkValue.length > 0;
        
        // Generate URL from value if url is empty
        // Always regenerate URL to ensure country code changes are reflected
        let linkUrl: string;
        if (hasValue) {
          // Always regenerate URL to ensure country code is properly applied
          linkUrl = generateUrl(link.platform, linkValue, link.countryCode);
        } else if (link.url && link.url.trim()) {
          // Fallback to existing URL if no value provided
          linkUrl = link.url.trim();
        } else {
          return; // Skip if no value provided
        }
        
        // Validate URL is not empty
        if (!linkUrl || !linkUrl.trim()) {
          return; // Skip invalid URLs
        }
        
        // Sanitize URL (basic check)
        const sanitizedUrl = linkUrl.trim();
        if (sanitizedUrl.length > 2048) {
          // URL too long, skipping
          return;
        }
        
        const platform = link.platform.trim();
        if (!processedLinks[platform]) {
          processedLinks[platform] = [];
          linkMetadata[platform] = [];
        }
        
        processedLinks[platform].push(sanitizedUrl);
        // Only include country_code in metadata for phone-based platforms
        const isPhonePlatform = platform === "whatsapp" || platform === "phone" || platform === "viber";
        // Get display name - if empty, fallback to English default (will be handled by getPlatformName)
        const displayName = link.displayName?.trim() || undefined;
        linkMetadata[platform].push({
          display_name: displayName, // If undefined, will use English default from getPlatformName
          // For WhatsApp, use empty message since modal handles it. For Telegram/Viber, use empty as default.
          default_message: platform === "telegram" || platform === "viber" ? "" : undefined,
          metadata: {
            original_input: linkValue,
            ...(isPhonePlatform && link.countryCode ? { country_code: link.countryCode } : {}),
          },
        });
      });

      // Final validation: ensure we have at least one link
      if (Object.keys(processedLinks).length === 0) {
        const hasSelectedPlatforms = selectedPlatforms.length > 0;
        if (hasSelectedPlatforms) {
          console.error("تکایە بەروارەکان بۆ لینکەکان بنووسە");
        } else {
          console.error("لانیکەم یەک پلاتفۆرم هەڵبژێرە");
        }
        throw new Error("No valid links provided");
      }

      // ============================================
      // FORMAT EXPIRY DATE
      // ============================================
      const expireDateValue = expiresAt && expiresAt.trim() ? expiresAt : getDefaultExpireDate();
      let expireDate: string;
      try {
        const dateObj = new Date(expireDateValue);
        if (isNaN(dateObj.getTime())) {
          throw new Error("Invalid date");
        }
        expireDate = dateObj.toISOString();
      } catch {
        expireDate = new Date(getDefaultExpireDate()).toISOString();
      }

      // ============================================
      // SANITIZE TEXT FIELDS
      // ============================================
      const sanitizedSubtitle = subtitle.trim() || "بۆ پەیوەندی کردن, کلیک لەم لینکانەی خوارەوە بکە";
      const sanitizedFooterText = footerText.trim() || undefined;
      const sanitizedFooterPhone = footerPhone.trim() || undefined;
      
      // Validate footer phone format if provided
      if (sanitizedFooterPhone) {
        const phoneError = validateFooterPhone(sanitizedFooterPhone);
        if (phoneError) {
          setErrors(prev => ({ ...prev, footerPhone: phoneError }));
          setTouched(prev => ({ ...prev, footerPhone: true }));
          console.error(phoneError);
          throw new Error(phoneError);
        }
      }

      // ============================================
      // PREPARE PLATFORMS ARRAY
      // ============================================
      const platforms = Array.from(
        new Set(
          socialLinks
            .filter(l => selectedPlatforms.includes(l.id))
            .map(l => l.platform)
        )
      );

      // ============================================
      // CALL PARENT SUBMIT HANDLER (AWAIT IT)
      // ============================================
      // Store WhatsApp modal config in template_config before normalization
      const templateConfigWithMessage = {
        ...templateConfig,
        // Only include whatsapp_modal if questions exist
        ...(whatsappQuestions.length > 0 ? {
          whatsapp_modal: {
            title: whatsappModalTitle.trim() || "پەیوەندی کردن",
            subtitle: whatsappModalSubtitle.trim() || "پرسیارێک هەڵبژێرە",
            questions: whatsappQuestions.filter(q => q.text.trim() && q.message.trim()),
          },
        } : {}),
      };
      const normalizedTemplateConfig = normalizeTemplateConfig(selectedTemplateKey, templateConfigWithMessage);

      await onSubmit({
        name: sanitizedName,
        subtitle: sanitizedSubtitle,
        slug: sanitizedSlug,
        image: imageUrl,
        background_color: selectedBgColor,
        templateKey: selectedTemplateKey,
        templateConfig: normalizedTemplateConfig,
        expire_date: expireDate,
        footer_text: sanitizedFooterText,
        footer_phone: sanitizedFooterPhone,
        footer_hidden: footerHidden,
        platforms: platforms,
        links: processedLinks,
        linkMetadata: Object.keys(linkMetadata).length > 0 ? linkMetadata : undefined,
      }, editData?.linktree.id);

      // Note: Modal closing is handled by parent component after successful submission
      // Don't reset isSubmitting here - let the modal close naturally reset the state
      // This keeps the button disabled with spinner until modal closes
      
    } catch (error) {
      console.error("Error submitting:", error);
      
      // Check if error has link-specific errors
      if (error && typeof error === 'object' && 'linkErrors' in error) {
        const linkErrorsData = (error as Error & { linkErrors?: Record<string, string> }).linkErrors;
        if (linkErrorsData && Object.keys(linkErrorsData).length > 0) {
          // Map link errors to display format
          // The key format from API is: platform_index (where index is position in linksToCreate)
          // We need to map this to our linkId format
          const mappedErrors: Record<string, string> = {};
          
          // Build a map of platform+index to linkId
          // We need to match the order in which links were processed
          const platformLinkCounts = new Map<string, number>();
          selectedPlatforms.forEach(linkId => {
            const link = socialLinks.find(l => l.id === linkId);
            if (!link) return;
            
            const count = platformLinkCounts.get(link.platform) || 0;
            const errorKey = `${link.platform}_${count}`;
            
            if (linkErrorsData[errorKey]) {
              mappedErrors[linkId] = linkErrorsData[errorKey];
            }
            
            platformLinkCounts.set(link.platform, count + 1);
          });
          
          if (Object.keys(mappedErrors).length > 0) {
            setLinkErrors(mappedErrors);
            console.error("هەندێک لینک هەڵەیەک هەیە. تکایە چاکی بکەوە");
          } else {
            // Fallback: show general error if mapping failed
            if (!(error instanceof Error && error.message === "Validation failed")) {
              console.error("هەڵە لە پاشەکەوتکردن");
            }
          }
        } else {
          // No link-specific errors, show general error
          if (!(error instanceof Error && error.message === "Validation failed")) {
            console.error("هەڵە لە پاشەکەوتکردن");
          }
        }
      } else {
        // No link-specific errors, show general error
        if (!(error instanceof Error && error.message === "Validation failed")) {
          console.error("هەڵە لە پاشەکەوتکردن");
        }
      }
      
      // ALWAYS reset submission flag on error so user can retry
      submitAttemptedRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Handle reorder links - move up or down
  const handleMoveLink = useCallback((linkId: string, direction: 'up' | 'down') => {
    // Get current sorted links for reordering
    const currentSorted = selectedPlatforms
      .map(linkId => {
        const link = socialLinks.find(l => l.id === linkId);
        if (!link) return null;
        return { linkId, link };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => (a.link.order ?? 0) - (b.link.order ?? 0));

    const currentIndex = currentSorted.findIndex((item) => item.linkId === linkId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= currentSorted.length) return;

    // Swap items
    const reorderedLinks = [...currentSorted];
    [reorderedLinks[currentIndex], reorderedLinks[newIndex]] = [reorderedLinks[newIndex], reorderedLinks[currentIndex]];
    
    const newSelectedPlatforms = reorderedLinks.map((item: { linkId: string }) => item.linkId);
    
    setSelectedPlatforms(newSelectedPlatforms);
    setSocialLinks((prev) =>
      prev.map((link) => {
        const index = newSelectedPlatforms.indexOf(link.id);
        return index !== -1 ? { ...link, order: index } : link;
      })
    );
  }, [selectedPlatforms, socialLinks]);

  // Check if there are any valid links (with values filled in) - optimized
  const hasValidLinks = useMemo(() => {
    if (selectedPlatforms.length === 0) return false;
    
    // Create a map for O(1) lookup instead of O(n) find
    const linksMap = new Map(socialLinks.map(link => [link.id, link]));
    
    // Check if at least one selected platform has a valid link
    for (const linkId of selectedPlatforms) {
      const link = linksMap.get(linkId);
      if (!link) continue;
      
      // Check if link has a value (user has filled in the input)
      const hasValue = link.value && link.value.trim();
      if (!hasValue) continue;
      
      // Generate URL to verify it's valid
      const linkUrl = link.url && link.url.trim() 
        ? link.url 
        : generateUrl(link.platform, link.value || "", link.countryCode);
      
      if (linkUrl && linkUrl.trim()) {
        return true; // Found at least one valid link, early return
      }
    }
    
    return false;
  }, [selectedPlatforms, socialLinks]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" dir="ltr">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div 
        className="relative z-10 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl bg-primary-95 backdrop-blur-sm border border-gray-100 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        style={{
          contain: "layout style paint",
        }}
      >
        <form 
          onSubmit={(e) => {
            // Prevent ALL automatic form submissions
            // Only allow submission via explicit button click
            e.preventDefault();
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            // Prevent ALL form submissions via Enter key
            // Only allow submission via the submit button click
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="flex flex-col h-full max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100/50 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-white to-slate-50/30">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-700 truncate">
                {isEditMode ? "دەستکاریکردنی لینک" : "لینکی نوێ زیاد بکە"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                {currentStep === "basic" && "زانیارییە سەرەکییەکان"}
                {currentStep === "select" && "پلاتفۆرمەکان هەڵبژێرە"}
                {currentStep === "links" && "لینکەکان زیاد بکە"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {editData?.linktree.uid !== "ali" && (
                <div className="hidden sm:block">
                  <DateTimePicker
                    value={expiresAt}
                    onChange={setExpiresAt}
                    placeholder="بەرواری کۆتایی"
                    minDate={new Date()}
                    startYearFromCurrent={true}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center rounded-xl p-2 bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 text-slate-500 hover:text-slate-700 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-5 md:px-6 py-3 sm:py-4 border-b border-gray-100/50 bg-gradient-to-r from-slate-50/50 to-gray-50/50">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className={`flex items-center gap-1.5 sm:gap-2 ${currentStep === "basic" ? "text-brand-600" : "text-brand-400"}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm transition-all duration-300 ${
                  currentStep === "basic" ? "bg-gradient-to-br from-brand-500 to-brand-500 text-white" : "bg-gradient-to-br from-brand-50 to-brand-50 text-brand-600 border border-brand-100"
                }`}>
                  {currentStep === "basic" ? "1" : "✓"}
                </div>
                <span className="text-xs sm:text-sm hidden sm:block">زانیارییەکان</span>
              </div>
              <div className={`h-0.5 flex-1 transition-colors duration-300 ${currentStep === "select" || currentStep === "links" ? "bg-gradient-to-r from-brand-300 to-brand-300" : "bg-slate-200"}`} />
              <div className={`flex items-center gap-1.5 sm:gap-2 ${currentStep === "select" ? "text-red-600" : currentStep === "links" ? "text-red-400" : "text-slate-400"}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm transition-all duration-300 ${
                  currentStep === "select" ? "bg-gradient-to-br from-brand-500 to-brand-500 text-white" : 
                  currentStep === "links" ? "bg-gradient-to-br from-brand-50 to-brand-50 text-brand-600 border border-brand-100" : 
                  "bg-gradient-to-br from-slate-50 to-gray-50 text-slate-400 border border-slate-100"
                }`}>
                  {currentStep === "links" ? "✓" : "2"}
                </div>
                <span className="text-xs sm:text-sm hidden sm:block">پلاتفۆرم</span>
              </div>
              <div className={`h-0.5 flex-1 transition-colors duration-300 ${currentStep === "links" ? "bg-gradient-to-r from-brand-300 to-brand-300" : "bg-slate-200"}`} />
              <div className={`flex items-center gap-1.5 sm:gap-2 ${currentStep === "links" ? "text-brand-600" : "text-slate-400"}`}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium shadow-sm transition-all duration-300 ${
                  currentStep === "links" ? "bg-gradient-to-br from-brand-500 to-brand-500 text-white" : "bg-gradient-to-br from-slate-50 to-gray-50 text-slate-400 border border-slate-100"
                }`}>3</div>
                <span className="text-xs sm:text-sm hidden sm:block">لینکەکان</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div 
            className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 bg-gradient-to-br from-white to-slate-50/20"
            style={{ 
              scrollbarWidth: "thin", 
              scrollbarColor: "rgba(156,163,175,0.5) transparent",
              willChange: "scroll-position",
              transform: "translateZ(0)",
              WebkitOverflowScrolling: "touch",
              contain: "layout style",
            }}
          >
            {/* Loading State */}
            {isLoadingEditData && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="w-12 h-12 border-3 border-slate-200 border-t-red-500 rounded-full animate-spin mb-4" />
                <p className="text-sm sm:text-base text-slate-500">Loading linktree data...</p>
              </div>
            )}
            
            {/* Step 1: Basic Info */}
            {!isLoadingEditData && currentStep === "basic" && (
              <BasicInfoStep
                profileImagePreview={profileImagePreview}
                fileInputRef={fileInputRef}
                name={name}
                subtitle={subtitle}
                slug={slug}
                backgroundColor={backgroundColor}
                templateKey={templateKey}
                footerText={footerText}
                footerPhone={footerPhone}
                footerHidden={footerHidden}
                errors={errors}
                touched={touched}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
                onNameChange={handleNameChange}
                onNameBlur={handleNameBlur}
                onSubtitleChange={setSubtitle}
                onSlugChange={setSlug}
                onBackgroundColorChange={handleBackgroundColorChange}
                onBackgroundColorBlur={handleBackgroundColorBlur}
                onTemplateKeyChange={handleTemplateKeyChange}
                onFooterTextChange={setFooterText}
                onFooterPhoneChange={setFooterPhone}
                onFooterHiddenChange={setFooterHidden}
                whatsappModalTitle={whatsappModalTitle}
                whatsappModalSubtitle={whatsappModalSubtitle}
                whatsappQuestions={whatsappQuestions}
                onWhatsappModalTitleChange={setWhatsappModalTitle}
                onWhatsappModalSubtitleChange={setWhatsappModalSubtitle}
                onWhatsappQuestionsChange={setWhatsappQuestions}
              />
            )}

            {/* Step 2: Select Platforms */}
            {!isLoadingEditData && currentStep === "select" && (
              <PlatformSelectionStep
                selectedPlatforms={selectedPlatforms}
                socialLinks={socialLinks}
                error={errors.platforms}
                touched={touched.platforms}
                onTogglePlatform={togglePlatform}
              />
            )}

            {/* Step 3: Add Links */}
            {!isLoadingEditData && currentStep === "links" && (
              <LinksStep
                selectedPlatforms={selectedPlatforms}
                socialLinks={socialLinks}
                linkErrors={linkErrors}
                error={errors.links}
                touched={touched.links}
                onUpdateLink={updateSocialLink}
                onUpdateCountryCode={updateCountryCode}
                onUpdateDisplayName={updateDisplayName}
                onRemoveLink={removeLinkInstance}
                onAddPlatformInstance={addPlatformInstance}
                onMoveLink={handleMoveLink}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 border-t border-gray-100/50 p-4 sm:p-5 md:p-6 bg-gradient-to-r from-white to-slate-50/30">
            {currentStep !== "basic" && (
              <button
                type="button"
                onClick={handleBackStep}
                className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 text-slate-600 hover:text-slate-700 text-xs sm:text-sm font-medium transition-all duration-300 shadow-sm hover:shadow"
              >
                گەڕانەوە
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 text-slate-600 hover:text-slate-700 text-xs sm:text-sm font-medium transition-all duration-300 shadow-sm hover:shadow ${currentStep === "basic" ? "sm:flex-1" : ""}`}
            >
              هەڵوەشاندنەوە
            </button>
            {isLoadingEditData ? (
              <div className="w-full sm:flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-red-500 rounded-full animate-spin" />
              </div>
            ) : currentStep !== "links" ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  (currentStep === "basic" && !name.trim()) ||
                  (currentStep === "select" && selectedPlatforms.length === 0)
                }
                className="w-full sm:flex-1 rounded-xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-brand-button"
              >
                <span>بەردەوام بە</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Only submit if explicitly clicked and on links step
                  if (currentStep === "links" && !isSubmitting && hasValidLinks) {
                    // Create a synthetic form event for handleSubmit
                    const syntheticEvent = {
                      preventDefault: () => {},
                      stopPropagation: () => {},
                    } as React.FormEvent<HTMLFormElement>;
                    handleSubmit(syntheticEvent);
                  }
                }}
                disabled={isSubmitting || !hasValidLinks || currentStep !== "links"}
                className="w-full sm:flex-1 rounded-xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 via-red-500 to-red-400 hover:from-red-500 hover:via-red-600 hover:to-red-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>پاشەکەوتکردن...</span>
                  </>
                ) : (
                  <span>{isEditMode ? "نوێکردنەوە" : "دروستکردن"}</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});

