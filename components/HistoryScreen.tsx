import React from 'react';
import { GeneratedImage } from '../types';
import { DeleteIcon } from './icons/Icons';

interface HistoryScreenProps {
    history: GeneratedImage[];
    onViewItem: (image: GeneratedImage) => void;
    onDeleteItem: (imageId: string) => void;
    onStartNew: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onViewItem, onDeleteItem, onStartNew }) => {
    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 animate-fade-in">
                <h2 className="text-3xl font-bold mb-4 text-purple-600 dark:text-purple-300">Tu Galería de Símbolos está Vacía</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    Crea tu primer símbolo para comenzar tu viaje de transformación y verlo aquí.
                </p>
                <button
                    onClick={onStartNew}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-purple-500/50"
                >
                    Crear Primer Símbolo
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-2">Mis Símbolos de Poder</h2>
                <p className="text-gray-600 dark:text-gray-400">Tu galería personal de transformación. Revisa y medita sobre tu progreso.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {history.map((item) => (
                    <div key={item.id} className="group relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-purple-500/30 bg-white dark:bg-gray-800/50 shadow-lg transition-all duration-300 hover:shadow-purple-300/50 dark:hover:shadow-purple-500/30 hover:border-purple-500 dark:hover:border-purple-400 transform hover:-translate-y-1">
                        <button onClick={() => onViewItem(item)} className="block w-full text-left">
                            <img src={item.url} alt={item.prompt} className="w-full h-56 object-cover" />
                            <div className="p-4">
                                <h3 className="text-lg font-bold truncate text-gray-900 dark:text-white">{item.scenarioTitle}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic truncate">"{item.affirmation}"</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{new Date(item.timestamp).toLocaleDateString()}</p>
                            </div>
                        </button>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteItem(item.id);
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            aria-label="Eliminar símbolo"
                        >
                            <DeleteIcon />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoryScreen;