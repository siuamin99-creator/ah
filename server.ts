import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { discordBot } from './server/discordBot';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatically start Discord Bot with the token
  const defaultToken = process.env.DISCORD_BOT_TOKEN || 'MTQ3NTQzNzcxNTg4ODU0MTc4MA.GkVIv0.sES_bHxmfAXG1VyXba110e-TmM7-hmK_Om6354';
  discordBot.start(defaultToken).catch(err => {
    console.error('Error initiating Discord Bot:', err);
  });

  // API Endpoints for Discord Bot Status & Controls
  app.get('/api/bot/status', (req, res) => {
    res.json(discordBot.getStatus());
  });

  app.post('/api/bot/start', async (req, res) => {
    const { token } = req.body;
    const success = await discordBot.start(token);
    res.json({ success, status: discordBot.getStatus() });
  });

  app.post('/api/bot/restart', async (req, res) => {
    const success = await discordBot.start(discordBot.currentToken);
    res.json({ success, status: discordBot.getStatus() });
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
