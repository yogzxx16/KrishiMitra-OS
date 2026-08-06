import { GoogleGenAI } from '@google/genai';
import i18n from '../i18n';

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
});

export interface AIDiagnosticReport {
  subjectType: 'Crop' | 'Soil' | 'Pest' | 'Other';
  subjectName: string;
  diseaseName: string | null;
  confidence: number; // 0-100
  severity: 'Low' | 'Medium' | 'High' | 'None';
  symptoms: string[];
  possibleCause: string;
  recommendedTreatment: string;
  preventiveMeasures: string[];
  suitableFertilizer: string;
  governmentScheme: string;
  nextInspectionDate: string; // ISO or human readable
}

/**
 * Compresses an image file before uploading to save bandwidth and API time.
 */
export async function compressImage(file: File, maxWidth = 1024, maxHeight = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas ctx not available'));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Return base64 string
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
}

/**
 * Analyzes an image (e.g., crop leaf, soil) using Gemini 2.5 Flash and returns a structured diagnostic report.
 */
export async function analyzeCropImage(base64Image: string): Promise<AIDiagnosticReport> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Please configure VITE_GEMINI_API_KEY.');
  }

  // Remove the data:image/jpeg;base64, prefix for the API
  const base64Data = base64Image.split(',')[1];
  
  if (!base64Data) {
    throw new Error('Invalid image format');
  }

  const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil' };
  const targetLanguage = langMap[i18n.resolvedLanguage || 'en'] || 'English';

  const prompt = `You are a Senior Agronomist and Agricultural AI Assistant for the Government of India.
Analyze the provided image of a crop, leaf, or soil sample.

CRITICAL INSTRUCTION: Reply strictly and entirely in ${targetLanguage}. Ensure all text values in the JSON are in ${targetLanguage}, but DO NOT change the JSON keys.

Output a strictly valid JSON object matching this exact structure:
{
  "subjectType": "Must be one of: 'Crop', 'Soil', 'Pest', 'Other'",
  "subjectName": "Name of the crop, soil type, pest, or object (e.g., 'Wheat', 'Alluvial Soil', 'Locust', 'Unknown')",
  "diseaseName": "Name of the disease (or null if healthy)",
  "confidence": <number 0-100 representing your confidence>,
  "severity": "None" | "Low" | "Medium" | "High",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "possibleCause": "Brief explanation of the cause",
  "recommendedTreatment": "Detailed treatment recommendation",
  "preventiveMeasures": ["Measure 1", "Measure 2"],
  "suitableFertilizer": "Recommended fertilizer name or NPK ratio",
  "governmentScheme": "Name of a relevant Indian Government Scheme (e.g., PM-FBY, PKVY, SHC) that can help the farmer",
  "nextInspectionDate": "Suggested time for next inspection (e.g., 'In 7 days')"
}

Ensure the response is ONLY raw JSON. Do not include markdown blocks like \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.2,
      }
    });

    const text = response.text || '{}';
    // Clean up potentially wrapped markdown just in case
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanText) as AIDiagnosticReport;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to analyze the image. Please try again.');
  }
}

/**
 * Generates a structured diagnostic report purely from a text label (e.g. from Teachable Machine).
 */
export async function generateReportFromLabel(subjectName: string): Promise<AIDiagnosticReport> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing. Please configure VITE_GEMINI_API_KEY.');
  }

  const langMap: Record<string, string> = { en: 'English', hi: 'Hindi', ta: 'Tamil' };
  const targetLanguage = langMap[i18n.resolvedLanguage || 'en'] || 'English';

  const prompt = `You are a Senior Agronomist and Agricultural AI Assistant for the Government of India.
An external AI model has identified the following subject in an image: "${subjectName}".

Generate a detailed diagnostic report for this subject. If it is a soil type, describe its characteristics, suitable fertilizers, and government schemes. If it's a disease or pest, describe treatments.

CRITICAL INSTRUCTION: Reply strictly and entirely in ${targetLanguage}. Ensure all text values in the JSON are in ${targetLanguage}, but DO NOT change the JSON keys.

Output a strictly valid JSON object matching this exact structure:
{
  "subjectType": "Must be one of: 'Crop', 'Soil', 'Pest', 'Other'",
  "subjectName": "${subjectName}",
  "diseaseName": "Name of the disease (or null if healthy or just soil)",
  "confidence": 95,
  "severity": "None" | "Low" | "Medium" | "High",
  "symptoms": ["Symptom 1", "Symptom 2"],
  "possibleCause": "Brief explanation of the cause or characteristics",
  "recommendedTreatment": "Detailed treatment recommendation or best practices",
  "preventiveMeasures": ["Measure 1", "Measure 2"],
  "suitableFertilizer": "Recommended fertilizer name or NPK ratio",
  "governmentScheme": "Name of a relevant Indian Government Scheme (e.g., PM-FBY, PKVY, SHC) that can help the farmer",
  "nextInspectionDate": "Suggested time for next inspection (e.g., 'In 7 days' or 'Before next season')"
}

Ensure the response is ONLY raw JSON. Do not include markdown blocks like \`\`\`json.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.2,
      }
    });

    const text = response.text || '{}';
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(cleanText) as AIDiagnosticReport;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate report from label. Please try again.');
  }
}
