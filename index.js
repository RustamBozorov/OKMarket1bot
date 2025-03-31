const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize Telegram bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);
const app = express();

// Middleware
app.use(bodyParser.json());

// Webhook setup
app.post(`/webhook/${token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  bot.setWebHook(`${process.env.WEBHOOK_URL}/webhook/${token}`);
});

// Bot commands and messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Handle commands
  if (text === '/start') {
    const welcomeMessages = {
      en: 'Welcome to OKMarket Bot!',
      ru: 'Добро пожаловать в OKMarket Бот!',
      uz: 'OKMarket Botiga xush kelibsiz!'
    };
    bot.sendMessage(chatId, welcomeMessages.en); // Default to English
  }

  // Forward messages to employee group
  if (chatId.toString() !== process.env.EMPLOYEE_GROUP_ID) {
    const forwardText = `New message from ${msg.from.first_name} ${msg.from.last_name || ''} (${msg.from.username || 'no username'}):\n${text}`;
    bot.sendMessage(process.env.EMPLOYEE_GROUP_ID, forwardText);
  }
});

// Handle order notifications
bot.onText(/New Order/, (msg) => {
  const groupId = process.env.EMPLOYEE_GROUP_ID;
  bot.sendMessage(groupId, msg.text, { parse_mode: 'Markdown' });
});

module.exports = bot;
