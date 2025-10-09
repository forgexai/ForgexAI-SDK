import axios from "axios";
import { Connection } from "@solana/web3.js";

const DRIFT_API = "https://dlob.drift.trade";
const DRIFT_HISTORY_API = "https://drift-history-api-v2.onrender.com";

export interface DriftPerpPosition {
  market: string;
  marketIndex: number;
  baseAsset: string;
  size: number;
  entryPrice: number;
  currentPrice: number;
  markPrice: number;
  pnl: number;
  unrealizedPnl: number;
  leverage: number;
  marginRatio: number;
  liquidationPrice: number;
  side: "long" | "short";
  collateral: number;
  maxLeverage: number;
  timestamp: number;
}

export interface DriftMarketInfo {
  marketIndex: number;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  markPrice: number;
  indexPrice: number;
  fundingRate: number;
  openInterest: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  nextFundingTime: number;
  maxLeverage: number;
  maintenanceMarginRatio: number;
  initialMarginRatio: number;
  minOrderSize: number;
  tickSize: number;
  stepSize: number;
}

export interface DriftUserStats {
  authority: string;
  totalCollateral: number;
  freeCollateral: number;
  marginRatio: number;
  leverage: number;
  totalPnl: number;
  unrealizedPnl: number;
  openPositions: number;
  liquidationPrice?: number;
  healthScore: number;
}

export interface DriftOrderParams {
  marketIndex: number;
  side: "buy" | "sell";
  size: number;
  price?: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
  orderType: "market" | "limit" | "stop" | "stopLimit";
  timeInForce?: "GTC" | "IOC" | "FOK";
}

export interface DriftTransactionResult {
  transaction: string;
  lastValidBlockHeight?: number;
  priorityFee?: number;
}

export interface DriftFundingRateHistory {
  marketIndex: number;
  fundingRate: number;
  timestamp: number;
  cumulative: number;
}

export interface DriftTradeHistory {
  marketIndex: number;
  price: number;
  size: number;
  side: "buy" | "sell";
  timestamp: number;
  txId: string;
}

export class DriftClient {
  constructor(private connection: Connection) {}

