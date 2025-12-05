/**
 * Rate Limiter Service
 * Prevents excessive API calls by throttling requests
 */

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RequestRecord {
    timestamps: number[];
}

const requestRecords: Map<string, RequestRecord> = new Map();

const DEFAULT_CONFIG: RateLimitConfig = {
    maxRequests: 10,    // Max 10 requests
    windowMs: 60000,    // Per minute
};

/**
 * Checks if a request can proceed based on rate limits
 * @param key - Identifier for the rate limit bucket (e.g., 'gemini-image', 'gemini-tts')
 * @param config - Rate limit configuration
 * @returns true if request can proceed, false if rate limited
 */
export function canProceed(key: string, config: RateLimitConfig = DEFAULT_CONFIG): boolean {
    const now = Date.now();
    const record = requestRecords.get(key) || { timestamps: [] };
    
    // Remove timestamps outside the window
    record.timestamps = record.timestamps.filter(ts => now - ts < config.windowMs);
    
    if (record.timestamps.length >= config.maxRequests) {
        console.warn(`[RateLimiter] Rate limit reached for: ${key}`);
        return false;
    }
    
    return true;
}

/**
 * Records a request for rate limiting
 * @param key - Identifier for the rate limit bucket
 */
export function recordRequest(key: string): void {
    const now = Date.now();
    const record = requestRecords.get(key) || { timestamps: [] };
    record.timestamps.push(now);
    requestRecords.set(key, record);
}

/**
 * Gets remaining requests available
 * @param key - Identifier for the rate limit bucket
 * @param config - Rate limit configuration
 * @returns Number of remaining requests
 */
export function getRemainingRequests(key: string, config: RateLimitConfig = DEFAULT_CONFIG): number {
    const now = Date.now();
    const record = requestRecords.get(key) || { timestamps: [] };
    const validTimestamps = record.timestamps.filter(ts => now - ts < config.windowMs);
    return Math.max(0, config.maxRequests - validTimestamps.length);
}

/**
 * Gets time until rate limit resets
 * @param key - Identifier for the rate limit bucket
 * @param config - Rate limit configuration
 * @returns Milliseconds until reset, or 0 if not rate limited
 */
export function getTimeUntilReset(key: string, config: RateLimitConfig = DEFAULT_CONFIG): number {
    const now = Date.now();
    const record = requestRecords.get(key);
    
    if (!record || record.timestamps.length === 0) {
        return 0;
    }
    
    const oldestTimestamp = Math.min(...record.timestamps);
    const resetTime = oldestTimestamp + config.windowMs;
    
    return Math.max(0, resetTime - now);
}

/**
 * Wraps an async function with rate limiting
 * @param key - Identifier for the rate limit bucket
 * @param fn - Async function to wrap
 * @param config - Rate limit configuration
 * @returns Wrapped function that throws if rate limited
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<unknown>>(
    key: string,
    fn: T,
    config: RateLimitConfig = DEFAULT_CONFIG
): T {
    return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
        if (!canProceed(key, config)) {
            const waitTime = Math.ceil(getTimeUntilReset(key, config) / 1000);
            throw new Error(`Límite de solicitudes alcanzado. Por favor espera ${waitTime} segundos.`);
        }
        
        recordRequest(key);
        return fn(...args) as ReturnType<T>;
    }) as T;
}

// Specific rate limit configurations for different API endpoints
export const RATE_LIMITS = {
    IMAGE_GENERATION: { maxRequests: 5, windowMs: 60000 },     // 5 per minute
    TTS_GENERATION: { maxRequests: 10, windowMs: 60000 },     // 10 per minute
    ANALYSIS: { maxRequests: 15, windowMs: 60000 },           // 15 per minute
    IMAGE_EDIT: { maxRequests: 5, windowMs: 60000 },          // 5 per minute
} as const;

