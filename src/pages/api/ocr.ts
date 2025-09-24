import type { NextApiRequest, NextApiResponse } from "next";
import { createWorker } from "tesseract.js";

interface OCRRequest {
  imageData: string; // base64 encoded image
  language?: string; // OCR language, default to 'eng'
}

interface OCRResponse {
  text?: string;
  confidence?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OCRResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageData, language = "eng" }: OCRRequest = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "Image data is required" });
  }

  try {
    // Create Tesseract worker
    const worker = await createWorker(language, 1, {
      logger: (m) => console.log(m), // Log progress
    });

    // Recognize text from image
    const { data: { text, confidence } } = await worker.recognize(imageData);

    // Terminate worker to free memory
    await worker.terminate();

    // Return recognized text
    return res.status(200).json({
      text: text.trim(),
      confidence: Math.round(confidence),
    });
  } catch (error) {
    console.error("OCR Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "OCR processing failed",
    });
  }
}

// Increase API route timeout for OCR processing
export const config = {
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb', // Allow larger image uploads
    },
  },
} 