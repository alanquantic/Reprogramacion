/**
 * Gemini AI Service
 * Handles image generation and text generation (analysis, affirmations)
 * TTS functionality is preserved but not actively used (ElevenLabs is used instead)
 */

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Gender, Language } from '../types';

// Helper function to initialize the AI client on demand, preventing a startup crash.
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
};

// Language-specific prompt configurations
const LANGUAGE_CONFIG = {
    es: {
        imageStyle: 'arte visionario, estilo de arte digital, detallado, alta resolución, onírico, simbólico, cargado emocionalmente, fotorrealista',
        customImagePrompt: (prompt: string) => `Crea una imagen simbólica y onírica basada en esta intención: "${prompt}". Estilo de arte digital, detallado, alta resolución, cargado emocionalmente, fotorrealista, arte visionario.`,
        genderInstruction: (gender: Gender) => `El usuario se identifica con el género ${gender === 'male' ? 'masculino' : gender === 'female' ? 'femenino' : 'neutro'}. Dirígete a él/ella/elle de forma apropiada y asegúrate de que todos los adjetivos concuerden.`,
        analysisPrompt: (scenarioTitle: string, prompt: string, genderInstruction: string) => `
            Eres un psicoterapeuta Junguiano y un experto en simbología. Tu tarea es analizar un prompt de imagen de IA que fue creado para ayudar a un usuario a superar un bloqueo. Explica el significado simbólico de la escena y cómo ayuda al usuario a integrar su sombra y avanzar en su sanación.

            Contexto:
            - ${genderInstruction}
            - Título del escenario de sanación: "${scenarioTitle}"
            - Prompt de la imagen: "${prompt}"

            Instrucciones:
            - Escribe un análisis breve (2-3 párrafos) en un tono cálido, perspicaz y empoderador.
            - Desglosa los símbolos clave de la imagen.
            - Explica cómo la imagen representa la integración de la sombra (cómo el 'problema' se convierte en una fortaleza).
            - Conecta la escena con la intención de sanación del escenario.
            - Habla directamente al usuario ('Esta imagen te invita a...'), usando el género correcto.
            - Responde ÚNICAMENTE en español.
        `,
        affirmationPrompt: (analysis: string, genderInstruction: string) => `
            Basado en el siguiente análisis psicológico, crea una afirmación corta y poderosa en primera persona ("Yo soy...", "Yo elijo...", "Yo permito...").
            Debe ser una frase directa, positiva y concisa (máximo 15 palabras) que encapsule la esencia de la transformación.

            Análisis: "${analysis}"
            Contexto Adicional: ${genderInstruction}

            Genera únicamente la frase de afirmación en español.
        `,
    },
    en: {
        imageStyle: 'visionary art, digital art style, detailed, high resolution, dreamlike, symbolic, emotionally charged, photorealistic',
        customImagePrompt: (prompt: string) => `Create a symbolic and dreamlike image based on this intention: "${prompt}". Digital art style, detailed, high resolution, emotionally charged, photorealistic, visionary art.`,
        genderInstruction: (gender: Gender) => `The user identifies with the ${gender === 'male' ? 'masculine' : gender === 'female' ? 'feminine' : 'neutral'} gender. Address them appropriately and ensure all adjectives agree.`,
        analysisPrompt: (scenarioTitle: string, prompt: string, genderInstruction: string) => `
            You are a Jungian psychotherapist and an expert in symbology. Your task is to analyze an AI image prompt that was created to help a user overcome a blockage. Explain the symbolic meaning of the scene and how it helps the user integrate their shadow and advance in their healing.

            Context:
            - ${genderInstruction}
            - Healing scenario title: "${scenarioTitle}"
            - Image prompt: "${prompt}"

            Instructions:
            - Write a brief analysis (2-3 paragraphs) in a warm, insightful, and empowering tone.
            - Break down the key symbols in the image.
            - Explain how the image represents shadow integration (how the 'problem' becomes a strength).
            - Connect the scene with the healing intention of the scenario.
            - Speak directly to the user ('This image invites you to...'), using the correct gender.
            - Respond ONLY in English.
        `,
        affirmationPrompt: (analysis: string, genderInstruction: string) => `
            Based on the following psychological analysis, create a short and powerful affirmation in first person ("I am...", "I choose...", "I allow...").
            It should be a direct, positive, and concise phrase (maximum 15 words) that encapsulates the essence of the transformation.

            Analysis: "${analysis}"
            Additional Context: ${genderInstruction}

            Generate only the affirmation phrase in English.
        `,
    },
};

