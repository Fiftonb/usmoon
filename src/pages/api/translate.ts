import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

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

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  // Validate and clean baseURL
  let cleanBaseURL = baseURL?.trim();
  if (cleanBaseURL && !cleanBaseURL.startsWith('http')) {
    cleanBaseURL = `https://${cleanBaseURL}`;
  }

  console.log("Original baseURL:", baseURL);
  console.log("Cleaned baseURL:", cleanBaseURL);

  try {
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: cleanBaseURL || "https://api.openai.com/v1",
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

    let completion;
    
    try {
      // First try with OpenAI SDK
      console.log("Attempting OpenAI SDK request...");
      completion = await openai.chat.completions.create({
        model: model || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      console.log("OpenAI SDK request successful!");
    } catch (sdkError: any) {
      console.log("OpenAI SDK failed, trying direct fetch...");
      console.log("SDK Error status:", sdkError.status);
      console.log("SDK Error message:", sdkError.message);
      console.log("SDK Error details:", sdkError);
      
      // If SDK fails, try direct fetch with more browser-like headers
      const requestBody = {
        model: model || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      };

      const apiUrl = cleanBaseURL ? `${cleanBaseURL}/chat/completions` : "https://api.openai.com/v1/chat/completions";
      
      console.log("Direct fetch URL:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Origin': 'https://chat.openai.com',
          'Referer': 'https://chat.openai.com/',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      completion = await response.json();
    }

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return res.status(500).json({ error: "Failed to get translation" });
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
      errorMessage = `Model "${model || 'gpt-3.5-turbo'}" not available. Please check your model selection or try a different model.`;
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