  /**
   * Get all positions for a user
   */
  async getPositionDetails(
    walletAddress: string,
    marketIndex?: number
  ): Promise<DriftPerpPosition[]> {
    try {
      const response = await axios.get(
        `${DRIFT_API}/users/${walletAddress}/positions`
      );

      if (!response.data || !response.data.positions) {
        return [];
      }

      let positions = response.data.positions;

      if (marketIndex !== undefined) {
        positions = positions.filter((p: any) => p.marketIndex === marketIndex);
      }

      return positions.map((position: any) => ({
        market: position.market || `PERP-${position.marketIndex}`,
        marketIndex: position.marketIndex,
        baseAsset: position.baseAsset || "Unknown",
        size: position.baseAssetAmount / 1e9 || 0,
        entryPrice: position.averageEntryPrice / 1e6 || 0,
        currentPrice: position.markPrice / 1e6 || 0,
        markPrice: position.markPrice / 1e6 || 0,
        pnl: position.unrealizedPnl / 1e6 || 0,
        unrealizedPnl: position.unrealizedPnl / 1e6 || 0,
        leverage: position.leverage || 0,
        marginRatio: position.marginRatio || 0,
        liquidationPrice: position.liquidationPrice / 1e6 || 0,
        side: position.baseAssetAmount > 0 ? "long" : "short",
        collateral: position.collateral / 1e6 || 0,
        maxLeverage: position.maxLeverage || 10,
        timestamp: position.timestamp || Date.now(),
      }));
    } catch (error: any) {
      throw new Error(
        `Failed to get Drift positions: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get market information and stats
   */
  async getMarketInfo(marketIndex: number): Promise<DriftMarketInfo> {
    try {
      const response = await axios.get(`${DRIFT_API}/markets/${marketIndex}`);

      if (!response.data) {
        throw new Error("Market not found");
      }

      const market = response.data;

      return {
        marketIndex: market.marketIndex,
        symbol: market.symbol || `PERP-${marketIndex}`,
        baseAsset: market.baseAsset || "Unknown",
        quoteAsset: market.quoteAsset || "USDC",
        markPrice: market.markPrice / 1e6 || 0,
        indexPrice: market.indexPrice / 1e6 || 0,
        fundingRate: market.fundingRate / 1e6 || 0,
        openInterest: market.openInterest / 1e9 || 0,
        volume24h: market.volume24h / 1e6 || 0,
        priceChange24h: market.priceChange24h / 1e6 || 0,
        priceChangePercent24h: market.priceChangePercent24h || 0,
        nextFundingTime: market.nextFundingTime || Date.now() + 3600000,
        maxLeverage: market.maxLeverage || 10,
        maintenanceMarginRatio: market.maintenanceMarginRatio / 10000 || 0.05,
        initialMarginRatio: market.initialMarginRatio / 10000 || 0.1,
        minOrderSize: market.minOrderSize / 1e9 || 0.001,
        tickSize: market.tickSize / 1e6 || 0.01,
        stepSize: market.stepSize / 1e9 || 0.001,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get market info: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get all available markets
   */
  async getAllMarkets(): Promise<DriftMarketInfo[]> {
    try {
      const response = await axios.get(`${DRIFT_API}/markets`);

      if (!response.data || !response.data.markets) {
        return [];
      }

      return response.data.markets.map((market: any) => ({
        marketIndex: market.marketIndex,
        symbol: market.symbol || `PERP-${market.marketIndex}`,
        baseAsset: market.baseAsset || "Unknown",
        quoteAsset: market.quoteAsset || "USDC",
        markPrice: market.markPrice / 1e6 || 0,
        indexPrice: market.indexPrice / 1e6 || 0,
        fundingRate: market.fundingRate / 1e6 || 0,
        openInterest: market.openInterest / 1e9 || 0,
        volume24h: market.volume24h / 1e6 || 0,
        priceChange24h: market.priceChange24h / 1e6 || 0,
        priceChangePercent24h: market.priceChangePercent24h || 0,
        nextFundingTime: market.nextFundingTime || Date.now() + 3600000,
        maxLeverage: market.maxLeverage || 10,
        maintenanceMarginRatio: market.maintenanceMarginRatio / 10000 || 0.05,
        initialMarginRatio: market.initialMarginRatio / 10000 || 0.1,
        minOrderSize: market.minOrderSize / 1e9 || 0.001,
        tickSize: market.tickSize / 1e6 || 0.01,
        stepSize: market.stepSize / 1e9 || 0.001,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get markets: ${error.message}`);
    }
  }

