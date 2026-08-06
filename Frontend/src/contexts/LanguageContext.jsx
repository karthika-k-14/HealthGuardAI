import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, setItem } from '../utils/storage';
import { LANGUAGES, DEFAULT_LANGUAGE_CODE } from '../constants/languages';

const LanguageContext = createContext(undefined);

function getInitialLanguage() {
  const stored = getItem(STORAGE_KEYS.LANGUAGE);
  if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  return DEFAULT_LANGUAGE_CODE;
}

export function LanguageProvider({ children }) {
  const [languageCode, setLanguageCode] = useState(getInitialLanguage);
  const { i18n } = useTranslation();

  useEffect(() => {
    setItem(STORAGE_KEYS.LANGUAGE, languageCode);
    document.documentElement.setAttribute('lang', languageCode);
    if (i18n.language !== languageCode) {
      i18n.changeLanguage(languageCode);
    }
  }, [languageCode, i18n]);

  const t = useMemo(() => {
    return (key, options) => {
      if (!key) return '';
      if (typeof key !== 'string') return key;
      return i18n.t(key, { lng: languageCode, ...options });
    };
  }, [languageCode, i18n]);

  const value = useMemo(
    () => ({
      languageCode,
      language: LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0],
      languages: LANGUAGES,
      setLanguageCode,
      t,
    }),
    [languageCode, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

