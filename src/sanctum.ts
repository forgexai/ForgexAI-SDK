import axios from "axios";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type {
  SanctumLsdInfo,
  SanctumSwapQuote,
  SanctumSwapResult,
} from "./types";

const SANCTUM_API_BASE = "https://api.sanctum.so/v1";

/**
 * Client for interacting with Sanctum Liquid Staking Aggregator
 */
export class SanctumClient {
  private connection: Connection;
  private apiKey?: string;

  /**
   * Create a new Sanctum client instance
   * @param connection - Solana connection
   * @param apiKey - Optional Sanctum API key for higher rate limits
   */
  constructor(connection: Connection, apiKey?: string) {
    this.connection = connection;
    this.apiKey = apiKey;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /**
   * Get APY information for all supported LSDs
   * @returns Array of LSD tokens with APY and other metrics
   */
  async getAllLsdYields(): Promise<SanctumLsdInfo[]> {
    try {
      const response = await axios.get(`${SANCTUM_API_BASE}/lsds`, {
        headers: this.getHeaders(),
      });
      return response.data.lsds.map((lsd: any) => ({
        token: lsd.symbol,
        mint: lsd.mint,
        apy: lsd.apy * 100,
        tvl: lsd.tvl,
        protocol: lsd.protocol,
        stakingStrategy: lsd.strategy,
      }));
    } catch (error) {
      console.error("Error fetching Sanctum LSD yields:", error);
      throw new Error(
        `Failed to fetch LSD yields: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get APY for a specific LSD token
   * @param tokenSymbol - Symbol of the LSD token (e.g., "mSOL", "jitoSOL", "bSOL")
   * @returns LSD information including APY
   */
  async getLsdYield(tokenSymbol: string): Promise<SanctumLsdInfo> {
    try {
      const allLsds = await this.getAllLsdYields();
      const lsd = allLsds.find(
        (l) => l.token.toLowerCase() === tokenSymbol.toLowerCase()
      );

      if (!lsd) {
        throw new Error(`LSD token ${tokenSymbol} not found`);
      }

      return lsd;
    } catch (error) {
      console.error(`Error fetching yield for ${tokenSymbol}:`, error);
      throw new Error(
        `Failed to fetch yield for ${tokenSymbol}: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get a quote for swapping between two LSD tokens
   * @param params - Swap parameters
   * @param params.fromMint - Source token mint address
   * @param params.toMint - Destination token mint address
   * @param params.amount - Amount to swap in base units (lamports)
   * @param params.slippageBps - Slippage tolerance in basis points (e.g., 50 for 0.5%)
   * @returns Swap quote information
   */
  async getSwapQuote({
    fromMint,
    toMint,
    amount,
    slippageBps = 50,
  }: {
    fromMint: string;
    toMint: string;
    amount: string;
    slippageBps?: number;
  }): Promise<SanctumSwapQuote> {
    try {
      const response = await axios.post(
        `${SANCTUM_API_BASE}/swap/quote`,
        {
          inputMint: fromMint,
          outputMint: toMint,
          amount,
          slippageBps,
        },
        { headers: this.getHeaders() }
      );

      return {
        fromMint,
        toMint,
        inAmount: amount,
        outAmount: response.data.outAmount,
        price: response.data.price,
        priceImpact: response.data.priceImpact,
        fee: response.data.fee,
        routeType: response.data.routeType,
        slippageBps,
      };
    } catch (error) {
      console.error("Error getting Sanctum swap quote:", error);
      throw new Error(`Failed to get swap quote: ${(error as Error).message}`);
    }
  }

  /**
   * Create swap transaction between LSD tokens
   * @param params - Swap parameters
   * @param params.quote - Swap quote obtained from getSwapQuote
   * @param params.walletAddress - User's wallet address
   * @returns Serialized transaction and other relevant information
   */
  async createSwapTransaction({
    quote,
    walletAddress,
  }: {
    quote: SanctumSwapQuote;
    walletAddress: string;
  }): Promise<SanctumSwapResult> {
    try {
      const response = await axios.post(
        `${SANCTUM_API_BASE}/swap/prepare`,
        {
          inputMint: quote.fromMint,
          outputMint: quote.toMint,
          amount: quote.inAmount,
          slippageBps: quote.slippageBps,
          userPublicKey: walletAddress,
        },
        { headers: this.getHeaders() }
      );

      const { transaction, blockhash } = response.data;

      return {
        transaction,
        blockhash,
        expectedOutAmount: quote.outAmount,
      };
    } catch (error) {
      console.error("Error creating Sanctum swap transaction:", error);
      throw new Error(
        `Failed to create swap transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Execute an LSD swap transaction
   * @param params - Swap execution parameters
   * @param params.quote - Swap quote obtained from getSwapQuote
   * @param params.walletAddress - User's wallet address as string
   * @param params.signTransaction - Function to sign the transaction
   * @returns Transaction signature
   */
  async executeLsdSwap({
    quote,
    walletAddress,
    signTransaction,
  }: {
    quote: SanctumSwapQuote;
    walletAddress: string;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
  }): Promise<string> {
    try {
      const swapResult = await this.createSwapTransaction({
        quote,
        walletAddress,
      });

      const transaction = Transaction.from(
        Buffer.from(swapResult.transaction, "base64")
      );

      transaction.feePayer = new PublicKey(walletAddress);

      const signedTransaction = await signTransaction(transaction);

      const txid = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: false }
      );

      return txid;
    } catch (error) {
      console.error("Error executing Sanctum swap:", error);
      throw new Error(`Failed to execute swap: ${(error as Error).message}`);
    }
  }

  /**
   * Get all supported LSD tokens
   * @returns Array of supported LSD tokens
   */
  async getSupportedLsds(): Promise<
    Array<{ symbol: string; mint: string; protocol: string }>
  > {
    try {
      const lsds = await this.getAllLsdYields();
      return lsds.map((lsd) => ({
        symbol: lsd.token,
        mint: lsd.mint,
        protocol: lsd.protocol,
      }));
    } catch (error) {
      console.error("Error fetching supported LSDs:", error);
      throw new Error(
        `Failed to fetch supported LSDs: ${(error as Error).message}`
      );
    }
  }
}
