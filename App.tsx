import React, { useReducer, useEffect, useCallback, useState, Suspense, lazy } from 'react';
import { AppStatus, ReprogramArea, GeneratedImage, Scenario, AppState, AppAction, LoadingStep } from './types';
import ThemeSwitcher from './components/ThemeSwitcher';
import { generateSubconsciousImage, generateCustomImage, generateSymbolicAnalysis, generateAffirmationAndAudio, editImageWithPrompt, generateAnalysisNarration } from './services/geminiService';
import { initStorage, getHistory, saveToHistory, deleteFromHistory, updateHistoryItem, getSetting, saveSetting } from './services/storageService';
import { getBackgroundMusic } from './services/musicService';
import { canProceed, recordRequest, getTimeUntilReset, RATE_LIMITS } from './services/rateLimiter';
import { preloadMusicForArea } from './utils/audioPreloader';

// Lazy load components for code splitting
const WelcomeScreen = lazy(() => import('./components/WelcomeScreen'));
const InputForm = lazy(() => import('./components/InputForm'));
const LoadingScreen = lazy(() => import('./components/LoadingScreen'));
const ResultDisplay = lazy(() => import('./components/ResultDisplay'));
const HistoryScreen = lazy(() => import('./components/HistoryScreen'));
const Onboarding = lazy(() => import('./components/Onboarding'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const LAST_SELECTIONS_KEY = 'lastSelections';
const ONBOARDING_COMPLETE_KEY = 'onboardingComplete';

const initialState: AppState = {
    status: AppStatus.Welcome,
    formStep: 'area',
    userInput: { area: null, scenario: null, gender: 'neutral' },
    generatedImage: null,
    loadingStep: null,
    error: null,
    history: [],
    viewingHistoryItem: null,
    lastSelections: { areaId: null, scenarioId: null },
    isEditingImage: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'INITIALIZE_STATE':
            return { ...state, ...action.payload };
        case 'START_SESSION':
            return {
                ...state,
                status: AppStatus.Input,
                formStep: 'area',
                userInput: { area: null, scenario: null, gender: 'neutral' },
                generatedImage: null,
                error: null,
            };
        case 'SELECT_AREA':
            return { ...state, userInput: { ...state.userInput, area: action.payload }, formStep: 'scenario' };
        case 'SELECT_SCENARIO':
            return { ...state, userInput: { ...state.userInput, scenario: action.payload } };
        case 'SET_GENDER':
            return { ...state, userInput: { ...state.userInput, gender: action.payload } };
        case 'START_GENERATION':
            return { ...state, status: AppStatus.Loading, loadingStep: 'prompt', error: null, generatedImage: null, viewingHistoryItem: null };
        case 'SET_LOADING_STEP':
            return { ...state, loadingStep: action.payload };
        case 'GENERATION_SUCCESS': {
            const newImage = action.payload;
            const updatedHistory = [newImage, ...state.history];
            return {
                ...state,
                status: AppStatus.Result,
                generatedImage: newImage,
                history: updatedHistory,
                lastSelections: { areaId: state.userInput.area, scenarioId: newImage.id },
            };
        }
        case 'GENERATION_FAILURE':
            return { ...state, status: AppStatus.Error, error: action.payload, loadingStep: null };
        case 'RETRY_FROM_ERROR':
            return { ...state, status: AppStatus.Input, formStep: 'scenario', error: null };
        case 'RESET_SESSION':
            return {
                ...state,
                status: AppStatus.Input,
                formStep: 'area',
                userInput: { area: null, scenario: null, gender: 'neutral' },
                generatedImage: null,
                error: null,
                viewingHistoryItem: null
            };
        case 'START_OVER':
            return { ...state, status: AppStatus.Welcome, viewingHistoryItem: null, generatedImage: null, error: null };
        case 'VIEW_HISTORY':
            return { ...state, status: AppStatus.History, viewingHistoryItem: null };
        case 'VIEW_HISTORY_ITEM':
            return { ...state, status: AppStatus.Result, viewingHistoryItem: action.payload };
        case 'GO_TO_STEP':
            return { ...state, formStep: action.payload };
        case 'DELETE_HISTORY_ITEM':
            return { ...state, history: state.history.filter(item => item.id !== action.payload) };
        case 'EDIT_IMAGE_START':
            return { ...state, isEditingImage: true, error: null };
        case 'EDIT_IMAGE_SUCCESS': {
            const { imageId, newUrl } = action.payload;
            const updateImage = (img: GeneratedImage | null): GeneratedImage | null => {
                if (!img || img.id !== imageId) return img;
                return {
                    ...img,
                    originalUrl: img.originalUrl || img.url,
                    url: newUrl,
                };
            };
            return {
                ...state,
                isEditingImage: false,
                generatedImage: updateImage(state.generatedImage),
                viewingHistoryItem: updateImage(state.viewingHistoryItem),
                history: state.history.map(img => updateImage(img) as GeneratedImage),
            };
        }
        case 'EDIT_IMAGE_FAILURE':
            return { ...state, isEditingImage: false, error: action.payload };
        case 'UNDO_IMAGE_EDIT': {
            const undoImageId = action.payload;
            const revertImage = (img: GeneratedImage | null): GeneratedImage | null => {
                if (!img || img.id !== undoImageId || !img.originalUrl) return img;
                return {
                    ...img,
                    url: img.originalUrl,
                    originalUrl: undefined,
                };
            };
            return {
                ...state,
                generatedImage: revertImage(state.generatedImage),
                viewingHistoryItem: revertImage(state.viewingHistoryItem),
                history: state.history.map(img => revertImage(img) as GeneratedImage),
            };
        }
        default:
            return state;
    }
}

/**
 * Checks rate limits and throws descriptive error if exceeded
 */
function checkRateLimits(): void {
    const checks = [
        { key: 'image-generation', config: RATE_LIMITS.IMAGE_GENERATION, name: 'generación de imágenes' },
        { key: 'tts-generation', config: RATE_LIMITS.TTS_GENERATION, name: 'síntesis de voz' },
    ];

    for (const check of checks) {
        if (!canProceed(check.key, check.config)) {
            const waitTime = Math.ceil(getTimeUntilReset(check.key, check.config) / 1000);
            throw new Error(`Límite de ${check.name} alcanzado. Por favor espera ${waitTime} segundos antes de intentar de nuevo.`);
        }
    }
}

const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize IndexedDB and load data
    useEffect(() => {
        const loadData = async () => {
            try {
                await initStorage();
                const [history, lastSelections, onboardingComplete] = await Promise.all([
                    getHistory(),
                    getSetting<{ areaId: ReprogramArea | null; scenarioId: string | null }>(LAST_SELECTIONS_KEY),
                    getSetting<boolean>(ONBOARDING_COMPLETE_KEY),
                ]);
                dispatch({
                    type: 'INITIALIZE_STATE',
                    payload: {
                        history: history || [],
                        lastSelections: lastSelections || { areaId: null, scenarioId: null },
                    },
                });
                
                // Show onboarding if first time
                if (!onboardingComplete) {
                    setShowOnboarding(true);
                }
                
                setIsInitialized(true);
            } catch (e) {
                console.error('[App] Failed to load data from IndexedDB:', e);
                setIsInitialized(true);
            }
        };
        loadData();
    }, []);

    // Save last selections to IndexedDB when they change
    useEffect(() => {
        if (state.lastSelections.areaId !== null || state.lastSelections.scenarioId !== null) {
            saveSetting(LAST_SELECTIONS_KEY, state.lastSelections).catch(console.error);
        }
    }, [state.lastSelections]);

    // Preload music when area is selected
    useEffect(() => {
        if (state.userInput.area) {
            console.log('[App] Preloading music for area:', state.userInput.area);
            preloadMusicForArea(state.userInput.area);
        }
    }, [state.userInput.area]);

    const handleOnboardingComplete = useCallback(async () => {
        setShowOnboarding(false);
        await saveSetting(ONBOARDING_COMPLETE_KEY, true);
    }, []);

    const handleGenerate = useCallback(async (scenario: Scenario) => {
        const { gender, area } = state.userInput;
        if (!area) return;
        
        dispatch({ type: 'START_GENERATION' });
        let currentStep: LoadingStep = 'prompt';
        
        try {
            // Check rate limits before proceeding
            checkRateLimits();

            // Step 1 & 2: Generate image AND analysis in PARALLEL for better performance
            currentStep = 'image';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            
            recordRequest('image-generation');
            const [imageUrl, analysis] = await Promise.all([
                generateSubconsciousImage(scenario.prompt),
                generateSymbolicAnalysis(scenario.title, scenario.prompt, gender),
            ]);
            
            // Step 3: Generate affirmation text (for display)
            currentStep = 'analysis';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const { affirmationText } = await generateAffirmationAndAudio(analysis, gender);

            // Step 4: Generate analysis narration (voice based on gender)
            currentStep = 'narration';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            recordRequest('tts-generation');
            const analysisAudioData = await generateAnalysisNarration(analysis, gender);

            // Step 5: Load pre-recorded background music for the area
            currentStep = 'music';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const backgroundMusicData = await getBackgroundMusic(area);

            const newImage: GeneratedImage = {
                id: scenario.id + '-' + Date.now(),
                timestamp: Date.now(),
                url: imageUrl,
                prompt: scenario.prompt,
                scenarioTitle: scenario.title,
                area: area,
                gender: gender,
                analysis: analysis,
                affirmation: affirmationText,
                affirmationAudioData: '',
                inductionAudioData: '',
                analysisAudioData: analysisAudioData,
                backgroundMusicData: backgroundMusicData,
            };
            
            // Save to IndexedDB
            await saveToHistory(newImage);
            
            dispatch({ type: 'GENERATION_SUCCESS', payload: newImage });

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error 
                ? err.message 
                : `No se pudo completar el paso: '${currentStep}'. Por favor, intenta de nuevo.`;
            dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
        }
    }, [state.userInput.gender, state.userInput.area]);

    const handleGenerateCustom = useCallback(async (prompt: string) => {
        const { gender, area } = state.userInput;
        if (!area) return;
        
        dispatch({ type: 'START_GENERATION' });
        let currentStep: LoadingStep = 'prompt';
        
        try {
            // Check rate limits before proceeding
            checkRateLimits();

            const scenarioTitle = "Símbolo Personalizado";

            // Step 1 & 2: Generate image AND analysis in PARALLEL
            currentStep = 'image';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            
            recordRequest('image-generation');
            const [imageUrl, analysis] = await Promise.all([
                generateCustomImage(prompt),
                generateSymbolicAnalysis(scenarioTitle, prompt, gender),
            ]);
            
            // Step 3: Generate affirmation text (for display)
            currentStep = 'analysis';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const { affirmationText } = await generateAffirmationAndAudio(analysis, gender);

            // Step 4: Generate analysis narration (voice based on gender)
            currentStep = 'narration';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            recordRequest('tts-generation');
            const analysisAudioData = await generateAnalysisNarration(analysis, gender);

            // Step 5: Load pre-recorded background music for the area
            currentStep = 'music';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const backgroundMusicData = await getBackgroundMusic(area);

            const newImage: GeneratedImage = {
                id: 'custom-' + Date.now(),
                timestamp: Date.now(),
                url: imageUrl,
                prompt: prompt,
                scenarioTitle: scenarioTitle,
                area: area,
                gender: gender,
                analysis: analysis,
                affirmation: affirmationText,
                affirmationAudioData: '',
                inductionAudioData: '',
                analysisAudioData: analysisAudioData,
                backgroundMusicData: backgroundMusicData,
            };
            
            // Save to IndexedDB
            await saveToHistory(newImage);
            
            dispatch({ type: 'GENERATION_SUCCESS', payload: newImage });

        } catch (err: unknown) {
            console.error(err);
            const errorMessage = err instanceof Error 
                ? err.message 
                : `No se pudo completar el paso: '${currentStep}'. Por favor, intenta de nuevo.`;
            dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
        }
    }, [state.userInput.gender, state.userInput.area]);
    
    const handleEditImage = useCallback(async (imageToEdit: GeneratedImage, prompt: string) => {
        // Check rate limit for image editing
        if (!canProceed('image-edit', RATE_LIMITS.IMAGE_EDIT)) {
            const waitTime = Math.ceil(getTimeUntilReset('image-edit', RATE_LIMITS.IMAGE_EDIT) / 1000);
            dispatch({ type: 'EDIT_IMAGE_FAILURE', payload: `Límite de edición alcanzado. Espera ${waitTime} segundos.` });
            return;
        }

        dispatch({ type: 'EDIT_IMAGE_START' });
        try {
            recordRequest('image-edit');
            const newImageUrl = await editImageWithPrompt(imageToEdit.url, prompt);
            
            // Update in IndexedDB
            const updatedImage: GeneratedImage = {
                ...imageToEdit,
                url: newImageUrl,
                originalUrl: imageToEdit.originalUrl || imageToEdit.url,
            };
            await updateHistoryItem(updatedImage);
            
            dispatch({ type: 'EDIT_IMAGE_SUCCESS', payload: { imageId: imageToEdit.id, newUrl: newImageUrl }});
        } catch (err: unknown) {
            console.error(err);
            dispatch({ type: 'EDIT_IMAGE_FAILURE', payload: 'No se pudo editar la imagen. Intenta de nuevo.' });
        }
    }, []);

    const renderContent = () => {
        switch (state.status) {
            case AppStatus.Welcome:
                return <WelcomeScreen onStart={() => dispatch({ type: 'START_SESSION' })} />;
            case AppStatus.Input:
                return <InputForm
                    state={state}
                    dispatch={dispatch}
                    onGenerate={handleGenerate}
                    onGenerateCustom={handleGenerateCustom}
                />;
            case AppStatus.Loading:
                return <LoadingScreen currentStep={state.loadingStep} />;
            case AppStatus.Result: {
                const imageToShow = state.viewingHistoryItem || state.generatedImage;
                return imageToShow && <ResultDisplay
                    image={imageToShow}
                    onBack={state.viewingHistoryItem ? () => dispatch({ type: 'VIEW_HISTORY' }) : () => dispatch({ type: 'RESET_SESSION' })}
                    isFromHistory={!!state.viewingHistoryItem}
                    onEditImage={handleEditImage}
                    isEditingImage={state.isEditingImage}
                    dispatch={dispatch}
                />;
            }
            case AppStatus.History:
                return <HistoryScreen
                    history={state.history}
                    onViewItem={(item) => dispatch({ type: 'VIEW_HISTORY_ITEM', payload: item })}
                    onDeleteItem={async (id) => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este símbolo de tu historial?')) {
                            await deleteFromHistory(id);
                            dispatch({ type: 'DELETE_HISTORY_ITEM', payload: id });
                        }
                    }}
                    onStartNew={() => dispatch({ type: 'RESET_SESSION' })}
                />;
            case AppStatus.Error:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400 mb-4 animate-fade-in-down">Ocurrió un Error</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md animate-fade-in-up">{state.error}</p>
                        <button
                            onClick={() => dispatch({ type: 'RETRY_FROM_ERROR' })}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-purple-500/50"
                        >
                           Intentar de Nuevo
                        </button>
                    </div>
                );
            default:
                return <WelcomeScreen onStart={() => dispatch({ type: 'START_SESSION' })} />;
        }
    };

    // Show loading while initializing
    if (!isInitialized) {
        return (
            <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-600 dark:text-purple-300">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-800 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 dark:text-gray-200 transition-colors duration-300">
            {/* Onboarding modal */}
            {showOnboarding && (
                <Suspense fallback={<LoadingFallback />}>
                    <Onboarding onComplete={handleOnboardingComplete} />
                </Suspense>
            )}

            <header className="p-4 flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Reprogramación Visual</h1>
                <div className="flex items-center gap-4">
                    {state.status !== AppStatus.Welcome && (
                        <button onClick={() => dispatch({ type: 'START_OVER' })} className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100 transition-colors">Inicio</button>
                    )}
                    {state.status !== AppStatus.Welcome && state.status !== AppStatus.History && state.history.length > 0 && (
                        <button onClick={() => dispatch({ type: 'VIEW_HISTORY' })} className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-100 transition-colors">Mis Símbolos</button>
                    )}
                    <ThemeSwitcher />
                </div>
            </header>
            <main className="overflow-x-hidden">
                <Suspense fallback={<LoadingFallback />}>
                    {renderContent()}
                </Suspense>
            </main>
        </div>
    );
};

export default App;
