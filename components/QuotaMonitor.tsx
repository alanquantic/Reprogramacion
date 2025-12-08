/**
 * QuotaMonitor - Floating widget to display ElevenLabs API usage
 * Shows character consumption and remaining quota
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getUsageInfo, ElevenLabsUsageInfo } from '../services/elevenlabsService';

interface QuotaMonitorProps {
    /** Whether to show the monitor (dev/debug mode) */
    visible?: boolean;
}

const QuotaMonitor: React.FC<QuotaMonitorProps> = memo(({ visible = true }) => {
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [usageInfo, setUsageInfo] = useState<ElevenLabsUsageInfo | null>(null);

    const fetchUsageInfo = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const info = await getUsageInfo();
            setUsageInfo(info);
        } catch (error) {
            console.error('[QuotaMonitor] Error fetching usage:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch usage info when expanded
    useEffect(() => {
        if (isExpanded && !usageInfo && !isLoading) {
            fetchUsageInfo();
        }
    }, [isExpanded, usageInfo, isLoading, fetchUsageInfo]);

    // Auto-refresh every 5 minutes when expanded
    useEffect(() => {
        if (!isExpanded) return;
        
        const interval = setInterval(() => {
            fetchUsageInfo();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [isExpanded, fetchUsageInfo]);

    if (!visible) return null;

    const getUsageColor = (percentage: number): string => {
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 70) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    return (
        <div className="fixed bottom-4 right-4 z-40">
            {/* Collapsed button */}
            {!isExpanded && (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-110 flex items-center gap-2"
                    title={t.quotaTitle}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {usageInfo && (
                        <span className={`text-xs font-bold ${getUsageColor(usageInfo.usagePercentage)}`}>
                            {usageInfo.usagePercentage.toFixed(0)}%
                        </span>
                    )}
                </button>
            )}

            {/* Expanded panel */}
            {isExpanded && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-purple-500/30 w-72 animate-fade-in overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="text-white font-semibold text-sm">{t.quotaTitle}</span>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-white/80 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {isLoading && !usageInfo ? (
                            <div className="flex items-center justify-center py-6">
                                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">{t.quotaLoading}</span>
                            </div>
                        ) : hasError ? (
                            <div className="text-center py-4">
                                <p className="text-red-500 text-sm mb-2">{t.quotaError}</p>
                                <button
                                    onClick={fetchUsageInfo}
                                    className="text-purple-600 dark:text-purple-400 text-sm hover:underline"
                                >
                                    {t.quotaRefresh}
                                </button>
                            </div>
                        ) : usageInfo ? (
                            <>
                                {/* Progress bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        <span>{t.quotaUsed}</span>
                                        <span className={`font-bold ${getUsageColor(usageInfo.usagePercentage)}`}>
                                            {usageInfo.usagePercentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getProgressColor(usageInfo.usagePercentage)} transition-all duration-500`}
                                            style={{ width: `${Math.min(usageInfo.usagePercentage, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Stats grid */}
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{t.quotaUsed}</p>
                                        <p className="text-gray-900 dark:text-white font-bold">
                                            {formatNumber(usageInfo.characterCount)}
                                        </p>
                                        <p className="text-gray-400 dark:text-gray-500 text-xs">{t.quotaCharacters}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{t.quotaRemaining}</p>
                                        <p className={`font-bold ${getUsageColor(usageInfo.usagePercentage)}`}>
                                            {formatNumber(usageInfo.remainingCharacters)}
                                        </p>
                                        <p className="text-gray-400 dark:text-gray-500 text-xs">{t.quotaCharacters}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{t.quotaLimit}</p>
                                        <p className="text-gray-900 dark:text-white font-bold">
                                            {formatNumber(usageInfo.characterLimit)}
                                        </p>
                                        <p className="text-gray-400 dark:text-gray-500 text-xs">{t.quotaCharacters}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{t.quotaTier}</p>
                                        <p className="text-purple-600 dark:text-purple-400 font-bold capitalize">
                                            {usageInfo.tier}
                                        </p>
                                        {usageInfo.nextResetDate && (
                                            <p className="text-gray-400 dark:text-gray-500 text-xs">
                                                {t.quotaResets}: {usageInfo.nextResetDate}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Refresh button */}
                                <button
                                    onClick={fetchUsageInfo}
                                    disabled={isLoading}
                                    className="w-full mt-4 text-purple-600 dark:text-purple-400 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    {t.quotaRefresh}
                                </button>

                                {/* Warning if usage is high */}
                                {usageInfo.usagePercentage >= 80 && (
                                    <div className={`mt-3 p-2 rounded-lg text-xs ${
                                        usageInfo.usagePercentage >= 90 
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    }`}>
                                        ⚠️ {usageInfo.usagePercentage >= 90 
                                            ? 'Critical: Almost at limit!' 
                                            : 'Warning: Usage is high'}
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
});

QuotaMonitor.displayName = 'QuotaMonitor';

export default QuotaMonitor;

