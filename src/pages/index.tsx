import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsDialog } from "@/components/settings-dialog";
import { ApiTest } from "@/components/api-test";
import { useTranslate } from "@/hooks/use-translate";
import { languages, getLanguageName } from "@/lib/languages";
import { 
  ArrowLeftRight, 
  Copy, 
  Trash2, 
  Languages,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  
  const { translatedText, isLoading, error, translate, reset } = useTranslate();
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("translate-api-key");
    const savedBaseURL = localStorage.getItem("translate-base-url");
    const savedModel = localStorage.getItem("translate-model");
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedBaseURL) setBaseURL(savedBaseURL);
    if (savedModel) setModel(savedModel);
  }, []);

  const handleSaveSettings = (newApiKey: string, newBaseURL: string, newModel: string) => {
    setApiKey(newApiKey);
    setBaseURL(newBaseURL);
    setModel(newModel);
    localStorage.setItem("translate-api-key", newApiKey);
    localStorage.setItem("translate-base-url", newBaseURL);
    localStorage.setItem("translate-model", newModel);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your API key in settings.",
        variant: "destructive",
      });
      return;
    }

    await translate({
      text: inputText,
      sourceLang,
      targetLang,
      apiKey,
      baseURL: baseURL || undefined,
      model,
    });
  };

  const handleSwapLanguages = () => {
    if (sourceLang === "auto") return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    
    if (translatedText) {
      setInputText(translatedText);
      reset();
    }
  };

  const handleCopyResult = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard.",
      });
    }
  };

  const handleClear = () => {
    setInputText("");
    reset();
  };

  const sourceLanguages = languages;
  const targetLanguages = languages.filter(lang => lang.code !== "auto");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Languages className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Translator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful AI-driven translation supporting multiple languages with OpenAI-compatible APIs
          </p>
        </div>

        {/* Settings */}
        <div className="flex justify-end mb-6">
          <SettingsDialog
            apiKey={apiKey}
            baseURL={baseURL}
            model={model}
            onSave={handleSaveSettings}
          />
        </div>

        {/* API Test Section - Show when API key is configured */}
        {apiKey && (
          <ApiTest apiKey={apiKey} baseURL={baseURL} model={model} />
        )}

        {/* Language Selection */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">From</label>
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {getLanguageName(lang.code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwapLanguages}
                      disabled={sourceLang === "auto"}
                      className="mt-6"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Swap languages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">To</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {targetLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {getLanguageName(lang.code)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Interface */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Original Text</span>
                <Badge variant="outline">
                  {inputText.length} chars
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter text to translate..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Output */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Translation</span>
                {translatedText && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyResult}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-2/5" />
                </div>
              ) : translatedText ? (
                <div className="min-h-[200px] p-3 bg-muted/50 rounded-md">
                  <p className="whitespace-pre-wrap">{translatedText}</p>
                </div>
              ) : (
                <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                  Translation will appear here...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            size="lg"
            className="px-8"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isLoading ? "Translating..." : "Translate"}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!inputText && !translatedText}
            size="lg"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="pt-6">
              <div className="text-destructive">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
