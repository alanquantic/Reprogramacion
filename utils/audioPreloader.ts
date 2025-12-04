/**
 * Audio Preloader Utility
 * Preloads audio files during idle time to reduce latency during meditation
 */

import { ReprogramArea } from '../types';
import { getBackgroundMusic } from '../services/musicService';

interface PreloadState {
    isPreloading: boolean;
    preloadedAreas: Set<ReprogramArea>;
    errors: Map<ReprogramArea, string>;
}

const state: PreloadState = {
    isPreloading: false,
    preloadedAreas: new Set(),
    errors: new Map(),
};

/**
 * Preloads background music for a specific area
 * @param area - The area to preload music for
 * @returns Promise that resolves when preloading is complete
 */
export async function preloadMusicForArea(area: ReprogramArea): Promise<void> {
    if (state.preloadedAreas.has(area)) {
        console.log('[AudioPreloader] Music already preloaded for:', area);
        return;
    }

    console.log('[AudioPreloader] Preloading music for:', area);
    
    try {
        await getBackgroundMusic(area);
        state.preloadedAreas.add(area);
        state.errors.delete(area);
        console.log('[AudioPreloader] Successfully preloaded music for:', area);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        state.errors.set(area, message);
        console.error('[AudioPreloader] Failed to preload music for:', area, error);
    }
}

/**
 * Preloads music for all areas during idle time
 * Uses requestIdleCallback for non-blocking preloading
 */
export function preloadAllMusic(): void {
    if (state.isPreloading) {
        console.log('[AudioPreloader] Already preloading');
        return;
    }

    state.isPreloading = true;
    const areas = Object.values(ReprogramArea);
    let currentIndex = 0;

    const preloadNext = () => {
        if (currentIndex >= areas.length) {
            state.isPreloading = false;
            console.log('[AudioPreloader] Finished preloading all areas');
            return;
        }

        const area = areas[currentIndex];
        currentIndex++;

        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleNext = typeof requestIdleCallback !== 'undefined'
            ? (cb: () => void) => requestIdleCallback(cb, { timeout: 2000 })
            : (cb: () => void) => setTimeout(cb, 100);

        preloadMusicForArea(area).finally(() => {
            scheduleNext(preloadNext);
        });
    };

    // Start preloading
    if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => preloadNext(), { timeout: 1000 });
    } else {
        setTimeout(preloadNext, 100);
    }
}

/**
 * Checks if music for an area is preloaded
 * @param area - The area to check
 * @returns true if preloaded
 */
export function isMusicPreloaded(area: ReprogramArea): boolean {
    return state.preloadedAreas.has(area);
}

/**
 * Gets the current preload status
 * @returns Object with preload state information
 */
export function getPreloadStatus(): {
    isPreloading: boolean;
    preloadedCount: number;
    totalAreas: number;
    errors: string[];
} {
    const totalAreas = Object.values(ReprogramArea).length;
    return {
        isPreloading: state.isPreloading,
        preloadedCount: state.preloadedAreas.size,
        totalAreas,
        errors: Array.from(state.errors.values()),
    };
}

/**
 * Clears all preloaded data
 */
export function clearPreloadedAudio(): void {
    state.preloadedAreas.clear();
    state.errors.clear();
    state.isPreloading = false;
    console.log('[AudioPreloader] Cleared preloaded audio');
}

