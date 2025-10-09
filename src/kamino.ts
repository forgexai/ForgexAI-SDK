import axios from "axios";
import { Connection } from "@solana/web3.js";

const KLEND_API = "https://api.kamino.finance";

export interface KaminoLoanHealth {
  healthFactor: number;
  totalDeposit: number;
  totalBorrow: number;
  maxBorrow: number;
  borrowUtilization: number;
  walletAddress: string;
  deposits: Array<{
    mint: string;
    symbol: string;
    amount: number;
    value: number;
    apy: number;
    ltv: number;
  }>;
  borrows: Array<{
    mint: string;
    symbol: string;
    amount: number;
    value: number;
    apy: number;
    liquidationThreshold: number;
  }>;
  liquidationPrice?: number;
  timestamp: number;
}

export interface KaminoMarket {
  address: string;
  name: string;
  reserves: Array<{
    mintAddress: string;
    symbol: string;
    decimals: number;
    supplyApy: number;
    borrowApy: number;
    totalSupply: number;
    totalBorrow: number;
    reserveLiquiditySupply: number;
    utilizationRate: number;
    ltv: number;
    liquidationThreshold: number;
    liquidationBonus: number;
    minBorrowRate: number;
    optimalBorrowRate: number;
    maxBorrowRate: number;
    optimalUtilizationRate: number;
    reserveBorrowLimitUsd?: number;
    reserveDepositLimitUsd?: number;
  }>;
}

export interface KaminoObligation {
  address: string;
  market: string;
  owner: string;
  deposits: Array<{
    mintAddress: string;
    amount: string;
    marketValue: number;
  }>;
  borrows: Array<{
    mintAddress: string;
    amount: string;
    marketValue: number;
  }>;
  borrowedValueUsd: number;
  depositedValueUsd: number;
  allowedBorrowValueUsd: number;
  unhealthyBorrowValueUsd: number;
  healthFactor: number;
}

export interface KaminoTransactionParams {
  market: string;
  reserve: string;
  amount: number;
  userPublicKey: string;
  obligation?: string;
}

export interface KaminoTransactionResult {
  transaction: string;
  message?: string;
}

export class KaminoClient {
  constructor(private connection: Connection) {}

