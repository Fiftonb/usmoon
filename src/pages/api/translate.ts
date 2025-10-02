import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import http2 from "http2";

interface TranslateRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

interface TranslateResponse {
  translatedText?: string;
  error?: string;
}

// HTTP/2 request helper
function http2Request(url: string, options: {
  method: string;
  headers: Record<string, string>;
  body: string;
}): Promise<any> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    console.log("Establishing HTTP/2 connection to:", urlObj.origin);
    
    const client = http2.connect(urlObj.origin, {
      // Node.js 会自动协商协议
      // 但我们可以确保使用 ALPN 协议协商
    });

    client.on('error', (err) => {
      console.error("HTTP/2 client error:", err);
      reject(err);
    });

    client.on('connect', (session) => {
      console.log("HTTP/2 session established");
      console.log("ALPN Protocol:", (session as any).alpnProtocol);
    });

    const bodyBuffer = Buffer.from(options.body, 'utf8');
    
    const headers = {
      ':method': options.method,
      ':path': urlObj.pathname + urlObj.search,
      ':scheme': urlObj.protocol.replace(':', ''),
      ':authority': urlObj.host,
      'content-length': bodyBuffer.length.toString(),
      ...Object.fromEntries(
        Object.entries(options.headers).map(([k, v]) => [k.toLowerCase(), v])
      ),
    };

    console.log("HTTP/2 request headers:", headers);
    console.log("HTTP/2 request body length:", bodyBuffer.length);

    const req = client.request(headers);

    req.setEncoding('utf8');

    let data = '';
    let statusCode: number | undefined;
    
    req.on('response', (headers) => {
      statusCode = Number(headers[':status']);
      console.log("HTTP/2 response status:", statusCode);
      console.log("HTTP/2 response headers:", headers);
    });

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      client.close();
      console.log("HTTP/2 response data length:", data.length);
      console.log("HTTP/2 response data preview:", data.substring(0, 500));
      
      // 如果状态码不是 2xx，拒绝 Promise
      if (statusCode && (statusCode < 200 || statusCode >= 300)) {
        console.error(`HTTP/2 request failed with status ${statusCode}`);
        console.error("Full response:", data);
        reject(new Error(`HTTP/2 request failed with status ${statusCode}: ${data.substring(0, 200)}`));
        return;
      }
      
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        // 如果不是 JSON，返回原始数据
        console.warn("Response is not JSON:", e);
        resolve(data);
      }
    });

    req.on('error', (err) => {
      console.error("HTTP/2 request error:", err);
      client.close();
      reject(err);
    });

    // 使用 Buffer 写入请求体，并在一次调用中完成
    req.end(bodyBuffer);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TranslateResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, sourceLang, targetLang, apiKey, baseURL, model }: TranslateRequest = req.body;

  if (!text || !sourceLang || !targetLang) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // 支持使用内置API配置（从环境变量）
  const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
  const finalBaseURL = baseURL || process.env.OPENAI_BASE_URL;
  const finalModel = model || process.env.OPENAI_MODEL;

  if (!finalApiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  // Validate and clean baseURL
  let cleanBaseURL = finalBaseURL?.trim();
  if (cleanBaseURL && !cleanBaseURL.startsWith('http')) {
    cleanBaseURL = `https://${cleanBaseURL}`;
  }

  console.log("Original baseURL:", finalBaseURL);
  console.log("Cleaned baseURL:", cleanBaseURL);
  console.log("Using built-in API:", !apiKey); // Log if using built-in API

  try {
    const openai = new OpenAI({
      apiKey: finalApiKey,
      baseURL: cleanBaseURL || "https://api.openai.com/v1",
      maxRetries: 0, // 禁用自动重试，我们自己处理
      defaultHeaders: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
      }
    });

    console.log("OpenAI SDK baseURL:", cleanBaseURL || "https://api.openai.com/v1");

    const prompt = `Please translate the following text from ${sourceLang} to ${targetLang}. Only return the translated text without any additional explanation or formatting:

${text}`;

    // Dynamic max_tokens based on model and input length
    const getMaxTokens = (modelName: string, inputLength: number) => {
      const baseTokens = Math.max(inputLength * 2, 1000); // At least 2x input length or 1000 minimum
      
      switch (modelName) {
        case 'gpt-3.5-turbo':
          return Math.min(baseTokens, 4000);
        case 'gpt-3.5-turbo-16k':
          return Math.min(baseTokens, 16000);
        case 'gpt-4':
        case 'gpt-4-turbo':
          return Math.min(baseTokens, 8000);
        case 'gpt-4-32k':
          return Math.min(baseTokens, 32000);
        default:
          return Math.min(baseTokens, 4000);
      }
    };

    const maxTokens = getMaxTokens(finalModel || "gpt-3.5-turbo", text.length);
    console.log(`Using max_tokens: ${maxTokens} for model: ${finalModel || "gpt-3.5-turbo"}`);

    let completion;
    
    try {
      // First try with OpenAI SDK
      console.log("Attempting OpenAI SDK request...");
      completion = await openai.chat.completions.create({
        model: finalModel || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
      });
      console.log("OpenAI SDK request successful!");
    } catch (sdkError: any) {
      console.log("OpenAI SDK failed, trying HTTP/2 request...");
      console.log("SDK Error status:", sdkError.status);
      console.log("SDK Error message:", sdkError.message);
      console.log("SDK Error details:", sdkError);
      
      // If SDK fails, try HTTP/2 request with more browser-like headers
      const requestBody = {
        model: finalModel || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
      };

      const apiUrl = cleanBaseURL ? `${cleanBaseURL}/chat/completions` : "https://api.openai.com/v1/chat/completions";
      
      console.log("HTTP/2 request URL:", apiUrl);

      try {
        completion = await http2Request(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${finalApiKey}`,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
          body: JSON.stringify(requestBody),
        });
        console.log("HTTP/2 request successful!");
      } catch (http2Error: any) {
        console.error("HTTP/2 request failed:", http2Error);
        throw new Error(`HTTP/2 request failed: ${http2Error.message}`);
      }
    }

    // 添加调试日志
    console.log("Completion response:", JSON.stringify(completion, null, 2));

    // 兼容不同的响应格式
    let translatedText: string | undefined;
    
    if (completion.choices && Array.isArray(completion.choices) && completion.choices.length > 0) {
      // 标准 OpenAI 格式
      translatedText = completion.choices[0]?.message?.content?.trim();
    } else if (completion.content) {
      // 某些 API 可能直接返回 content
      translatedText = completion.content.trim();
    } else if (completion.text) {
      // 某些 API 返回 text 字段
      translatedText = completion.text.trim();
    } else if (typeof completion === 'string') {
      // 某些 API 直接返回字符串
      translatedText = completion.trim();
    }

    if (!translatedText) {
      console.error("Failed to extract translation from response:", completion);
      return res.status(500).json({ 
        error: "Failed to get translation. Response format may be incompatible." 
      });
    }

    res.status(200).json({ translatedText });
  } catch (error: any) {
    console.error("Translation error:", error);
    
    // Provide more user-friendly error messages
    let errorMessage = "Translation failed";
    
    if (error.status === 401) {
      errorMessage = "Invalid API key. Please check your API key in settings.";
    } else if (error.status === 403) {
      if (error.message?.includes('cloudflare') || error.message?.includes('blocked')) {
        errorMessage = "API endpoint blocked by security service. Please check your Base URL or try using the official OpenAI endpoint.";
      } else {
        errorMessage = "Access denied. Please check your API key and endpoint configuration.";
      }
    } else if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Please try again later.";
    } else if (error.status === 404) {
      errorMessage = "API endpoint not found. Please check your Base URL configuration.";
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to API endpoint. Please check your Base URL.";
    } else if (error.message?.includes('model')) {
      errorMessage = `Model "${finalModel || 'gpt-3.5-turbo'}" not available. Please check your model selection or try a different model.`;
    } else if (error.message) {
      // Clean up the error message for display
      const cleanMessage = error.message.replace(/<!DOCTYPE html>[\s\S]*?<\/html>/gi, '').trim();
      if (cleanMessage && cleanMessage.length < 200) {
        errorMessage = cleanMessage;
      }
    }
    
    res.status(500).json({ 
      error: errorMessage
    });
  }
} 