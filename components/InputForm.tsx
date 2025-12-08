import React, { useMemo, useState, useCallback, memo } from 'react';
import { ReprogramArea, Scenario, AppState, AppAction, Gender, ContentLanguage } from '../types';
import { AREAS, SCENARIOS, getScenarioTitle } from '../constants';
import { IconRenderer } from './icons/Icons';
import { useLanguage } from '../contexts/LanguageContext';
import { Translations } from '../i18n';

interface InputFormProps {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    onGenerate: (scenario: Scenario) => Promise<void>;
    onGenerateCustom: (prompt: string) => Promise<void>;
}

// Memoized custom prompt input to prevent re-renders
interface CustomPromptInputProps {
    onGenerate: (prompt: string) => void;
    onCancel: () => void;
    t: Translations;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = memo(({ onGenerate, onCancel, t }) => {
    const [customPrompt, setCustomPrompt] = useState('');

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomPrompt(e.target.value);
    }, []);

    const handleGenerate = useCallback(() => {
        if (customPrompt.trim()) {
            onGenerate(customPrompt);
        }
    }, [customPrompt, onGenerate]);

    return (
        <div className="my-8 p-6 bg-purple-100 dark:bg-gray-800/50 rounded-xl border-2 border-purple-300 dark:border-purple-500/50 animate-fade-in">
            <h3 className="text-xl font-bold text-center text-purple-600 dark:text-purple-300 mb-4">{t.customSymbolTitle}</h3>
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4">
                {t.customSymbolDescription}
            </p>
            <textarea
                value={customPrompt}
                onChange={handleChange}
                className="w-full h-24 p-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-purple-500/50 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition-colors resize-none"
                placeholder={t.customSymbolPlaceholder}
            />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
                <button 
                    onClick={handleGenerate} 
                    disabled={!customPrompt.trim()} 
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t.customSymbolButton}
                </button>
                <button 
                    onClick={onCancel} 
                    className="w-full sm:w-auto text-sm text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100 transition-colors"
                >
                    {t.orChoosePredefined}
                </button>
            </div>
        </div>
    );
});

CustomPromptInput.displayName = 'CustomPromptInput';

