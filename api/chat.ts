import type { IncomingMessage, ServerResponse } from 'http';
import { runChatAgent } from '../server/chatAgent.ts';
import type { ChatTurnInput, ClientShopState } from '../server/chatAgent.ts';

interface VercelReq extends IncomingMessage {
  method?: string;
  body?: {
    messages?: ChatTurnInput[];
    clientState?: ClientShopState;
  };
}

interface VercelRes extends ServerResponse {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body;
    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const result = await runChatAgent(body.messages, body.clientState || ({} as ClientShopState));
    res.status(200).json(result);
  } catch (err: unknown) {
    console.error('Vercel AI Chat Error:', err);
    const statusCode =
      (err as { statusCode?: number; status?: number })?.statusCode ||
      (err as { status?: number })?.status ||
      500;
    const rawMessage = err instanceof Error ? err.message : 'Unexpected server error.';

    let userFriendlyError = rawMessage;
    if (statusCode === 403 || rawMessage.includes('API_KEY_INVALID') || statusCode === 400) {
      userFriendlyError = 'Gemini API key error. Please check GEMINI_API_KEY in Vercel Environment Variables.';
    } else if (statusCode === 429) {
      userFriendlyError = 'Our Fragrance Concierge is experiencing high demand. Please retry in a moment.';
    }

    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: userFriendlyError
    });
  }
}
