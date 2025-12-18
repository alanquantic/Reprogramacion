import React from 'react';
import type { ContentLanguage } from '../types';

interface LanguageSelectionScreenProps {
    onSelectLanguage: (language: ContentLanguage) => void;
}

const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({ onSelectLanguage }) => {
    return (
        <div className="language-selection-screen">
            <div className="language-selection-content">
                <p className="language-subtitle">Choose your language / Escoge tu idioma</p>
                
                <div className="language-options-horizontal">
                    <button className="language-option-h" onClick={() => onSelectLanguage('es-latam')}>
                        <span className="language-flag-h">🇲🇽</span>
                        <span className="language-name-h">Español</span>
                    </button>
                    
                    <button className="language-option-h" onClick={() => onSelectLanguage('en')}>
                        <span className="language-flag-h">🇺🇸</span>
                        <span className="language-name-h">English</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LanguageSelectionScreen;

