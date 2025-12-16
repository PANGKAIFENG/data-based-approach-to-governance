import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function urlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      // Enable CORS for the image if supported by the server
      img.crossOrigin = "Anonymous"; 
      
      img.onload = () => {
        // Resize image to reduce payload size (Max 800px)
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with moderate compression
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        // Remove data url prefix
        const base64Data = base64String.split(',')[1] || base64String;
        resolve(base64Data);
      };
      
      img.onerror = (e) => {
          console.warn("Image load failed, falling back to blob", e);
          // Fallback to original blob reader if image loading fails (e.g. strict CORS)
          const reader = new FileReader();
          reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1] || res);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
      };
      
      img.src = URL.createObjectURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    throw error;
  }
}

/**
 * Analyzes a product image to extract fashion attributes.
 */
export const analyzeProductImage = async (imageUrl: string): Promise<any> => {
  try {
    const base64Image = await urlToBase64(imageUrl);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: `Analyze this fashion product image. 
            Return a JSON object with the following properties (all string values must be in Simplified Chinese/简体中文):
            - material (e.g., 棉, 涤纶, 丝绸, 牛仔布)
            - color (e.g., 黑色, 白色, 红色, 蓝色)
            - style (e.g., 休闲, 商务, 街头, 优雅)
            - season (e.g., 春季, 夏季, 秋季, 冬季)
            - category (e.g., T恤, 连衣裙, 牛仔裤, 卫衣)
            - collarType (e.g., 圆领, V领, 翻领, 连帽)`
          }
        ]
      },
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
    
    return response.text ? JSON.parse(response.text) : mockAnalysis();
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return mockAnalysis();
  }
};

const mockAnalysis = () => ({
  material: "棉混纺",
  color: "未知色",
  style: "休闲",
  season: "四季",
  category: "上衣",
  collarType: "常规"
});

/**
 * Generates new fashion style descriptions based on a seed.
 */
export const generateStyleDescriptions = async (seed: string, count: number): Promise<any[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} unique fashion style concepts based on the seed theme: "${seed}".
      Return a JSON array where each object has: name, description, material, elements (design elements), colorTheme, and a promptForImage (a detailed English prompt for an AI image generator, describing a realistic high-quality fashion photography of this item on a clean background).
      Ensure 'name', 'description', 'material', 'elements', and 'colorTheme' are in Simplified Chinese (简体中文).`,
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

    return response.text ? JSON.parse(response.text) : [];
  } catch (error) {
    console.error("Gemini Style Generation Failed:", error);
    return [];
  }
};

/**
 * Generates an image for a specific style.
 */
export const generateStyleImage = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
    });

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
    // Return a random Unsplash placeholder if generation fails
    return `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&fit=crop`;
  }
};