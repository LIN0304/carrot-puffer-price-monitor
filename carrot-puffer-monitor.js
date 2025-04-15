// carrot-puffer-monitor.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Config variables (replace with your own values)
const CONFIG = {
  telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN',
  telegramChatId: 'YOUR_TELEGRAM_CHAT_ID',
  discountRatio: 0.55, // 55% threshold
  checkInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
  minNotificationInterval: 60 * 60 * 1000, // 1 hour in milliseconds
  logFile: path.join(__dirname, 'price-monitor.log')
};

// State variables
let lastNotificationTime = 0;

// Initialize logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // Also write to log file
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

// Fetch cryptocurrency prices
async function fetchPrices() {
  try {
    log('Fetching current prices...');
    
    // Fetch Carrot price from CoinGecko
    const carrotResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=carrot-by-puffer&vs_currencies=usd');
    const carrotPrice = carrotResponse.data['carrot-by-puffer']?.usd;
    
    // Fetch Puffer price from CoinGecko
    const pufferResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=puffer&vs_currencies=usd');
    const pufferPrice = pufferResponse.data['puffer']?.usd;
    
    // If both prices were successfully fetched
    if (carrotPrice && pufferPrice) {
      log(`Current prices: Carrot: $${carrotPrice}, Puffer: $${pufferPrice}`);
      
      const thresholdPrice = pufferPrice * CONFIG.discountRatio;
      log(`Discount threshold (${CONFIG.discountRatio * 100}% of Puffer): $${thresholdPrice.toFixed(6)}`);
      
      // Check if Carrot is below the threshold
      if (carrotPrice < thresholdPrice) {
        const discountPercentage = ((thresholdPrice - carrotPrice) / thresholdPrice * 100).toFixed(2);
        log(`Discount detected! Carrot is ${discountPercentage}% below the threshold`);
        
        // Check if enough time has passed since the last notification
        const now = Date.now();
        if (now - lastNotificationTime > CONFIG.minNotificationInterval) {
          await sendTelegramNotification(carrotPrice, pufferPrice, thresholdPrice, discountPercentage);
          lastNotificationTime = now;
        } else {
          log('Skipped notification due to rate limit');
        }
      } else {
        log('No discount detected. Carrot price is above the threshold.');
      }
    } else {
      log('Error: Could not fetch prices for one or both cryptocurrencies');
    }
  } catch (error) {
    log(`Error fetching prices: ${error.message}`);
    console.error(error);
  }
}

// Send Telegram notification
async function sendTelegramNotification(carrotPrice, pufferPrice, thresholdPrice, discountPercentage) {
  try {
    const message = `🚨 DISCOUNT ALERT 🚨\n\n` +
                   `Carrot is trading at a ${discountPercentage}% discount!\n\n` +
                   `🥕 Carrot: $${carrotPrice}\n` +
                   `🐡 Puffer: $${pufferPrice}\n` +
                   `📉 Threshold (${(CONFIG.discountRatio * 100).toFixed(0)}% of Puffer): $${thresholdPrice.toFixed(6)}`;
    
    const url = `https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`;
    
    const response = await axios.post(url, {
      chat_id: CONFIG.telegramChatId,
      text: message
    });
    
    if (response.data.ok) {
      log('Telegram notification sent successfully');
    } else {
      log(`Failed to send Telegram notification: ${response.data.description}`);
    }
  } catch (error) {
    log(`Error sending Telegram notification: ${error.message}`);
    console.error(error);
  }
}

// Start monitoring
function startMonitoring() {
  log('Price monitoring started');
  log(`Checking prices every ${CONFIG.checkInterval / 60000} minutes`);
  
  // Run immediately on startup
  fetchPrices();
  
  // Then set interval for periodic checks
  setInterval(fetchPrices, CONFIG.checkInterval);
}

// Handle script termination
process.on('SIGINT', () => {
  log('Monitoring stopped');
  process.exit(0);
});

// Start the monitoring
startMonitoring();