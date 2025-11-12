import React, { useState } from 'react';
import { GeneratedImage, AppAction } from '../types';
import MeditationMode from './MeditationMode';
import ImageEditor from './ImageEditor';

interface ResultDisplayProps {
    image: GeneratedImage;
    onBack: () => void;
    isFromHistory?: boolean;
    onEditImage: (imageToEdit: GeneratedImage, prompt: string) => void;
    isEditingImage: boolean;
    dispatch: React.Dispatch<AppAction>;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, onBack, isFromHistory, onEditImage, isEditingImage, dispatch }) => {
    const [isMeditating, setIsMeditating] = useState(false);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = image.url;
        const filename = `simbolo-poder-${image.scenarioTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpeg`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SectionHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
        <h3 className={`text-xl font-bold mb-3 text-purple-600 dark:text-purple-300 ${className}`}>{children}</h3>
    );

    if (isMeditating) {
        return <MeditationMode image={image} onClose={() => setIsMeditating(false)} />;
    }

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in text-center">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">Tu Símbolo de Poder</h2>
                 <p className="text-gray-500 dark:text-gray-400">{image.scenarioTitle}</p>
                <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mt-2">
                    Esta imagen es una llave visual para tu subconsciente. Edítala, medita en ella y repite tu afirmación.
                </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
                {/* Image */}
                <div className="w-full max-w-lg flex-shrink-0">
                    <img 
                        src={image.url} 
                        alt="Imagen subconsciente generada" 
                        className="rounded-xl shadow-2xl shadow-purple-300/50 dark:shadow-purple-900/50 w-full aspect-square object-cover border-4 border-purple-300 dark:border-purple-500/30"
                    />
                </div>

                {/* Image Editor */}
                <ImageEditor
                    image={image}
                    onEdit={(prompt) => onEditImage(image, prompt)}
                    onUndo={() => dispatch({ type: 'UNDO_IMAGE_EDIT', payload: image.id })}
                    isEditing={isEditingImage}
                />

                {/* Affirmation */}
                <div className="w-full mt-4">
                    <SectionHeader>Afirmación de Poder</SectionHeader>
                    <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-600/30 dark:to-indigo-600/30 p-4 rounded-lg border border-purple-300 dark:border-purple-400/50">
                       <p className="text-lg font-semibold text-gray-900 dark:text-white italic">"{image.affirmation}"</p>
                    </div>
                </div>

                {/* Analysis */}
                <div className="w-full mt-6 text-left">
                    <SectionHeader className="text-center md:text-left">Análisis Simbólico</SectionHeader>
                    <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg border border-gray-200 dark:border-purple-500/30">
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{image.analysis}</p>
                    </div>
                </div>
            </div>

            <div className="text-center mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
                <button
                    onClick={onBack}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-purple-500/50 w-full sm:w-auto"
                >
                    {isFromHistory ? 'Volver a Mis Símbolos' : 'Crear Otro Símbolo'}
                </button>
                <button
                    onClick={handleDownload}
                    className="bg-transparent border-2 border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-300 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-400 dark:hover:text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 w-full sm:w-auto"
                >
                    Descargar Imagen
                </button>
                 <button
                    onClick={() => setIsMeditating(true)}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-cyan-500/50 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Inmersión Profunda</span>
                </button>
            </div>
        </div>
    );
};

export default ResultDisplay;