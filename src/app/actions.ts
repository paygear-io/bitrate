"use server";

import ccxt from "ccxt";

interface RateData {
  rate: number;
  timestamp: number;
}

interface ActionResult {
  data: RateData | null;
  error: string | null;
}

export async function getBtcRate(): Promise<ActionResult> {
  try {
    const exchange = new ccxt.binance();
    const ticker = await exchange.fetchTicker("BTC/USDT");
    
    if (!ticker || typeof ticker.last !== 'number') {
      return { data: null, error: "Invalid response from Binance API." };
    }
    
    return { 
      data: { rate: ticker.last, timestamp: Date.now() }, 
      error: null 
    };

  } catch (e: unknown) {
    console.error("Failed to fetch from Binance:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { 
      data: null, 
      error: `Could not connect to the API. ${errorMessage}` 
    };
  }
}
