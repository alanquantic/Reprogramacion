


export enum AppStatus {
    Welcome = 'WELCOME',
    Input = 'INPUT',
    Loading = 'LOADING',
    Result = 'RESULT',
    Error = 'ERROR',
    History = 'HISTORY',
}

export type FormStep = 'area' | 'scenario';
export type LoadingStep = 'prompt' | 'image' | 'analysis' | 'affirmation' | null;
export type Gender = 'male' | 'female' | 'neutral';

export enum ReprogramArea {
    Physical = 'FÍSICO',
    Economic = 'ECONÓMICO',
    Spiritual = 'ESPIRITUAL',
    Energetic = 'ENERGÉTICO',
}

export interface AreaInfo {
    id: ReprogramArea;
    name: string;
    description: string;
    iconId: string;
    color: string;
    borderColor: string;
    ringColor: string;
    shadowColor: string;
    hoverBorderColor: string;
}

export interface Scenario {
    id: string;
    area: ReprogramArea;
    title: string;
    prompt: string;
}

export interface GeneratedImage {
    id: string;
    timestamp: number;
    url: string;
    originalUrl?: string; // a copy of the URL before the first edit
    prompt: string;
    scenarioTitle: string;
    analysis: string;
    affirmation: string;
    affirmationAudioData: string;
    inductionAudioData: string;
}

// Fix: Added missing Archetype type for ArchetypeModal.tsx
export interface Archetype {
    id: string;
    name: string;
    description: string;
}

// State managed by useReducer
export interface AppState {
    status: AppStatus;
    formStep: FormStep;
    userInput: {
        area: ReprogramArea | null;
        scenario: Scenario | null;
        gender: Gender;
    };
    generatedImage: GeneratedImage | null;
    loadingStep: LoadingStep;
    error: string | null;
    history: GeneratedImage[];
    viewingHistoryItem: GeneratedImage | null;
    lastSelections: {
        areaId: ReprogramArea | null;
        scenarioId: string | null;
    };
    isEditingImage: boolean;
}

// Actions for the reducer
export type AppAction =
    | { type: 'START_SESSION' }
    | { type: 'SELECT_AREA'; payload: ReprogramArea }
    | { type: 'SELECT_SCENARIO'; payload: Scenario }
    | { type: 'SET_GENDER'; payload: Gender }
    | { type: 'START_GENERATION' }
    | { type: 'SET_LOADING_STEP'; payload: LoadingStep }
    | { type: 'GENERATION_SUCCESS'; payload: GeneratedImage }
    | { type: 'GENERATION_FAILURE'; payload: string }
    | { type: 'RESET_SESSION' }
    | { type: 'RETRY_FROM_ERROR' }
    | { type: 'START_OVER' }
    | { type: 'VIEW_HISTORY' }
    | { type: 'VIEW_HISTORY_ITEM'; payload: GeneratedImage }
    | { type: 'GO_TO_STEP'; payload: FormStep }
    | { type: 'DELETE_HISTORY_ITEM'; payload: string }
    | { type: 'INITIALIZE_STATE'; payload: Partial<AppState> }
    | { type: 'EDIT_IMAGE_START' }
    | { type: 'EDIT_IMAGE_SUCCESS'; payload: { imageId: string; newUrl: string } }
    | { type: 'EDIT_IMAGE_FAILURE'; payload: string }
    | { type: 'UNDO_IMAGE_EDIT'; payload: string }; // payload is imageId