"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import "./login-compat.css";

// Simplified validation (no zod for faster load)
const validateUsername = (username: string): string | null => {
  if (!username || username.trim().length < 3) {
    return "ناوی بەکارهێنەر پێویستە لانیکەم ٣ پیت بێت";
  }
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password || password.length < 6) {
    return "تێپەڕەوشە پێویستە لانیکەم ٦ پیت بێت";
  }
  return null;
};

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    setUsernameError(null);
    setPasswordError(null);
    
    // Validate
    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);
    
    if (usernameErr || passwordErr) {
      setUsernameError(usernameErr);
      setPasswordError(passwordErr);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        cache: 'no-store', // Always fetch fresh data
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe: true,
        }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "ناوی بەکارهێنەر یان تێپەڕەوشە هەڵەیە");
        setIsLoading(false);
        return;
      }

      // Login successful - redirect immediately
      window.location.href = "/admin";
    } catch (err) {
      console.error("Login error:", err);
      setError("هەڵەیەکی نادیار ڕوویدا");
      setIsLoading(false);
    }
  }, [username, password]);

  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Cross-platform viewport height fix
  useEffect(() => {
    // Fix viewport height for all browsers and devices
    const setViewportHeight = () => {
      // Get actual viewport height
      const vh = window.innerHeight * 0.01;
      // Set CSS custom property for viewport height
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial viewport height
    setViewportHeight();

    // Update on resize and orientation change
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    
    // iOS Safari specific: Update after a short delay
    setTimeout(setViewportHeight, 100);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Prevent form submission on Enter key if inputs are invalid (cross-browser)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (usernameError || passwordError)) {
      e.preventDefault();
    }
  }, [usernameError, passwordError]);

  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row bg-primary relative" 
      style={{ 
        backgroundColor: '#ffffff',
        background: '#ffffff',
        backgroundImage: 'none'
      }}
    >
      {/* Back to home button - Top */}
      <button
        onClick={handleGoHome}
        className="fixed top-4 left-4 lg:top-6 lg:left-6 z-50 group flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50/80 transition-all duration-300"
        aria-label="Go to home page"
        title="گەڕانەوە بۆ پەڕەی سەرەکی"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">گەڕانەوە</span>
      </button>

      {/* Left Side - Yellow Background with Text */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center px-8 xl:px-16 py-12 relative overflow-hidden" 
        style={{ 
          background: 'linear-gradient(to bottom right, rgba(248, 113, 113, 0.95), rgba(239, 68, 68, 0.85), rgba(248, 113, 113, 0.95))',
          backgroundColor: 'rgba(248, 113, 113, 0.9)'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-md text-center space-y-8 z-10">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-90 backdrop-blur-sm border border-brand-200/50 shadow-sm">
                <Image
                  src="/images/Logo.jpg"
                  alt="Ali Network Logo"
                  width={80}
                  height={80}
                  className="rounded-full"
                  priority
                  quality={85}
                />
              </div>
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-slate-800">
              بەخێربێیت
            </h2>
            <p className="text-lg xl:text-xl text-slate-700 leading-relaxed">
              پەیجەکانت بەڕێوە ببەو داتاکان ببینە.
            </p>
          </div>
          <div className="pt-6 border-t border-red-400/30">
            <p className="text-base text-slate-600">
              بەکارهێنانی ئاسان و خێرا بۆ بەڕێوەبردنی پەیجەکانت
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form with White Background */}
      <div 
        className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12 bg-primary relative overflow-hidden" 
        style={{ 
          backgroundColor: '#ffffff',
          background: '#ffffff',
          backgroundImage: 'none'
        }}
      >
        <div className="w-full max-w-md relative z-10">
          {/* Logo Section - Only on mobile */}
          <div className="flex lg:hidden flex-col items-center gap-4 mb-8">
            <div className="relative h-16 w-16">
              <div className="relative h-full w-full overflow-hidden rounded-full bg-primary shadow-sm border border-slate-100">
                <Image
                  src="/images/Logo.jpg"
                  alt="Ali Network Logo"
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  priority
                  sizes="64px"
                  quality={85}
                />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-700 mb-1">
                چوونەژوورەوە
              </h1>
              <p className="text-sm text-slate-500">
                بەخێربێیت بۆ Ali Network
              </p>
            </div>
          </div>

          {/* Title for desktop - Centered */}
          <div className="hidden lg:block mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-700 mb-2">
              چوونەژوورەوە
            </h1>
            <p className="text-sm text-slate-500">
              بەخێربێیت بۆ Ali Network
            </p>
          </div>

          {/* Login Form */}
          <form 
            onSubmit={handleSubmit} 
            onKeyDown={handleKeyDown}
            className="w-full flex flex-col gap-5"
            noValidate
            autoComplete="on"
          >
            {/* Error Message */}
            {(error || usernameError || passwordError) && (
              <div className="w-full rounded-xl px-4 py-3 text-sm border border-red-200/50 bg-red-50/50 text-red-600 text-center">
                {error || usernameError || passwordError}
              </div>
            )}

            {/* Username Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600 text-right">
                ناوی بەکارهێنەر
              </label>
              <input
                type="text"
                autoComplete="username"
                autoFocus={true}
                placeholder="ناوی بەکارهێنەرەکەت بنووسە"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError(null);
                }}
                disabled={isLoading}
                className="w-full rounded-xl px-4 py-3 text-base text-right border bg-primary-90 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 placeholder:text-slate-400"
                  style={{
                    borderColor: usernameError ? '#ef4444' : 'rgba(226, 232, 240, 0.5)',
                  minHeight: '48px',
                  fontSize: '16px',
                }}
                onFocus={(e) => {
                  if (!usernameError) {
                    e.currentTarget.style.borderColor = '#ef4444';
                  }
                }}
                onBlur={(e) => {
                  if (!usernameError) {
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)';
                  }
                }}
              />
            </div>
            
            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-600 text-right">
                تێپەڕەوشە
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="تێپەڕەوشە بنووسە"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  disabled={isLoading}
                  className="w-full rounded-xl pr-4 pl-12 py-3 text-base text-right border bg-primary-90 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 placeholder:text-slate-400"
                  style={{
                    borderColor: passwordError ? '#ef4444' : 'rgba(226, 232, 240, 0.5)',
                    minHeight: '48px',
                    fontSize: '16px',
                  }}
                  onFocus={(e) => {
                    if (!passwordError) {
                      e.currentTarget.style.borderColor = '#ef4444';
                    }
                  }}
                  onBlur={(e) => {
                    if (!passwordError) {
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.5)';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed p-1.5 transition-colors rounded-lg hover:bg-slate-50/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl px-4 py-3 text-base font-medium text-white shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-brand-button"
              style={{
                minHeight: '48px',
              }}
            >
              {isLoading ? "چاوەڕوان بە..." : "چوونەژوورەوە"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

