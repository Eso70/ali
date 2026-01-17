"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X, Globe } from "lucide-react";

interface Country {
  code: string;
  name: string;
}

interface CountrySelectorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Comprehensive list of countries with phone codes - Iraq first
const ALL_COUNTRIES: Country[] = [
  { code: "964", name: "Iraq" },
  { code: "1", name: "United States / Canada" },
  { code: "7", name: "Russia / Kazakhstan" },
  { code: "20", name: "Egypt" },
  { code: "27", name: "South Africa" },
  { code: "30", name: "Greece" },
  { code: "31", name: "Netherlands" },
  { code: "32", name: "Belgium" },
  { code: "33", name: "France" },
  { code: "34", name: "Spain" },
  { code: "36", name: "Hungary" },
  { code: "39", name: "Italy" },
  { code: "40", name: "Romania" },
  { code: "41", name: "Switzerland" },
  { code: "43", name: "Austria" },
  { code: "44", name: "United Kingdom" },
  { code: "45", name: "Denmark" },
  { code: "46", name: "Sweden" },
  { code: "47", name: "Norway" },
  { code: "48", name: "Poland" },
  { code: "49", name: "Germany" },
  { code: "51", name: "Peru" },
  { code: "52", name: "Mexico" },
  { code: "53", name: "Cuba" },
  { code: "54", name: "Argentina" },
  { code: "55", name: "Brazil" },
  { code: "56", name: "Chile" },
  { code: "57", name: "Colombia" },
  { code: "58", name: "Venezuela" },
  { code: "60", name: "Malaysia" },
  { code: "61", name: "Australia" },
  { code: "62", name: "Indonesia" },
  { code: "63", name: "Philippines" },
  { code: "64", name: "New Zealand" },
  { code: "65", name: "Singapore" },
  { code: "66", name: "Thailand" },
  { code: "81", name: "Japan" },
  { code: "82", name: "South Korea" },
  { code: "84", name: "Vietnam" },
  { code: "86", name: "China" },
  { code: "90", name: "Turkey" },
  { code: "91", name: "India" },
  { code: "92", name: "Pakistan" },
  { code: "93", name: "Afghanistan" },
  { code: "94", name: "Sri Lanka" },
  { code: "95", name: "Myanmar" },
  { code: "98", name: "Iran" },
  { code: "212", name: "Morocco" },
  { code: "213", name: "Algeria" },
  { code: "216", name: "Tunisia" },
  { code: "218", name: "Libya" },
  { code: "220", name: "Gambia" },
  { code: "221", name: "Senegal" },
  { code: "222", name: "Mauritania" },
  { code: "223", name: "Mali" },
  { code: "224", name: "Guinea" },
  { code: "225", name: "Ivory Coast" },
  { code: "226", name: "Burkina Faso" },
  { code: "227", name: "Niger" },
  { code: "228", name: "Togo" },
  { code: "229", name: "Benin" },
  { code: "230", name: "Mauritius" },
  { code: "231", name: "Liberia" },
  { code: "232", name: "Sierra Leone" },
  { code: "233", name: "Ghana" },
  { code: "234", name: "Nigeria" },
  { code: "235", name: "Chad" },
  { code: "236", name: "Central African Republic" },
  { code: "237", name: "Cameroon" },
  { code: "238", name: "Cape Verde" },
  { code: "239", name: "São Tomé and Príncipe" },
  { code: "240", name: "Equatorial Guinea" },
  { code: "241", name: "Gabon" },
  { code: "242", name: "Republic of the Congo" },
  { code: "243", name: "Democratic Republic of the Congo" },
  { code: "244", name: "Angola" },
  { code: "245", name: "Guinea-Bissau" },
  { code: "246", name: "British Indian Ocean Territory" },
  { code: "248", name: "Seychelles" },
  { code: "249", name: "Sudan" },
  { code: "250", name: "Rwanda" },
  { code: "251", name: "Ethiopia" },
  { code: "252", name: "Somalia" },
  { code: "253", name: "Djibouti" },
  { code: "254", name: "Kenya" },
  { code: "255", name: "Tanzania" },
  { code: "256", name: "Uganda" },
  { code: "257", name: "Burundi" },
  { code: "258", name: "Mozambique" },
  { code: "260", name: "Zambia" },
  { code: "261", name: "Madagascar" },
  { code: "262", name: "Réunion / Mayotte" },
  { code: "263", name: "Zimbabwe" },
  { code: "264", name: "Namibia" },
  { code: "265", name: "Malawi" },
  { code: "266", name: "Lesotho" },
  { code: "267", name: "Botswana" },
  { code: "268", name: "Eswatini" },
  { code: "269", name: "Comoros" },
  { code: "290", name: "Saint Helena" },
  { code: "291", name: "Eritrea" },
  { code: "297", name: "Aruba" },
  { code: "298", name: "Faroe Islands" },
  { code: "299", name: "Greenland" },
  { code: "350", name: "Gibraltar" },
  { code: "351", name: "Portugal" },
  { code: "352", name: "Luxembourg" },
  { code: "353", name: "Ireland" },
  { code: "354", name: "Iceland" },
  { code: "355", name: "Albania" },
  { code: "356", name: "Malta" },
  { code: "357", name: "Cyprus" },
  { code: "358", name: "Finland" },
  { code: "359", name: "Bulgaria" },
  { code: "370", name: "Lithuania" },
  { code: "371", name: "Latvia" },
  { code: "372", name: "Estonia" },
  { code: "373", name: "Moldova" },
  { code: "374", name: "Armenia" },
  { code: "375", name: "Belarus" },
  { code: "376", name: "Andorra" },
  { code: "377", name: "Monaco" },
  { code: "378", name: "San Marino" },
  { code: "380", name: "Ukraine" },
  { code: "381", name: "Serbia" },
  { code: "382", name: "Montenegro" },
  { code: "383", name: "Kosovo" },
  { code: "385", name: "Croatia" },
  { code: "386", name: "Slovenia" },
  { code: "387", name: "Bosnia and Herzegovina" },
  { code: "389", name: "North Macedonia" },
  { code: "420", name: "Czech Republic" },
  { code: "421", name: "Slovakia" },
  { code: "423", name: "Liechtenstein" },
  { code: "500", name: "Falkland Islands" },
  { code: "501", name: "Belize" },
  { code: "502", name: "Guatemala" },
  { code: "503", name: "El Salvador" },
  { code: "504", name: "Honduras" },
  { code: "505", name: "Nicaragua" },
  { code: "506", name: "Costa Rica" },
  { code: "507", name: "Panama" },
  { code: "508", name: "Saint Pierre and Miquelon" },
  { code: "509", name: "Haiti" },
  { code: "590", name: "Guadeloupe" },
  { code: "591", name: "Bolivia" },
  { code: "592", name: "Guyana" },
  { code: "593", name: "Ecuador" },
  { code: "594", name: "French Guiana" },
  { code: "595", name: "Paraguay" },
  { code: "596", name: "Martinique" },
  { code: "597", name: "Suriname" },
  { code: "598", name: "Uruguay" },
  { code: "599", name: "Netherlands Antilles" },
  { code: "670", name: "East Timor" },
  { code: "672", name: "Antarctica" },
  { code: "673", name: "Brunei" },
  { code: "674", name: "Nauru" },
  { code: "675", name: "Papua New Guinea" },
  { code: "676", name: "Tonga" },
  { code: "677", name: "Solomon Islands" },
  { code: "678", name: "Vanuatu" },
  { code: "679", name: "Fiji" },
  { code: "680", name: "Palau" },
  { code: "681", name: "Wallis and Futuna" },
  { code: "682", name: "Cook Islands" },
  { code: "683", name: "Niue" },
  { code: "685", name: "Samoa" },
  { code: "686", name: "Kiribati" },
  { code: "687", name: "New Caledonia" },
  { code: "688", name: "Tuvalu" },
  { code: "689", name: "French Polynesia" },
  { code: "690", name: "Tokelau" },
  { code: "691", name: "Micronesia" },
  { code: "692", name: "Marshall Islands" },
  { code: "850", name: "North Korea" },
  { code: "852", name: "Hong Kong" },
  { code: "853", name: "Macau" },
  { code: "855", name: "Cambodia" },
  { code: "856", name: "Laos" },
  { code: "880", name: "Bangladesh" },
  { code: "886", name: "Taiwan" },
  { code: "960", name: "Maldives" },
  { code: "961", name: "Lebanon" },
  { code: "962", name: "Jordan" },
  { code: "963", name: "Syria" },
  { code: "965", name: "Kuwait" },
  { code: "966", name: "Saudi Arabia" },
  { code: "967", name: "Yemen" },
  { code: "968", name: "Oman" },
  { code: "970", name: "Palestine" },
  { code: "971", name: "United Arab Emirates" },
  { code: "972", name: "Israel" },
  { code: "973", name: "Bahrain" },
  { code: "974", name: "Qatar" },
  { code: "975", name: "Bhutan" },
  { code: "976", name: "Mongolia" },
  { code: "977", name: "Nepal" },
  { code: "992", name: "Tajikistan" },
  { code: "993", name: "Turkmenistan" },
  { code: "994", name: "Azerbaijan" },
  { code: "995", name: "Georgia" },
  { code: "996", name: "Kyrgyzstan" },
  { code: "998", name: "Uzbekistan" },
];

