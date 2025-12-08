/**
 * Application Constants
 * Area definitions and scenario configurations
 */

import { ReprogramArea, AreaInfo, LoadingStep, Scenario, Language } from './types';
import { Translations } from './i18n';

// Area definitions with styling (translation keys reference i18n)
export const AREAS: AreaInfo[] = [
    {
        id: ReprogramArea.Physical,
        name: 'areaPhysical', // Translation key
        description: 'areaPhysicalDesc', // Translation key
        iconId: 'Physical',
        color: 'from-green-500 to-teal-500',
        borderColor: 'border-green-500',
        ringColor: 'ring-green-500',
        shadowColor: 'shadow-green-500/20',
        hoverBorderColor: 'hover:border-green-500',
    },
    {
        id: ReprogramArea.Economic,
        name: 'areaEconomic',
        description: 'areaEconomicDesc',
        iconId: 'Economic',
        color: 'from-yellow-500 to-amber-500',
        borderColor: 'border-yellow-500',
        ringColor: 'ring-yellow-500',
        shadowColor: 'shadow-yellow-500/20',
        hoverBorderColor: 'hover:border-yellow-500',
    },
    {
        id: ReprogramArea.Spiritual,
        name: 'areaSpiritual',
        description: 'areaSpiritualDesc',
        iconId: 'Spiritual',
        color: 'from-purple-500 to-indigo-500',
        borderColor: 'border-purple-500',
        ringColor: 'ring-purple-500',
        shadowColor: 'shadow-purple-500/20',
        hoverBorderColor: 'hover:border-purple-500',
    },
    {
        id: ReprogramArea.Energetic,
        name: 'areaEnergetic',
        description: 'areaEnergeticDesc',
        iconId: 'Energetic',
        color: 'from-cyan-500 to-blue-500',
        borderColor: 'border-cyan-500',
        ringColor: 'ring-cyan-500',
        shadowColor: 'shadow-cyan-500/20',
        hoverBorderColor: 'hover:border-cyan-500',
    },
];

// Scenario title translation keys mapped by scenario ID
export const SCENARIO_TITLE_KEYS: Record<string, keyof Translations> = {
    'phys-1': 'scenarioPhys1',
    'phys-2': 'scenarioPhys2',
    'phys-3': 'scenarioPhys3',
    'ener-1': 'scenarioEner1',
    'ener-2': 'scenarioEner2',
    'ener-3': 'scenarioEner3',
    'spir-1': 'scenarioSpir1',
    'spir-2': 'scenarioSpir2',
    'spir-3': 'scenarioSpir3',
    'econ-1': 'scenarioEcon1',
    'econ-2': 'scenarioEcon2',
    'econ-3': 'scenarioEcon3',
};

