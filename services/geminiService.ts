/**
 * Gemini AI Service
 * Handles image generation, text generation (analysis, affirmations), and TTS narration
 * Uses Gemini TTS (gemini-2.5-flash-preview-tts) for meditation narration
 */

import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Gender, ContentLanguage } from '../types';

// Helper function to initialize the AI client on demand, preventing a startup crash.
const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set");
    }
    return new GoogleGenAI({ apiKey });
};

// Content language-specific prompt configurations
// 'es-latam' = Spanish Latin American (for generated text and narration)
// 'en' = English (for generated text and narration)
const LANGUAGE_CONFIG: Record<ContentLanguage, {
    imageStyle: string;
    customImagePrompt: (prompt: string) => string;
    genderInstruction: (gender: Gender, userName: string) => string;
    analysisPrompt: (scenarioTitle: string, prompt: string, genderInstruction: string, userName: string) => string;
    affirmationPrompt: (analysis: string, genderInstruction: string, userName: string) => string;
}> = {
    'es-latam': {
        imageStyle: 'arte visionario, estilo de arte digital, detallado, alta resolución, onírico, simbólico, cargado emocionalmente, fotorrealista',
        customImagePrompt: (prompt: string) => `Crea una imagen simbólica y onírica basada en esta intención: "${prompt}". Estilo de arte digital, detallado, alta resolución, cargado emocionalmente, fotorrealista, arte visionario.`,
        genderInstruction: (gender: Gender, userName: string) => {
            const nameInstruction = userName ? `El nombre del usuario es "${userName}".` : '';
            if (gender === 'female') {
                return `${nameInstruction} IMPORTANTE: El usuario es MUJER. Usa SIEMPRE género femenino: "Estimada", "querida", "bendecida", "conectada", "fortalecida", "sanada", etc. Todos los adjetivos y participios deben terminar en -a (femenino).`;
            } else if (gender === 'male') {
                return `${nameInstruction} IMPORTANTE: El usuario es HOMBRE. Usa SIEMPRE género masculino: "Estimado", "querido", "bendecido", "conectado", "fortalecido", "sanado", etc. Todos los adjetivos y participios deben terminar en -o (masculino).`;
            } else {
                return `${nameInstruction} Usa un lenguaje neutro e inclusivo. Evita adjetivos con género cuando sea posible, o usa alternativas como "eres alguien valiente", "tienes la capacidad de...".`;
            }
        },
        analysisPrompt: (scenarioTitle: string, prompt: string, genderInstruction: string, userName: string) => {
            const personalGreeting = userName ? `Inicia el mensaje con "Querida ${userName}," si es mujer o "Querido ${userName}," si es hombre.` : '';
            return `
            Eres un psicoterapeuta Junguiano y experto en simbología. Analiza este prompt de imagen creado para ayudar al usuario a superar un bloqueo.

            GÉNERO DEL USUARIO (MUY IMPORTANTE - SEGUIR ESTRICTAMENTE):
            ${genderInstruction}

            Contexto:
            - Escenario: "${scenarioTitle}"
            - Prompt de imagen: "${prompt}"

            Instrucciones:
            - ${personalGreeting}
            - Escribe 2-3 párrafos cálidos y empoderadores.
            - Desglosa los símbolos clave.
            - Explica cómo integra la sombra.
            - Habla directamente al usuario usando el género correcto en TODOS los adjetivos.
            - Español latinoamericano (no "vosotros").
            
            RECUERDA: Verifica que cada adjetivo concuerde con el género indicado.
        `;
        },
        affirmationPrompt: (analysis: string, genderInstruction: string, userName: string) => {
            const nameNote = userName ? ` Puedes incluir el nombre "${userName}" si fluye naturalmente.` : '';
            return `
            Crea una afirmación en primera persona ("Yo soy...", "Yo elijo..."). Máximo 15 palabras.${nameNote}

            GÉNERO: ${genderInstruction}
            
            Análisis: "${analysis}"

            IMPORTANTE: Si el usuario es mujer, usa adjetivos femeninos (ej: "Yo soy poderosa", "Yo estoy conectada").
            Si es hombre, usa masculinos (ej: "Yo soy poderoso", "Yo estoy conectado").
            
            Genera solo la frase de afirmación.
        `;
        },
    },
    'en': {
        imageStyle: 'visionary art, digital art style, detailed, high resolution, dreamlike, symbolic, emotionally charged, photorealistic',
        customImagePrompt: (prompt: string) => `Create a symbolic and dreamlike image based on this intention: "${prompt}". Digital art style, detailed, high resolution, emotionally charged, photorealistic, visionary art.`,
        genderInstruction: (gender: Gender, userName: string) => {
            const nameInstruction = userName ? `The user's name is "${userName}".` : '';
            if (gender === 'female') {
                return `${nameInstruction} IMPORTANT: The user is a WOMAN. Use "she/her" pronouns. Address her as "Dear [name]" if name is provided.`;
            } else if (gender === 'male') {
                return `${nameInstruction} IMPORTANT: The user is a MAN. Use "he/him" pronouns. Address him as "Dear [name]" if name is provided.`;
            } else {
                return `${nameInstruction} Use gender-neutral language. Prefer "you/your" and avoid gendered terms.`;
            }
        },
        analysisPrompt: (scenarioTitle: string, prompt: string, genderInstruction: string, userName: string) => {
            const personalGreeting = userName ? `Start with "Dear ${userName},"` : '';
            return `
            You are a Jungian psychotherapist and symbology expert. Analyze this AI image prompt created to help the user overcome a blockage.

            USER GENDER (VERY IMPORTANT - FOLLOW STRICTLY):
            ${genderInstruction}

            Context:
            - Scenario: "${scenarioTitle}"
            - Image prompt: "${prompt}"

            Instructions:
            - ${personalGreeting}
            - Write 2-3 warm, empowering paragraphs.
            - Break down key symbols.
            - Explain shadow integration.
            - Speak directly to the user using correct pronouns.
            - Respond in English only.
        `;
        },
        affirmationPrompt: (analysis: string, genderInstruction: string, userName: string) => {
            const nameNote = userName ? ` You may include "${userName}" if it flows naturally.` : '';
            return `
            Create a first-person affirmation ("I am...", "I choose..."). Maximum 15 words.${nameNote}

            Analysis: "${analysis}"

            Generate only the affirmation phrase in English.
        `;
        },
    },
};

