import axios from "axios";
import { Connection } from "@solana/web3.js";

const JUPITER_API_V6 = "https://quote-api.jup.ag/v6";
const JUPITER_PRICE_API = "https://price.jup.ag/v4";
const JUPITER_TOKEN_API = "https://token.jup.ag";

export interface JupiterSwapQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}

export interface JupiterSwapResult {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
}

export interface JupiterTokenInfo {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags: string[];
  daily_volume?: number;
  created_at?: string;
  freeze_authority?: string;
  mint_authority?: string;
}

export interface JupiterPriceData {
  [mintAddress: string]: {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
  };
}

export interface JupiterSwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
  platformFeeBps?: number;
  maxAccounts?: number;
}

export interface JupiterTransactionParams {
  quoteResponse: JupiterSwapQuote;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  feeAccount?: string;
  computeUnitPriceMicroLamports?: string | number;
  prioritizationFeeLamports?: string | number;
  asLegacyTransaction?: boolean;
  useTokenLedger?: boolean;
  dynamicComputeUnitLimit?: boolean;
}

export class JupiterClient {
  constructor(private connection: Connection) {}

  /**
   * Get swap quote from Jupiter aggregator
   */
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    options: {
      slippageBps?: number;
      onlyDirectRoutes?: boolean;
      asLegacyTransaction?: boolean;
      platformFeeBps?: number;
      maxAccounts?: number;
    } = {}
  ): Promise<JupiterSwapQuote> {
    try {
      const {
        slippageBps = 50,
        onlyDirectRoutes = false,
        asLegacyTransaction = false,
        platformFeeBps,
        maxAccounts,
      } = options;

      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: onlyDirectRoutes.toString(),
        asLegacyTransaction: asLegacyTransaction.toString(),
      });

      if (platformFeeBps) {
        params.append("platformFeeBps", platformFeeBps.toString());
      }
      if (maxAccounts) {
        params.append("maxAccounts", maxAccounts.toString());
      }

      const response = await axios.get<JupiterSwapQuote>(
        `${JUPITER_API_V6}/quote?${params.toString()}`
      );

      if (!response.data) {
        throw new Error("No quote data received from Jupiter");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get Jupiter quote: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    quote: JupiterSwapQuote,
    userPublicKey: string,
    options: {
      wrapAndUnwrapSol?: boolean;
      useSharedAccounts?: boolean;
      feeAccount?: string;
      computeUnitPriceMicroLamports?: string | number;
      prioritizationFeeLamports?: string | number;
      asLegacyTransaction?: boolean;
      useTokenLedger?: boolean;
      dynamicComputeUnitLimit?: boolean;
    } = {}
  ): Promise<JupiterSwapResult> {
    try {
      const {
        wrapAndUnwrapSol = true,
        useSharedAccounts = true,
        feeAccount,
        computeUnitPriceMicroLamports,
        prioritizationFeeLamports = "auto",
        asLegacyTransaction = false,
        useTokenLedger = false,
        dynamicComputeUnitLimit = true,
      } = options;

      const requestBody: JupiterTransactionParams = {
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol,
        useSharedAccounts,
        dynamicComputeUnitLimit,
        prioritizationFeeLamports,
        asLegacyTransaction,
        useTokenLedger,
      };

      if (feeAccount) {
        requestBody.feeAccount = feeAccount;
      }
      if (computeUnitPriceMicroLamports) {
        requestBody.computeUnitPriceMicroLamports =
          computeUnitPriceMicroLamports;
      }

      const response = await axios.post<JupiterSwapResult>(
        `${JUPITER_API_V6}/swap`,
        requestBody
      );

      if (!response.data) {
        throw new Error("No swap transaction data received from Jupiter");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build swap transaction: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  }

  /**
   * Get token price from Jupiter
   */
  async getTokenPrice(
    tokenMint: string,
    vsToken: string = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  ): Promise<{ price: number; mintSymbol: string; vsTokenSymbol: string }> {
    try {
      const response = await axios.get<JupiterPriceData>(
        `${JUPITER_PRICE_API}/price?ids=${tokenMint}&vsToken=${vsToken}`
      );

      const data = response.data[tokenMint];

      if (!data) {
        throw new Error("Token price not found");
      }

      return {
        price: data.price,
        mintSymbol: data.mintSymbol || tokenMint,
        vsTokenSymbol: data.vsTokenSymbol,
      };
    } catch (error: any) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }

  /**
   * Get multiple token prices
   */
  async getMultipleTokenPrices(
    tokenMints: string[],
    vsToken: string = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
  ): Promise<JupiterPriceData> {
    try {
      const ids = tokenMints.join(",");
      const response = await axios.get<{ data: JupiterPriceData }>(
        `${JUPITER_PRICE_API}/price?ids=${ids}&vsToken=${vsToken}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token prices: ${error.message}`);
    }
  }

  /**
   * Get all tokens available on Jupiter
   */
  async getTokenList(): Promise<JupiterTokenInfo[]> {
    try {
      const response = await axios.get<JupiterTokenInfo[]>(
        `${JUPITER_TOKEN_API}/all`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get token list: ${error.message}`);
    }
  }

  /**
   * Get strict token list (more curated)
   */
  async getStrictTokenList(): Promise<JupiterTokenInfo[]> {
    try {
      const response = await axios.get<JupiterTokenInfo[]>(
        `${JUPITER_TOKEN_API}/strict`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get strict token list: ${error.message}`);
    }
  }

  /**
   * Get route map for available swaps
   */
  async getRouteMap(): Promise<Record<string, string[]>> {
    try {
      const response = await axios.get<Record<string, string[]>>(
        `${JUPITER_API_V6}/indexed-route-map`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get route map: ${error.message}`);
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
   * Calculate price impact percentage
   */
  static calculatePriceImpact(
    inputAmount: number,
    outputAmount: number,
    marketPrice: number
  ): number {
    const expectedOutput = inputAmount * marketPrice;
    return ((expectedOutput - outputAmount) / expectedOutput) * 100;
  }
}
