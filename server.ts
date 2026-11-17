import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { runChatAgent } from './server/chatAgent.ts';
import type { ChatTurnInput, ClientShopState } from './server/chatAgent.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'maison-dor-concierge',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Shopping Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  const startedAt = Date.now();
  try {
    const body = req.body as {
      messages?: ChatTurnInput[];
      clientState?: ClientShopState;
    };

    if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const result = await runChatAgent(body.messages, body.clientState || ({} as ClientShopState));
    console.log(`[chat] completed in ${Date.now() - startedAt}ms`);
    res.json(result);
  } catch (err: unknown) {
    console.error(`[chat] failed in ${Date.now() - startedAt}ms:`, err);
    const statusCode =
      (err as { statusCode?: number; status?: number })?.statusCode ||
      (err as { status?: number })?.status ||
      500;
    const rawMessage = err instanceof Error ? err.message : 'Unexpected server error.';

    let userFriendlyError = rawMessage;
    if (statusCode === 403 || rawMessage.includes('API_KEY_INVALID') || statusCode === 400) {
      userFriendlyError =
        'Gemini API key error. Please verify your GEMINI_API_KEY in Settings > Secrets.';
    } else if (statusCode === 429) {
      userFriendlyError = 'Our Fragrance Concierge is experiencing high demand. Please retry in a moment.';
    }

    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      error: userFriendlyError
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maison d'Or Parfumerie server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
