"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X, Check } from "lucide-react";

// Simple date utility functions (replacing date-fns)
const formatDate = (date: Date, formatStr: string): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return formatStr
    .replace("yyyy", String(year))
    .replace("MMM", monthNamesShort[month - 1])
    .replace("MMMM", monthNames[month - 1])
    .replace("MM", String(month).padStart(2, '0'))
    .replace("dd", String(day).padStart(2, '0'))
    .replace("d", String(day))
    .replace("HH", String(hours).padStart(2, '0'))
    .replace("mm", String(minutes).padStart(2, '0'));
};

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const subMonths = (date: Date, months: number): Date => {
  return addMonths(date, -months);
};

const startOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const endOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

const eachDayOfInterval = ({ start, end }: { start: Date; end: Date }): Date[] => {
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return isSameDay(date, today);
};

const setYear = (date: Date, year: number): Date => {
  const result = new Date(date);
  result.setFullYear(year);
  return result;
};

const getYear = (date: Date): number => {
  return date.getFullYear();
};

const setHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(hours);
  return result;
};

const setMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(minutes);
  return result;
};

const isBefore = (date1: Date, date2: Date): boolean => {
  return date1.getTime() < date2.getTime();
};

const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  minDate?: Date; // Minimum selectable date (prevents past dates)
  startYearFromCurrent?: boolean; // If true, year dropdown starts from current year
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  style,
  onFocus,
  onBlur,
  minDate,
  startYearFromCurrent = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update currentMonth and tempSelectedDate when value changes externally
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        // Only update if the date is different to avoid unnecessary re-renders
        const currentValue = selectedDate ? formatDate(selectedDate, "yyyy-MM-dd") : null;
        const newValue = formatDate(date, "yyyy-MM-dd");
        if (currentValue !== newValue) {
          setCurrentMonth(date);
          setTempSelectedDate(date);
          setSelectedDate(date);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setShowYearPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month to pad calendar
  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const handleDateSelect = (day: Date) => {
    // Prevent selecting past dates if minDate is set
    if (minDate && isBefore(day, startOfDay(minDate))) {
      return;
    }
    setTempSelectedDate(day);
  };

  const handleOk = () => {
    if (tempSelectedDate) {
      // Set time to noon (12:00) to avoid timezone issues
      const dateWithTime = setMinutes(setHours(tempSelectedDate, 12), 0);
      const formatted = formatDate(dateWithTime, "yyyy-MM-dd'T'HH:mm");
      onChange(formatted);
      setSelectedDate(tempSelectedDate);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(true);
    // If no date is selected, default to today
    if (!selectedDate) {
      const today = new Date();
      setTempSelectedDate(today);
      setCurrentMonth(today);
    } else {
      setTempSelectedDate(selectedDate);
      setCurrentMonth(selectedDate);
    }
  };

  const displayValue = value && selectedDate
    ? formatDate(selectedDate, "MMM dd, yyyy")
    : "";

  // Generate years - from minYear to 2100
  const currentYear = new Date().getFullYear();
  const minYear = minDate ? getYear(minDate) : (startYearFromCurrent ? currentYear : currentYear - 10);
  const maxYear = 2100;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const handleYearChange = (year: number) => {
    const newDate = setYear(currentMonth, year);
    // Ensure we don't go below minDate if set
    if (minDate && isBefore(newDate, startOfMonth(minDate))) {
      const minMonthDate = startOfMonth(minDate);
      setCurrentMonth(minMonthDate);
    } else {
      setCurrentMonth(newDate);
    }
    setShowYearPicker(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={handleInputClick}
        className={`w-full rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm text-left bg-gradient-to-br from-white to-slate-50/50 border border-slate-200 shadow-sm transition-all duration-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-red-400/30 focus-within:border-red-300 cursor-pointer flex items-center gap-2 hover:shadow-md hover:border-red-200 ${className}`}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className={`flex-1 ${displayValue ? "text-slate-700" : "text-slate-400"}`}>
          {displayValue || placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="fixed z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[380px] rounded-2xl overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-100/50 shadow-2xl"
        >
          <div className="p-4 bg-gradient-to-br from-white to-slate-50/20">
            {showYearPicker ? (
              /* Year Picker Grid */
              <div>
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(false)}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-slate-50 transition-colors duration-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-4 gap-2">
                    {years.map((year) => {
                      const isPast = minDate && year < getYear(minDate);
                      const isSelected = getYear(currentMonth) === year;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => handleYearChange(year)}
                          disabled={isPast}
                          className={`px-3 py-2 rounded-xl text-sm transition-all duration-300 ${
                            isPast
                              ? "text-slate-300 cursor-not-allowed bg-slate-50/50"
                              : isSelected
                              ? "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg font-semibold"
                              : "text-slate-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-gray-50 border border-slate-100 hover:border-red-100"
                          }`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Year and Month Navigation */}
                <div className="flex items-center justify-between mb-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-300 text-slate-600 hover:text-slate-700 flex-shrink-0 border border-slate-100 shadow-sm hover:shadow"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowYearPicker(true)}
                    className="text-lg font-semibold text-slate-700 hover:text-red-600 transition-colors duration-300 px-3 py-1 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-red-50 border border-transparent hover:border-red-100"
                  >
                    {formatDate(currentMonth, "yyyy")}
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-300 text-slate-600 hover:text-slate-700 flex-shrink-0 border border-slate-100 shadow-sm hover:shadow"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Day Labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-xs font-medium text-slate-500 text-center py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {paddingDays.map((_, idx) => (
                    <div key={`pad-${idx}`} className="aspect-square" />
                  ))}
                  {daysInMonth.map((day) => {
                    const isSelected = tempSelectedDate && isSameDay(day, tempSelectedDate);
                    const isCurrentDay = isToday(day);
                    return (
                      <button
                        key={day.toString()}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        className={`aspect-square rounded-xl text-sm transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-br from-red-400 to-red-500 text-white shadow-lg scale-105 font-semibold"
                            : isCurrentDay
                            ? "bg-gradient-to-br from-red-50 to-red-50 text-red-600 font-semibold border-2 border-red-200"
                            : "text-slate-600 hover:bg-gradient-to-br hover:from-slate-50 hover:to-gray-50"
                        }`}
                      >
                        {formatDate(day, "d")}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* OK and Cancel Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100/50">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-100 text-sm font-medium text-slate-600 hover:text-slate-700 transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOk}
                disabled={!tempSelectedDate}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-red-400 via-red-500 to-red-400 hover:from-red-500 hover:via-red-600 hover:to-red-500 text-white text-sm font-medium transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <Check className="h-4 w-4" />
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
