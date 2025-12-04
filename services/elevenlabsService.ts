/**
 * ElevenLabs TTS Service
 * Generates high-quality text-to-speech audio using ElevenLabs API
 */

import { Gender } from '../types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs from ElevenLabs - multilingual voices that support Spanish well
const VOICE_IDS: Record<Gender, string> = {
    male: 'onwK4e9ZLuTAKqWW03F9',     // "Daniel" - calm male voice, multilingual
    female: 'XB0fDUnXU5powFXDhCwa',   // "Charlotte" - calm female voice, multilingual
    neutral: 'EXAVITQu4vr4xnSDxMaL',  // "Sarah" - neutral/soft voice, multilingual
};

// Voice names for logging
const VOICE_NAMES: Record<Gender, string> = {
    male: 'Daniel',
    female: 'Charlotte',
    neutral: 'Sarah',
};

interface ElevenLabsConfig {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
}

// Settings optimized for calm, meditative narration
const DEFAULT_VOICE_SETTINGS: ElevenLabsConfig = {
    stability: 0.80,        // Higher stability for consistent calm tone
    similarity_boost: 0.70,
    style: 0.40,            // Lower style for more neutral delivery
    use_speaker_boost: true,
};

/**
 * Gets the ElevenLabs API key from environment variables
 */
function getApiKey(): string {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable not set');
    }
    return apiKey;
}

/**
 * Generates speech audio from text using ElevenLabs API
 * Returns base64 encoded audio data (MP3 format)
 */
export async function generateSpeechWithElevenLabs(
    text: string,
    voiceId: string
): Promise<string> {
    console.log('[ElevenLabs] Generating speech for text length:', text.length);
    
    const apiKey = getApiKey();
    
    const requestBody = {
        text: text,
        model_id: 'eleven_multilingual_v2', // Supports Spanish
        voice_settings: DEFAULT_VOICE_SETTINGS,
    };

    try {
        const response = await fetch(
            `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ElevenLabs] API Error:', response.status, errorText);
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        // Convert response to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64Audio = arrayBufferToBase64(arrayBuffer);
        
        console.log('[ElevenLabs] Generated audio, size:', base64Audio.length, 'chars');
        
        return base64Audio;
    } catch (error) {
        console.error('[ElevenLabs] Failed to generate speech:', error);
        throw new Error('Failed to generate speech with ElevenLabs');
    }
}

/**
 * Generates narration audio for the symbolic analysis in Spanish
 * Voice is selected based on user's gender preference
 */
export async function generateAnalysisNarration(
    analysisText: string,
    gender: Gender
): Promise<string> {
    const voiceId = VOICE_IDS[gender];
    const voiceName = VOICE_NAMES[gender];
    
    console.log(`[ElevenLabs] Generating Spanish narration with voice: ${voiceName} (${gender})`);
    return generateSpeechWithElevenLabs(analysisText, voiceId);
}

/**
 * Converts an ArrayBuffer to a base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Gets available voices from ElevenLabs (useful for testing/debugging)
 */
export async function getAvailableVoices(): Promise<unknown[]> {
    const apiKey = getApiKey();
    
    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch voices: ${response.status}`);
        }

        const data = await response.json();
        return data.voices;
    } catch (error) {
        console.error('[ElevenLabs] Failed to get voices:', error);
        throw error;
    }
}
