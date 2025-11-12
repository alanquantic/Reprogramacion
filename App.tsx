

import React, { useReducer, useEffect, useCallback } from 'react';
import { AppStatus, ReprogramArea, GeneratedImage, Scenario, AppState, AppAction, Gender, LoadingStep } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import InputForm from './components/InputForm';
import LoadingScreen from './components/LoadingScreen';
import ResultDisplay from './components/ResultDisplay';
import HistoryScreen from './components/HistoryScreen';
import ThemeSwitcher from './components/ThemeSwitcher';
import { generateSubconsciousImage, generateCustomImage, generateSymbolicAnalysis, generateAffirmationAndAudio, generateInductionAudio, editImageWithPrompt } from './services/geminiService';

const LAST_SELECTIONS_KEY = 'reprogramacion_last_selections_v2';
const HISTORY_KEY = 'reprogramacion_history_v2';

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
        case 'GENERATION_SUCCESS':
            const newImage = action.payload;
            const updatedHistory = [newImage, ...state.history];
            return {
                ...state,
                status: AppStatus.Result,
                generatedImage: newImage,
                history: updatedHistory,
                lastSelections: { areaId: state.userInput.area, scenarioId: newImage.id },
            };
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
        case 'EDIT_IMAGE_SUCCESS':
            const { imageId, newUrl } = action.payload;
            const updateImage = (img: GeneratedImage | null): GeneratedImage | null => {
                if (!img || img.id !== imageId) return img;
                return {
                    ...img,
                    originalUrl: img.originalUrl || img.url, // Save original on first edit
                    url: newUrl,
                };
            };
            return {
                ...state,
                isEditingImage: false,
                generatedImage: updateImage(state.generatedImage),
                viewingHistoryItem: updateImage(state.viewingHistoryItem),
                history: state.history.map(updateImage),
            };
        case 'EDIT_IMAGE_FAILURE':
            return { ...state, isEditingImage: false, error: action.payload };
        case 'UNDO_IMAGE_EDIT':
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
                history: state.history.map(revertImage),
            };
        default:
            return state;
    }
}

const App: React.FC = () => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    useEffect(() => {
        try {
            const storedSelections = localStorage.getItem(LAST_SELECTIONS_KEY);
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            dispatch({
                type: 'INITIALIZE_STATE', payload: {
                    lastSelections: storedSelections ? JSON.parse(storedSelections) : { areaId: null, scenarioId: null },
                    history: storedHistory ? JSON.parse(storedHistory) : [],
                }
            });
        } catch (e) { console.error("Failed to parse data from localStorage", e); }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(LAST_SELECTIONS_KEY, JSON.stringify(state.lastSelections));
            localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
        } catch (e) { console.error("Failed to save data to localStorage", e); }
    }, [state.lastSelections, state.history]);

    const handleGenerate = useCallback(async (scenario: Scenario) => {
        const { gender } = state.userInput;
        dispatch({ type: 'START_GENERATION' });
        let currentStep: LoadingStep = 'prompt';
        try {
            currentStep = 'image';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const imageUrl = await generateSubconsciousImage(scenario.prompt);
            
            currentStep = 'analysis';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const analysis = await generateSymbolicAnalysis(scenario.title, scenario.prompt, gender);
            
            currentStep = 'affirmation';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const { affirmationText, affirmationAudioData } = await generateAffirmationAndAudio(analysis, gender);
            const inductionAudioData = await generateInductionAudio(analysis, gender);

            const newImage: GeneratedImage = {
                id: scenario.id + '-' + Date.now(), // Make history ID unique
                timestamp: Date.now(),
                url: imageUrl,
                prompt: scenario.prompt,
                scenarioTitle: scenario.title,
                analysis: analysis,
                affirmation: affirmationText,
                affirmationAudioData: affirmationAudioData,
                inductionAudioData: inductionAudioData
            };
            dispatch({ type: 'GENERATION_SUCCESS', payload: newImage });

        } catch (err: any) {
            console.error(err);
            const errorMessage = `No se pudo completar el paso: '${currentStep}'. Por favor, intenta de nuevo.`;
            dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
        }
    }, [state.userInput.gender]);

    const handleGenerateCustom = useCallback(async (prompt: string) => {
        const { gender } = state.userInput;
        dispatch({ type: 'START_GENERATION' });
        let currentStep: LoadingStep = 'prompt';
        try {
            currentStep = 'image';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const imageUrl = await generateCustomImage(prompt);

            const scenarioTitle = "Símbolo Personalizado";

            currentStep = 'analysis';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const analysis = await generateSymbolicAnalysis(scenarioTitle, prompt, gender);
            
            currentStep = 'affirmation';
            dispatch({ type: 'SET_LOADING_STEP', payload: currentStep });
            const { affirmationText, affirmationAudioData } = await generateAffirmationAndAudio(analysis, gender);
            const inductionAudioData = await generateInductionAudio(analysis, gender);

            const newImage: GeneratedImage = {
                id: 'custom-' + Date.now(),
                timestamp: Date.now(),
                url: imageUrl,
                prompt: prompt,
                scenarioTitle: scenarioTitle,
                analysis: analysis,
                affirmation: affirmationText,
                affirmationAudioData: affirmationAudioData,
                inductionAudioData: inductionAudioData
            };
            dispatch({ type: 'GENERATION_SUCCESS', payload: newImage });

        } catch (err: any) {
            console.error(err);
            const errorMessage = `No se pudo completar el paso: '${currentStep}'. Por favor, intenta de nuevo.`;
            dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
        }
    }, [state.userInput.gender]);
    
    const handleEditImage = useCallback(async (imageToEdit: GeneratedImage, prompt: string) => {
        dispatch({ type: 'EDIT_IMAGE_START' });
        try {
            const newImageUrl = await editImageWithPrompt(imageToEdit.url, prompt);
            dispatch({ type: 'EDIT_IMAGE_SUCCESS', payload: { imageId: imageToEdit.id, newUrl: newImageUrl }});
        } catch (err: any) {
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
            case AppStatus.Result:
                const imageToShow = state.viewingHistoryItem || state.generatedImage;
                return imageToShow && <ResultDisplay
                    image={imageToShow}
                    onBack={state.viewingHistoryItem ? () => dispatch({ type: 'VIEW_HISTORY' }) : () => dispatch({ type: 'RESET_SESSION' })}
                    isFromHistory={!!state.viewingHistoryItem}
                    onEditImage={handleEditImage}
                    isEditingImage={state.isEditingImage}
                    dispatch={dispatch}
                />;
            case AppStatus.History:
                return <HistoryScreen
                    history={state.history}
                    onViewItem={(item) => dispatch({ type: 'VIEW_HISTORY_ITEM', payload: item })}
                    onDeleteItem={(id) => {
                        if (window.confirm('¿Estás seguro de que quieres eliminar este símbolo de tu historial?')) {
                            dispatch({ type: 'DELETE_HISTORY_ITEM', payload: id })
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

    return (
        <div className="min-h-screen bg-white text-gray-800 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 dark:text-gray-200 transition-colors duration-300">
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
                {renderContent()}
            </main>
        </div>
    );
};

export default App;