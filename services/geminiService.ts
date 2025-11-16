
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { MeditationSession } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SCRIPT_GENERATION_MODEL = 'gemini-2.5-flash';
const IMAGE_GENERATION_MODEL = 'imagen-4.0-generate-001';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
export const CHAT_MODEL = 'gemini-2.5-flash';


export async function generateMeditationSession(prompt: string): Promise<MeditationSession> {
  try {
    // Step 1: Generate script and image prompt
    const scriptAndImagePromptResponse = await ai.models.generateContent({
      model: SCRIPT_GENERATION_MODEL,
      contents: `You are an expert meditation guide. Based on the user's request for a meditation about "${prompt}", create a guided meditation script. The script should be calm, descriptive, and last about 2-3 minutes when spoken. Also, create a short, descriptive prompt for an image generation model to create a serene and abstract background visual that matches the mood of the meditation. Return the response as a JSON object with two keys: "script" and "imagePrompt".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: {
              type: Type.STRING,
              description: "The full guided meditation script.",
            },
            imagePrompt: {
              type: Type.STRING,
              description: "A prompt for an image generation model."
            }
          }
        }
      }
    });

    const { script, imagePrompt } = JSON.parse(scriptAndImagePromptResponse.text);

    // Step 2: Generate image
    const imageResponsePromise = ai.models.generateImages({
      model: IMAGE_GENERATION_MODEL,
      prompt: `photorealistic, cinematic lighting, ${imagePrompt}`,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg',
      },
    });

    // Step 3: Generate speech
    const speechResponsePromise = ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const [imageResponse, speechResponse] = await Promise.all([imageResponsePromise, speechResponsePromise]);

    const base64ImageData = imageResponse.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageData}`;
    
    const audioData = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? '';

    if (!audioData) {
      throw new Error("Failed to generate audio data.");
    }

    return { script, imageUrl, audioData };

  } catch (error) {
    console.error("Error generating meditation session:", error);
    throw new Error("Failed to create meditation session. Please try again.");
  }
}

let chatInstance: Chat | null = null;

export const getChatInstance = () => {
    if(!chatInstance){
        chatInstance = ai.chats.create({
            model: CHAT_MODEL,
            config: {
                systemInstruction: 'You are a helpful assistant for a guided meditation app called \'SereneAI\'. You can answer questions about meditation, mindfulness, or how to use the app.'
            }
        });
    }
    return chatInstance;
}
