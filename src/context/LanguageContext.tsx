import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Language, LocalizedText } from "@/data/site-config";
import { uiTranslations } from "@/data/site-config";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  lt: (text: LocalizedText) => string;
  isRTL: boolean;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>("fr");

  const isRTL = lang === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  const t = useCallback((key: string): string => {
    const entry = uiTranslations[key];
    if (!entry) return key;
    return entry[lang] || entry.fr || key;
  }, [lang]);

  const lt = useCallback((text: LocalizedText): string => {
    return text[lang] || text.fr || "";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, lt, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};
