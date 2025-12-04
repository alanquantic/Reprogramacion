import React, { useState, useCallback, memo } from 'react';

interface OnboardingStep {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: '¡Bienvenido a Reprogramación Visual!',
        description: 'Una experiencia de meditación guiada con símbolos visuales generados por IA para ayudarte a transformar bloqueos internos.',
        icon: (
            <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        ),
    },
    {
        title: 'Elige tu Área de Enfoque',
        description: 'Selecciona entre 4 áreas: Físico, Económico, Espiritual o Energético. Cada área tiene escenarios diseñados para trabajar bloqueos específicos.',
        icon: (
            <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        title: 'Genera tu Símbolo de Poder',
        description: 'La IA creará una imagen simbólica única y un análisis personalizado basado en tu intención. También puedes crear tu propio símbolo personalizado.',
        icon: (
            <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        title: 'Meditación Inmersiva',
        description: 'Entra en "Inmersión Profunda" para una experiencia meditativa con narración de voz, música relajante y visualización de tu símbolo.',
        icon: (
            <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = memo(({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = useCallback(() => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    }, [currentStep, onComplete]);

    const handleSkip = useCallback(() => {
        onComplete();
    }, [onComplete]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const step = ONBOARDING_STEPS[currentStep];
    const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

    return (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-8">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentStep(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentStep 
                                    ? 'w-8 bg-purple-500' 
                                    : index < currentStep 
                                        ? 'bg-purple-300' 
                                        : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            aria-label={`Ir al paso ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        {step.icon}
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {step.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {step.description}
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg shadow-purple-500/30"
                    >
                        {isLastStep ? '¡Comenzar!' : 'Siguiente'}
                    </button>
                    
                    <div className="flex justify-between">
                        {currentStep > 0 ? (
                            <button
                                onClick={handlePrevious}
                                className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 text-sm transition-colors"
                            >
                                ← Anterior
                            </button>
                        ) : (
                            <div />
                        )}
                        
                        {!isLastStep && (
                            <button
                                onClick={handleSkip}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm transition-colors"
                            >
                                Saltar tutorial
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

Onboarding.displayName = 'Onboarding';

export default Onboarding;

