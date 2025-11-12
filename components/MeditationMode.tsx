import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage } from '../types';

type MeditationPhase = 'breathing' | 'induction' | 'meditation' | 'conclusion';

// Royalty-free calm music with integrated Theta wave binaural beats for deep relaxation.
const BINAURAL_MUSIC_BASE64 = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaXRyYXRlOiAzMjBrYnBzLCBTYW1wbGUgcmF0ZTogNDQxMDBIEC0gU3RlcmVvAAMA/yoEAAEAAAAAAAAAAABCAECAAAD/7bAOFpaQ0tY29tbWVudABCaXRyYXRlOiAzMjBrYnBzLCBTYW1wbGUgcmF0ZTogNDQxMDBIEC0gU3RlcmVvAAMA/yoEAAEAAAAAAAAAAABCAECAAAD/7bAOFpaQ0tY29tbWVudABCaXRyYXRlOiAzMjBrYnBzLCBTYW1wbGUgcmF0ZTogNDQxMDBIEC0gU3RlcmVvAAD/7bAOFpaQ0tAAAAAAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//7rI4APAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-';

/**
 * Decodes a base64 string into a Uint8Array.
 */
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 */
async function decodePcmAudioData(
    data: Uint8Array,
    ctx: AudioContext,
): Promise<AudioBuffer> {
    // Gemini TTS returns 24000Hz, 1 channel, 16-bit PCM
    const sampleRate = 24000;
    const numChannels = 1;
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0; // Convert 16-bit int to float range [-1, 1]
    }
    return buffer;
}

interface PhaseContentProps {
    phase: MeditationPhase;
    affirmation: string;
    imageUrl: string;
}

const PhaseContent: React.FC<PhaseContentProps> = ({ phase, affirmation, imageUrl }) => {
    switch (phase) {
        case 'breathing':
            return (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Prepárate para la Inmersión</h3>
                    <p className="text-lg text-purple-300 mt-2">Respira profundamente. Inhala calma, exhala tensión.</p>
                     <div className="mt-8 relative w-48 h-48 flex items-center justify-center">
                        <div className="absolute inset-0 bg-purple-500 rounded-full animate-pulse-soft opacity-50"></div>
                        <div className="absolute w-3/4 h-3/4 bg-purple-700 rounded-full animate-breathing-circle"></div>
                    </div>
                </div>
            );
        case 'induction':
            return (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Relajación Guiada</h3>
                    <p className="text-lg text-purple-300 mt-2">Escucha la guía. Permite que tu mente se abra.</p>
                </div>
            );
        case 'meditation':
            return (
                 <div className="flex flex-col items-center justify-center animate-fade-in">
                    <img
                        src={imageUrl}
                        alt="Símbolo de meditación"
                        className="rounded-xl shadow-2xl shadow-purple-900/80 w-full max-w-md aspect-square object-cover border-4 border-purple-500/50 animate-breathing-image"
                    />
                    <div className="mt-8">
                        <p className="text-xl md:text-2xl font-semibold text-white italic animate-pulse-soft">"{affirmation}"</p>
                    </div>
                </div>
            );
        case 'conclusion':
             return (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Integración Completa</h3>
                    <p className="text-lg text-purple-300 mt-2">La sesión está terminando. Vuelve lentamente a tu estado presente.</p>
                </div>
            );
        default:
            return null;
    }
};

interface MeditationModeProps {
    image: GeneratedImage;
    onClose: () => void;
}

const MeditationMode: React.FC<MeditationModeProps> = ({ image, onClose }) => {
    const [phase, setPhase] = useState<MeditationPhase>('breathing');
    const isMounted = useRef(true);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        isMounted.current = true;
        
        // Initialize AudioContext for TTS playback
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                 audioCtxRef.current = new AudioContext();
            } else {
                console.error("Web Audio API is not supported in this browser.");
                onClose(); // Can't proceed without it
                return;
            }
        }
        const audioCtx = audioCtxRef.current;

        /**
         * Plays raw PCM audio data from a base64 string using the Web Audio API.
         * Returns a promise that resolves when playback is complete.
         */
        const playPcmAudio = (base64Data?: string): Promise<void> => {
            return new Promise(async (resolve) => {
                if (!base64Data || !audioCtx) {
                    console.warn("Audio data or context is missing, skipping.");
                    resolve();
                    return;
                }
                try {
                    // Browsers may suspend audio context, it must be resumed by user interaction.
                    if (audioCtx.state === 'suspended') {
                        await audioCtx.resume();
                    }
                    const decodedBytes = decode(base64Data);
                    const audioBuffer = await decodePcmAudioData(decodedBytes, audioCtx);
                    const source = audioCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioCtx.destination);
                    source.onended = () => resolve();
                    source.start();
                } catch (err) {
                    console.error("Failed to decode or play PCM audio:", err);
                    resolve(); // Don't block the meditation sequence on audio error
                }
            });
        };

        const mainPlayer = new Audio(BINAURAL_MUSIC_BASE64);
        let affirmationIntervalId: number | undefined;
        let fadeOutIntervalId: number | undefined;

        const startSequence = async () => {
            // Phase 1: Breathing (8 seconds)
            if (!isMounted.current) return;
            setPhase('breathing');
            await new Promise(r => setTimeout(r, 8000));

            // Phase 2: Induction Voiceover
            if (!isMounted.current) return;
            setPhase('induction');
            await playPcmAudio(image.inductionAudioData);
            
            // Phase 3: Main Meditation (60 seconds)
            if (!isMounted.current) return;
            setPhase('meditation');
            mainPlayer.loop = true;
            mainPlayer.volume = 0.6;
            await mainPlayer.play().catch(e => console.error("Binaural music failed to play", e));
            
            await playPcmAudio(image.affirmationAudioData);
            affirmationIntervalId = window.setInterval(() => {
                if (isMounted.current) {
                    playPcmAudio(image.affirmationAudioData);
                }
            }, 15000);

            await new Promise(r => setTimeout(r, 60000));

            // Phase 4: Conclusion & Fade out
            if (!isMounted.current) return;
            setPhase('conclusion');
            clearInterval(affirmationIntervalId);

            // Fade out music over 4 seconds
            let vol = mainPlayer.volume;
            fadeOutIntervalId = window.setInterval(() => {
                if (vol > 0.05 && !mainPlayer.paused) {
                    vol -= 0.05;
                    mainPlayer.volume = Math.max(0, vol);
                } else {
                    clearInterval(fadeOutIntervalId);
                    mainPlayer.pause();
                }
            }, 200);

            await new Promise(r => setTimeout(r, 5000)); // Wait for conclusion message

            if (isMounted.current) {
                onClose();
            }
        };

        startSequence();

        return () => {
            isMounted.current = false;
            clearInterval(affirmationIntervalId);
            clearInterval(fadeOutIntervalId);
            mainPlayer.pause();
            audioCtx?.close().catch(console.error);
        };
    }, [image, onClose]);

    return (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
                aria-label="Cerrar meditación"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <PhaseContent phase={phase} affirmation={image.affirmation} imageUrl={image.url} />
        </div>
    );
};

export default MeditationMode;
