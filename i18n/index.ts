/**
 * i18n System - Internationalization for Spanish and English
 */

import { Language } from '../types';
import { es } from './es';
import { en } from './en';

export interface Translations {
    // App header
    appTitle: string;
    home: string;
    mySymbols: string;
    
    // Welcome screen
    welcomeTitle: string;
    welcomeDescription: string;
    startButton: string;
    
    // Input form - Step 1
    step1Title: string;
    step1Description: string;
    lastAreaWas: string;
    
    // Input form - Step 2
    step2Title: string;
    step2Description: string;
    genderQuestion: string;
    genderMale: string;
    genderFemale: string;
    genderNeutral: string;
    backToArea: string;
    createOwnSymbol: string;
    
    // Custom prompt
    customSymbolTitle: string;
    customSymbolDescription: string;
    customSymbolPlaceholder: string;
    customSymbolButton: string;
    orChoosePredefined: string;
    
    // Loading screen
    loadingTitle: string;
    loadingStepPrompt: string;
    loadingStepImage: string;
    loadingStepAnalysis: string;
    loadingStepNarration: string;
    loadingStepMusic: string;
    
    // Result display
    resultTitle: string;
    resultDescription: string;
    affirmationTitle: string;
    analysisTitle: string;
    backToSymbols: string;
    createAnother: string;
    deepImmersion: string;
    
    // Meditation mode
    meditationPrepare: string;
    meditationBreathe: string;
    meditationPhaseBreathing: string;
    meditationPhaseMeditation: string;
    meditationPhaseConclusion: string;
    meditationListening: string;
    meditationPaused: string;
    meditationComplete: string;
    meditationCompleteDesc: string;
    meditationPauseLabel: string;
    meditationResumeLabel: string;
    meditationCloseLabel: string;
    meditationSubtitlesLabel: string;
    meditationVolumeLabel: string;
    meditationNarrationVolume: string;
    meditationMusicVolume: string;
    
    // History screen
    historyTitle: string;
    historyDescription: string;
    historyEmpty: string;
    historyEmptyDescription: string;
    createFirstSymbol: string;
    deleteSymbolConfirm: string;
    deleteSymbolLabel: string;
    
    // Areas
    areaPhysical: string;
    areaPhysicalDesc: string;
    areaEconomic: string;
    areaEconomicDesc: string;
    areaSpiritual: string;
    areaSpiritualDesc: string;
    areaEnergetic: string;
    areaEnergeticDesc: string;
    
    // Scenarios - Physical
    scenarioPhys1: string;
    scenarioPhys2: string;
    scenarioPhys3: string;
    
    // Scenarios - Energetic
    scenarioEner1: string;
    scenarioEner2: string;
    scenarioEner3: string;
    
    // Scenarios - Spiritual
    scenarioSpir1: string;
    scenarioSpir2: string;
    scenarioSpir3: string;
    
    // Scenarios - Economic
    scenarioEcon1: string;
    scenarioEcon2: string;
    scenarioEcon3: string;
    
    // Custom scenario
    customScenarioTitle: string;
    
    // Errors
    errorTitle: string;
    errorRetry: string;
    errorRateLimit: string;
    errorWaitSeconds: string;
    errorImageEdit: string;
    errorAudioNotSupported: string;
    errorClickToActivate: string;
    
    // Loading text
    loading: string;
    
    // Onboarding
    onboardingWelcomeTitle: string;
    onboardingWelcomeDesc: string;
    onboardingAreaTitle: string;
    onboardingAreaDesc: string;
    onboardingGenerateTitle: string;
    onboardingGenerateDesc: string;
    onboardingMeditationTitle: string;
    onboardingMeditationDesc: string;
    onboardingNext: string;
    onboardingStart: string;
    onboardingPrevious: string;
    onboardingSkip: string;
    onboardingGoToStep: string;
    
    // Image Editor
    imageEditorTitle: string;
    imageEditorDesc: string;
    imageEditorPlaceholder: string;
    imageEditorButton: string;
    imageEditorEditing: string;
    imageEditorUndo: string;
    
    // Share Button
    shareButton: string;
    shareSharing: string;
    shareDownload: string;
    shareCopyAffirmation: string;
    shareCopied: string;
    shareOnX: string;
    shareOnWhatsApp: string;
    shareTitle: string;
    shareText: string;
    
    // Quota Monitor
    quotaTitle: string;
    quotaUsed: string;
    quotaRemaining: string;
    quotaLimit: string;
    quotaTier: string;
    quotaResets: string;
    quotaCharacters: string;
    quotaLoading: string;
    quotaError: string;
    quotaRefresh: string;
    
    // Language Selection Screen (Initial)
    langSelectTitle: string;
    langSelectDescription: string;
    langSelectSpanish: string;
    langSelectSpanishDesc: string;
    langSelectEnglish: string;
    langSelectEnglishDesc: string;
    
    // User Name Input
    nameInputLabel: string;
    nameInputPlaceholder: string;
    nameInputDescription: string;
    continueButton: string;
    backButton: string;
}

const translations: Record<Language, Translations> = {
    es,
    en,
};

export function getTranslations(language: Language): Translations {
    return translations[language];
}

export function getTranslation(language: Language, key: keyof Translations): string {
    return translations[language][key];
}

export { es, en };

