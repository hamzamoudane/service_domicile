import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/lib/i18n";

const LanguageContext = createContext({ lang: "fr", t: (k) => k, setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    if (typeof window === "undefined") return "fr";
    return localStorage.getItem("sos_lang") || "fr";
  });

  useEffect(() => {
    localStorage.setItem("sos_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => setLangState(l);
  const t = (key) => translations[lang]?.[key] || translations.fr[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, t, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
