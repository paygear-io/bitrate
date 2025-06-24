"use server";

import ccxt from "ccxt";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

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
    
    if (!ticker || typeof ticker.last !== 'number' || !isFinite(ticker.last)) {
      return { data: null, error: "Invalid or non-finite rate from Binance API." };
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

export async function saveRate(rateData: RateData): Promise<{ error: string | null }> {
  try {
    if (!rateData || typeof rateData.rate !== 'number' || !isFinite(rateData.rate)) {
      return { error: "Attempted to save an invalid rate value." };
    }
    
    const rateRef = doc(db, "rates", "latest_btc_usdt");
    const dataToSave = {
      rate: rateData.rate,
      timestamp: Timestamp.fromMillis(rateData.timestamp),
    };
    await setDoc(rateRef, dataToSave);

    return { error: null };
  } catch (e: unknown) {
    console.error("Failed to save rate to Firestore:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Could not save rate. ${errorMessage}` };
  }
}

export async function getSavedRate(): Promise<{ data: RateData | null; error: string | null; }> {
  try {
    const rateRef = doc(db, "rates", "latest_btc_usdt");
    const docSnap = await getDoc(rateRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (typeof data.rate !== 'number' || !data.timestamp?.toMillis) {
        return { data: null, error: "Invalid data format in database." };
      }
      const rateData: RateData = {
        rate: data.rate,
        timestamp: data.timestamp.toMillis(),
      };
      return { data: rateData, error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (e: unknown) {
    console.error("Failed to get saved rate from Firestore:", e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Could not fetch saved rate. ${errorMessage}` };
  }
}
