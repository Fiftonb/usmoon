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
import { Settings, AlertCircle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import { useTranslation } from "@/lib/i18n";

interface SettingsDialogProps {
  apiKey: string;
  baseURL: string;
  model: string;
  onSave: (apiKey: string, baseURL: string, model: string) => void;
}

export function SettingsDialog({ apiKey, baseURL, model, onSave }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempBaseURL, setTempBaseURL] = useState(baseURL);
  const [tempModel, setTempModel] = useState(model);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { models, isLoading: modelsLoading, fetchModels, clearModels } = useModels();

  useEffect(() => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
  }, [apiKey, baseURL, model]);

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

  // Auto-fetch models when dialog opens and API key exists
  useEffect(() => {
    if (open && tempApiKey.trim()) {
      fetchModels(tempApiKey, tempBaseURL, handleModelsSuccess, handleModelsError);
    }
  }, [open]);

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
    if (!tempApiKey.trim()) {
      toast({
        title: t("settings.api_key_required"),
        description: t("settings.api_key_required_desc"),
        variant: "destructive",
      });
      return;
    }

    if (!isValidURL) {
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

    onSave(tempApiKey.trim(), tempBaseURL.trim(), tempModel);
    setOpen(false);
    toast({
      description: t("toast.settings_saved"),
    });
  };

  const handleCancel = () => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
    clearModels();
    setOpen(false);
  };

  const handleRefreshModels = useCallback(() => {
    if (tempApiKey.trim()) {
      fetchModels(tempApiKey, tempBaseURL, handleModelsSuccess, handleModelsError);
    } else {
      toast({
        title: t("settings.api_key_required"),
        description: t("settings.api_key_required_desc"),
        variant: "destructive",
      });
    }
  }, [tempApiKey, tempBaseURL, fetchModels, handleModelsSuccess, handleModelsError, t, toast]);

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
                disabled={modelsLoading || !tempApiKey.trim()}
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
          <Button onClick={handleSave} disabled={!isValidURL || !tempModel} className="text-sm h-9">
            {t("settings.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 