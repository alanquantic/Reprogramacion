import React, { useState, useCallback, memo } from 'react';
import { GeneratedImage } from '../types';

interface ShareButtonProps {
    image: GeneratedImage;
}

const ShareButton: React.FC<ShareButtonProps> = memo(({ image }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    /**
     * Downloads the image to the user's device
     */
    const handleDownloadImage = useCallback(async () => {
        try {
            const link = document.createElement('a');
            link.href = image.url;
            const filename = `simbolo-poder-${image.scenarioTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpeg`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setShowMenu(false);
        } catch (error) {
            console.error('[ShareButton] Error downloading image:', error);
        }
    }, [image]);

    /**
     * Copies the affirmation text to clipboard
     */
    const handleCopyAffirmation = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(`"${image.affirmation}"\n\n- Mi símbolo de poder: ${image.scenarioTitle}`);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (error) {
            console.error('[ShareButton] Error copying to clipboard:', error);
        }
    }, [image]);

    /**
     * Uses Web Share API if available
     */
    const handleNativeShare = useCallback(async () => {
        if (!navigator.share) {
            setShowMenu(true);
            return;
        }

        setIsSharing(true);
        try {
            // Convert base64 to blob for sharing
            const response = await fetch(image.url);
            const blob = await response.blob();
            const file = new File([blob], 'simbolo-poder.jpg', { type: 'image/jpeg' });

            await navigator.share({
                title: `Mi Símbolo de Poder: ${image.scenarioTitle}`,
                text: `"${image.affirmation}"\n\nGenerado con Reprogramación Visual`,
                files: [file],
            });
            console.log('[ShareButton] Shared successfully');
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('[ShareButton] Error sharing:', error);
                // Fallback to menu
                setShowMenu(true);
            }
        } finally {
            setIsSharing(false);
        }
    }, [image]);

    /**
     * Share to Twitter/X
     */
    const handleShareTwitter = useCallback(() => {
        const text = encodeURIComponent(`"${image.affirmation}"\n\n🧘 Mi símbolo de poder para ${image.scenarioTitle.toLowerCase()}\n\n#ReprogramacionVisual #Meditacion`);
        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420');
        setShowMenu(false);
    }, [image]);

    /**
     * Share to WhatsApp
     */
    const handleShareWhatsApp = useCallback(() => {
        const text = encodeURIComponent(`🧘 *Mi Símbolo de Poder*\n\n"${image.affirmation}"\n\n✨ ${image.scenarioTitle}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShowMenu(false);
    }, [image]);

    return (
        <div className="relative">
            <button
                onClick={handleNativeShare}
                disabled={isSharing}
                className="bg-transparent border-2 border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-300 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-400 dark:hover:text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {isSharing ? 'Compartiendo...' : 'Compartir'}
            </button>

            {/* Share menu dropdown */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 w-56 z-50 animate-fade-in">
                        <button
                            onClick={handleDownloadImage}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>Descargar imagen</span>
                        </button>

                        <button
                            onClick={handleCopyAffirmation}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{copySuccess ? '¡Copiado!' : 'Copiar afirmación'}</span>
                        </button>

                        <hr className="my-2 border-gray-200 dark:border-gray-700" />

                        <button
                            onClick={handleShareTwitter}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            <span>Compartir en X</span>
                        </button>

                        <button
                            onClick={handleShareWhatsApp}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            <span>Compartir en WhatsApp</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
});

ShareButton.displayName = 'ShareButton';

export default ShareButton;

