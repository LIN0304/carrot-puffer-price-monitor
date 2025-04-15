// carrot-puffer-monitor-coinmarketcap.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let notifyIntervalArg = null;

// Check for --notify-interval argument
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--notify-interval' && i + 1 < args.length) {
    notifyIntervalArg = parseInt(args[i + 1]) * 60 * 1000; // Convert minutes to milliseconds
    break;
  }
}

// Config variables (replace with your own values)
const CONFIG = {
  coinmarketcapApiKey: 'YOUR_COINMARKETCAP_API_KEY', // Get from https://coinmarketcap.com/api/
  telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN',
  telegramChatId: 'YOUR_TELEGRAM_CHAT_ID',
  discountRatio: 0.55, // 55% threshold
  checkInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
  // Notification interval is now configurable with fallbacks:
  // 1. Command line argument (--notify-interval X)
  // 2. Environment variable (NOTIFY_INTERVAL)
  // 3. Default (10 minutes)
  notifyInterval: notifyIntervalArg || parseInt(process.env.NOTIFY_INTERVAL || '10') * 60 * 1000,
  logFile: path.join(__dirname, 'price-monitor.log'),
  // CoinMarketCap IDs for the tokens
  carrotId: '35839', // Carrot by Puffer
  pufferId: '32325' // Puffer
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
    log('Fetching current prices from CoinMarketCap...');
    
    // Fetch both tokens in one API call
    const response = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest`, {
      headers: {
        'X-CMC_PRO_API_KEY': CONFIG.coinmarketcapApiKey
      },
      params: {
        id: `${CONFIG.carrotId},${CONFIG.pufferId}`
      }
    });
    
    const data = response.data.data;
    
    // Extract prices
    const carrotPrice = data[CONFIG.carrotId]?.quote?.USD?.price;
    const pufferPrice = data[CONFIG.pufferId]?.quote?.USD?.price;
    
    // If both prices were successfully fetched
    if (carrotPrice && pufferPrice) {
      log(`Current prices: Carrot: $${carrotPrice.toFixed(6)}, Puffer: $${pufferPrice.toFixed(6)}`);
      
      const thresholdPrice = pufferPrice * CONFIG.discountRatio;
      log(`Discount threshold (${CONFIG.discountRatio * 100}% of Puffer): $${thresholdPrice.toFixed(6)}`);
      
      // Check if Carrot is below the threshold
      if (carrotPrice < thresholdPrice) {
        const discountPercentage = ((thresholdPrice - carrotPrice) / thresholdPrice * 100).toFixed(2);
        log(`Discount detected! Carrot is ${discountPercentage}% below the threshold`);
        
        // Check if enough time has passed since the last notification
        const now = Date.now();
        if (now - lastNotificationTime > CONFIG.notifyInterval) {
          await sendTelegramNotification(carrotPrice, pufferPrice, thresholdPrice, discountPercentage);
          lastNotificationTime = now;
        } else {
          const nextNotificationTime = new Date(lastNotificationTime + CONFIG.notifyInterval);
          const minutesRemaining = Math.floor((nextNotificationTime - now) / 60000);
          log(`Skipped notification due to rate limit. Next notification possible in ~${minutesRemaining} minutes`);
        }
      } else {
        log('No discount detected. Carrot price is above the threshold.');
      }
    } else {
      log('Error: Could not fetch prices for one or both cryptocurrencies');
      log(`Data received: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    log(`Error fetching prices: ${error.message}`);
    if (error.response) {
      log(`API response error: ${JSON.stringify(error.response.data)}`);
    }
    console.error(error);
  }
}

// Send Telegram notification
async function sendTelegramNotification(carrotPrice, pufferPrice, thresholdPrice, discountPercentage) {
  try {
    const message = `🚨 DISCOUNT ALERT 🚨\n\n` +
                   `Carrot is trading at a ${discountPercentage}% discount!\n\n` +
                   `🥕 Carrot: $${carrotPrice.toFixed(6)}\n` +
                   `🐡 Puffer: $${pufferPrice.toFixed(6)}\n` +
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
  log(`Notification interval set to ${CONFIG.notifyInterval / 60000} minutes`);
  
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