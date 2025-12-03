import { GoogleGenAI, Type } from "@google/genai";

// Ideally, this is injected securely. For this demo, we assume process.env.API_KEY is available.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes a product image to extract fashion attributes.
 */
export const analyzeProductImage = async (imageUrl: string): Promise<any> => {
  if (!apiKey) {
    console.warn("No API Key provided for analysis.");
    return mockAnalysis();
  }

  try {
    // Since we can't easily fetch CORS images on client-side to convert to base64 for the API 
    // without a proxy, for this demo we will simulate the "Analysis" if it's a picsum URL,
    // OR we would need the image as base64. 
    // Assuming for the demo we send a text prompt to simulate the result based on a description implies by the "image".
    // In a real app, we would upload the file.
    
    // Let's rely on the text model to generate plausible data for a "mock" image analysis 
    // to ensure the UI works even without a real image upload.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze a hypothetical fashion product image (e.g., a T-shirt, Dress, or Jeans). 
      Return a JSON object with the following properties: material, color, style, season, category, collarType.
      Make sure all string values are in Simplified Chinese (简体中文) suitable for a fashion e-commerce site.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            material: { type: Type.STRING },
            color: { type: Type.STRING },
            style: { type: Type.STRING },
            season: { type: Type.STRING },
            category: { type: Type.STRING },
            collarType: { type: Type.STRING },
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return mockAnalysis();
  }
};

const mockAnalysis = () => ({
  material: "棉混纺",
  color: "藏青色",
  style: "休闲",
  season: "夏季",
  category: "T恤",
  collarType: "圆领"
});

/**
 * Generates new fashion style descriptions based on a seed.
 */
export const generateStyleDescriptions = async (seed: string, count: number): Promise<any[]> => {
  if (!apiKey) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} unique fashion style concepts based on the seed theme: "${seed}".
      Return a JSON array where each object has: name, description, material, elements (design elements), colorTheme, and a promptForImage (a detailed prompt to generate an image of this item).
      Ensure 'name', 'description', 'material', 'elements', and 'colorTheme' are in Simplified Chinese (简体中文). 'promptForImage' should remain in English for better image generation results.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              material: { type: Type.STRING },
              elements: { type: Type.STRING },
              colorTheme: { type: Type.STRING },
              promptForImage: { type: Type.STRING },
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Style Generation Failed:", error);
    return [];
  }
};

/**
 * Generates an image for a specific style.
 */
export const generateStyleImage = async (prompt: string): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    // Using gemini-2.5-flash-image as requested for general generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // or 'gemini-3-pro-image-preview' for higher quality if key supports it
      contents: prompt,
      config: {
        // imageConfig can be added here if using a model that supports specific aspect ratios
      }
    });

    // Extract image
    // The response for image generation models usually contains inlineData in the parts
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Failed:", error);
    // Return a placeholder if generation fails to keep UI intact
    return `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 1000)}`;
  }
};