export function CountrySelector({
  value,
  onChange,
  className = "",
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mount check for portal - use startTransition to avoid cascading renders
  useEffect(() => {
    // Use setTimeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Find selected country - default to Iraq (964)
  const selectedCountry = useMemo(() => {
    const code = value || "964";
    return ALL_COUNTRIES.find((c) => c.code === code) || ALL_COUNTRIES[0];
  }, [value]);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) {
      return ALL_COUNTRIES;
    }
    const query = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.includes(query) ||
        `+${country.code}`.includes(query)
    );
  }, [searchQuery]);

  // Handle country selection
  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Toggle modal
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery("");
    }
  };

  // Close modal
  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && mounted) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mounted]);

  if (!mounted) {
    return (
      <button
        type="button"
        className={`flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-red-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/30 min-w-[100px] shadow-sm ${className}`}
      >
        <span className="font-medium">+{value || "964"}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
    );
  }

  const modalContent = isOpen ? (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-lg animate-in fade-in duration-300"
        onClick={handleClose}
        aria-hidden
      />
      
      {/* Modal container - centered like template selector */}
      <div 
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[500px] max-w-[500px] max-h-[600px] overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-100/50 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-100/50 bg-gradient-to-r from-white to-red-50/20">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-red-50 to-red-50 border border-red-100 p-2 shadow-sm">
                <Globe className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-700">
                  وڵات هەڵبژێرە
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {ALL_COUNTRIES.length} وڵات
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 rounded-xl p-2 bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 text-slate-500 hover:text-slate-700 transition-all duration-300 border border-slate-100 shadow-sm hover:shadow"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-3 sm:p-4 border-b border-gray-100/50 bg-gradient-to-br from-white to-slate-50/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search country or code..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-400/30 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors duration-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Countries List */}
        <div 
          className="overflow-y-auto p-2 bg-gradient-to-br from-white to-slate-50/20"
          style={{ 
            scrollbarWidth: "thin", 
            scrollbarColor: "rgba(156,163,175,0.5) transparent",
            maxHeight: "calc(600px - 180px)",
          }}
        >
          {filteredCountries.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No countries found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCountries.map((country) => {
                const isSelected = (value || "964") === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country.code)}
                    className={`w-full px-4 py-3 text-left text-sm transition-all duration-300 rounded-xl ${
                      isSelected
                        ? "bg-gradient-to-r from-red-50 to-red-50 text-red-700 border-l-4 border-red-400 shadow-md font-semibold"
                        : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 hover:text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-base">+{country.code}</span>
                      <span className="text-slate-500 text-sm truncate flex-1 text-right">
                        {country.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className={`flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/50 px-3 py-2 text-sm text-slate-700 transition-all duration-300 hover:border-red-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400/30 min-w-[100px] shadow-sm ${className}`}
      >
        <span className="font-medium">+{selectedCountry.code}</span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
