import React from 'react';
import { LoadingStep } from '../types';
import { LOADING_STEPS } from '../constants';
import { CheckCircleIcon, SpinnerIcon } from './icons/Icons';

interface LoadingScreenProps {
    currentStep: LoadingStep;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ currentStep }) => {
    const steps = Object.keys(LOADING_STEPS) as (keyof typeof LOADING_STEPS)[];
    const currentStepIndex = steps.indexOf(currentStep ?? 'prompt');

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center px-4 overflow-hidden animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8 animate-fade-in-down">
                Forjando tu Símbolo...
            </h2>
            
            <div className="w-full max-w-md">
                <ul className="space-y-4">
                    {steps.map((stepKey, index) => {
                        const stepInfo = LOADING_STEPS[stepKey];
                        const isCompleted = index < currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <li key={stepKey} className={`flex items-center p-3 rounded-lg transition-all duration-500 ${isCurrent ? 'bg-purple-500/20 scale-105' : ''} ${isCompleted ? 'opacity-60' : ''}`}>
                                <div className="flex-shrink-0 mr-4">
                                    {isCompleted ? <CheckCircleIcon /> : isCurrent ? <SpinnerIcon className="w-6 h-6 text-purple-300" /> : <div className="w-6 h-6 border-2 border-purple-400/50 rounded-full"></div>}
                                </div>
                                <span className={`text-lg ${isCurrent ? 'font-bold text-white' : 'text-purple-300'}`}>
                                    {stepInfo.text}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="w-full max-w-md mt-12">
                 <div className="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
                        style={{ width: `${LOADING_STEPS[currentStep ?? 'prompt'].progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;