const InputForm: React.FC<InputFormProps> = ({ state, dispatch, onGenerate, onGenerateCustom }) => {
    const { t } = useLanguage();
    const { formStep, userInput, lastSelections } = state;
    const { area, gender, contentLanguage } = userInput;
    const [isCustomizing, setIsCustomizing] = useState(false);

    const currentScenarios = useMemo(() => {
        if (!area) return [];
        return SCENARIOS.filter(s => s.area === area);
    }, [area]);

    const handleScenarioSelect = useCallback((scenario: Scenario) => {
        dispatch({ type: 'SELECT_SCENARIO', payload: scenario });
        onGenerate(scenario);
    }, [dispatch, onGenerate]);

    const handleCustomGenerate = useCallback((prompt: string) => {
        onGenerateCustom(prompt);
    }, [onGenerateCustom]);

    const handleCancelCustom = useCallback(() => {
        setIsCustomizing(false);
    }, []);

    const handleStartCustomizing = useCallback(() => {
        setIsCustomizing(true);
    }, []);

    // Get translated area name for display
    const getAreaDisplayName = (areaId: ReprogramArea): string => {
        const areaInfo = AREAS.find(a => a.id === areaId);
        if (!areaInfo) return '';
        return t[areaInfo.name as keyof Translations] || areaInfo.name;
    };

    const handleContentLanguageSelect = useCallback((lang: ContentLanguage) => {
        dispatch({ type: 'SET_CONTENT_LANGUAGE', payload: lang });
        dispatch({ type: 'GO_TO_STEP', payload: 'area' });
    }, [dispatch]);

    const ContentLanguageStep = () => (
        <div className="p-4 md:p-8 text-center max-w-3xl mx-auto animate-slide-in-from-right">
            <h2 className="text-3xl font-bold mb-2">{t.contentLangStepTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.contentLangStepDescription}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Spanish Latin American Option */}
                <button
                    onClick={() => handleContentLanguageSelect('es-latam')}
                    className={`p-8 rounded-xl border-2 transition-all duration-300 text-center transform hover:-translate-y-1 ${
                        contentLanguage === 'es-latam'
                            ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
                            : 'border-gray-300 dark:border-purple-500/30 bg-white dark:bg-gray-800/50 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg'
                    }`}
                >
                    <div className="text-5xl mb-4">🇲🇽</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.contentLangSpanish}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.contentLangSpanishDesc}</p>
                </button>

                {/* English Option */}
                <button
                    onClick={() => handleContentLanguageSelect('en')}
                    className={`p-8 rounded-xl border-2 transition-all duration-300 text-center transform hover:-translate-y-1 ${
                        contentLanguage === 'en'
                            ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50 dark:bg-purple-900/30 shadow-lg'
                            : 'border-gray-300 dark:border-purple-500/30 bg-white dark:bg-gray-800/50 hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg'
                    }`}
                >
                    <div className="text-5xl mb-4">🇺🇸</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t.contentLangEnglish}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.contentLangEnglishDesc}</p>
                </button>
            </div>
        </div>
    );

    const AreaStep = () => (
        <div className="p-4 md:p-8 text-center max-w-4xl mx-auto animate-slide-in-from-right">
            <button 
                onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'contentLanguage' })} 
                className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 mb-6 text-sm block"
            >
                ← {contentLanguage === 'es-latam' ? 'Cambiar idioma' : 'Change language'}
            </button>
            <h2 className="text-3xl font-bold mb-2">{t.step1Title}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t.step1Description}</p>
            {lastSelections.areaId && (
                <div className="mb-6 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-300 dark:border-purple-500/30 max-w-md mx-auto animate-fade-in">
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                        {t.lastAreaWas} <span className="font-bold">{getAreaDisplayName(lastSelections.areaId)}</span>
                    </p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {AREAS.map((areaInfo) => {
                    const isLastSelected = lastSelections.areaId === areaInfo.id;
                    const stateClasses = isLastSelected 
                        ? `${areaInfo.borderColor} ring-2 ${areaInfo.ringColor} shadow-md ${areaInfo.shadowColor}` 
                        : `border-gray-300 dark:border-purple-500/30 ${areaInfo.hoverBorderColor} hover:-translate-y-1`;
                    
                    const areaName = t[areaInfo.name as keyof Translations] || areaInfo.name;
                    const areaDesc = t[areaInfo.description as keyof Translations] || areaInfo.description;
                    
                    return (
                        <button
                            key={areaInfo.id}
                            onClick={() => dispatch({ type: 'SELECT_AREA', payload: areaInfo.id })}
                            className={`p-6 rounded-xl border-2 bg-white dark:bg-gray-800/50 shadow-sm dark:shadow-none transition-all duration-500 ease-in-out text-left flex flex-col items-center text-center transform ${stateClasses}`}
                        >
                            <div className="mb-4 text-purple-500 dark:text-purple-300">
                                <IconRenderer iconId={areaInfo.iconId} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{areaName}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{areaDesc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const ScenarioStep = () => {
        const genderLabels: Record<Gender, string> = { 
            male: t.genderMale, 
            female: t.genderFemale, 
            neutral: t.genderNeutral 
        };

        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto animate-slide-in-from-right">
                <button 
                    onClick={() => dispatch({ type: 'GO_TO_STEP', payload: 'area' })} 
                    className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 mb-6 text-sm"
                >
                    {t.backToArea}
                </button>
                <h2 className="text-3xl font-bold mb-2 text-center">{t.step2Title}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">
                    {t.step2Description}{' '}
                    <span className="font-bold text-purple-600 dark:text-purple-300">{area ? getAreaDisplayName(area) : ''}</span>.
                </p>

                <div className="mb-8">
                    <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {t.genderQuestion}
                    </h3>
                    <div className="flex justify-center gap-2 md:gap-4">
                        {(['male', 'female', 'neutral'] as const).map((g) => {
                            const isSelected = gender === g;
                            return (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => dispatch({ type: 'SET_GENDER', payload: g })}
                                    className={`py-2 px-4 rounded-full font-semibold border-2 transition-all duration-200 w-full md:w-auto
                                        ${isSelected
                                            ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                                            : 'bg-transparent border-gray-300 dark:border-purple-500/50 text-gray-600 dark:text-gray-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-300'
                                        }`}
                                >
                                    {genderLabels[g]}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isCustomizing ? (
                    <CustomPromptInput 
                        onGenerate={handleCustomGenerate} 
                        onCancel={handleCancelCustom}
                        t={t}
                    />
                ) : (
                    <div className="mt-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {currentScenarios.map((scenario) => (
                                <button
                                    key={scenario.id}
                                    onClick={() => handleScenarioSelect(scenario)}
                                    className="p-6 rounded-xl border-2 border-gray-300 dark:border-purple-500/30 bg-white dark:bg-gray-800/50 shadow-sm dark:shadow-none hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg dark:hover:shadow-purple-500/20 hover:-translate-y-1 transition-all duration-300 text-left"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {getScenarioTitle(scenario.id, t)}
                                    </h3>
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <button 
                                onClick={handleStartCustomizing} 
                                className="text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100 font-semibold transition-colors"
                            >
                                {t.createOwnSymbol}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (formStep === 'contentLanguage') {
        return <ContentLanguageStep />;
    }
    if (formStep === 'area') {
        return <AreaStep />;
    }
    return <ScenarioStep />;
};

export default InputForm;