  /**
   * Get loan health factor and detailed position info
   */
  async getLoanHealth(
    walletAddress: string,
    marketAddress?: string
  ): Promise<KaminoLoanHealth> {
    try {
      const response = await axios.get(
        `${KLEND_API}/users/${walletAddress}/obligations`
      );

      if (!response.data || response.data.length === 0) {
        return {
          healthFactor: 999,
          totalDeposit: 0,
          totalBorrow: 0,
          maxBorrow: 0,
          borrowUtilization: 0,
          walletAddress,
          deposits: [],
          borrows: [],
          timestamp: Date.now(),
        };
      }

      const obligations = marketAddress
        ? response.data.filter((ob: any) => ob.market === marketAddress)
        : response.data;

      if (obligations.length === 0) {
        return {
          healthFactor: 999,
          totalDeposit: 0,
          totalBorrow: 0,
          maxBorrow: 0,
          borrowUtilization: 0,
          walletAddress,
          deposits: [],
          borrows: [],
          timestamp: Date.now(),
        };
      }

      const obligation = obligations[0];
      const deposits = obligation.deposits || [];
      const borrows = obligation.borrows || [];

      const marketData = await this.getMarketData(obligation.market);
      const reserveMap = new Map(
        marketData.reserves.map((r) => [r.mintAddress, r])
      );

      const enrichedDeposits = deposits.map((d: any) => {
        const reserve = reserveMap.get(d.mintAddress);
        return {
          mint: d.mintAddress,
          symbol: reserve?.symbol || "Unknown",
          amount: parseFloat(d.amount),
          value: d.marketValue || 0,
          apy: reserve?.supplyApy || 0,
          ltv: reserve?.ltv || 0,
        };
      });

      const enrichedBorrows = borrows.map((b: any) => {
        const reserve = reserveMap.get(b.mintAddress);
        return {
          mint: b.mintAddress,
          symbol: reserve?.symbol || "Unknown",
          amount: parseFloat(b.amount),
          value: b.marketValue || 0,
          apy: reserve?.borrowApy || 0,
          liquidationThreshold: reserve?.liquidationThreshold || 0,
        };
      });

      const totalDeposit = obligation.depositedValueUsd || 0;
      const totalBorrow = obligation.borrowedValueUsd || 0;
      const maxBorrow = obligation.allowedBorrowValueUsd || 0;
      const borrowUtilization =
        maxBorrow > 0 ? (totalBorrow / maxBorrow) * 100 : 0;

      return {
        healthFactor: obligation.healthFactor || 999,
        totalDeposit,
        totalBorrow,
        maxBorrow,
        borrowUtilization,
        walletAddress,
        deposits: enrichedDeposits,
        borrows: enrichedBorrows,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error("Failed to get loan health:", error);
      throw new Error(
        `Failed to get loan health: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get market data including all reserves and their APYs
   */
  async getMarketData(marketAddress: string): Promise<KaminoMarket> {
    try {
      const response = await axios.get(`${KLEND_API}/markets/${marketAddress}`);

      if (!response.data) {
        throw new Error("Market data not found");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get market data: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get all available markets
   */
  async getMarkets(): Promise<KaminoMarket[]> {
    try {
      const response = await axios.get(`${KLEND_API}/markets`);
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get Kamino markets: ${error.message}`);
    }
  }

  /**
   * Build supply/deposit transaction
   */
  async buildSupplyTransaction(
    params: KaminoTransactionParams
  ): Promise<KaminoTransactionResult> {
    try {
      const response = await axios.post(`${KLEND_API}/transactions/supply`, {
        market: params.market,
        reserve: params.reserve,
        amount: params.amount.toString(),
        userPublicKey: params.userPublicKey,
        obligation: params.obligation,
      });

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build supply transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build supply transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build withdraw transaction
   */
  async buildWithdrawTransaction(
    params: KaminoTransactionParams
  ): Promise<KaminoTransactionResult> {
    try {
      const response = await axios.post(`${KLEND_API}/transactions/withdraw`, {
        market: params.market,
        reserve: params.reserve,
        amount: params.amount.toString(),
        userPublicKey: params.userPublicKey,
        obligation: params.obligation,
      });

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build withdraw transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build withdraw transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build borrow transaction
   */
  async buildBorrowTransaction(
    params: KaminoTransactionParams
  ): Promise<KaminoTransactionResult> {
    try {
      const response = await axios.post(`${KLEND_API}/transactions/borrow`, {
        market: params.market,
        reserve: params.reserve,
        amount: params.amount.toString(),
        userPublicKey: params.userPublicKey,
        obligation: params.obligation,
      });

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build borrow transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build borrow transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build repay transaction
   */
  async buildRepayTransaction(
    params: KaminoTransactionParams
  ): Promise<KaminoTransactionResult> {
    try {
      const response = await axios.post(`${KLEND_API}/transactions/repay`, {
        market: params.market,
        reserve: params.reserve,
        amount: params.amount.toString(),
        userPublicKey: params.userPublicKey,
        obligation: params.obligation,
      });

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build repay transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build repay transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get historical APY data for a reserve
   */
  async getHistoricalApy(
    marketAddress: string,
    reserveAddress: string,
    days: number = 30
  ): Promise<
    Array<{ timestamp: number; supplyApy: number; borrowApy: number }>
  > {
    try {
      const response = await axios.get(
        `${KLEND_API}/markets/${marketAddress}/reserves/${reserveAddress}/history?days=${days}`
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get historical APY: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Utility method to convert amount to raw amount considering token decimals
   */
  static toRawAmount(amount: number, decimals: number): number {
    return Math.floor(amount * Math.pow(10, decimals));
  }

  /**
   * Utility method to convert raw amount to human readable amount
   */
  static fromRawAmount(rawAmount: string | number, decimals: number): number {
    return Number(rawAmount) / Math.pow(10, decimals);
  }

  /**
   * Calculate liquidation price for a position
   */
  static calculateLiquidationPrice(
    collateralValue: number,
    borrowValue: number,
    liquidationThreshold: number
  ): number {
    if (borrowValue === 0) return 0;
    return borrowValue / (collateralValue * liquidationThreshold);
  }

  /**
   * Check if position is at risk of liquidation
   */
  static isAtRiskOfLiquidation(
    healthFactor: number,
    warningThreshold: number = 1.3
  ): boolean {
    return healthFactor < warningThreshold;
  }
}
