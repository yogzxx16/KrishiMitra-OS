import * as tmImage from '@teachablemachine/image';

let model: tmImage.CustomMobileNet | null = null;
let modelURL = '';

/**
 * Initializes and loads the Teachable Machine model from the given URL.
 */
export async function initModel(url: string) {
  if (model && modelURL === url) return; // Already loaded

  const modelJSON = url + 'model.json';
  const metadataJSON = url + 'metadata.json';

  try {
    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelJSON, metadataJSON);
    modelURL = url;
  } catch (error) {
    console.error('Error loading Teachable Machine model:', error);
    throw new Error('Failed to load the AI model. Please check the URL.');
  }
}

export interface TMPrediction {
  className: string;
  probability: number;
}

/**
 * Runs a prediction on a given image element or canvas.
 */
export async function predict(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<TMPrediction> {
  if (!model) {
    throw new Error('Model is not initialized yet. Call initModel() first.');
  }

  // predict can take in an image, video or canvas html element
  const predictions = await model.predict(imageElement);
  
  // Sort predictions by probability, descending
  predictions.sort((a, b) => b.probability - a.probability);

  return predictions[0] as TMPrediction;
}
