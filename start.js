require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();

// Initialize Telegram Bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start Express server
app.listen(10000, '0.0.0.0', () => {   // Explicitly listen on all interfaces
  console.log(`Server running on port 10000`);
});

// Start Telegram Bot (uses webhook or polling)
if (process.env.NODE_ENV === 'production') {
  // Webhook mode (for Render/Fly.io)
  const WEBHOOK_URL = `https://${process.env.WEBHOOK_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`;
  bot.launch({
    webhook: {
      domain: WEBHOOK_URL,
      port: PORT,
    },
  }).then(() => console.log('Bot running via webhook'));
} else {
  // Polling mode (for local testing)
  bot.launch().then(() => console.log('Bot running via polling'));
}

// Error handling
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
