'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type SupportedLanguage = 'en' | 'es';

type Dictionary = Record<string, any>;

type I18nContextValue = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  ready: boolean;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = 'wb_language';
const COOKIE_KEY = 'wb_language';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es'];
const FALLBACK_LANGUAGE: SupportedLanguage = 'en';

const dictionaryLoaders: Record<SupportedLanguage, () => Promise<{ default: Dictionary }>> = {
  en: () => import('@/app/locales/en/common.json'),
  es: () => import('@/app/locales/es/common.json'),
};

function normalizeLanguage(input: string | null | undefined): SupportedLanguage | null {
  if (!input) return null;
  const raw = input.toLowerCase();
  const primary = raw.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(primary as SupportedLanguage)) {
    return primary as SupportedLanguage;
  }
  return null;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
}

function isSupported(lang: string | null): lang is SupportedLanguage {
  return !!lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

async function detectLanguageWithGeoIp(): Promise<SupportedLanguage | null> {
  const url = process.env.NEXT_PUBLIC_GEOIP_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return null;
    const data: any = await res.json();

    // Try common response shapes
    const countryCode = (data?.country_code || data?.countryCode || data?.country || '').toString().toUpperCase();

    // Minimal mapping (expandable)
    if (
      ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR'].includes(
        countryCode
      )
    ) {
      return 'es';
    }

    return null;
  } catch {
    return null;
  }
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (params[key] ?? `{${key}}`).toString());
}

function getByPath(obj: Dictionary, path: string): any {
  return path.split('.').reduce((acc: any, part) => (acc && typeof acc === 'object' ? acc[part] : undefined), obj);
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(FALLBACK_LANGUAGE);
  const [dict, setDict] = useState<Dictionary>({});
  const [ready, setReady] = useState(false);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    writeCookie(COOKIE_KEY, lang);
  };

  // Initial detection on first visit
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = normalizeLanguage((() => {
        try {
          return localStorage.getItem(STORAGE_KEY);
        } catch {
          return null;
        }
      })());

      const cookie = normalizeLanguage(readCookie(COOKIE_KEY));
      const browser = normalizeLanguage(typeof navigator !== 'undefined' ? navigator.language : null);

      let detected: SupportedLanguage | null = stored || cookie || browser;

      if (!detected) {
        detected = FALLBACK_LANGUAGE;
      }

      // If browser language isn't supported, optionally try Geo-IP
      if (!isSupported(detected)) {
        const geo = await detectLanguageWithGeoIp();
        detected = geo || FALLBACK_LANGUAGE;
      }

      if (cancelled) return;
      setLanguage(detected);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load dictionary when language changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setReady(false);
      try {
        const loader = dictionaryLoaders[language] || dictionaryLoaders[FALLBACK_LANGUAGE];
        const mod = await loader();
        if (cancelled) return;
        setDict(mod.default || {});
      } catch {
        if (cancelled) return;
        setDict({});
      } finally {
        if (cancelled) return;
        setReady(true);
      }

      // Update html lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [language]);

  const t = useMemo(() => {
    return (key: string, params?: Record<string, string | number>) => {
      const value = getByPath(dict, key);
      if (typeof value === 'string') return interpolate(value, params);
      if (value === 0) return '0';
      if (typeof value === 'number') return String(value);
      return key;
    };
  }, [dict]);

  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t, ready }), [language, t, ready]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider');
  return ctx;
}
