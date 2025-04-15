# Carrot/Puffer Price Monitor

A monitoring tool that tracks Carrot and Puffer cryptocurrency prices and sends alerts when Carrot trades below 55% of Puffer's price.

## Overview

This repository contains multiple implementations of a price monitoring tool for the Carrot and Puffer tokens. The tool checks if the Carrot token is trading at a discount (below 55% of Puffer's price) and sends a notification via Telegram when it detects such a discount.

## Features

- Real-time price monitoring using CoinGecko or CoinMarketCap APIs
- Configurable discount threshold (default: 55%)
- Telegram notifications when discount is detected
- Customizable check intervals
- Configurable notification frequency
- Detailed activity logging
- Both web and Node.js implementations

## Implementations

### Node.js Server Implementations

1. **CoinGecko Version** (`carrot-puffer-monitor.js`)
   - Uses the free CoinGecko API (no authentication required)
   - Runs as a background process on any server with Node.js

2. **CoinMarketCap Version** (`carrot-puffer-monitor-coinmarketcap.js`)
   - Uses the CoinMarketCap API (requires an API key)
   - More reliable for accurate price data
   - Supports configurable notification intervals

### Web-Based Implementations

1. **Browser Version** (`web-app/index.html`)
   - Runs entirely in your browser
   - Uses CoinGecko API (no authentication required)
   - Visual interface for monitoring and configuration

2. **CoinMarketCap Browser Version** (`web-app/coinmarketcap-version.html`)
   - Uses CoinMarketCap API (requires API key and proxy server due to CORS restrictions)
   - Enhanced UI with additional settings

## Setup

### Node.js Implementation

1. Install required packages:
   ```
   npm install
   ```

2. Edit the CONFIG object in the script with your Telegram credentials:
   ```javascript
   const CONFIG = {
     telegramBotToken: 'YOUR_TELEGRAM_BOT_TOKEN',
     telegramChatId: 'YOUR_TELEGRAM_CHAT_ID',
     // other config...
   };
   ```

3. For the CoinMarketCap version, also add your API key:
   ```javascript
   coinmarketcapApiKey: 'YOUR_COINMARKETCAP_API_KEY',
   ```

4. Run the script with different notification intervals:
   ```
   # Default (10 minute notification interval)
   npm run start:cmc
   
   # More frequent notifications (every 5 minutes)
   npm run start:cmc:frequent
   
   # Medium frequency (every 15 minutes)
   npm run start:cmc:medium
   
   # Hourly notifications
   npm run start:cmc:hourly
   ```

5. Or run directly with a custom notification interval (in minutes):
   ```
   node carrot-puffer-monitor-coinmarketcap.js --notify-interval 3
   ```

6. You can also use an environment variable:
   ```
   NOTIFY_INTERVAL=2 node carrot-puffer-monitor-coinmarketcap.js
   ```

### Web Implementation

1. Open `web-app/index.html` in your web browser
2. Enter your Telegram bot token and chat ID
3. Adjust settings as needed
4. Click "Start Monitoring"

## Obtaining Credentials

### Telegram Bot and Chat ID

1. Create a Telegram bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Get your Chat ID by messaging [@userinfobot](https://t.me/userinfobot) on Telegram

### CoinMarketCap API Key

1. Register at [CoinMarketCap](https://coinmarketcap.com/api/)
2. Create an API key from your dashboard

## Running 24/7 (Production Use)

For continuous monitoring, you can use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start with default settings
pm2 start carrot-puffer-monitor-coinmarketcap.js --name "carrot-monitor"

# Or with custom notification interval (5 minutes)
pm2 start carrot-puffer-monitor-coinmarketcap.js --name "carrot-monitor" -- --notify-interval 5

# Make it auto-restart on server reboot
pm2 startup
pm2 save
```

## License

MIT