export const generateSubconsciousImage = async (prompt: string, language: Language): Promise<string> => {
    const config = LANGUAGE_CONFIG[language];
    const fullPrompt = `${prompt}, ${config.imageStyle}.`;
    try {
        const ai = getAiClient();
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated by the API.");
        }

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image from Imagen.");
    }
};

export const generateCustomImage = async (prompt: string, language: Language): Promise<string> => {
    const config = LANGUAGE_CONFIG[language];
    const fullPrompt = config.customImagePrompt(prompt);
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No image was returned from the custom generation.");
    } catch (error) {
        console.error("Error generating custom image with Nano Banana:", error);
        throw new Error("Failed to generate custom image with Gemini.");
    }
};

export const editImageWithPrompt = async (base64ImageData: string, prompt: string): Promise<string> => {
    const match = base64ImageData.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 image data string.");
    }
    const mimeType = match[1];
    const data = match[2];

    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: data,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("No image was returned from the edit operation.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image with Gemini.");
    }
};

export const generateSymbolicAnalysis = async (
    scenarioTitle: string,
    prompt: string,
    gender: Gender,
    language: Language
): Promise<string> => {
    const config = LANGUAGE_CONFIG[language];
    const genderInstruction = config.genderInstruction(gender);
    const analysisPrompt = config.analysisPrompt(scenarioTitle, prompt, genderInstruction);

    try {
        const ai = getAiClient();
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: analysisPrompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating symbolic analysis:", error);
        throw new Error("Failed to generate symbolic analysis from Gemini.");
    }
}

/**
 * Generates only affirmation text (no audio) for faster performance.
 * Audio is generated separately by ElevenLabs for the analysis narration.
 */
export const generateAffirmationText = async (
    analysis: string,
    gender: Gender,
    language: Language
): Promise<string> => {
    const config = LANGUAGE_CONFIG[language];
    const genderInstruction = config.genderInstruction(gender);
    const textPrompt = config.affirmationPrompt(analysis, genderInstruction);

    try {
        const ai = getAiClient();
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: textPrompt,
        });
        const affirmationText = textResponse.text.trim().replace(/"/g, '');

        if (!affirmationText) {
            throw new Error("Failed to generate affirmation text.");
        }

        return affirmationText;
    } catch (error) {
        console.error("Error generating affirmation:", error);
        throw new Error("Failed to generate affirmation from Gemini.");
    }
};

// ============================================================================
// GEMINI TTS - PRESERVED FOR FUTURE USE (Currently using ElevenLabs instead)
// ============================================================================

// Gemini TTS voice configuration by gender
// Selected voices with calm, meditative qualities for Spanish narration
// Aoede and Kore are softer/gentler voices
const GEMINI_VOICES: Record<Gender, string> = {
    male: 'Charon',    // Male voice - deep and calm
    female: 'Aoede',   // Female voice - soft, gentle, soothing  
    neutral: 'Kore',   // Neutral voice - warm and calming
};

const GEMINI_VOICE_NAMES: Record<Gender, string> = {
    male: 'Charon (masculine calm)',
    female: 'Aoede (feminine soft)',
    neutral: 'Kore (neutral warm)',
};

/**
 * Text-to-Speech with gender-based voice selection (GEMINI TTS)
 * Uses Gemini TTS for calm, meditative narration
 * Wraps text with style instructions for meditation delivery
 * 
 * NOTE: This function is preserved but NOT actively used.
 * The app currently uses ElevenLabs for TTS instead.
 */
const textToSpeechWithGenderGemini = async (text: string, gender: Gender): Promise<string> => {
    const voiceName = GEMINI_VOICES[gender];
    const voiceLabel = GEMINI_VOICE_NAMES[gender];
    
    console.log(`[Gemini TTS] Generating speech with voice: ${voiceLabel}`);
    console.log("[Gemini TTS] Text preview:", text.substring(0, 80) + "...");
    
    // Wrap text with style instructions for meditation narration
    const styledText = `<speak slowly and calmly, like a meditation guide, with a soft and soothing tone, taking natural pauses between phrases>

${text}

</speak>`;
    
    try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: styledText }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        
        if (!base64Audio) {
            throw new Error("No audio data received from TTS API.");
        }
        
        console.log("[Gemini TTS] Audio generated successfully, size:", base64Audio.length, "chars");
        return base64Audio;
    } catch (error) {
        console.error("[Gemini TTS] Error generating speech:", error);
        throw new Error("Failed to generate audio from text.");
    }
};

