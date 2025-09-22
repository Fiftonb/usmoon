import type { NextApiRequest, NextApiResponse } from "next";

interface ModelsRequest {
  apiKey: string;
  baseURL?: string;
}

interface Model {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

interface ModelsResponse {
  models?: Model[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ModelsResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { apiKey, baseURL }: ModelsRequest = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  // Validate and clean baseURL
  let cleanBaseURL = baseURL?.trim();
  if (cleanBaseURL && !cleanBaseURL.startsWith('http')) {
    cleanBaseURL = `https://${cleanBaseURL}`;
  }

  // Ensure the URL has the correct /v1/models path
  const baseUrl = cleanBaseURL || "https://api.openai.com/v1";
  let modelsUrl;
  
  if (baseUrl.includes('/v1/models')) {
    // Already has full path
    modelsUrl = baseUrl;
  } else if (baseUrl.includes('/models')) {
    // Has /models but might need /v1
    modelsUrl = baseUrl;
  } else if (baseUrl.endsWith('/v1')) {
    // Has /v1, add /models
    modelsUrl = `${baseUrl}/models`;
  } else {
    // Need to add /v1/models
    modelsUrl = `${baseUrl}/v1/models`;
  }

  console.log(`Fetching models from: ${modelsUrl}`);

  try {
    // Use direct fetch instead of OpenAI SDK to have more control over the request
    const response = await fetch(modelsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'none',
      },
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log(`Response text (first 500 chars):`, responseText.substring(0, 500));

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`);
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
    }
    
    console.log(`Parsed data type:`, typeof data);
    console.log(`Data keys:`, Object.keys(data));
    
    // Handle different response formats
    let models: Model[] = [];
    if (data.data && Array.isArray(data.data)) {
      // Standard OpenAI format: {"data": [...], "object": "list"}
      models = data.data;
      console.log(`Found models in data.data, count: ${models.length}`);
    } else if (Array.isArray(data)) {
      // Direct array format: [...]
      models = data;
      console.log(`Found models as direct array, count: ${models.length}`);
    } else if (data.models && Array.isArray(data.models)) {
      // Alternative format: {"models": [...]}
      models = data.models;
      console.log(`Found models in data.models, count: ${models.length}`);
    } else {
      console.error('Unexpected response format:', {
        dataType: typeof data,
        dataKeys: Object.keys(data),
        hasData: !!data.data,
        hasModels: !!data.models,
        isArray: Array.isArray(data),
        sampleData: JSON.stringify(data).substring(0, 200)
      });
      throw new Error(`Unexpected response format. Expected models array but got object with keys: ${Object.keys(data).join(', ')}`);
    }

    console.log(`Successfully parsed ${models.length} models`);

    // Sort models by ID for better UX
    const sortedModels = models.sort((a, b) => a.id.localeCompare(b.id));
    
    res.status(200).json({ models: sortedModels });
  } catch (error: any) {
    console.error("Models fetch error:", error);
    
    let errorMessage = "Failed to fetch models";
    
    if (error.message?.includes('401')) {
      errorMessage = "Invalid API key. Please check your API key.";
    } else if (error.message?.includes('403')) {
      if (error.message?.includes('cloudflare') || error.message?.includes('blocked')) {
        errorMessage = "API endpoint blocked by security service. Please check your Base URL or try using the official OpenAI endpoint.";
      } else {
        errorMessage = "Access denied. Please check your API key and endpoint configuration.";
      }
    } else if (error.message?.includes('404')) {
      errorMessage = "Models endpoint not found. This API may not support model listing.";
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to API endpoint. Please check your Base URL.";
    } else if (error.message?.includes('fetch')) {
      errorMessage = "Network error. Please check your internet connection and API endpoint.";
    } else if (error.message?.includes('JSON')) {
      errorMessage = "Invalid response format. The endpoint may not be compatible with OpenAI API format.";
    } else if (error.message) {
      // Clean up the error message for display
      const cleanMessage = error.message
        .replace(/<!DOCTYPE html>[\s\S]*?<\/html>/gi, '')
        .replace(/HTTP \d+: /, '')
        .trim();
      if (cleanMessage && cleanMessage.length < 200) {
        errorMessage = cleanMessage;
      }
    }
    
    res.status(500).json({ 
      error: errorMessage
    });
  }
} 