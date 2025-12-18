/**
 * TTS API Service
 * Connects to local TTS API Pro server that uses Gemini 2.5 Flash TTS
 */

import { Gender, ContentLanguage } from '../types';

// Local TTS API endpoint (TTS API Pro server)
const TTS_API_URL = process.env.TTS_API_URL || 'http://localhost:3001';

// Voice descriptions for logging (Gemini 2.5 Pro TTS voices)
// MALE: Enceladus (breathy), Schedar (even), Umbriel (easy-going), Algieba (smooth)
// FEMALE: Sulafat (warm), Vindemiatrix (gentle), Achernar (soft), Aoede (breezy)
const VOICE_NAMES: Record<ContentLanguage, Record<Gender, string>> = {
    'es-latam': {
        male: 'Enceladus (etéreo, meditativo)',
        female: 'Sulafat (cálida, reconfortante)',
        neutral: 'Schedar (equilibrado, sereno)',
    },
    'en': {
        male: 'Enceladus (breathy, meditative)',
        female: 'Vindemiatrix (gentle, calming)',
        neutral: 'Schedar (even, balanced)',
    },
};

/**
 * Response from TTS API
 */
interface TtsApiResponse {
    audioContent: string;  // Base64 encoded audio (WAV format from Gemini TTS)
    mimeType?: string;     // Audio MIME type (e.g., 'audio/wav')
    voice: string;
    language: string;
    error?: string;
}

/**
 * Generates narration audio for the symbolic analysis
 * Calls local TTS API Pro server which uses Gemini 2.5 Flash TTS
 * 
 * @param analysisText - The text to narrate (already in the correct language)
 * @param gender - User's gender preference for voice selection
 * @param contentLanguage - The language of the content ('es-latam' | 'en')
 * @returns Base64 encoded audio data (WAV format)
 */
export async function generateAnalysisNarration(
    analysisText: string,
    gender: Gender,
    contentLanguage: ContentLanguage
): Promise<string> {
    const voiceLabel = VOICE_NAMES[contentLanguage][gender];

    console.log(`[TTS API] Generating ${contentLanguage.toUpperCase()} narration`);
    console.log(`[TTS API] Voice: ${voiceLabel}, Gender: ${gender}`);
    console.log(`[TTS API] Text length: ${analysisText.length} chars`);

    try {
        const response = await fetch(`${TTS_API_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: analysisText,
                gender: gender,
                contentLanguage: contentLanguage,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error || response.statusText;
            console.error('[TTS API] Error:', response.status, errorMessage);
            throw new Error(`TTS API error: ${response.status} - ${errorMessage}`);
        }

        const data: TtsApiResponse = await response.json();

        if (!data.audioContent) {
            throw new Error('No audio content received from TTS API');
        }

        console.log(`[TTS API] Success: voice=${data.voice}, lang=${data.language}, audioSize=${data.audioContent.length}`);
        return data.audioContent;

    } catch (error) {
        console.error('[TTS API] Failed to generate narration:', error);
        
        // Check if it's a connection error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('No se puede conectar al servidor TTS. Asegúrate de que el servidor esté corriendo en http://localhost:3001');
        }
        
        throw error;
    }
}

/**
 * Check if TTS API server is available
 */
export async function checkTtsApiHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${TTS_API_URL}/`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * All 30 available Gemini TTS voices with their characteristics
 * 
 * MALE voices: Puck, Charon, Fenrir, Orus, Achird, Algenib, Algieba, Alnilam,
 *              Enceladus, Iapetus, Rasalgethi, Sadachbia, Sadaltager, Schedar,
 *              Umbriel, Zubenelgenubi
 * 
 * FEMALE voices: Zephyr, Kore, Leda, Aoede, Callirrhoe, Autonoe, Despina,
 *                Erinome, Laomedeia, Achernar, Gacrux, Pulcherrima, Vindemiatrix,
 *                Sulafat
 */
export const AVAILABLE_VOICES = {
    // Calm/meditation suitable voices by gender
    calm: {
        male: ['Enceladus', 'Schedar', 'Umbriel', 'Algieba'],
        female: ['Sulafat', 'Vindemiatrix', 'Achernar', 'Aoede', 'Despina'],
    },
    // All voices by characteristic and gender
    all: [
        // Male voices
        { name: 'Puck', style: 'Upbeat', gender: 'male' },
        { name: 'Charon', style: 'Informative', gender: 'male' },
        { name: 'Fenrir', style: 'Excitable', gender: 'male' },
        { name: 'Orus', style: 'Firm', gender: 'male' },
        { name: 'Achird', style: 'Friendly', gender: 'male' },
        { name: 'Algenib', style: 'Gravelly', gender: 'male' },
        { name: 'Algieba', style: 'Smooth', gender: 'male' },
        { name: 'Alnilam', style: 'Firm', gender: 'male' },
        { name: 'Enceladus', style: 'Breathy', gender: 'male' },
        { name: 'Iapetus', style: 'Clear', gender: 'male' },
        { name: 'Rasalgethi', style: 'Informative', gender: 'male' },
        { name: 'Sadachbia', style: 'Lively', gender: 'male' },
        { name: 'Sadaltager', style: 'Knowledgeable', gender: 'male' },
        { name: 'Schedar', style: 'Even', gender: 'male' },
        { name: 'Umbriel', style: 'Easy-going', gender: 'male' },
        { name: 'Zubenelgenubi', style: 'Casual', gender: 'male' },
        // Female voices
        { name: 'Zephyr', style: 'Bright', gender: 'female' },
        { name: 'Kore', style: 'Firm', gender: 'female' },
        { name: 'Leda', style: 'Youthful', gender: 'female' },
        { name: 'Aoede', style: 'Breezy', gender: 'female' },
        { name: 'Callirrhoe', style: 'Easy-going', gender: 'female' },
        { name: 'Autonoe', style: 'Bright', gender: 'female' },
        { name: 'Despina', style: 'Smooth', gender: 'female' },
        { name: 'Erinome', style: 'Clear', gender: 'female' },
        { name: 'Laomedeia', style: 'Upbeat', gender: 'female' },
        { name: 'Achernar', style: 'Soft', gender: 'female' },
        { name: 'Gacrux', style: 'Mature', gender: 'female' },
        { name: 'Pulcherrima', style: 'Forward', gender: 'female' },
        { name: 'Vindemiatrix', style: 'Gentle', gender: 'female' },
        { name: 'Sulafat', style: 'Warm', gender: 'female' },
    ],
};
