/**
 * ElevenLabs TTS Service
 * Generates high-quality text-to-speech audio using ElevenLabs API
 * This is the PRIMARY TTS service for narration in the app
 */

import { Gender, Language } from '../types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Voice IDs from ElevenLabs - multilingual voices that support both Spanish and English
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

interface ElevenLabsVoiceSettings {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
}

// Settings optimized for calm, meditative narration
const DEFAULT_VOICE_SETTINGS: ElevenLabsVoiceSettings = {
    stability: 0.80,        // Higher stability for consistent calm tone
    similarity_boost: 0.70, // Good similarity for natural sound
    style: 0.35,            // Lower style for more neutral, meditative delivery
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
        model_id: 'eleven_multilingual_v2', // Supports both Spanish and English
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
 * Prepares text for meditative narration
 * Adds SSML-like pauses for a more relaxed delivery
 */
function prepareTextForMeditativeNarration(text: string): string {
    return text
        // Add pauses after paragraphs
        .replace(/\n\n/g, '. ... ')
        // Add pauses after line breaks
        .replace(/\n/g, '. .. ')
        // Ensure proper spacing after periods
        .replace(/\.  +/g, '. ')
        .trim();
}

/**
 * Generates narration audio for the symbolic analysis
 * Voice is selected based on user's gender preference
 * Language is automatically handled by the multilingual model
 * 
 * @param analysisText - The text to narrate (already in the correct language from Gemini)
 * @param gender - User's gender preference for voice selection
 * @param language - The language of the text (for logging purposes)
 */
export async function generateAnalysisNarration(
    analysisText: string,
    gender: Gender,
    language: Language
): Promise<string> {
    const voiceId = VOICE_IDS[gender];
    const voiceName = VOICE_NAMES[gender];
    
    console.log(`[ElevenLabs] Generating ${language.toUpperCase()} narration with voice: ${voiceName} (${gender})`);
    console.log(`[ElevenLabs] Text length: ${analysisText.length} chars`);
    
    // Prepare text for meditative delivery
    const preparedText = prepareTextForMeditativeNarration(analysisText);
    
    return generateSpeechWithElevenLabs(preparedText, voiceId);
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

/**
 * Subscription/Usage information from ElevenLabs
 */
export interface ElevenLabsUsageInfo {
    characterCount: number;
    characterLimit: number;
    remainingCharacters: number;
    usagePercentage: number;
    tier: string;
    nextResetDate: string | null;
}

/**
 * Gets the current usage/quota information from ElevenLabs API
 */
export async function getUsageInfo(): Promise<ElevenLabsUsageInfo> {
    const apiKey = getApiKey();
    
    try {
        const response = await fetch(`${ELEVENLABS_API_URL}/user/subscription`, {
            headers: {
                'xi-api-key': apiKey,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[ElevenLabs] Subscription API Error:', response.status, errorText);
            throw new Error(`Failed to fetch subscription info: ${response.status}`);
        }

        const data = await response.json();
        
        const characterCount = data.character_count || 0;
        const characterLimit = data.character_limit || 10000;
        const remainingCharacters = Math.max(0, characterLimit - characterCount);
        const usagePercentage = characterLimit > 0 ? (characterCount / characterLimit) * 100 : 0;
        
        // Try to get next reset date from the API response
        let nextResetDate: string | null = null;
        if (data.next_character_count_reset_unix) {
            nextResetDate = new Date(data.next_character_count_reset_unix * 1000).toLocaleDateString();
        }

        console.log('[ElevenLabs] Usage info:', {
            characterCount,
            characterLimit,
            remainingCharacters,
            usagePercentage: usagePercentage.toFixed(1) + '%',
            tier: data.tier,
        });

        return {
            characterCount,
            characterLimit,
            remainingCharacters,
            usagePercentage,
            tier: data.tier || 'free',
            nextResetDate,
        };
    } catch (error) {
        console.error('[ElevenLabs] Failed to get usage info:', error);
        // Return default values on error
        return {
            characterCount: 0,
            characterLimit: 10000,
            remainingCharacters: 10000,
            usagePercentage: 0,
            tier: 'unknown',
            nextResetDate: null,
        };
    }
}