// Scenarios with prompts (prompts remain in English for image generation)
export const SCENARIOS: Scenario[] = [
    // Physical
    {
        id: 'phys-1',
        area: ReprogramArea.Physical,
        title: 'scenarioPhys1', // Translation key
        prompt: 'Ultra-high-res image, central composition, human silhouette receiving a gentle turquoise light wave from a living mandala at the solar plexus; fractal cellular patterns dissolving tension; water textures + soft smoke releasing blockages; bright healing glow; realistic skin micro-shine; cinematic depth; no text, no logos',
    },
    {
        id: 'phys-2',
        area: ReprogramArea.Physical,
        title: 'scenarioPhys2',
        prompt: 'Hyperrealistic digital painting of a spine made of golden-turquoise light surrounded by swirling geometric patterns; smooth energy flow ascending; soft particles clearing stuck areas; calm atmosphere; high detail; therapeutic glow; no text, no religious symbols',
    },
    {
        id: 'phys-3',
        area: ReprogramArea.Physical,
        title: 'scenarioPhys3',
        prompt: 'Close-up of energy filaments repairing muscle tissue in a soothing teal-green light; fractal patterns weaving harmony; warm illumination and soft motion blur; realistic texture + dreamlike atmosphere; healing frequency effect; no text',
    },
    // Energetic
    {
        id: 'ener-1',
        area: ReprogramArea.Energetic,
        title: 'scenarioEner1',
        prompt: 'Central mandala in indigo + emerald emitting rotating rays through aligned chakras; golden circuits connecting each center; ethereal background waves; high contrast lighting; aura shimmering; sacred geometry without explicit religious symbols; ultra-high resolution',
    },
    {
        id: 'ener-2',
        area: ReprogramArea.Energetic,
        title: 'scenarioEner2',
        prompt: 'Human silhouette surrounded by a flowing auric field of emerald, violet and gold; particles moving in slow spiral; soft glow from the heart centre; fractal geometry integrated; surreal realism style; no distortions, no text',
    },
    {
        id: 'ener-3',
        area: ReprogramArea.Energetic,
        title: 'scenarioEner3',
        prompt: 'Waves of light in indigo and white breaking through a dark energetic knot; knot dissolving into bright particles; cinematic lighting; minimal background; strong emotional release effect; high detail; no harsh colors',
    },
    // Spiritual
    {
        id: 'spir-1',
        area: ReprogramArea.Spiritual,
        title: 'scenarioSpir1',
        prompt: 'Dreamlike silver portal made of sacred geometry columns; faint stars above; violet-blue glow; small human figure stepping into light; smooth gradients; mystical yet serene atmosphere; ultra detailed; no text, no faces',
    },
    {
        id: 'spir-2',
        area: ReprogramArea.Spiritual,
        title: 'scenarioSpir2',
        prompt: 'Soft-lit meditative silhouette with glowing third-eye mandala; spirals ascending; shimmering violet, silver and midnight blue; floating fractals; peaceful symmetry; ethereal vibe; high resolution',
    },
    {
        id: 'spir-3',
        area: ReprogramArea.Spiritual,
        title: 'scenarioSpir3',
        prompt: 'Golden-violet spiral ascending toward a luminous center; light beams radiating outwards; abstract sacred geometry; painterly digital style; serene yet powerful presence; ultra-high-res; no text, no symbolism tied to specific religions',
    },
    // Economic
    {
        id: 'econ-1',
        area: ReprogramArea.Economic,
        title: 'scenarioEcon1',
        prompt: 'Seed of gold growing into a geometric tree; translucent coins transforming into glowing leaves; ambient light from below; warm gold and emerald palette; hyperreal-mystical style; no text, no obvious currency symbols',
    },
    {
        id: 'econ-2',
        area: ReprogramArea.Economic,
        title: 'scenarioEcon2',
        prompt: 'Clean golden light river flowing through interconnected geometric circuits; sparkling particles; futuristic elegance; black-gold palette; wealth and expansion mood; crisp detail; no text',
    },
    {
        id: 'econ-3',
        area: ReprogramArea.Economic,
        title: 'scenarioEcon3',
        prompt: 'Golden light radiating from inside a silhouette, spreading outward into geometric patterns; calm power; subtle glow; realistic texture with surreal sacred geometry; high detail; no logos or text',
    },
];

// Loading step configuration with translation keys
export const LOADING_STEP_KEYS: Record<Exclude<LoadingStep, null>, { textKey: keyof Translations; progress: number }> = {
    prompt: { textKey: 'loadingStepPrompt', progress: 20 },
    image: { textKey: 'loadingStepImage', progress: 45 },
    analysis: { textKey: 'loadingStepAnalysis', progress: 70 },
    narration: { textKey: 'loadingStepNarration', progress: 90 },
    music: { textKey: 'loadingStepMusic', progress: 95 },
};

// Legacy export for backwards compatibility (used in old components)
export const LOADING_STEPS: Record<Exclude<LoadingStep, null>, { text: string; progress: number }> = {
    prompt: { text: "Generating symbolic concept...", progress: 20 },
    image: { text: "Creating visual image...", progress: 45 },
    analysis: { text: "Analyzing symbolism...", progress: 70 },
    narration: { text: "Generating analysis narration...", progress: 90 },
    music: { text: "Preparing audio...", progress: 95 },
};

/**
 * Helper function to get translated area name
 */
export function getAreaName(areaId: ReprogramArea, t: Translations): string {
    const area = AREAS.find(a => a.id === areaId);
    if (!area) return '';
    return t[area.name as keyof Translations] || area.name;
}

/**
 * Helper function to get translated area description
 */
export function getAreaDescription(areaId: ReprogramArea, t: Translations): string {
    const area = AREAS.find(a => a.id === areaId);
    if (!area) return '';
    return t[area.description as keyof Translations] || area.description;
}

/**
 * Helper function to get translated scenario title
 */
export function getScenarioTitle(scenarioId: string, t: Translations): string {
    const key = SCENARIO_TITLE_KEYS[scenarioId];
    if (key) {
        return t[key];
    }
    // Fallback for custom scenarios
    return t.customScenarioTitle;
}

/**
 * Helper to get loading step text
 */
export function getLoadingStepText(step: Exclude<LoadingStep, null>, t: Translations): string {
    const config = LOADING_STEP_KEYS[step];
    return t[config.textKey];
}

/**
 * Helper to get loading step progress
 */
export function getLoadingStepProgress(step: Exclude<LoadingStep, null>): number {
    return LOADING_STEP_KEYS[step].progress;
}
