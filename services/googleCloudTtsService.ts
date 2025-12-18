/**
 * TTS API Service
 * Connects to local TTS API Pro server that uses Gemini 2.5 Flash TTS
 */

import { Gender, ContentLanguage } from '../types';

// Local TTS API endpoint (TTS API Pro server)
const TTS_API_URL = process.env.TTS_API_URL || 'http://localhost:3001';

// Voice descriptions for logging (Gemini 2.5 Pro TTS voices)
const VOICE_NAMES: Record<ContentLanguage, Record<Gender, string>> = {
    'es-latam': {
        male: 'Sulafat (cálida, reconfortante)',
        female: 'Achernar (suave, delicada)',
        neutral: 'Aoede (serena, tranquila)',
    },
    'en': {
        male: 'Sulafat (warm, soothing)',
        female: 'Vindemiatrix (gentle, calming)',
        neutral: 'Enceladus (breathy, meditative)',
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
 */
export const AVAILABLE_VOICES = {
    // Calm/meditation suitable voices
    calm: ['Sulafat', 'Achernar', 'Vindemiatrix', 'Enceladus', 'Aoede', 'Despina', 'Algieba'],
    // All voices by characteristic
    all: [
        { name: 'Zephyr', style: 'Bright' },
        { name: 'Puck', style: 'Upbeat' },
        { name: 'Charon', style: 'Informative' },
        { name: 'Kore', style: 'Firm' },
        { name: 'Fenrir', style: 'Excitable' },
        { name: 'Leda', style: 'Youthful' },
        { name: 'Orus', style: 'Firm' },
        { name: 'Aoede', style: 'Breezy' },
        { name: 'Callirrhoe', style: 'Easy-going' },
        { name: 'Autonoe', style: 'Bright' },
        { name: 'Enceladus', style: 'Breathy' },
        { name: 'Iapetus', style: 'Clear' },
        { name: 'Umbriel', style: 'Easy-going' },
        { name: 'Algieba', style: 'Smooth' },
        { name: 'Despina', style: 'Smooth' },
        { name: 'Erinome', style: 'Clear' },
        { name: 'Algenib', style: 'Gravelly' },
        { name: 'Rasalgethi', style: 'Informative' },
        { name: 'Laomedeia', style: 'Upbeat' },
        { name: 'Achernar', style: 'Soft' },
        { name: 'Alnilam', style: 'Firm' },
        { name: 'Schedar', style: 'Even' },
        { name: 'Gacrux', style: 'Mature' },
        { name: 'Pulcherrima', style: 'Forward' },
        { name: 'Achird', style: 'Friendly' },
        { name: 'Zubenelgenubi', style: 'Casual' },
        { name: 'Vindemiatrix', style: 'Gentle' },
        { name: 'Sadachbia', style: 'Lively' },
        { name: 'Sadaltager', style: 'Knowledgeable' },
        { name: 'Sulafat', style: 'Warm' },
    ],
};
