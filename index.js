const { Telegraf, Markup } = require('telegraf');
const i18n = require('i18next');

// Initialize translations (Uzbek, Russian, English)
i18n.init({
  lng: 'uz',
  resources: {
    uz: {
      translation: {
        welcome: 'Assalomu alaykum! Tilni tanlang:',
        ask_notification: 'Buyurtma yangiliklarni Telegram orqali olishni xohlaysizmi?',
        order_received: 'Buyurtma qabul qilindi! ID: {{orderId}}',
        employee_alert: '🛒 Yangi buyurtma #{{orderId}}\nMijoz: {{customerName}}\nMahsulotlar:\n{{products}}',
        confirm_button: '✅ Tasdiqlash',
        cancel_button: '❌ Bekor qilish'
      }
    },
    ru: {
      translation: {
        welcome: 'Здравствуйте! Выберите язык:',
        ask_notification: 'Хотите получать уведомления о заказе в Telegram?',
        order_received: 'Заказ принят! ID: {{orderId}}',
        employee_alert: '🛒 Новый заказ #{{orderId}}\nКлиент: {{customerName}}\nТовары:\n{{products}}',
        confirm_button: '✅ Подтвердить',
        cancel_button: '❌ Отменить'
      }
    },
    en: {
      translation: {
        welcome: 'Hello! Choose a language:',
        ask_notification: 'Do you want order updates via Telegram?',
        order_received: 'Order received! ID: {{orderId}}',
        employee_alert: '🛒 New order #{{orderId}}\nCustomer: {{customerName}}\nProducts:\n{{products}}',
        confirm_button: '✅ Confirm',
        cancel_button: '❌ Cancel'
      }
    }
  }
});

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const EMPLOYEE_GROUP = env.EMPLOYEE_GROUP_ID; // Replace with your group chat ID

// Start command: Language selection
bot.start((ctx) => {
  ctx.reply(
    i18n.t('welcome'),
    Markup.inlineKeyboard([
      [Markup.button.callback('🇺🇿 Uzbek', 'set_lang_uz')],
      [Markup.button.callback('🇷🇺 Russian', 'set_lang_ru')],
      [Markup.button.callback('🇬🇧 English', 'set_lang_en')],
    ])
  );
});

// Language selection handler
bot.action(/set_lang_(.+)/, (ctx) => {
  const lang = ctx.match[1];
  i18n.changeLanguage(lang);
  ctx.editMessageText(i18n.t('language_changed'));
  ctx.reply(i18n.t('menu'));
});

// Mock function: Replace with actual API call from your mobile app
function submitOrder(orderDetails, chatId) {
  const orderId = `ORDER-${Math.random().toString(36).substring(2, 8)}`;
  const productsText = orderDetails.items.map(item => `${item.name} x${item.qty}`).join('\n');

  // Always notify employee group
  bot.telegram.sendMessage(
    EMPLOYEE_GROUP,
    i18n.t('employee_alert', {
      orderId,
      customerName: orderDetails.customerName,
      products: productsText
    }),
    Markup.inlineKeyboard([
      [Markup.button.callback(i18n.t('confirm_button'), `confirm_${orderId}`)],
      [Markup.button.callback(i18n.t('cancel_button'), `cancel_${orderId}`)]
    ])
  );

  // Notify customer if opted in
  if (orderDetails.notifyViaTelegram && chatId) {
    bot.telegram.sendMessage(
      chatId,
      i18n.t('order_received', { orderId })
    );
  }
  return orderId;
}

// Simulate order from mobile app (for testing)
bot.command('testorder', (ctx) => {
  const orderDetails = {
    customerName: 'Test User',
    items: [{ name: 'Apple', qty: 2 }, { name: 'Milk', qty: 1 }],
    notifyViaTelegram: true // Change to false to test employee-only flow
  };
  submitOrder(orderDetails, ctx.chat.id);
});

// Employee actions (confirm/cancel)
bot.action(/confirm_(.+)/, (ctx) => {
  const orderId = ctx.match[1];
  ctx.editMessageText(`✅ ${orderId} confirmed by ${ctx.from.first_name}`);
  // Add logic to update your database
});

bot.action(/cancel_(.+)/, (ctx) => {
  const orderId = ctx.match[1];
  ctx.editMessageText(`❌ ${orderId} cancelled by ${ctx.from.first_name}`);
  // Add logic to update your database
});

bot.launch();
console.log('Bot is running!');
