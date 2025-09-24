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
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n";

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [apiKey, setApiKey] = useState("YOUR_API_KEY");
  const [baseURL, setBaseURL] = useState("https://api.openai.com/v1");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Prevent body scrolling and use container scrolling instead
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Add no-scroll class to body
    document.body.classList.add('no-scroll');
    
    // Restore on unmount
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, []);

  const restoreScrollOnOpen = (open: boolean) => {
    if (typeof window === "undefined") return;
    if (open) {
      const container = document.getElementById("page-scroll-container");
      if (container) {
        const y = container.scrollTop;
        requestAnimationFrame(() => {
          container.scrollTop = y;
        });
      }
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai-api-key");
    const savedBaseURL = localStorage.getItem("openai-base-url");
    const savedModel = localStorage.getItem("openai-model");
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedBaseURL) setBaseURL(savedBaseURL);
    if (savedModel) setModel(savedModel);
  }, []);

  const {
    translatedText,
    isLoading,
    error,
    translate,
    reset
  } = useTranslate();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        variant: "destructive",
        description: t("toast.please_enter_text"),
      });
      return;
    }

    if (!apiKey) {
      toast({
        variant: "destructive", 
        description: t("toast.please_configure_api"),
      });
      return;
    }

    await translate({
      text: inputText,
      sourceLang,
      targetLang,
      apiKey,
      baseURL,
      model,
      onSuccess: () => {
        toast({
          description: t("toast.translate_success"),
        });
      },
      onError: (message) => {
        toast({
          title: t("toast.translate_failed"),
          description: message,
          variant: "destructive",
        });
      }
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: t("toast.copy_success"),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: t("toast.copy_failed"),
      });
    }
  };

  const handleSaveSettings = (newApiKey: string, newBaseURL: string, newModel: string) => {
    setApiKey(newApiKey);
    setBaseURL(newBaseURL);
    setModel(newModel);
    
    localStorage.setItem("openai-api-key", newApiKey);
    localStorage.setItem("openai-base-url", newBaseURL);
    localStorage.setItem("openai-model", newModel);
    
    toast({
      description: t("toast.settings_saved"),
    });
  };

  const sourceLanguages = languages;
  const targetLanguages = languages.filter(lang => lang.code !== "auto");

  return (
    <div className="h-screen bg-background relative animate-scale-in page-content">
      {/* 现代化背景层 */}
      <div className="pointer-events-none absolute inset-0 bg-dot-pattern [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.15),rgba(0,0,0,1))] dark:[mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.08),rgba(255,255,255,1))]"></div>
      
      {/* 渐变装饰层 */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-gentle"></div>
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
      
      <div className="h-full overflow-y-auto" id="page-scroll-container">
        <div className="container mx-auto px-4 py-8 relative z-10 stable-scrollbar min-h-full">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-in">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <Languages className="h-10 w-10 text-primary animate-float" />
                <div className="absolute inset-0 h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-md opacity-30 animate-pulse-gentle"></div>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold gradient-text">
                {t("common.ai_translator")}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("common.experience_power")}
              <br />
              <span className="text-sm opacity-75">{t("common.supporting_languages")}</span>
            </p>
            
            {/* 装饰性元素 */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent w-20"></div>
              <Zap className="h-4 w-4 text-primary animate-pulse" />
              <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent w-20"></div>
            </div>
          </div>

          {/* Settings */}
          <div className="flex justify-end items-center gap-3 mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="hover-float">
              <LanguageSwitcher />
            </div>
            <div className="hover-float">
              <ThemeToggle />
            </div>
            <div className="hover-float">
              <SettingsDialog
                apiKey={apiKey}
                baseURL={baseURL}
                model={model}
                onSave={handleSaveSettings}
              />
            </div>
          </div>

          {/* Language Selection */}
          <Card className="mb-8 border-animate glass-effect shadow-elegant card-hover animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">{t("translation.source_language")}</label>
                  <Select value={sourceLang} onValueChange={setSourceLang} onOpenChange={restoreScrollOnOpen}>
                    <SelectTrigger className="glass-effect border-animate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {t(`languages.${lang.code}` as any) || getLanguageName(lang.code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSwapLanguages}
                    disabled={sourceLang === "auto"}
                    className="btn-modern hover-float"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">{t("translation.target_language")}</label>
                  <Select value={targetLang} onValueChange={setTargetLang} onOpenChange={restoreScrollOnOpen}>
                    <SelectTrigger className="glass-effect border-animate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {targetLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {t(`languages.${lang.code}` as any) || getLanguageName(lang.code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Input */}
            <Card className="card-hover glass-effect shadow-elegant animate-slide-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t("translation.input_text")}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t(`languages.${sourceLang}` as any) || getLanguageName(sourceLang)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t("translation.input_placeholder")}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] resize-none glass-effect border-animate focus:shadow-luxury transition-all duration-300"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {inputText.length} {t("common.characters")}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText("")}
                      className="hover-float"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("translation.clear_button")}
                    </Button>
                    <Button
                      onClick={handleTranslate}
                      disabled={isLoading || !inputText.trim()}
                      className="btn-modern hover-float clickable"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t("translation.translate_button")}...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          {t("translation.translate_button")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Output */}
            <Card className="card-hover glass-effect shadow-elegant animate-slide-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {t("translation.translation_result")}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {t(`languages.${targetLang}` as any) || getLanguageName(targetLang)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                           <div className="min-h-[200px] p-4 rounded-md bg-muted/30 border border-border/50 glass-effect">
                 {isLoading ? (
                   <div className="space-y-2">
                     <Skeleton className="h-4 w-full" />
                     <Skeleton className="h-4 w-3/4" />
                     <Skeleton className="h-4 w-1/2" />
                   </div>
                 ) : error ? (
                   <div className="text-destructive text-sm">{error}</div>
                 ) : translatedText ? (
                   <div className="whitespace-pre-wrap text-sm leading-relaxed">{translatedText}</div>
                 ) : (
                   <div className="text-muted-foreground text-sm italic">
                     {t("translation.no_result")}
                   </div>
                 )}
               </div>
               <div className="flex justify-end">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => handleCopy(translatedText || "")}
                   disabled={!translatedText}
                   className="hover-float"
                 >
                   <Copy className="h-4 w-4 mr-2" />
                   {t("translation.copy_button")}
                 </Button>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* API Test Section - Show when API key is configured */}
        {apiKey && (
          <ApiTest apiKey={apiKey} baseURL={baseURL} model={model} />
        )}

                 {/* Error Display */}
         {error && (
           <Card className="glass-effect shadow-elegant border-destructive/50 animate-slide-in" style={{ animationDelay: '0.6s' }}>
             <CardContent className="pt-6">
               <div className="text-destructive text-sm">
                 <strong>{t("common.error")}:</strong> {error}
               </div>
             </CardContent>
           </Card>
         )}
        </div>
      </div>
    </div>
  );
}
