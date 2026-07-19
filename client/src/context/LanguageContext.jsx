import { createContext, useContext, useMemo, useState } from "react";
import { LANGUAGES, translations } from "../../i18n/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "jansewa_lang";

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === LANGUAGES.NE ? LANGUAGES.NE : LANGUAGES.EN;
  });

  const changeLang = (next) => {
    setLang(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleLang = () => changeLang(lang === LANGUAGES.EN ? LANGUAGES.NE : LANGUAGES.EN);

  // t(key): looks up the current language's dictionary, falling back to
  // English and finally the raw key itself so a missing translation
  // never breaks the UI.
  const t = useMemo(() => {
    return (key) => translations[lang]?.[key] ?? translations[LANGUAGES.EN]?.[key] ?? key;
  }, [lang]);

  // Pick the right label off a bilingual { label_en, label_ne } object
  // (used for category/sub-category/status metadata from the backend).
  const tLabel = useMemo(() => {
    return (obj) => (lang === LANGUAGES.NE ? obj?.label_ne : obj?.label_en) ?? obj?.label_en ?? "";
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, toggleLang, t, tLabel }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
};