/**
 * Prepares text for calm, meditative narration.
 * Adds natural pauses and breathing room for a more relaxed delivery.
 * Uses longer pauses and breathing cues for a meditation-like pace.
 */
function prepareTextForCalmNarration(text: string): string {
    return text
        // Add long pauses after paragraphs (breathing moments)
        .replace(/\n\n/g, '...... ')
        // Add medium pauses after line breaks
        .replace(/\n/g, '.... ')
        // Add pauses after sentences (natural breathing)
        .replace(/\. /g, '.... ')
        // Add pauses after colons for anticipation
        .replace(/: /g, ':.... ')
        // Add pauses after commas for gentler pacing
        .replace(/, /g, ',... ')
        // Clean up excessive pauses
        .replace(/\.{7,}/g, '......')
        .trim();
}

/**
 * Generates narration audio using Gemini TTS (PRESERVED FOR FUTURE USE)
 * 
 * NOTE: This function is preserved but NOT actively used.
 * The app currently uses ElevenLabs for TTS via elevenlabsService.ts
 */
export const generateAnalysisNarrationGemini = async (
    analysisText: string,
    gender: Gender
): Promise<string> => {
    const voiceLabel = GEMINI_VOICE_NAMES[gender];
    console.log(`[Gemini Narration] Generating analysis narration with voice: ${voiceLabel}`);
    console.log(`[Gemini Narration] Analysis length: ${analysisText.length} chars`);
    
    // Prepare text with pauses for a more relaxed, meditative delivery
    const narrativeText = prepareTextForCalmNarration(analysisText);
    
    console.log(`[Gemini Narration] Prepared text preview: ${narrativeText.substring(0, 100)}...`);
    
    return textToSpeechWithGenderGemini(narrativeText, gender);
};

// Legacy function kept for backwards compatibility
export const generateAffirmationAndAudio = async (
    analysis: string,
    gender: Gender,
    language: Language
): Promise<{ affirmationText: string, affirmationAudioData: string }> => {
    const affirmationText = await generateAffirmationText(analysis, gender, language);
    return { affirmationText, affirmationAudioData: '' }; // No audio needed
};

export const generateInductionAudio = async (analysis: string, gender: Gender, language: Language): Promise<string> => {
    const isSpanish = language === 'es';
    const genderInstruction = isSpanish
        ? `Dirígete al usuario de acuerdo a su género (${gender === 'male' ? 'masculino' : gender === 'female' ? 'femenino' : 'neutro'}).`
        : `Address the user according to their gender (${gender}).`;
    
    const prompt = isSpanish
        ? `
            Eres un guía de meditación con una voz calmada y tranquilizadora. Basado en el siguiente análisis de un bloqueo emocional, crea un guion de inducción a la meditación muy corto (30-45 segundos).
            El objetivo es guiar al usuario a un estado de relajación y receptividad antes de que vea su símbolo de poder.
            
            Instrucciones:
            - Comienza invitando a tomar una respiración profunda.
            - Guía al usuario para que libere tensiones físicas y mentales.
            - Prepara su mente para recibir una nueva imagen sanadora.
            - Termina con una frase que le invite a abrirse a la transformación.
            - Sé conciso, directo y usa un lenguaje suave y empoderador.
            - ${genderInstruction}

            Análisis del bloqueo: "${analysis}"

            Genera únicamente el texto del guion en español.
        `
        : `
            You are a meditation guide with a calm and soothing voice. Based on the following emotional blockage analysis, create a very short meditation induction script (30-45 seconds).
            The goal is to guide the user to a state of relaxation and receptivity before they see their power symbol.
            
            Instructions:
            - Begin by inviting a deep breath.
            - Guide the user to release physical and mental tensions.
            - Prepare their mind to receive a new healing image.
            - End with a phrase inviting them to open to transformation.
            - Be concise, direct, and use soft, empowering language.
            - ${genderInstruction}

            Blockage analysis: "${analysis}"

            Generate only the script text in English.
        `;
    
    try {
        const ai = getAiClient();
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const inductionText = textResponse.text.trim();
        if (!inductionText) {
            throw new Error("Failed to generate induction script text.");
        }
        // Note: This uses Gemini TTS - preserved for future use
        return await textToSpeechWithGenderGemini(inductionText, gender);
    } catch (error) {
        console.error("Error generating induction audio:", error);
        throw new Error("Failed to generate induction audio from Gemini.");
    }
};
