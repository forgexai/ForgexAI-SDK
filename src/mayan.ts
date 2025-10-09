import axios from "axios";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type {
  MayanQuote,
  MayanSwapResult,
  MayanTrackingResult,
  MayanTokenInfo,
} from "./types";

const MAYAN_API_BASE_URL = "https://api.mayan.finance";

/**
 * Client for interacting with Mayan Finance Cross-Chain Swap API
 */
export class MayanClient {
  private connection: Connection;

  /**
   * Creates a new instance of the MayanClient
   * @param connection - Solana connection
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Fetch a quote for a cross-chain swap
   *
   * @param params - Parameters for fetching the quote
   * @param params.amountIn64 - Amount to swap in base units (e.g. "250000000" for 250 USDC)
   * @param params.fromToken - Source token address/contract
   * @param params.toToken - Destination token address/contract
   * @param params.fromChain - Source blockchain ("solana", "ethereum", "bsc", etc.)
   * @param params.toChain - Destination blockchain ("solana", "ethereum", "bsc", etc.)
   * @param params.slippageBps - Slippage tolerance in basis points or "auto"
   * @param params.gasDrop - Optional amount of native token to receive on destination chain
   * @param params.referrer - Optional referrer address
   * @param params.referrerBps - Optional referrer fee in basis points
   * @returns Promise resolving to an array of quotes
   */
  async fetchQuote({
    amountIn64,
    fromToken,
    toToken,
    fromChain,
    toChain,
    slippageBps = "auto",
    gasDrop,
    referrer,
    referrerBps,
  }: {
    amountIn64: string;
    fromToken: string;
    toToken: string;
    fromChain: string;
    toChain: string;
    slippageBps?: string | number;
    gasDrop?: number;
    referrer?: string;
    referrerBps?: number;
  }): Promise<MayanQuote[]> {
    try {
      const params: Record<string, any> = {
        amountIn64,
        fromToken,
        toToken,
        fromChain,
        toChain,
        slippageBps,
      };

      if (gasDrop !== undefined) {
        params.gasDrop = gasDrop;
      }

      if (referrer) {
        params.referrer = referrer;
      }

      if (referrerBps !== undefined) {
        params.referrerBps = referrerBps;
      }

      const response = await axios.get(`${MAYAN_API_BASE_URL}/v3/quote`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Mayan quote:", error);
      throw new Error(
        `Failed to fetch Mayan quote: ${(error as Error).message}`
      );
    }
  }

  /**
   * Prepare and execute a swap transaction from Solana to another chain
   *
   * @param quote - The quote to use for the swap
   * @param originWalletAddress - Source wallet address on Solana
   * @param destinationWalletAddress - Destination wallet address on the target chain
   * @param referrerAddresses - Optional object containing referrer addresses for different chains
   * @param signTransaction - Function to sign the transaction
   * @returns Promise resolving to the swap transaction
   */
  async swapFromSolana(
    quote: MayanQuote,
    originWalletAddress: string,
    destinationWalletAddress: string,
    referrerAddresses?: { evm?: string; solana?: string; sui?: string },
    signTransaction?: (transaction: Transaction) => Promise<Transaction>
  ): Promise<MayanSwapResult> {
    try {
      const instructions = await this.createSwapFromSolanaInstructions(
        quote,
        originWalletAddress,
        destinationWalletAddress,
        referrerAddresses
      );

      const transaction = new Transaction().add(...instructions);

      transaction.recentBlockhash = (
        await this.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = new PublicKey(originWalletAddress);

      let signedTransaction = transaction;
      if (signTransaction) {
        signedTransaction = await signTransaction(transaction);
      }

      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      return {
        txHash: signature,
        status: "submitted",
      };
    } catch (error) {
      console.error("Error executing Mayan swap from Solana:", error);
      throw new Error(
        `Failed to execute Mayan swap: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create instructions for a swap from Solana to another chain
   *
   * @param quote - The quote to use for the swap
   * @param originWalletAddress - Source wallet address on Solana
   * @param destinationWalletAddress - Destination wallet address on the target chain
   * @param referrerAddresses - Optional object containing referrer addresses for different chains
   * @returns Promise resolving to the transaction instructions
   */
  async createSwapFromSolanaInstructions(
    quote: MayanQuote,
    originWalletAddress: string,
    destinationWalletAddress: string,
    referrerAddresses?: { evm?: string; solana?: string; sui?: string }
  ): Promise<any[]> {
    try {
      const response = await axios.post(
        `${MAYAN_API_BASE_URL}/v3/swap/solana/instructions`,
        {
          quote,
          originWalletAddress,
          destinationWalletAddress,
          referrerAddresses,
        }
      );

      return response.data.instructions;
    } catch (error) {
      console.error("Error creating Mayan swap instructions:", error);
      throw new Error(
        `Failed to create Mayan swap instructions: ${(error as Error).message}`
      );
    }
  }

  /**
   * Track the status of a swap
   *
   * @param txHash - Transaction hash of the swap
   * @returns Promise resolving to the tracking result
   */
  async trackSwap(txHash: string): Promise<MayanTrackingResult> {
    try {
      const response = await axios.get(
        `${MAYAN_API_BASE_URL}/v3/track/${txHash}`
      );
      return response.data;
    } catch (error) {
      console.error("Error tracking Mayan swap:", error);
      throw new Error(
        `Failed to track Mayan swap: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get list of supported tokens
   *
   * @param chain - Optional chain to filter tokens by
   * @returns Promise resolving to an array of supported tokens
   */
  async getSupportedTokens(chain?: string): Promise<MayanTokenInfo[]> {
    try {
      const params: Record<string, any> = {};
      if (chain) {
        params.chain = chain;
      }

      const response = await axios.get(`${MAYAN_API_BASE_URL}/v3/tokens`, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Mayan supported tokens:", error);
      throw new Error(
        `Failed to fetch Mayan supported tokens: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get list of supported chains
   *
   * @returns Promise resolving to an array of supported chains
   */
  async getSupportedChains(): Promise<string[]> {
    try {
      const response = await axios.get(`${MAYAN_API_BASE_URL}/v3/chains`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Mayan supported chains:", error);
      throw new Error(
        `Failed to fetch Mayan supported chains: ${(error as Error).message}`
      );
    }
  }
}
