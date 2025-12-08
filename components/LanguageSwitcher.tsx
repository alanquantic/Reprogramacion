/**
 * Language Switcher Component - Toggle between Spanish and English
 */

import React, { memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';

const LanguageSwitcher: React.FC = memo(() => {
    const { language, setLanguage } = useLanguage();

    const handleToggle = () => {
        const newLanguage: Language = language === 'es' ? 'en' : 'es';
        setLanguage(newLanguage);
    };

    return (
        <button
            onClick={handleToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors text-sm font-medium text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30"
            aria-label={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
        >
            <span className="text-base">🌐</span>
            <span className="uppercase font-bold">{language === 'es' ? 'ES' : 'EN'}</span>
        </button>
    );
});

LanguageSwitcher.displayName = 'LanguageSwitcher';

export default LanguageSwitcher;

