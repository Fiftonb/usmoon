import { useState } from "react";

interface TranslateOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  apiKey: string;
  baseURL?: string;
  model?: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

interface TranslateResult {
  translatedText: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useTranslate() {
  const [result, setResult] = useState<TranslateResult>({
    translatedText: null,
    isLoading: false,
    error: null,
  });

  const translate = async (options: TranslateOptions) => {
    setResult({
      translatedText: null,
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Translation failed");
      }

      setResult({
        translatedText: data.translatedText,
        isLoading: false,
        error: null,
      });

      options.onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || "Translation failed";
      setResult({
        translatedText: null,
        isLoading: false,
        error: errorMessage,
      });

      options.onError?.(errorMessage);
    }
  };

  const reset = () => {
    setResult({
      translatedText: null,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...result,
    translate,
    reset,
  };
} 