import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";

interface ApiTestProps {
  apiKey: string;
  baseURL: string;
  model: string;
}

export function ApiTest({ apiKey, baseURL, model }: ApiTestProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning';
    message: string;
  }>({ status: 'idle', message: '' });
  const { toast } = useToast();
  const { t } = useTranslation();

  const testConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        description: t("toast.please_configure_api"),
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult({ status: 'idle', message: '' });

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hello",
          sourceLang: "en",
          targetLang: "zh",
          apiKey,
          baseURL: baseURL || undefined,
          model,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          status: 'success',
          message: t("api_test.result_success", { result: data.translatedText })
        });
        toast({
          title: t("api_test.test_successful"),
          description: t("api_test.test_successful_desc"),
        });
      } else {
        setTestResult({
          status: 'error',
          message: data.error || t("api_test.test_failed")
        });
        toast({
          title: t("api_test.test_failed"),
          description: data.error || t("api_test.test_failed"),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: error.message || t("api_test.connection_error")
      });
      toast({
        title: t("api_test.connection_error"),
        description: t("api_test.connection_error_desc"),
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (testResult.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (testResult.status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t("api_test.status_connected")}</Badge>;
      case 'error':
        return <Badge variant="destructive">{t("api_test.status_failed")}</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("api_test.status_warning")}</Badge>;
      default:
        return <Badge variant="outline">{t("api_test.status_not_tested")}</Badge>;
    }
  };

  return (
    <Card className="mb-8 border-animate glass-effect shadow-elegant card-hover animate-slide-in" style={{ animationDelay: '0.5s' }}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
            <span>{t("api_test.title")}</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("api_test.endpoint", { url: baseURL || "https://api.openai.com/v1" })}</span>
        </div>
        
        {testResult.message && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50">
            {getStatusIcon()}
            <div className="text-sm">
              {testResult.message}
            </div>
          </div>
        )}

        <Button
          onClick={testConnection}
          disabled={testing || !apiKey.trim()}
          className="w-full btn-modern hover-float"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("api_test.testing")}
            </>
          ) : (
            t("api_test.test_button")
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 