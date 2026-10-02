import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to { value, label } format
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs rounded-lg',
    md: 'h-11 sm:h-12 px-3.5 text-xs sm:text-[13px] rounded-xl',
    lg: 'h-13 px-4 text-sm rounded-xl',
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full ${sizeClasses[size]} flex items-center justify-between border bg-white font-medium text-[#182019] outline-none transition-all shadow-2xs ${
          isOpen
            ? 'border-[#183c2a] ring-2 ring-[#183c2a]/20'
            : 'border-[#183c2a]/20 hover:border-[#183c2a]/50'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-stone-50' : 'cursor-pointer'}`}
      >
        <span className={`truncate text-left ${!selectedOption ? 'text-stone-400 font-normal' : 'font-semibold text-[#182019]'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[#183c2a] shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'opacity-70'
          }`}
        />
      </button>

      {/* Custom Floating Options Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl border border-[#183c2a]/15 bg-white py-1.5 shadow-[0_12px_30px_rgba(24,60,42,0.12)] transition-all">
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-[13px] transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#183c2a] text-white font-bold'
                    : 'text-[#182019] hover:bg-[#dfe8d7]/50 hover:text-[#183c2a]'
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#c5a880] shrink-0 ml-2" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
