import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { GeneratedImage } from '../types';

type MeditationPhase = 'breathing' | 'meditation' | 'conclusion';

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
 * Decodes raw PCM audio data into an AudioBuffer for playback (for Gemini TTS/Music).
 */
async function decodePcmAudioData(
    data: Uint8Array,
    ctx: AudioContext,
): Promise<AudioBuffer> {
    const sampleRate = 24000;
    const numChannels = 1;
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

/**
 * Converts base64 to ArrayBuffer for MP3 decoding (for ElevenLabs audio).
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

interface SubtitleDisplayProps {
    text: string;
    isVisible: boolean;
}

/**
 * Component to display subtitles with accessibility support
 */
const SubtitleDisplay: React.FC<SubtitleDisplayProps> = memo(({ text, isVisible }) => {
    if (!isVisible || !text) return null;
    
    return (
        <div 
            className="absolute bottom-24 left-4 right-4 mx-auto max-w-2xl"
            role="region"
            aria-live="polite"
            aria-label="Subtítulos"
        >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg px-6 py-4 text-center">
                <p className="text-white text-lg md:text-xl leading-relaxed">
                    {text}
                </p>
            </div>
        </div>
    );
});

SubtitleDisplay.displayName = 'SubtitleDisplay';

/**
 * Progress bar component for meditation phases
 */
interface ProgressBarProps {
    progress: number; // 0-100
    phase: MeditationPhase;
    isPaused: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = memo(({ progress, phase, isPaused }) => {
    const phaseLabels: Record<MeditationPhase, string> = {
        breathing: 'Respiración',
        meditation: 'Meditación',
        conclusion: 'Cierre',
    };

    return (
        <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-md">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                <span>{phaseLabels[phase]}</span>
                <span>{isPaused ? 'Pausado' : `${Math.round(progress)}%`}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                    className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ${isPaused ? 'opacity-50' : ''}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
});

ProgressBar.displayName = 'ProgressBar';

/**
 * Volume control component
 */
interface VolumeControlProps {
    narrationVolume: number;
    musicVolume: number;
    onNarrationVolumeChange: (volume: number) => void;
    onMusicVolumeChange: (volume: number) => void;
    isExpanded: boolean;
    onToggle: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = memo(({
    narrationVolume,
    musicVolume,
    onNarrationVolumeChange,
    onMusicVolumeChange,
    isExpanded,
    onToggle,
}) => {
    return (
        <div className="absolute top-16 right-4 z-20">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                className="text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition-colors"
                aria-label="Control de volumen"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
            
            {isExpanded && (
                <div 
                    className="absolute top-12 right-0 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-48 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mb-4">
                        <label className="text-white/80 text-sm block mb-2">
                            Narración: {Math.round(narrationVolume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={narrationVolume}
                            onChange={(e) => onNarrationVolumeChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                    <div>
                        <label className="text-white/80 text-sm block mb-2">
                            Música: {Math.round(musicVolume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.01"
                            value={musicVolume}
                            onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

VolumeControl.displayName = 'VolumeControl';

interface PhaseContentProps {
    phase: MeditationPhase;
    affirmation: string;
    imageUrl: string;
    isNarrating: boolean;
    isPaused: boolean;
}

const PhaseContent: React.FC<PhaseContentProps> = memo(({ phase, affirmation, imageUrl, isNarrating, isPaused }) => {
    switch (phase) {
        case 'breathing':
            return (
                <div className="text-center animate-fade-in">
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Prepárate para la Inmersión</h3>
                    <p className="text-lg text-purple-300 mt-2">Respira profundamente. Inhala calma, exhala tensión.</p>
                    <div className="mt-8 relative w-48 h-48 flex items-center justify-center mx-auto">
                        <div className={`absolute inset-0 bg-purple-500 rounded-full opacity-50 ${isPaused ? '' : 'animate-pulse-soft'}`}></div>
                        <div className={`absolute w-3/4 h-3/4 bg-purple-700 rounded-full ${isPaused ? '' : 'animate-breathing-circle'}`}></div>
                    </div>
                </div>
            );
        case 'meditation':
            return (
                <div className="flex flex-col items-center justify-center animate-fade-in">
                    <img
                        src={imageUrl}
                        alt="Símbolo de meditación"
                        className={`rounded-xl shadow-2xl shadow-purple-900/80 w-full max-w-md aspect-square object-cover border-4 border-purple-500/50 ${isPaused ? '' : 'animate-breathing-image'}`}
                    />
                    <div className="mt-8 max-w-lg text-center">
                        {isNarrating ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className={`w-2 h-2 bg-purple-400 rounded-full ${isPaused ? '' : 'animate-pulse'}`}></div>
                                <p className="text-lg text-purple-300">
                                    {isPaused ? 'Narración pausada...' : 'Escuchando análisis simbólico...'}
                                </p>
                                <div className={`w-2 h-2 bg-purple-400 rounded-full ${isPaused ? '' : 'animate-pulse'}`}></div>
                            </div>
                        ) : (
                            <p className="text-xl md:text-2xl font-semibold text-white italic animate-pulse-soft">"{affirmation}"</p>
                        )}
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
});

PhaseContent.displayName = 'PhaseContent';

interface MeditationModeProps {
    image: GeneratedImage;
    onClose: () => void;
}

const MeditationMode: React.FC<MeditationModeProps> = ({ image, onClose }) => {
    const [phase, setPhase] = useState<MeditationPhase>('breathing');
    const [audioError, setAudioError] = useState<string | null>(null);
    const [isNarrating, setIsNarrating] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(false);
    const [currentSubtitle, setCurrentSubtitle] = useState('');
    
    // New state for improvements
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(0);
    const [narrationVolume, setNarrationVolume] = useState(0.6);
    const [musicVolume, setMusicVolume] = useState(0.08);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const musicGainRef = useRef<GainNode | null>(null);
    const narrationGainRef = useRef<GainNode | null>(null);
    const sequenceStartedRef = useRef(false);
    const isClosingRef = useRef(false);
    const isPausedRef = useRef(false);
    const progressIntervalRef = useRef<number | null>(null);

    // Phase durations in ms
    const BREATHING_DURATION = 8000;
    const CONCLUSION_DURATION = 5000;

    // Update ref when state changes
    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    // Update volume in real-time
    useEffect(() => {
        if (musicGainRef.current) {
            musicGainRef.current.gain.value = musicVolume;
        }
    }, [musicVolume]);

    useEffect(() => {
        if (narrationGainRef.current) {
            narrationGainRef.current.gain.value = narrationVolume;
        }
    }, [narrationVolume]);

    const getAudioContext = useCallback((): AudioContext | null => {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            return audioCtxRef.current;
        }
        
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) {
            console.error("[MeditationMode] Web Audio API not supported.");
            return null;
        }
        
        const newCtx = new AudioContextClass();
        audioCtxRef.current = newCtx;
        console.log("[MeditationMode] Created new AudioContext, state:", newCtx.state);
        return newCtx;
    }, []);

    const startBackgroundMusic = useCallback(async (base64Data: string, volume: number = 0.3): Promise<void> => {
        if (!base64Data) {
            console.warn("[MeditationMode] No background music data provided.");
            return;
        }

        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        try {
            if (audioCtx.state !== 'running') {
                await audioCtx.resume();
            }

            console.log("[MeditationMode] Starting background music (MP3), length:", base64Data.length);
            
            const arrayBuffer = base64ToArrayBuffer(base64Data);
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
            
            console.log("[MeditationMode] Music duration:", audioBuffer.duration.toFixed(2), "s (will loop)");
            
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = volume;
            
            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            musicSourceRef.current = source;
            musicGainRef.current = gainNode;
            
            source.start();
            console.log("[MeditationMode] Background music started");
        } catch (err) {
            console.error("[MeditationMode] Failed to start background music:", err);
        }
    }, [getAudioContext]);

    const stopBackgroundMusic = useCallback(async (fadeOutMs: number = 2000): Promise<void> => {
        if (!musicSourceRef.current || !musicGainRef.current) return;

        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        try {
            const currentTime = audioCtx.currentTime;
            musicGainRef.current.gain.setValueAtTime(musicGainRef.current.gain.value, currentTime);
            musicGainRef.current.gain.linearRampToValueAtTime(0, currentTime + fadeOutMs / 1000);
            
            setTimeout(() => {
                try {
                    musicSourceRef.current?.stop();
                } catch {
                    // Already stopped
                }
                musicSourceRef.current = null;
                musicGainRef.current = null;
                console.log("[MeditationMode] Background music stopped");
            }, fadeOutMs);
        } catch (err) {
            console.error("[MeditationMode] Failed to stop background music:", err);
        }
    }, [getAudioContext]);

    const playPcmAudio = useCallback(async (base64Data: string | undefined, volume: number = 0.6): Promise<void> => {
        if (!base64Data) {
            console.warn("[MeditationMode] No PCM audio data provided.");
            return;
        }

        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        try {
            if (audioCtx.state !== 'running') {
                console.log("[MeditationMode] Resuming AudioContext...");
                await audioCtx.resume();
            }

            console.log("[MeditationMode] Decoding PCM audio (Gemini TTS), length:", base64Data.length);
            
            const decodedBytes = decode(base64Data);
            const audioBuffer = await decodePcmAudioData(decodedBytes, audioCtx);
            
            console.log("[MeditationMode] Playing PCM audio, duration:", audioBuffer.duration.toFixed(2), "s, volume:", volume);
            
            return new Promise<void>((resolve) => {
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                
                const gainNode = audioCtx.createGain();
                gainNode.gain.value = volume;
                narrationGainRef.current = gainNode;
                
                source.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                source.onended = () => {
                    console.log("[MeditationMode] PCM audio playback ended.");
                    narrationGainRef.current = null;
                    resolve();
                };
                source.start();
            });
        } catch (err) {
            console.error("[MeditationMode] Failed to play PCM audio:", err);
        }
    }, [getAudioContext]);

    const handleScreenClick = useCallback(async () => {
        const audioCtx = getAudioContext();
        if (audioCtx && audioCtx.state === 'suspended') {
            try {
                await audioCtx.resume();
                console.log("[MeditationMode] AudioContext resumed by click.");
                setAudioError(null);
            } catch (err) {
                console.error("[MeditationMode] Failed to resume:", err);
            }
        }
    }, [getAudioContext]);

    const handlePauseResume = useCallback(() => {
        const audioCtx = getAudioContext();
        if (!audioCtx) return;

        if (isPaused) {
            // Resume
            audioCtx.resume().then(() => {
                console.log("[MeditationMode] Audio resumed");
                setIsPaused(false);
            });
        } else {
            // Pause
            audioCtx.suspend().then(() => {
                console.log("[MeditationMode] Audio paused");
                setIsPaused(true);
            });
        }
    }, [isPaused, getAudioContext]);

    const handleClose = useCallback(() => {
        if (isClosingRef.current) return;
        isClosingRef.current = true;
        
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }
        
        if (musicSourceRef.current) {
            try {
                musicSourceRef.current.stop();
            } catch {
                // Already stopped
            }
        }
        
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(console.error);
            audioCtxRef.current = null;
        }
        
        onClose();
    }, [onClose]);

    // Progress tracking
    const startProgressTracking = useCallback((duration: number, startPercent: number, endPercent: number) => {
        const startTime = Date.now();
        const percentRange = endPercent - startPercent;

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = window.setInterval(() => {
            if (isPausedRef.current) return;
            
            const elapsed = Date.now() - startTime;
            const phaseProgress = Math.min(elapsed / duration, 1);
            const totalProgress = startPercent + (phaseProgress * percentRange);
            setProgress(totalProgress);

            if (phaseProgress >= 1) {
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                }
            }
        }, 100);
    }, []);

    // Main meditation sequence
    useEffect(() => {
        if (sequenceStartedRef.current) {
            console.log("[MeditationMode] Sequence already started, skipping.");
            return;
        }
        sequenceStartedRef.current = true;
        isClosingRef.current = false;

        console.log("[MeditationMode] Starting meditation sequence...");
        console.log("[MeditationMode] Audio data check:", {
            hasAnalysisAudio: Boolean(image.analysisAudioData),
            hasBackgroundMusic: Boolean(image.backgroundMusicData),
            analysisLength: image.analysisAudioData?.length ?? 0,
            musicLength: image.backgroundMusicData?.length ?? 0,
        });

        const audioCtx = getAudioContext();
        if (!audioCtx) {
            setAudioError("Tu navegador no soporta la reproducción de audio.");
        } else if (audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {
                setAudioError("Haz click en la pantalla para activar el audio.");
            });
        }

        const runSequence = async () => {
            // ========== PHASE 1: BREATHING (0-20%) ==========
            if (isClosingRef.current) return;
            console.log("[MeditationMode] Phase 1: Breathing");
            setPhase('breathing');
            startProgressTracking(BREATHING_DURATION, 0, 20);
            
            if (image.backgroundMusicData) {
                await startBackgroundMusic(image.backgroundMusicData, musicVolume);
            }
            
            await new Promise(r => setTimeout(r, BREATHING_DURATION));
            
            // ========== PHASE 2: MEDITATION (20-90%) ==========
            if (isClosingRef.current) return;
            console.log("[MeditationMode] Phase 2: Meditation");
            setPhase('meditation');
            
            if (musicGainRef.current) {
                musicGainRef.current.gain.value = musicVolume * 0.6; // Lower during narration
            }
            
            if (image.analysisAudioData) {
                setIsNarrating(true);
                setCurrentSubtitle(image.analysis);
                setProgress(20);
                
                // Estimate narration duration for progress (rough estimate: 150 chars/second)
                const estimatedDuration = Math.max(10000, (image.analysis.length / 150) * 1000);
                startProgressTracking(estimatedDuration, 20, 90);
                
                console.log("[MeditationMode] Starting analysis narration...");
                await playPcmAudio(image.analysisAudioData, narrationVolume);
                console.log("[MeditationMode] Analysis narration completed");
                setIsNarrating(false);
                setCurrentSubtitle('');
            }
            
            setProgress(90);
            await stopBackgroundMusic(1500);

            // ========== PHASE 3: CONCLUSION (90-100%) ==========
            if (isClosingRef.current) return;
            console.log("[MeditationMode] Phase 3: Conclusion");
            setPhase('conclusion');
            startProgressTracking(CONCLUSION_DURATION, 90, 100);
            
            await new Promise(r => setTimeout(r, CONCLUSION_DURATION));

            if (!isClosingRef.current) {
                handleClose();
            }
        };

        runSequence();

        return () => {
            console.log("[MeditationMode] Effect cleanup");
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
        };
    }, []);

    return (
        <div 
            className="fixed inset-0 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in"
            onClick={handleScreenClick}
            role="dialog"
            aria-modal="true"
            aria-label="Modo meditación"
        >
            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                className="absolute top-4 right-4 text-white bg-black/30 rounded-full p-2 hover:bg-black/60 transition-colors z-20"
                aria-label="Cerrar meditación"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Pause/Resume button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handlePauseResume();
                }}
                className="absolute top-4 left-1/2 -translate-x-1/2 text-white bg-black/30 rounded-full p-3 hover:bg-black/60 transition-colors z-20"
                aria-label={isPaused ? "Reanudar meditación" : "Pausar meditación"}
            >
                {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </button>
            
            {/* Subtitle toggle button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtitles(!showSubtitles);
                }}
                className="absolute top-4 left-4 text-white bg-black/30 rounded-full px-3 py-2 hover:bg-black/60 transition-colors z-20 text-sm flex items-center gap-2"
                aria-label={showSubtitles ? "Ocultar subtítulos" : "Mostrar subtítulos"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                CC
            </button>

            {/* Volume control */}
            <VolumeControl
                narrationVolume={narrationVolume}
                musicVolume={musicVolume}
                onNarrationVolumeChange={setNarrationVolume}
                onMusicVolumeChange={setMusicVolume}
                isExpanded={showVolumeControl}
                onToggle={() => setShowVolumeControl(!showVolumeControl)}
            />
            
            {/* Audio error message */}
            {audioError && (
                <div className="absolute top-20 left-4 right-16 bg-yellow-500/20 border border-yellow-500/50 text-yellow-200 px-4 py-2 rounded-lg text-sm">
                    ⚠️ {audioError}
                </div>
            )}
            
            {/* Main content */}
            <PhaseContent 
                phase={phase} 
                affirmation={image.affirmation} 
                imageUrl={image.url}
                isNarrating={isNarrating}
                isPaused={isPaused}
            />
            
            {/* Subtitles */}
            <SubtitleDisplay 
                text={currentSubtitle}
                isVisible={showSubtitles && isNarrating}
            />

            {/* Progress bar */}
            <ProgressBar 
                progress={progress}
                phase={phase}
                isPaused={isPaused}
            />
        </div>
    );
};

export default MeditationMode;