  /**
   * Get user account stats and overview
   */
  async getUserStats(walletAddress: string): Promise<DriftUserStats> {
    try {
      const response = await axios.get(
        `${DRIFT_API}/users/${walletAddress}/stats`
      );

      if (!response.data) {
        throw new Error("User stats not found");
      }

      const stats = response.data;

      return {
        authority: walletAddress,
        totalCollateral: stats.totalCollateral / 1e6 || 0,
        freeCollateral: stats.freeCollateral / 1e6 || 0,
        marginRatio: stats.marginRatio || 0,
        leverage: stats.leverage || 0,
        totalPnl: stats.totalPnl / 1e6 || 0,
        unrealizedPnl: stats.unrealizedPnl / 1e6 || 0,
        openPositions: stats.openPositions || 0,
        liquidationPrice: stats.liquidationPrice
          ? stats.liquidationPrice / 1e6
          : undefined,
        healthScore: stats.healthScore || 100,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get user stats: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get funding rate history for a market
   */
  async getFundingRateHistory(
    marketIndex: number,
    hours: number = 24
  ): Promise<DriftFundingRateHistory[]> {
    try {
      const response = await axios.get(
        `${DRIFT_HISTORY_API}/funding-rates/${marketIndex}?hours=${hours}`
      );

      if (!response.data || !response.data.fundingRates) {
        return [];
      }

      return response.data.fundingRates.map((fr: any) => ({
        marketIndex,
        fundingRate: fr.fundingRate / 1e6 || 0,
        timestamp: fr.timestamp,
        cumulative: fr.cumulative / 1e6 || 0,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get funding rate history: ${error.message}`);
    }
  }

  /**
   * Get recent trades for a market
   */
  async getRecentTrades(
    marketIndex: number,
    limit: number = 50
  ): Promise<DriftTradeHistory[]> {
    try {
      const response = await axios.get(
        `${DRIFT_API}/markets/${marketIndex}/trades?limit=${limit}`
      );

      if (!response.data || !response.data.trades) {
        return [];
      }

      return response.data.trades.map((trade: any) => ({
        marketIndex,
        price: trade.price / 1e6 || 0,
        size: trade.size / 1e9 || 0,
        side: trade.side === 1 ? "buy" : "sell",
        timestamp: trade.timestamp,
        txId: trade.txId || "",
      }));
    } catch (error: any) {
      throw new Error(`Failed to get recent trades: ${error.message}`);
    }
  }

  /**
   * Build place order transaction
   */
  async buildPlaceOrderTransaction(
    orderParams: DriftOrderParams,
    userPublicKey: string
  ): Promise<DriftTransactionResult> {
    try {
      const response = await axios.post(
        `${DRIFT_API}/transactions/place-order`,
        {
          marketIndex: orderParams.marketIndex,
          side: orderParams.side === "buy" ? 1 : 0,
          size: Math.floor(orderParams.size * 1e9),
          price: orderParams.price
            ? Math.floor(orderParams.price * 1e6)
            : undefined,
          orderType: orderParams.orderType,
          reduceOnly: orderParams.reduceOnly || false,
          postOnly: orderParams.postOnly || false,
          timeInForce: orderParams.timeInForce || "GTC",
          userPublicKey,
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build place order transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build place order transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build cancel order transaction
   */
  async buildCancelOrderTransaction(
    orderId: number,
    userPublicKey: string
  ): Promise<DriftTransactionResult> {
    try {
      const response = await axios.post(
        `${DRIFT_API}/transactions/cancel-order`,
        {
          orderId,
          userPublicKey,
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build cancel order transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build cancel order transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build modify margin transaction
   */
  async buildModifyMarginTransaction(
    marketIndex: number,
    marginAmount: number,
    userPublicKey: string
  ): Promise<DriftTransactionResult> {
    try {
      const response = await axios.post(
        `${DRIFT_API}/transactions/modify-margin`,
        {
          marketIndex,
          marginAmount: Math.floor(marginAmount * 1e6),
          userPublicKey,
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build modify margin transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build modify margin transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Utility method to calculate liquidation price
   */
  static calculateLiquidationPrice(
    entryPrice: number,
    leverage: number,
    side: "long" | "short",
    maintenanceMarginRatio: number = 0.05
  ): number {
    if (side === "long") {
      return entryPrice * (1 - 1 / leverage + maintenanceMarginRatio);
    } else {
      return entryPrice * (1 + 1 / leverage - maintenanceMarginRatio);
    }
  }

  /**
   * Utility method to calculate position PnL
   */
  static calculatePnL(
    entryPrice: number,
    currentPrice: number,
    size: number,
    side: "long" | "short"
  ): number {
    if (side === "long") {
      return (currentPrice - entryPrice) * size;
    } else {
      return (entryPrice - currentPrice) * size;
    }
  }

  /**
   * Utility method to calculate required margin
   */
  static calculateRequiredMargin(
    positionSize: number,
    entryPrice: number,
    leverage: number
  ): number {
    return (positionSize * entryPrice) / leverage;
  }

  /**
   * Check if position is at risk of liquidation
   */
  static isAtRiskOfLiquidation(
    marginRatio: number,
    warningThreshold: number = 0.1
  ): boolean {
    return marginRatio < warningThreshold;
  }
}
