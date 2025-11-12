import React from 'react';

interface WelcomeScreenProps {
    onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4">
            <div className="max-w-3xl">
                <h2 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 animate-fade-in-down">
                    Despierta tu Poder Interior
                </h2>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up">
                    Accede a la sabiduría de tu alma. Transforma tus bloqueos en poder a través de imágenes arquetípicas que reprograman tu subconsciente y alinean tu realidad con tu verdadero propósito.
                </p>
                <button
                    onClick={onStart}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-purple-500/50 animate-bounce-slow"
                >
                    Iniciar Viaje de Sanación
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;