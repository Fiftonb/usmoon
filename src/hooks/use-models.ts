import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface Model {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

interface UseModelsResult {
  models: Model[];
  isLoading: boolean;
  error: string | null;
  fetchModels: (apiKey: string, baseURL?: string) => Promise<void>;
  clearModels: () => void;
}

// Fallback models for when API doesn't support model listing
const fallbackModels: Model[] = [
  { id: "gpt-3.5-turbo", object: "model", owned_by: "openai" },
  { id: "gpt-4", object: "model", owned_by: "openai" },
  { id: "gpt-4-turbo-preview", object: "model", owned_by: "openai" },
  { id: "gpt-4o", object: "model", owned_by: "openai" },
];

export function useModels(): UseModelsResult {
  const [models, setModels] = useState<Model[]>(fallbackModels);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchModels = useCallback(async (apiKey: string, baseURL?: string) => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          baseURL: baseURL?.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.models) {
        setModels(data.models);
        toast({
          title: "Models Loaded",
          description: `Found ${data.models.length} available models.`,
        });
      } else {
        throw new Error(data.error || "Failed to fetch models");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch models";
      setError(errorMessage);
      
      // Use fallback models on error
      setModels(fallbackModels);
      
      toast({
        title: "Using Fallback Models",
        description: "Could not fetch models from API. Using common models instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearModels = useCallback(() => {
    setModels(fallbackModels);
    setError(null);
  }, []);

  return {
    models,
    isLoading,
    error,
    fetchModels,
    clearModels,
  };
} 