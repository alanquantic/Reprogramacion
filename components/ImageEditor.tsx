import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { SpinnerIcon } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageEditorProps {
    image: GeneratedImage;
    onEdit: (prompt: string) => void;
    onUndo: () => void;
    isEditing: boolean;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ image, onEdit, onUndo, isEditing }) => {
    const { t } = useLanguage();
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim()) {
            onEdit(prompt);
            setPrompt('');
        }
    };

    return (
        <div className="w-full mt-8 p-6 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-purple-500/30 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-4 text-center text-purple-600 dark:text-purple-300">{t.imageEditorTitle}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4 text-sm">{t.imageEditorDesc}</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.imageEditorPlaceholder}
                    className="w-full flex-grow p-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-purple-500/50 rounded-full focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none text-gray-900 dark:text-white transition-colors"
                    disabled={isEditing}
                    aria-label="Image edit prompt"
                />
                <button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isEditing || !prompt.trim()}
                    aria-live="polite"
                >
                    {isEditing ? <><SpinnerIcon className="w-5 h-5 mr-2" /> {t.imageEditorEditing}</> : t.imageEditorButton}
                </button>
            </form>
            {image.originalUrl && (
                <div className="text-center mt-4">
                    <button onClick={onUndo} className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100 transition-colors disabled:opacity-50" disabled={isEditing}>
                        {t.imageEditorUndo}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageEditor;
