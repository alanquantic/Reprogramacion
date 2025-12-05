/**
 * Image Optimizer Utility
 * Converts base64 images to Blob URLs for better memory management
 */

const blobUrlCache = new Map<string, string>();

/**
 * Converts a base64 data URL to a Blob URL
 * Blob URLs are more memory-efficient and can be revoked when no longer needed
 * @param base64DataUrl - The base64 data URL (e.g., "data:image/jpeg;base64,...")
 * @returns A blob URL that can be used as an image src
 */
export function base64ToBlobUrl(base64DataUrl: string): string {
    // Check cache first
    const cached = blobUrlCache.get(base64DataUrl);
    if (cached) {
        return cached;
    }

    // Extract the base64 data and mime type
    const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
        console.warn('[ImageOptimizer] Invalid base64 data URL format');
        return base64DataUrl;
    }

    const mimeType = match[1];
    const base64Data = match[2];

    try {
        // Decode base64 to binary
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create Blob and URL
        const blob = new Blob([bytes], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Cache the result
        blobUrlCache.set(base64DataUrl, blobUrl);

        console.log('[ImageOptimizer] Converted base64 to blob URL, size:', len, 'bytes');
        return blobUrl;
    } catch (error) {
        console.error('[ImageOptimizer] Failed to convert base64:', error);
        return base64DataUrl;
    }
}

/**
 * Revokes a blob URL to free memory
 * @param blobUrl - The blob URL to revoke
 */
export function revokeBlobUrl(blobUrl: string): void {
    if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
        // Remove from cache
        for (const [key, value] of blobUrlCache.entries()) {
            if (value === blobUrl) {
                blobUrlCache.delete(key);
                break;
            }
        }
        console.log('[ImageOptimizer] Revoked blob URL');
    }
}

/**
 * Clears all cached blob URLs
 * Should be called when leaving the app or on cleanup
 */
export function clearBlobCache(): void {
    for (const blobUrl of blobUrlCache.values()) {
        URL.revokeObjectURL(blobUrl);
    }
    blobUrlCache.clear();
    console.log('[ImageOptimizer] Cleared blob URL cache');
}

/**
 * Gets the estimated size of a base64 string in bytes
 * @param base64 - The base64 string (without data URL prefix)
 * @returns Estimated size in bytes
 */
export function getBase64Size(base64: string): number {
    // Remove data URL prefix if present
    const data = base64.includes(',') ? base64.split(',')[1] : base64;
    // Base64 encoding increases size by ~33%, so we reverse it
    return Math.ceil((data.length * 3) / 4);
}

/**
 * Formats bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

