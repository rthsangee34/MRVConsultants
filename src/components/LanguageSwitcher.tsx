import React, { useState, useEffect, useRef, useCallback } from 'react';

export type LanguageCode = 'en' | 'si' | 'ta';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  desktopLabel: string;
  mobileLabel: string;
  flag: string;
  locale: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    name: 'English (US)',
    desktopLabel: 'English',
    mobileLabel: 'EN',
    flag: '🇺🇸',
    locale: 'en-US',
  },
  {
    code: 'si',
    name: 'සිංහල',
    desktopLabel: 'සිංහල',
    mobileLabel: 'SI',
    flag: '🇱🇰',
    locale: 'si-LK',
  },
  {
    code: 'ta',
    name: 'தமிழ்',
    desktopLabel: 'தமிழ்',
    mobileLabel: 'TA',
    flag: '🇱🇰',
    locale: 'ta-LK',
  },
];

export interface LanguageSwitcherProps {
  /** Optional callback fired immediately when a language is selected */
  onLanguageChange?: (language: LanguageCode, option: LanguageOption) => void;
  /** Optional default language code if none is saved in localStorage */
  defaultLanguage?: LanguageCode;
  /** Optional additional CSS class names */
  className?: string;
}

const STORAGE_KEY = 'language';
const LEGACY_STORAGE_KEY = 'mrvc_lang';

function normalizeLanguageCode(raw: string | null | undefined): LanguageCode {
  if (!raw) return 'en';
  const cleaned = raw.toLowerCase().trim();
  if (cleaned.startsWith('si')) return 'si';
  if (cleaned.startsWith('ta')) return 'ta';
  return 'en';
}

function getInitialLanguage(defaultLanguage: LanguageCode = 'en'): LanguageCode {
  if (typeof window === 'undefined') return defaultLanguage;

  try {
    const savedPrimary = window.localStorage.getItem(STORAGE_KEY);
    if (savedPrimary) return normalizeLanguageCode(savedPrimary);

    const savedLegacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (savedLegacy) return normalizeLanguageCode(savedLegacy);

    const cookieMatch = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
    if (cookieMatch && cookieMatch[1]) {
      return normalizeLanguageCode(cookieMatch[1]);
    }
  } catch {
    // Ignore storage read errors in restricted environments
  }

  return defaultLanguage;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  onLanguageChange,
  defaultLanguage = 'en',
  className = '',
}) => {
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(() =>
    getInitialLanguage(defaultLanguage)
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerBtnRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === selectedLang) || LANGUAGE_OPTIONS[0];

  const applyLanguageSelection = useCallback(
    (langCode: LanguageCode, triggerGlobalUpdate: boolean = true) => {
      const normalized = normalizeLanguageCode(langCode);
      const matchedOption =
        LANGUAGE_OPTIONS.find((opt) => opt.code === normalized) || LANGUAGE_OPTIONS[0];

      setSelectedLang(normalized);

      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, normalized);
          window.localStorage.setItem(LEGACY_STORAGE_KEY, normalized);
        } catch {
          // Ignore storage write errors
        }

        document.documentElement.setAttribute('lang', matchedOption.locale);

        if (triggerGlobalUpdate) {
          const globalChanger = (
            window as unknown as { changeSiteLanguage?: (code: string) => void }
          ).changeSiteLanguage;
          if (typeof globalChanger === 'function') {
            globalChanger(normalized);
          }
        }
      }

      if (onLanguageChange) {
        onLanguageChange(normalized, matchedOption);
      }
    },
    [onLanguageChange]
  );

  // Sync saved language when component mounts
  useEffect(() => {
    const initial = getInitialLanguage(defaultLanguage);
    setSelectedLang(initial);
    try {
      window.localStorage.setItem(STORAGE_KEY, initial);
      window.localStorage.setItem(LEGACY_STORAGE_KEY, initial);
    } catch {
      // Ignore storage errors
    }
  }, [defaultLanguage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus active option when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const activeIdx = LANGUAGE_OPTIONS.findIndex((o) => o.code === selectedLang);
      const idx = activeIdx >= 0 ? activeIdx : 0;
      setFocusedIndex(idx);
      requestAnimationFrame(() => {
        optionRefs.current[idx]?.focus();
      });
    }
  }, [isOpen, selectedLang]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelectOption = (option: LanguageOption) => {
    setIsOpen(false);
    applyLanguageSelection(option.code, true);
    triggerBtnRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        triggerBtnRef.current?.focus();
        break;
      case 'ArrowDown': {
        event.preventDefault();
        const nextIdx = (focusedIndex + 1) % LANGUAGE_OPTIONS.length;
        setFocusedIndex(nextIdx);
        optionRefs.current[nextIdx]?.focus();
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const prevIdx =
          (focusedIndex - 1 + LANGUAGE_OPTIONS.length) % LANGUAGE_OPTIONS.length;
        setFocusedIndex(prevIdx);
        optionRefs.current[prevIdx]?.focus();
        break;
      }
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        optionRefs.current[0]?.focus();
        break;
      case 'End': {
        event.preventDefault();
        const lastIdx = LANGUAGE_OPTIONS.length - 1;
        setFocusedIndex(lastIdx);
        optionRefs.current[lastIdx]?.focus();
        break;
      }
      case 'Tab':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={`mrvc-lang-switcher ${isOpen ? 'is-open' : ''} ${className}`.trim()}
      onKeyDown={handleKeyDown}
    >
      {/* Dropdown Menu */}
      <div
        id="mrvc-lang-dropdown"
        className={`mrvc-lang-dropdown ${isOpen ? 'is-open' : ''}`}
        role="listbox"
        aria-label="Select Website Language"
        aria-hidden={!isOpen}
      >
        <div className="mrvc-lang-dropdown-header">
          <span className="mrvc-lang-globe" aria-hidden="true">
            🌐
          </span>
          <span>Select Language</span>
        </div>

        <div className="mrvc-lang-options-list">
          {LANGUAGE_OPTIONS.map((option, index) => {
            const isSelected = option.code === selectedLang;
            return (
              <button
                key={option.code}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                tabIndex={isOpen ? 0 : -1}
                className={`mrvc-lang-option ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleSelectOption(option)}
              >
                <span className="mrvc-lang-option-left">
                  <span className="mrvc-lang-flag" aria-hidden="true">
                    {option.flag}
                  </span>
                  <span className="mrvc-lang-name">{option.name}</span>
                </span>
                {isSelected && (
                  <span className="mrvc-lang-check" aria-hidden="true">
                    ✔
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Floating Pill Button */}
      <button
        ref={triggerBtnRef}
        type="button"
        className="mrvc-lang-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="mrvc-lang-dropdown"
        aria-label={`Current language: ${currentOption.name}. Click to change language`}
        onClick={handleToggle}
      >
        <span className="mrvc-lang-globe" aria-hidden="true">
          🌐
        </span>
        <span className="mrvc-lang-label-desktop">{currentOption.desktopLabel}</span>
        <span className="mrvc-lang-label-mobile">{currentOption.mobileLabel}</span>
        <span className="mrvc-lang-caret" aria-hidden="true">
          ▼
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
