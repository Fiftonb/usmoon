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
  { code: "eng", name: "English", flag: "🇺🇸" },
  { code: "chi_sim", name: "Chinese Simplified", flag: "🇨🇳" },
  { code: "chi_tra", name: "Chinese Traditional", flag: "🇹🇼" },
  { code: "jpn", name: "Japanese", flag: "🇯🇵" },
  { code: "kor", name: "Korean", flag: "🇰🇷" },
  { code: "spa", name: "Spanish", flag: "🇪🇸" },
  { code: "fra", name: "French", flag: "🇫🇷" },
  { code: "deu", name: "German", flag: "🇩🇪" },
  { code: "rus", name: "Russian", flag: "🇷🇺" },
  { code: "ara", name: "Arabic", flag: "🇸🇦" },
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
          title: "Text extracted successfully",
          description: `Confidence: ${result.confidence}%`,
        });
      } else {
        toast({
          title: "No text found",
          description: "No text was detected in the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "OCR Error",
        description: error instanceof Error ? error.message : "Failed to extract text",
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
      toast({
        title: "Translation completed",
        description: "Text has been translated successfully",
      });
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            OCR Text Recognition
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Upload an image to extract text, then translate it using the translation settings above
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            OCR Recognition Language
            <Tooltip>
              <TooltipTrigger>
                <div className="w-4 h-4 rounded-full bg-muted text-xs flex items-center justify-center cursor-help">
                  ?
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Select the language of the text in your image for better recognition accuracy.
                  This is different from translation language.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select image text language" />
            </SelectTrigger>
            <SelectContent>
              {ocrLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    {lang.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            💡 Choose the language of text in your image (not the translation target)
          </p>
        </div>

        {/* Translation Target Language */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Translation Target Language
            <Tooltip>
              <TooltipTrigger>
                <div className="w-4 h-4 rounded-full bg-muted text-xs flex items-center justify-center cursor-help">
                  ?
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Select the language you want to translate the extracted text into.
                </p>
              </TooltipContent>
            </Tooltip>
          </Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select translation target" />
            </SelectTrigger>
            <SelectContent>
              {targetLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{getLanguageFlag(lang.code)}</span>
                    {t(`languages.${lang.code}` as any) || getLanguageName(lang.code)}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
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
            <div className="space-y-2">
              <FileImage className="h-8 w-8 mx-auto text-green-500" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop an image
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP up to 10MB
              </p>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Image Preview</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showPreview && (
              <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-64 mx-auto rounded"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={processOCR}
              disabled={!selectedFile || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Extract Text"
              )}
            </Button>
            
            {selectedFile && (
              <Button variant="outline" onClick={clearFile}>
                Clear
              </Button>
            )}
          </div>
          
          {/* Translation Button */}
          {extractedText && onTranslateRequest && (
            <Button
              onClick={handleTranslate}
              disabled={isTranslating}
              className="w-full"
              variant="secondary"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate to {getLanguageName(targetLanguage)}
                </>
              )}
            </Button>
          )}
        </div>

        {/* Extracted Text Display */}
        {extractedText && (
          <div className="space-y-2">
            <Label>Extracted Text:</Label>
            <div className="min-h-[80px] p-3 rounded-md bg-muted/30 border border-border/50 glass-effect">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{extractedText}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {extractedText.length} characters extracted
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <p className="text-xs text-gray-500 text-center">
              Processing image... This may take a few seconds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
} 