export const generateSubconsciousImage = async (prompt: string, contentLanguage: ContentLanguage): Promise<string> => {
    const config = LANGUAGE_CONFIG[contentLanguage];
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

export const generateCustomImage = async (prompt: string, contentLanguage: ContentLanguage): Promise<string> => {
    const config = LANGUAGE_CONFIG[contentLanguage];
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
    contentLanguage: ContentLanguage,
    userName: string
): Promise<string> => {
    const config = LANGUAGE_CONFIG[contentLanguage];
    const genderInstruction = config.genderInstruction(gender, userName);
    const analysisPrompt = config.analysisPrompt(scenarioTitle, prompt, genderInstruction, userName);

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
    contentLanguage: ContentLanguage,
    userName: string
): Promise<string> => {
    const config = LANGUAGE_CONFIG[contentLanguage];
    const genderInstruction = config.genderInstruction(gender, userName);
    const textPrompt = config.affirmationPrompt(analysis, genderInstruction, userName);

    try {
        const ai = getAiClient();
        const textResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',  // Text model for text generation
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
// GEMINI TTS - DEPRECATED: Now using Google Cloud TTS API
// See: services/googleCloudTtsService.ts
// ============================================================================
// TTS functionality has been moved to googleCloudTtsService.ts which uses
// the Google Cloud Text-to-Speech API with gemini-2.5-pro-tts model.
// This provides better audio quality (MP3 format) and more control over
// voice parameters like speaking rate, pitch, and volume.

// export const generateAffirmationAndAudio = async (
//     analysis: string,
//     gender: Gender,
//     language: Language
// ): Promise<{ affirmationText: string, affirmationAudioData: string }> => {
//     const affirmationText = await generateAffirmationText(analysis, gender, language);
//     return { affirmationText, affirmationAudioData: '' };
// };

// export const generateInductionAudio = async (
//     analysis: string,
//     gender: Gender,
//     language: Language
// ): Promise<string> => {
//     // Implementation removed - not currently in use
//     throw new Error("generateInductionAudio is not currently implemented");
// };
