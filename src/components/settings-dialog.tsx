import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Settings, AlertCircle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import { useTranslation } from "@/lib/i18n";

interface SettingsDialogProps {
  apiKey: string;
  baseURL: string;
  model: string;
  useBuiltinApi: boolean;
  onSave: (apiKey: string, baseURL: string, model: string, useBuiltinApi: boolean) => void;
}

export function SettingsDialog({ apiKey, baseURL, model, useBuiltinApi, onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempBaseURL, setTempBaseURL] = useState(baseURL);
  const [tempModel, setTempModel] = useState(model);
  const [tempUseBuiltinApi, setTempUseBuiltinApi] = useState(useBuiltinApi);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { models, isLoading: modelsLoading, fetchModels, clearModels } = useModels();

  useEffect(() => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
    setTempUseBuiltinApi(useBuiltinApi);
  }, [apiKey, baseURL, model, useBuiltinApi]);

  // Stable callbacks for model fetching
  const handleModelsSuccess = useCallback((count: number) => {
    toast({
      title: t("settings.models_loaded"),
      description: t("settings.models_loaded_desc", { count }),
    });
  }, [t, toast]);

  const handleModelsError = useCallback((message: string, usesFallback: boolean) => {
    if (usesFallback) {
      toast({
        title: t("settings.using_fallback_models"),
        description: t("settings.fallback_models_desc"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("settings.api_key_required"),
        description: t("settings.api_key_required_desc"),
        variant: "destructive",
      });
    }
  }, [t, toast]);

  // Auto-fetch models when dialog opens and API key exists (or using built-in API)
  useEffect(() => {
    if (open && (tempUseBuiltinApi || tempApiKey.trim())) {
      fetchModels(tempUseBuiltinApi ? "" : tempApiKey, tempUseBuiltinApi ? "" : tempBaseURL, handleModelsSuccess, handleModelsError);
    }
  }, [open, tempUseBuiltinApi]);

  const validateURL = (url: string) => {
    if (!url.trim()) return true; // Empty is OK
    try {
      const testUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  };

  const isValidURL = validateURL(tempBaseURL);

  const handleSave = () => {
    // 如果不使用内置API，则需要验证API密钥
    if (!tempUseBuiltinApi && !tempApiKey.trim()) {
      toast({
        title: t("settings.api_key_required"),
        description: t("settings.api_key_required_desc"),
        variant: "destructive",
      });
      return;
    }

    // 如果不使用内置API，则需要验证URL
    if (!tempUseBuiltinApi && !isValidURL) {
      toast({
        title: t("settings.invalid_url"),
        description: t("settings.invalid_url_desc"),
        variant: "destructive",
      });
      return;
    }

    if (!tempModel) {
      toast({
        title: t("settings.model_required_error"),
        description: t("settings.model_required_desc"),
        variant: "destructive",
      });
      return;
    }

    onSave(
      tempUseBuiltinApi ? "" : tempApiKey.trim(), 
      tempUseBuiltinApi ? "" : tempBaseURL.trim(), 
      tempModel,
      tempUseBuiltinApi
    );
    setOpen(false);
    toast({
      description: t("toast.settings_saved"),
    });
  };

  const handleCancel = () => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
    setTempUseBuiltinApi(useBuiltinApi);
    clearModels();
    setOpen(false);
  };

  const handleRefreshModels = useCallback(() => {
    if (tempUseBuiltinApi || tempApiKey.trim()) {
      fetchModels(tempUseBuiltinApi ? "" : tempApiKey, tempUseBuiltinApi ? "" : tempBaseURL, handleModelsSuccess, handleModelsError);
    } else {
      toast({
        title: t("settings.api_key_required"),
        description: t("settings.api_key_required_desc"),
        variant: "destructive",
      });
    }
  }, [tempUseBuiltinApi, tempApiKey, tempBaseURL, fetchModels, handleModelsSuccess, handleModelsError, t, toast]);

  const commonEndpoints = [
    { name: "OpenAI Official", url: "https://api.openai.com/v1" },
    { name: "Azure OpenAI", url: "https://your-resource.openai.azure.com" },
    { name: "Local Ollama", url: "http://localhost:11434/v1" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">{t("settings.title")}</DialogTitle>
          <DialogDescription className="text-sm">
            {t("settings.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
          {/* 使用内置API开关 */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1 pr-4">
                <Label htmlFor="use-builtin-api" className="text-sm font-medium cursor-pointer">
                  {t("settings.use_builtin_api")}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t("settings.use_builtin_api_desc")}
                </p>
              </div>
              <Switch
                id="use-builtin-api"
                checked={tempUseBuiltinApi}
                onCheckedChange={setTempUseBuiltinApi}
              />
            </div>
            {tempUseBuiltinApi && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 pt-2 border-t">
                <CheckCircle className="h-3 w-3" />
                <span>{t("settings.builtin_api_enabled")}</span>
              </div>
            )}
          </div>

          {/* 自定义API配置 */}
          {!tempUseBuiltinApi && (
            <>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">
                  {t("settings.custom_api_config")}
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium">{t("settings.api_key")} *</Label>
            <Textarea
              id="apiKey"
              placeholder={t("settings.api_key_placeholder")}
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="resize-none text-sm"
              rows={2}
            />
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>{t("settings.security_note")}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="baseURL" className="text-sm font-medium">{t("settings.base_url_optional")}</Label>
            <Textarea
              id="baseURL"
              placeholder={t("settings.base_url_placeholder")}
              value={tempBaseURL}
              onChange={(e) => setTempBaseURL(e.target.value)}
              className={`resize-none text-sm ${!isValidURL ? 'border-destructive' : ''}`}
              rows={2}
            />
            {!isValidURL && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-destructive">
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>{t("settings.valid_url_note")}</span>
              </div>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("settings.base_url_note")}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label htmlFor="model" className="text-sm font-medium">{t("settings.model_required")} *</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshModels}
                disabled={modelsLoading || (!tempUseBuiltinApi && !tempApiKey.trim())}
                className="text-xs sm:text-sm h-8 px-2 sm:px-3"
              >
                {modelsLoading ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="ml-1 sm:ml-2">{t("settings.refresh")}</span>
              </Button>
            </div>
            <Select value={tempModel} onValueChange={setTempModel}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder={t("settings.select_model")} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] max-w-[calc(100vw-4rem)] sm:max-w-[calc(32rem-4rem)] w-[var(--radix-select-trigger-width)]">
                {models.map((modelOption) => (
                  <SelectItem key={modelOption.id} value={modelOption.id} className="text-sm">
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <span className="truncate flex-1 min-w-0">{modelOption.id}</span>
                      {modelOption.owned_by && (
                        <Badge variant="outline" className="text-xs flex-shrink-0 max-w-[80px] truncate">
                          {modelOption.owned_by}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>{t("settings.models_count", { count: models.length })}</span>
              {modelsLoading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("settings.models_note")}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.common_endpoints")}</Label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {commonEndpoints.map((endpoint) => (
                <Badge
                  key={endpoint.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-xs px-2 py-1"
                  onClick={() => setTempBaseURL(endpoint.url)}
                >
                  {endpoint.name}
                </Badge>
              ))}
            </div>
          </div>
            </>
          )}

          <div className="bg-muted/50 rounded-md p-2.5 sm:p-3 space-y-2">
            <div className="font-medium text-xs sm:text-sm">{t("settings.dynamic_loading_title")}</div>
            <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
              <li>• {t("settings.dynamic_loading_notes.0")}</li>
              <li>• {t("settings.dynamic_loading_notes.1")}</li>
              <li>• {t("settings.dynamic_loading_notes.2")}</li>
              <li>• {t("settings.dynamic_loading_notes.3")}</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 sm:pt-0">
          <Button variant="outline" onClick={handleCancel} className="text-sm h-9">
            {t("settings.cancel")}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={(!tempUseBuiltinApi && !isValidURL) || !tempModel} 
            className="text-sm h-9"
          >
            {t("settings.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 