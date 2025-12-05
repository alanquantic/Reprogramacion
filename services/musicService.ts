/**
 * Music Service
 * Handles loading pre-recorded background music files by area
 * 
 * Music files should be placed in /public/audio/ folder:
 * - physical.mp3  (for Físico area)
 * - economic.mp3  (for Económico area)
 * - spiritual.mp3 (for Espiritual area)
 * - energetic.mp3 (for Energético area)
 */

import { ReprogramArea } from '../types';

// Mapping of areas to their corresponding audio file paths
const AREA_MUSIC_FILES: Record<ReprogramArea, string> = {
    [ReprogramArea.Physical]: '/audio/physical.mp3',
    [ReprogramArea.Economic]: '/audio/economic.mp3',
    [ReprogramArea.Spiritual]: '/audio/spiritual.mp3',
    [ReprogramArea.Energetic]: '/audio/energetic.mp3',
};

// Cache for loaded audio data
const musicCache: Map<ReprogramArea, string> = new Map();

/**
 * Fetches an audio file and converts it to base64 string
 */
async function fetchAudioAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Failed to load audio file: ${url}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Gets background music for a specific area.
 * Loads from pre-recorded files and caches the result.
 * 
 * @param area - The focus area to get music for
 * @returns Base64 encoded audio data (MP3 format)
 */
export async function getBackgroundMusic(area: ReprogramArea): Promise<string> {
    // Check cache first
    const cached = musicCache.get(area);
    if (cached) {
        console.log('[Music] Using cached music for area:', area);
        return cached;
    }
    
    const audioPath = AREA_MUSIC_FILES[area];
    console.log('[Music] Loading music for area:', area, 'from:', audioPath);
    
    try {
        const base64Audio = await fetchAudioAsBase64(audioPath);
        
        // Cache for future use
        musicCache.set(area, base64Audio);
        
        console.log('[Music] Loaded and cached music, size:', base64Audio.length, 'chars');
        return base64Audio;
    } catch (error) {
        console.warn('[Music] Failed to load music file:', audioPath, error);
        // Return empty string if file doesn't exist - music is optional
        return '';
    }
}

/**
 * Preloads music for all areas (call on app startup for faster experience)
 */
export async function preloadAllMusic(): Promise<void> {
    console.log('[Music] Preloading music for all areas...');
    
    const areas = Object.values(ReprogramArea);
    
    await Promise.allSettled(
        areas.map(area => getBackgroundMusic(area))
    );
    
    console.log('[Music] Preload complete');
}

/**
 * Clears the music cache (useful for testing or forcing reload)
 */
export function clearMusicCache(): void {
    musicCache.clear();
    console.log('[Music] Cache cleared');
}

/**
 * Checks if music is available for an area
 */
export function hasMusicForArea(area: ReprogramArea): boolean {
    return musicCache.has(area);
}

