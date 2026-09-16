import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { botManager } from './bot.js';
import { store } from './store.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  console.log(`🚀 KITY RICH STUDIO server running on port ${PORT}`);
  
  // Auto-initialize bot if token is present
  const initialToken = store.getBotToken();
  if (initialToken) {
    console.log('Connecting Telegram Bot with saved token...');
    await botManager.verifyAndInit(initialToken);
  } else {
    console.log('💡 Tip: Set TELEGRAM_BOT_TOKEN in .env or configure via Web Settings.');
  }
});
