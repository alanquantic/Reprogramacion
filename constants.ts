

import { ReprogramArea, AreaInfo, LoadingStep, Scenario } from './types';

export const AREAS: AreaInfo[] = [
    {
        id: ReprogramArea.Physical,
        name: 'Físico',
        description: 'Salud, energía, vitalidad y bienestar corporal.',
        iconId: 'Physical',
        color: 'from-green-500 to-teal-500',
        borderColor: 'border-green-500',
        ringColor: 'ring-green-500',
        shadowColor: 'shadow-green-500/20',
        hoverBorderColor: 'hover:border-green-500',
    },
    {
        id: ReprogramArea.Economic,
        name: 'Económico',
        description: 'Abundancia, prosperidad, carrera y finanzas.',
        iconId: 'Economic',
        color: 'from-yellow-500 to-amber-500',
        borderColor: 'border-yellow-500',
        ringColor: 'ring-yellow-500',
        shadowColor: 'shadow-yellow-500/20',
        hoverBorderColor: 'hover:border-yellow-500',
    },
    {
        id: ReprogramArea.Spiritual,
        name: 'Espiritual',
        description: 'Paz interior, conexión, propósito y crecimiento personal.',
        iconId: 'Spiritual',
        color: 'from-purple-500 to-indigo-500',
        borderColor: 'border-purple-500',
        ringColor: 'ring-purple-500',
        shadowColor: 'shadow-purple-500/20',
        hoverBorderColor: 'hover:border-purple-500',
    },
    {
        id: ReprogramArea.Energetic,
        name: 'Energético',
        description: 'Flujo de chakras, campo áurico y liberación emocional.',
        iconId: 'Energetic',
        color: 'from-cyan-500 to-blue-500',
        borderColor: 'border-cyan-500',
        ringColor: 'ring-cyan-500',
        shadowColor: 'shadow-cyan-500/20',
        hoverBorderColor: 'hover:border-cyan-500',
    },
];

export const SCENARIOS: Scenario[] = [
    // Físico
    {
        id: 'phys-1',
        area: ReprogramArea.Physical,
        title: 'Desbloqueo físico – Plexo Solar',
        prompt: 'Ultra-high-res image, central composition, human silhouette receiving a gentle turquoise light wave from a living mandala at the solar plexus; fractal cellular patterns dissolving tension; water textures + soft smoke releasing blockages; bright healing glow; realistic skin micro-shine; cinematic depth; no text, no logos',
    },
    {
        id: 'phys-2',
        area: ReprogramArea.Physical,
        title: 'Desbloqueo físico – Columna vertebral',
        prompt: 'Hyperrealistic digital painting of a spine made of golden-turquoise light surrounded by swirling geometric patterns; smooth energy flow ascending; soft particles clearing stuck areas; calm atmosphere; high detail; therapeutic glow; no text, no religious symbols',
    },
    {
        id: 'phys-3',
        area: ReprogramArea.Physical,
        title: 'Desbloqueo físico – Regeneración muscular',
        prompt: 'Close-up of energy filaments repairing muscle tissue in a soothing teal-green light; fractal patterns weaving harmony; warm illumination and soft motion blur; realistic texture + dreamlike atmosphere; healing frequency effect; no text',
    },
    // Energético
    {
        id: 'ener-1',
        area: ReprogramArea.Energetic,
        title: 'Desbloqueo energético – Flujo de chakras',
        prompt: 'Central mandala in indigo + emerald emitting rotating rays through aligned chakras; golden circuits connecting each center; ethereal background waves; high contrast lighting; aura shimmering; sacred geometry without explicit religious symbols; ultra-high resolution',
    },
    {
        id: 'ener-2',
        area: ReprogramArea.Energetic,
        title: 'Desbloqueo energético – Campo áurico',
        prompt: 'Human silhouette surrounded by a flowing auric field of emerald, violet and gold; particles moving in slow spiral; soft glow from the heart centre; fractal geometry integrated; surreal realism style; no distortions, no text',
    },
    {
        id: 'ener-3',
        area: ReprogramArea.Energetic,
        title: 'Desbloqueo energético – Liberación de tensión emocional',
        prompt: 'Waves of light in indigo and white breaking through a dark energetic knot; knot dissolving into bright particles; cinematic lighting; minimal background; strong emotional release effect; high detail; no harsh colors',
    },
    // Espiritual
    {
        id: 'spir-1',
        area: ReprogramArea.Spiritual,
        title: 'Desbloqueo espiritual – Portal de claridad',
        prompt: 'Dreamlike silver portal made of sacred geometry columns; faint stars above; violet-blue glow; small human figure stepping into light; smooth gradients; mystical yet serene atmosphere; ultra detailed; no text, no faces',
    },
    {
        id: 'spir-2',
        area: ReprogramArea.Spiritual,
        title: 'Desbloqueo espiritual – Conexión interior',
        prompt: 'Soft-lit meditative silhouette with glowing third-eye mandala; spirals ascending; shimmering violet, silver and midnight blue; floating fractals; peaceful symmetry; ethereal vibe; high resolution',
    },
    {
        id: 'spir-3',
        area: ReprogramArea.Spiritual,
        title: 'Desbloqueo espiritual – Ascenso de consciencia',
        prompt: 'Golden-violet spiral ascending toward a luminous center; light beams radiating outwards; abstract sacred geometry; painterly digital style; serene yet powerful presence; ultra-high-res; no text, no symbolism tied to specific religions',
    },
    // Económico
    {
        id: 'econ-1',
        area: ReprogramArea.Economic,
        title: 'Desbloqueo económico – Árbol de abundancia',
        prompt: 'Seed of gold growing into a geometric tree; translucent coins transforming into glowing leaves; ambient light from below; warm gold and emerald palette; hyperreal-mystical style; no text, no obvious currency symbols',
    },
    {
        id: 'econ-2',
        area: ReprogramArea.Economic,
        title: 'Desbloqueo económico – Flujo financiero',
        prompt: 'Clean golden light river flowing through interconnected geometric circuits; sparkling particles; futuristic elegance; black-gold palette; wealth and expansion mood; crisp detail; no text',
    },
    {
        id: 'econ-3',
        area: ReprogramArea.Economic,
        title: 'Desbloqueo económico – Riqueza interior',
        prompt: 'Golden light radiating from inside a silhouette, spreading outward into geometric patterns; calm power; subtle glow; realistic texture with surreal sacred geometry; high detail; no logos or text',
    },
];


export const LOADING_STEPS: Record<Exclude<LoadingStep, null>, { text: string; progress: number }> = {
    prompt: { text: "Generando concepto simbólico...", progress: 25 },
    image: { text: "Creando imagen visual...", progress: 50 },
    analysis: { text: "Analizando el simbolismo...", progress: 75 },
    affirmation: { text: "Creando tu afirmación y audio...", progress: 90 },
};