/**
 * Language Context - Provides i18n functionality throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Language } from '../types';
import { Translations, getTranslations } from '../i18n';

const LANGUAGE_STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE: Language = 'es';

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        // Try to get from localStorage on initial load
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (stored === 'es' || stored === 'en') {
                return stored;
            }
            // Try to detect browser language
            const browserLang = navigator.language.slice(0, 2);
            if (browserLang === 'es') {
                return 'es';
            }
        }
        return DEFAULT_LANGUAGE;
    });

    const setLanguage = useCallback((newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
    }, []);

    // Persist language changes
    useEffect(() => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }, [language]);

    const t = useMemo(() => getTranslations(language), [language]);

    const value = useMemo(() => ({
        language,
        setLanguage,
        t,
    }), [language, setLanguage, t]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export function useLanguage(): LanguageContextValue {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}

export { LanguageContext };

