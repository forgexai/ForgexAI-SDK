import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";

const PYTH_HERMES_API = "https://hermes.pyth.network/v2";
const PYTH_BENCHMARKS_API = "https://benchmarks.pyth.network/v1";

export interface PythPriceData {
  id: string;
  symbol?: string;
  price: number;
  confidence: number;
  timestamp: number;
  expo: number;
  prevPrice?: number;
  prevTimestamp?: number;
  emaPrice?: number;
  emaConfidence?: number;
}

export interface PythPriceFeed {
  id: string;
  attributes: {
    symbol: string;
    asset_type: string;
    base: string;
    quote: string;
    description: string;
    country?: string;
    tenor?: string;
    cms_symbol?: string;
    cqs_symbol?: string;
    nasdaq_symbol?: string;
  };
}

export interface PythHistoricalPrice {
  timestamp: number;
  price: number;
  confidence: number;
}

export interface PythBenchmarkPrice {
  symbol: string;
  price: number;
  timestamp: number;
  type: "crypto" | "fx" | "equity" | "commodity" | "rates";
}

export interface PythVaa {
  vaa: string;
  publishTime: number;
}

export class PythClient {
  constructor(private connection?: Connection) {}

  /**
   * Get latest price for a single asset
   */
  async getAssetPrice(priceId: string): Promise<PythPriceData> {
    try {
      const response = await axios.get(
        `${PYTH_HERMES_API}/updates/price/latest`,
        {
          params: {
            ids: [priceId],
            encoding: "hex",
            parsed: "true",
          },
        }
      );

      if (!response.data.parsed || response.data.parsed.length === 0) {
        throw new Error("Price feed not found");
      }

      const feed = response.data.parsed[0];
      const priceData = feed.price;
      const emaPriceData = feed.ema_price;

      return {
        id: feed.id,
        price: this.normalizePrice(priceData.price, priceData.expo),
        confidence: this.normalizePrice(priceData.conf, priceData.expo),
        timestamp: feed.publish_time,
        expo: priceData.expo,
        prevPrice: feed.prev_price
          ? this.normalizePrice(feed.prev_price.price, feed.prev_price.expo)
          : undefined,
        prevTimestamp: feed.prev_publish_time,
        emaPrice: emaPriceData
          ? this.normalizePrice(emaPriceData.price, emaPriceData.expo)
          : undefined,
        emaConfidence: emaPriceData
          ? this.normalizePrice(emaPriceData.conf, emaPriceData.expo)
          : undefined,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get Pyth price: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get latest prices for multiple assets
   */
  async getMultiplePrices(priceIds: string[]): Promise<PythPriceData[]> {
    try {
      const response = await axios.get(
        `${PYTH_HERMES_API}/updates/price/latest`,
        {
          params: {
            ids: priceIds,
            encoding: "hex",
            parsed: "true",
          },
        }
      );

      if (!response.data.parsed) {
        return [];
      }

      return response.data.parsed.map((feed: any) => {
        const priceData = feed.price;
        const emaPriceData = feed.ema_price;

        return {
          id: feed.id,
          price: this.normalizePrice(priceData.price, priceData.expo),
          confidence: this.normalizePrice(priceData.conf, priceData.expo),
          timestamp: feed.publish_time,
          expo: priceData.expo,
          prevPrice: feed.prev_price
            ? this.normalizePrice(feed.prev_price.price, feed.prev_price.expo)
            : undefined,
          prevTimestamp: feed.prev_publish_time,
          emaPrice: emaPriceData
            ? this.normalizePrice(emaPriceData.price, emaPriceData.expo)
            : undefined,
          emaConfidence: emaPriceData
            ? this.normalizePrice(emaPriceData.conf, emaPriceData.expo)
            : undefined,
        };
      });
    } catch (error: any) {
      throw new Error(`Failed to get multiple Pyth prices: ${error.message}`);
    }
  }

  /**
   * Get historical prices for an asset
   */
  async getHistoricalPrices(
    priceId: string,
    startTime: number,
    endTime?: number
  ): Promise<PythHistoricalPrice[]> {
    try {
      const params: any = {
        ids: [priceId],
        start_time: startTime,
        encoding: "hex",
        parsed: "true",
      };

      if (endTime) {
        params.end_time = endTime;
      }

      const response = await axios.get(`${PYTH_HERMES_API}/updates/price`, {
        params,
      });

      if (!response.data.parsed) {
        return [];
      }

      return response.data.parsed.map((feed: any) => ({
        timestamp: feed.publish_time,
        price: this.normalizePrice(feed.price.price, feed.price.expo),
        confidence: this.normalizePrice(feed.price.conf, feed.price.expo),
      }));
    } catch (error: any) {
      throw new Error(`Failed to get historical prices: ${error.message}`);
    }
  }

  /**
   * Get all available price feeds
   */
  async getAllPriceFeeds(): Promise<PythPriceFeed[]> {
    try {
      const response = await axios.get(`${PYTH_HERMES_API}/price_feeds`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get price feeds: ${error.message}`);
    }
  }

  /**
   * Search for price feeds by symbol or description
   */
  async searchPriceFeeds(query: string): Promise<PythPriceFeed[]> {
    try {
      const allFeeds = await this.getAllPriceFeeds();
      const lowerQuery = query.toLowerCase();

      return allFeeds.filter(
        (feed) =>
          feed.attributes.symbol?.toLowerCase().includes(lowerQuery) ||
          feed.attributes.description?.toLowerCase().includes(lowerQuery) ||
          feed.attributes.base?.toLowerCase().includes(lowerQuery)
      );
    } catch (error: any) {
      throw new Error(`Failed to search price feeds: ${error.message}`);
    }
  }

  /**
   * Get benchmark prices (end-of-day prices)
   */
  async getBenchmarkPrices(
    symbols?: string[],
    date?: string
  ): Promise<PythBenchmarkPrice[]> {
    try {
      const params: any = {};

      if (symbols && symbols.length > 0) {
        params.symbols = symbols.join(",");
      }
      if (date) {
        params.date = date;
      }

      const response = await axios.get(
        `${PYTH_BENCHMARKS_API}/benchmarks/latest`,
        { params }
      );

      return response.data.map((item: any) => ({
        symbol: item.symbol,
        price: item.price,
        timestamp: item.timestamp,
        type: item.type,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get benchmark prices: ${error.message}`);
    }
  }

  /**
   * Get VAA (Verifiable Action Approval) for price updates
   */
  async getPriceVaa(priceIds: string[]): Promise<PythVaa[]> {
    try {
      const response = await axios.get(
        `${PYTH_HERMES_API}/updates/price/latest`,
        {
          params: {
            ids: priceIds,
            encoding: "base64",
          },
        }
      );

      return response.data.binary.data.map((vaa: string, index: number) => ({
        vaa,
        publishTime: response.data.parsed?.[index]?.publish_time || Date.now(),
      }));
    } catch (error: any) {
      throw new Error(`Failed to get price VAA: ${error.message}`);
    }
  }

  /**
   * Get price feeds by asset type
   */
  async getPriceFeedsByAssetType(
    assetType: "crypto" | "fx" | "equity" | "commodity" | "rates"
  ): Promise<PythPriceFeed[]> {
    try {
      const allFeeds = await this.getAllPriceFeeds();
      return allFeeds.filter(
        (feed) => feed.attributes.asset_type === assetType
      );
    } catch (error: any) {
      throw new Error(
        `Failed to get price feeds by asset type: ${error.message}`
      );
    }
  }

  /**
   * Get confidence ratio (confidence / price)
   */
  static getConfidenceRatio(price: number, confidence: number): number {
    if (price === 0) return 0;
    return (confidence / Math.abs(price)) * 100;
  }

  /**
   * Check if price is stale
   */
  static isPriceStale(timestamp: number, maxAgeSeconds: number = 60): boolean {
    const now = Date.now() / 1000;
    return now - timestamp > maxAgeSeconds;
  }

  /**
   * Format price with appropriate decimals
   */
  static formatPrice(price: number, decimals: number = 6): string {
    return price.toFixed(decimals);
  }

  /**
   * Calculate price change percentage
   */
  static calculatePriceChange(
    currentPrice: number,
    previousPrice: number
  ): { absolute: number; percentage: number } {
    const absolute = currentPrice - previousPrice;
    const percentage =
      previousPrice !== 0 ? (absolute / previousPrice) * 100 : 0;
    return { absolute, percentage };
  }

  /**
   * Normalize price with exponent
   */
  private normalizePrice(price: string, expo: number): number {
    return parseFloat(price) * Math.pow(10, expo);
  }
}

export const PYTH_FEEDS = {
  SOL_USD: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
  BTC_USD: "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
  ETH_USD: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
  USDC_USD:
    "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
  USDT_USD:
    "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
  AVAX_USD:
    "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
  MATIC_USD:
    "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
  LINK_USD:
    "0x8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221",
  UNI_USD: "0x78d185a741d07edb3aeb9547aa6e684ec08a73a6b78ee8d4c1e5c1b8dd8a37de",

  EUR_USD: "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
  GBP_USD: "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
  JPY_USD: "0xef2c98c804ba503c6a707e38be4dfbb9d9ecd86a0d06c8c5b3a7c24c6b8a6c6",

  GOLD_USD:
    "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2",
  SILVER_USD:
    "0xf2fb02c32b055c5777e15296e2d634cc3fd96b1b36c84b56e4e89b4c5b0b1fce",

  AAPL_USD:
    "0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688",
  TSLA_USD:
    "0x16dad506d7db8da01c04aee0b7eefecc71eab7efe1b77cf4d3f7c6f9ae2b9e8f",
  MSFT_USD:
    "0xc1b12769f6633a9db49e3ca4653ca1a0b163915f5f3ec7a7cb3e9e7c4e9b0e3d",
} as const;
