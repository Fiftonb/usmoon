import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TranslateOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  apiKey: string;
  baseURL?: string;
  model?: string;
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
  const { toast } = useToast();

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

      toast({
        title: "Translation completed",
        description: "Text has been successfully translated.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "Translation failed";
      setResult({
        translatedText: null,
        isLoading: false,
        error: errorMessage,
      });

      toast({
        title: "Translation failed",
        description: errorMessage,
        variant: "destructive",
      });
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