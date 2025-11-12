import React from 'react';

const iconClass = "w-12 h-12";
const smallIconClass = "w-4 h-4";
const statusIconClass = "w-6 h-6";

export const CheckCircleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${statusIconClass} text-green-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${className || statusIconClass} animate-spin`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v3m0 12v3m9-9h-3m-12 0H3m16.636 6.364l-2.121-2.121M6.364 6.364L8.485 8.485m12.02 0l-2.121 2.121M6.364 17.636l2.121-2.121" />
    </svg>
);

export const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={smallIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);

export const DeleteIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className={smallIconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const PhysicalIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.75c-5.13-5.13-5.13-13.52 0-18.65a13.2 13.2 0 0118.65 0c5.13 5.13 5.13 13.52 0 18.65a13.2 13.2 0 01-18.65 0z" />
         <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0 4.5 4.5 0 010-6.364a4.5 4.5 0 016.364 0z" />
    </svg>
);

export const EconomicIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.94-3.94m3.94 3.94l-3.94 3.94" />
    </svg>
);

export const SpiritualIcon: React.FC = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75l9 16.5h-18l9-16.5z" />
    </svg>
);

export const EnergeticIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ICONS: { [key: string]: React.FC } = {
    Physical: PhysicalIcon,
    Economic: EconomicIcon,
    Spiritual: SpiritualIcon,
    Energetic: EnergeticIcon,
};

interface IconRendererProps {
    iconId: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ iconId }) => {
    const IconComponent = ICONS[iconId];
    if (!IconComponent) {
        return null;
    }
    return <IconComponent />;
};