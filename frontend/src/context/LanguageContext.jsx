import { createContext, useContext, useEffect, useState } from 'react';
import { translate } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('cervibloom-language') || 'en');
  useEffect(() => {
    localStorage.setItem('cervibloom-language', language);
    document.documentElement.lang = language;
  }, [language]);
  const t = (key) => translate(language, key);
  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
