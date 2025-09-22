import { useState, useEffect } from "react";
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
  const { models, isLoading: modelsLoading, fetchModels, clearModels } = useModels();

  useEffect(() => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
  }, [apiKey, baseURL, model]);

  // Auto-fetch models when dialog opens and API key exists
  useEffect(() => {
    if (open && tempApiKey.trim()) {
      fetchModels(tempApiKey, tempBaseURL);
    }
  }, [open, tempApiKey, tempBaseURL, fetchModels]);

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
        title: "API Key Required",
        description: "Please enter your API key.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidURL) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL for the Base URL field.",
        variant: "destructive",
      });
      return;
    }

    if (!tempModel) {
      toast({
        title: "Model Required",
        description: "Please select a model.",
        variant: "destructive",
      });
      return;
    }

    onSave(tempApiKey.trim(), tempBaseURL.trim(), tempModel);
    setOpen(false);
    toast({
      title: "Settings Saved",
      description: "Your API configuration has been saved.",
    });
  };

  const handleCancel = () => {
    setTempApiKey(apiKey);
    setTempBaseURL(baseURL);
    setTempModel(model);
    clearModels();
    setOpen(false);
  };

  const handleRefreshModels = () => {
    if (tempApiKey.trim()) {
      fetchModels(tempApiKey, tempBaseURL);
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter your API key first.",
        variant: "destructive",
      });
    }
  };

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>API Settings</DialogTitle>
          <DialogDescription>
            Configure your OpenAI-compatible API settings for translation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Textarea
              id="apiKey"
              placeholder="sk-..."
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>Your API key is stored locally and never sent to our servers</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="baseURL">Base URL (Optional)</Label>
            <Textarea
              id="baseURL"
              placeholder="https://api.openai.com/v1"
              value={tempBaseURL}
              onChange={(e) => setTempBaseURL(e.target.value)}
              className={`resize-none ${!isValidURL ? 'border-destructive' : ''}`}
              rows={2}
            />
            {!isValidURL && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>Please enter a valid URL</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Leave empty to use OpenAI default. For custom endpoints, include the full URL.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="model">AI Model *</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshModels}
                disabled={modelsLoading || !tempApiKey.trim()}
              >
                {modelsLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </div>
            <Select value={tempModel} onValueChange={setTempModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((modelOption) => (
                  <SelectItem key={modelOption.id} value={modelOption.id}>
                    <div className="flex items-center gap-2">
                      <span>{modelOption.id}</span>
                      {modelOption.owned_by && (
                        <Badge variant="outline" className="text-xs">
                          {modelOption.owned_by}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {models.length} available models</span>
              {modelsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Models are fetched from your API endpoint. Click refresh to update the list.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Common Endpoints</Label>
            <div className="flex flex-wrap gap-2">
              {commonEndpoints.map((endpoint) => (
                <Badge
                  key={endpoint.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setTempBaseURL(endpoint.url)}
                >
                  {endpoint.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-muted/50 rounded-md p-3 space-y-2">
            <div className="font-medium text-sm">💡 Dynamic Model Loading:</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Models are automatically fetched from your API endpoint</li>
              <li>• Click "Refresh" to reload available models</li>
              <li>• If fetching fails, fallback models will be shown</li>
              <li>• Different endpoints may have different available models</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValidURL || !tempModel}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 