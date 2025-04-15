# Carrot/Puffer Price Monitor

A monitoring tool that tracks Carrot and Puffer cryptocurrency prices and sends alerts when Carrot trades below 55% of Puffer's price.

## Overview

This repository contains multiple implementations of a price monitoring tool for the Carrot and Puffer tokens. The tool checks if the Carrot token is trading at a discount (below 55% of Puffer's price) and sends a notification via Telegram when it detects such a discount.

## Features

- Real-time price monitoring using CoinGecko or CoinMarketCap APIs
- Configurable discount threshold (default: 55%)
- Telegram notifications when discount is detected
- Customizable check intervals
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
   npm install axios
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

4. Run the script:
   ```
   node carrot-puffer-monitor.js
   # OR
   node carrot-puffer-monitor-coinmarketcap.js
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

## License

MIT