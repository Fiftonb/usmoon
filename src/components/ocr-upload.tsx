import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileImage, Loader2, X, Eye, EyeOff, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { languages, getLanguageName } from "@/lib/languages";

interface OCRUploadProps {
  onTextExtracted: (text: string) => void;
  onTranslateRequest?: (text: string, targetLang: string) => void;
}

// Supported OCR languages
const ocrLanguages = [
  { code: "eng", flag: "🇺🇸" },
  { code: "chi_sim", flag: "🇨🇳" },
  { code: "chi_tra", flag: "🇹🇼" },
  { code: "jpn", flag: "🇯🇵" },
  { code: "kor", flag: "🇰🇷" },
  { code: "spa", flag: "🇪🇸" },
  { code: "fra", flag: "🇫🇷" },
  { code: "deu", flag: "🇩🇪" },
  { code: "rus", flag: "🇷🇺" },
  { code: "ara", flag: "🇸🇦" },
];

export function OCRUpload({ onTextExtracted, onTranslateRequest }: OCRUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState("eng");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [extractedText, setExtractedText] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (PNG, JPG, WEBP, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processOCR = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(selectedFile);
      });

      // Call OCR API
      const response = await fetch("/api/ocr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64,
          language: ocrLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "OCR processing failed");
      }

      if (result.text) {
        setExtractedText(result.text);
        onTextExtracted(result.text);
        toast({
          title: t("ocr.text_extracted_success"),
          description: t("ocr.confidence", { confidence: result.confidence }),
        });
      } else {
        toast({
          title: t("ocr.no_text_found"),
          description: t("ocr.no_text_detected"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: t("ocr.ocr_error"),
        description: error instanceof Error ? error.message : t("ocr.failed_extract_text"),
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    if (!extractedText || !onTranslateRequest) return;

    setIsTranslating(true);
    try {
      await onTranslateRequest(extractedText, targetLanguage);
      // 不显示额外的toast，因为主页面已经显示了成功消息
      // 也不执行额外的滚动，因为主页面已经处理了滚动逻辑
    } catch (error) {
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "Failed to translate text",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const targetLanguages = languages.filter(lang => lang.code !== "auto");

  // Language code to flag mapping
  const getLanguageFlag = (code: string): string => {
    const flagMap: { [key: string]: string } = {
      "en": "🇺🇸",
      "zh": "🇨🇳",
      "zh-cn": "🇨🇳", 
      "zh-tw": "🇹🇼",
      "ja": "🇯🇵",
      "ko": "🇰🇷",
      "es": "🇪🇸",
      "fr": "🇫🇷",
      "de": "🇩🇪",
      "it": "🇮🇹",
      "pt": "🇵🇹",
      "ru": "🇷🇺",
      "ar": "🇸🇦",
      "hi": "🇮🇳",
      "th": "🇹🇭",
      "vi": "🇻🇳",
      "nl": "🇳🇱",
      "sv": "🇸🇪",
      "no": "🇳🇴",
      "da": "🇩🇰",
      "fi": "🇫🇮",
      "pl": "🇵🇱",
      "tr": "🇹🇷",
    };
    return flagMap[code] || "🌐";
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileImage className="h-4 w-4" />
            {t("ocr.title")}
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {t("ocr.description")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
        {/* Language Selection - Compact Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              {t("ocr.ocr_language")}
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-3 h-3 rounded-full bg-muted text-xs flex items-center justify-center cursor-help">
                    ?
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    {t("ocr.ocr_language_tooltip")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder={t("ocr.select_language")} />
              </SelectTrigger>
              <SelectContent>
                {ocrLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-1 text-xs">
                      <span>{lang.flag}</span>
                      {t(`ocr_languages.${lang.code}` as any)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1">
              {t("ocr.translate_to")}
              <Tooltip>
                <TooltipTrigger>
                  <div className="w-3 h-3 rounded-full bg-muted text-xs flex items-center justify-center cursor-help">
                    ?
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    {t("ocr.translate_to_tooltip")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder={t("ocr.select_target")} />
              </SelectTrigger>
              <SelectContent>
                {targetLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-1 text-xs">
                      <span>{getLanguageFlag(lang.code)}</span>
                      {t(`languages.${lang.code}` as any) || getLanguageName(lang.code)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Upload Area - Compact */}
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-1">
              <FileImage className="h-6 w-6 mx-auto text-green-500" />
              <p className="text-xs font-medium truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <Upload className="h-6 w-6 mx-auto text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t("ocr.click_drag_image")}
              </p>
              <p className="text-xs text-gray-500">
                {t("ocr.file_format_info")}
              </p>
            </div>
          )}
        </div>

        {/* Image Preview - Collapsible and Compact */}
        {previewUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t("ocr.preview")}</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-6 w-6 p-0"
                >
                  {showPreview ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearFile} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {showPreview && (
              <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-32 mx-auto rounded object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Compact */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={processOCR}
              disabled={!selectedFile || isProcessing}
              className="flex-1 h-8 text-xs"
              size="sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  {t("ocr.processing")}
                </>
              ) : (
                t("ocr.extract_text")
              )}
            </Button>
            
            {selectedFile && (
              <Button variant="outline" onClick={clearFile} className="h-8 text-xs" size="sm">
                {t("ocr.clear")}
              </Button>
            )}
          </div>
          
          {/* Translation Button */}
          {extractedText && onTranslateRequest && (
            <Button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="w-full h-8 text-xs"
              variant="secondary"
              size="sm"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  {t("ocr.translating")}
                </>
              ) : (
                <>
                  <Languages className="mr-1 h-3 w-3" />
                  {t("ocr.translate_to_lang", { language: getLanguageName(targetLanguage) })}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Extracted Text Display - Compact */}
        {extractedText && (
          <div className="space-y-1">
            <Label className="text-xs">{t("ocr.extracted_text")}</Label>
            <div className="max-h-20 p-2 rounded-md bg-muted/30 border border-border/50 glass-effect overflow-y-auto">
              <div className="whitespace-pre-wrap text-xs leading-relaxed">{extractedText}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {extractedText.length} {t("ocr.characters")}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-1">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <p className="text-xs text-gray-500 text-center">
              {t("ocr.processing_image")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
} 