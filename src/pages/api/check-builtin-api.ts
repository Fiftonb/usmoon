import type { NextApiRequest, NextApiResponse } from "next";

interface CheckResponse {
  hasBuiltinApi: boolean;
  model?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ hasBuiltinApi: false });
  }

  // 检查是否配置了内置API
  const hasBuiltinApi = !!process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

  res.status(200).json({ 
    hasBuiltinApi,
    model: hasBuiltinApi ? model : undefined
  });
}

