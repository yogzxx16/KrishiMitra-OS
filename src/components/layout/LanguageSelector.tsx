import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import type { LanguageCode } from '../../types';

export function LanguageSelector() {
  const { setLanguage } = useAppStore();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLang = (i18n.resolvedLanguage || 'en') as LanguageCode;

  function selectLang(lang: LanguageCode) {
    i18n.changeLanguage(lang);
    setLanguage(lang); // Keep appStore in sync if needed elsewhere
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 h-6 px-2 rounded hover:bg-gray-700 transition-colors text-xs font-semibold focus-visible:ring-2 focus-visible:ring-saffron outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        <Globe className="h-3 w-3" aria-hidden="true" />
        <span>{t(`nav.${currentLang}`, 'Language')}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <motion.ul
              role="listbox"
              aria-label="Language options"
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 z-20 min-w-[120px] bg-white border border-gray-200 rounded shadow-lg overflow-hidden py-1 text-gray-800"
            >
              {(['en', 'hi', 'ta'] as LanguageCode[]).map(
                (code) => (
                  <li key={code}>
                    <button
                      role="option"
                      aria-selected={currentLang === code}
                      onClick={() => selectLang(code)}
                      className={[
                        'w-full text-left px-4 py-2 text-sm transition-colors focus:bg-gray-100 outline-none',
                        currentLang === code
                          ? 'bg-[var(--color-goi-green)] text-white font-semibold hover:bg-[var(--color-goi-green-dark)]'
                          : 'hover:bg-gray-100',
                      ].join(' ')}
                    >
                      {t(`nav.${code}`)}
                    </button>
                  </li>
                )
              )}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
