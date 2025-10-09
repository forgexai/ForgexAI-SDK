import axios from "axios";
import { Connection } from "@solana/web3.js";

const RAYDIUM_API_BASE = "https://api-v3.raydium.io";
const RAYDIUM_SWAP_API = "https://transaction-v1.raydium.io";

export interface RaydiumSwapQuote {
  id: string;
  success: boolean;
  version: string;
  msg?: string;
  data: {
    swapType: "BaseIn" | "BaseOut";
    inputMint: string;
    inputAmount: string;
    outputMint: string;
    outputAmount: string;
    otherAmountThreshold: string;
    slippageBps: number;
    priceImpactPct: number;
    routePlan: Array<{
      poolId: string;
      inputMint: string;
      outputMint: string;
      feeMint: string;
      feeRate: number;
      feeAmount: string;
    }>;
  };
}

export interface RaydiumSwapResult {
  id: string;
  version: string;
  success: boolean;
  data: Array<{
    transaction: string;
  }>;
}

export interface RaydiumPriorityFee {
  id: string;
  success: boolean;
  data: {
    default: {
      vh: number;
      h: number;
      m: number;
    };
  };
}

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

export interface RaydiumSwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps: number;
  txVersion?: "V0" | "LEGACY";
}

export interface RaydiumTransactionParams {
  computeUnitPriceMicroLamports: string;
  swapResponse: RaydiumSwapQuote;
  txVersion: "V0" | "LEGACY";
  wallet: string;
  wrapSol?: boolean;
  unwrapSol?: boolean;
  inputAccount?: string;
  outputAccount?: string;
}

export class RaydiumClient {
  constructor(private connection: Connection) {}

  /**
   * Get swap quote for exact input amount (swap-base-in)
   */
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50,
    txVersion: "V0" | "LEGACY" = "V0"
  ): Promise<RaydiumSwapQuote> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        txVersion,
      });

      const response = await axios.get<RaydiumSwapQuote>(
        `${RAYDIUM_SWAP_API}/compute/swap-base-in?${params.toString()}`
      );

      if (!response.data.success) {
        throw new Error(
          `Raydium API error: ${response.data.msg || "Unknown error"}`
        );
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get Raydium quote: ${
          error.response?.data?.msg || error.message
        }`
      );
    }
  }

  /**
   * Get swap quote for exact output amount (swap-base-out)
   */
  async getSwapQuoteExactOut(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50,
    txVersion: "V0" | "LEGACY" = "V0"
  ): Promise<RaydiumSwapQuote> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        txVersion,
      });

      const response = await axios.get<RaydiumSwapQuote>(
        `${RAYDIUM_SWAP_API}/compute/swap-base-out?${params.toString()}`
      );

      if (!response.data.success) {
        throw new Error(
          `Raydium API error: ${response.data.msg || "Unknown error"}`
        );
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get Raydium quote: ${
          error.response?.data?.msg || error.message
        }`
      );
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    quote: RaydiumSwapQuote,
    userPublicKey: string,
    options: {
      wrapSol?: boolean;
      unwrapSol?: boolean;
      inputAccount?: string;
      outputAccount?: string;
      priorityFee?: "auto" | "vh" | "h" | "m" | number;
      txVersion?: "V0" | "LEGACY";
    } = {}
  ): Promise<RaydiumSwapResult> {
    try {
      const {
        wrapSol = false,
        unwrapSol = false,
        priorityFee = "h",
        txVersion = "V0",
        inputAccount,
        outputAccount,
      } = options;

      let computeUnitPriceMicroLamports: string;
      if (typeof priorityFee === "number") {
        computeUnitPriceMicroLamports = priorityFee.toString();
      } else if (priorityFee === "auto") {
        const feeData = await this.getPriorityFee();
        computeUnitPriceMicroLamports = feeData.data.default.h.toString();
      } else {
        const feeData = await this.getPriorityFee();
        computeUnitPriceMicroLamports =
          feeData.data.default[priorityFee].toString();
      }

      const swapType = quote.data.swapType.toLowerCase();
      const endpoint = `${RAYDIUM_SWAP_API}/transaction/swap-base-${
        swapType === "basein" ? "in" : "out"
      }`;

      const response = await axios.post<RaydiumSwapResult>(endpoint, {
        computeUnitPriceMicroLamports,
        swapResponse: quote,
        txVersion,
        wallet: userPublicKey,
        wrapSol,
        unwrapSol,
        inputAccount,
        outputAccount,
      });

      if (!response.data.success) {
        throw new Error(`Failed to build swap transaction`);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build swap transaction: ${
          error.response?.data?.msg || error.message
        }`
      );
    }
  }

  /**
   * Get priority fee recommendations
   */
  async getPriorityFee(): Promise<RaydiumPriorityFee> {
    try {
      const response = await axios.get<RaydiumPriorityFee>(
        `${RAYDIUM_API_BASE}/main/auto-fee`
      );

      if (!response.data.success) {
        throw new Error("Failed to get priority fee");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get priority fee: ${error.message}`);
    }
  }

  /**
   * Get token price from Raydium
   */
  async getTokenPrice(
    tokenMint: string
  ): Promise<{ price: number; symbol?: string }> {
    try {
      const response = await axios.get(
        `${RAYDIUM_API_BASE}/mint/price?mints=${tokenMint}`
      );

      const data = response.data.data;
      if (!data || !data[tokenMint]) {
        throw new Error("Token price not found");
      }

      return {
        price: data[tokenMint],
        symbol: tokenMint,
      };
    } catch (error: any) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }

  /**
   * Get multiple token prices
   */
  async getMultipleTokenPrices(
    tokenMints: string[]
  ): Promise<Record<string, { price: number; symbol?: string }>> {
    try {
      const mints = tokenMints.join(",");
      const response = await axios.get(
        `${RAYDIUM_API_BASE}/mint/price?mints=${mints}`
      );

      const result: Record<string, { price: number; symbol?: string }> = {};
      const data = response.data.data;

      for (const mint of tokenMints) {
        if (data[mint]) {
          result[mint] = {
            price: data[mint],
            symbol: mint,
          };
        }
      }

      return result;
    } catch (error: any) {
      throw new Error(`Failed to get token prices: ${error.message}`);
    }
  }

  /**
   * Get token list from Raydium
   */
  async getTokenList(): Promise<TokenInfo[]> {
    try {
      const response = await axios.get(`${RAYDIUM_API_BASE}/mint/list`);
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get token list: ${error.message}`);
    }
  }

  /**
   * Get token info by mint addresses
   */
  async getTokenInfo(mints: string[]): Promise<Record<string, TokenInfo>> {
    try {
      const mintList = mints.join(",");
      const response = await axios.get(
        `${RAYDIUM_API_BASE}/mint/ids?ids=${mintList}`
      );

      return response.data.data || {};
    } catch (error: any) {
      throw new Error(`Failed to get token info: ${error.message}`);
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
}
