import axios from "axios";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type {
  MarginfiPosition,
  MarginfiMarketInfo,
  MarginfiAction,
} from "./types";

const MARGINFI_API_BASE = "https://api.marginfi.com/v1";

/**
 * Client for interacting with MarginFi lending protocol
 */
export class MarginfiClient {
  private connection: Connection;
  private apiKey?: string;

  /**
   * Create a new MarginFi client instance
   * @param connection - Solana connection
   * @param apiKey - Optional MarginFi API key for higher rate limits
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
   * Get user's lending positions across protocols
   * @param walletAddress - User's wallet address
   * @returns User's lending position information
   */
  async getUserPositions(walletAddress: string): Promise<MarginfiPosition> {
    try {
      const response = await axios.get(
        `${MARGINFI_API_BASE}/accounts/${walletAddress}`,
        {
          headers: this.getHeaders(),
        }
      );

      const position = response.data;

      return {
        account: position.account,
        owner: position.owner,
        healthFactor: position.healthFactor,
        netValue: position.netValue,
        totalBorrowedValue: position.totalBorrowedValue,
        totalSuppliedValue: position.totalSuppliedValue,
        assets: position.assets.map((asset: any) => ({
          tokenSymbol: asset.tokenSymbol,
          tokenMint: asset.tokenMint,
          tokenPrice: asset.tokenPrice,
          depositBalance: asset.depositBalance,
          depositValue: asset.depositValue,
          borrowBalance: asset.borrowBalance,
          borrowValue: asset.borrowValue,
          netBalance: asset.netBalance,
          netValue: asset.netValue,
        })),
      };
    } catch (error) {
      console.error(
        `Error fetching MarginFi positions for ${walletAddress}:`,
        error
      );
      throw new Error(`Failed to fetch positions: ${(error as Error).message}`);
    }
  }

  /**
   * Get information about available lending markets
   * @returns Array of lending market information
   */
  async getMarkets(): Promise<MarginfiMarketInfo[]> {
    try {
      const response = await axios.get(`${MARGINFI_API_BASE}/markets`, {
        headers: this.getHeaders(),
      });

      return response.data.markets.map((market: any) => ({
        tokenMint: market.tokenMint,
        tokenSymbol: market.tokenSymbol,
        tokenName: market.tokenName,
        supplyApy: market.supplyApy,
        borrowApy: market.borrowApy,
        totalSupply: market.totalSupply,
        totalBorrow: market.totalBorrow,
        availableLiquidity: market.availableLiquidity,
        price: market.price,
        borrowCap: market.borrowCap,
        supplyCap: market.supplyCap,
        ltv: market.ltv,
      }));
    } catch (error) {
      console.error("Error fetching MarginFi markets:", error);
      throw new Error(`Failed to fetch markets: ${(error as Error).message}`);
    }
  }

  /**
   * Create a deposit transaction
   * @param params - Deposit parameters
   * @param params.walletAddress - User's wallet address
   * @param params.tokenMint - Token mint address to deposit
   * @param params.amount - Amount to deposit in base units
   * @returns Transaction information
   */
  async createDepositTransaction({
    walletAddress,
    tokenMint,
    amount,
  }: {
    walletAddress: string;
    tokenMint: string;
    amount: string;
  }): Promise<MarginfiAction> {
    try {
      const response = await axios.post(
        `${MARGINFI_API_BASE}/transactions/deposit`,
        {
          wallet: walletAddress,
          tokenMint,
          amount,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        blockhash: response.data.blockhash,
        expectedBalance: response.data.expectedBalance,
      };
    } catch (error) {
      console.error("Error creating MarginFi deposit transaction:", error);
      throw new Error(
        `Failed to create deposit transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a withdraw transaction
   * @param params - Withdraw parameters
   * @param params.walletAddress - User's wallet address
   * @param params.tokenMint - Token mint address to withdraw
   * @param params.amount - Amount to withdraw in base units
   * @returns Transaction information
   */
  async createWithdrawTransaction({
    walletAddress,
    tokenMint,
    amount,
  }: {
    walletAddress: string;
    tokenMint: string;
    amount: string;
  }): Promise<MarginfiAction> {
    try {
      const response = await axios.post(
        `${MARGINFI_API_BASE}/transactions/withdraw`,
        {
          wallet: walletAddress,
          tokenMint,
          amount,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        blockhash: response.data.blockhash,
        expectedBalance: response.data.expectedBalance,
      };
    } catch (error) {
      console.error("Error creating MarginFi withdraw transaction:", error);
      throw new Error(
        `Failed to create withdraw transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a borrow transaction
   * @param params - Borrow parameters
   * @param params.walletAddress - User's wallet address
   * @param params.tokenMint - Token mint address to borrow
   * @param params.amount - Amount to borrow in base units
   * @returns Transaction information
   */
  async createBorrowTransaction({
    walletAddress,
    tokenMint,
    amount,
  }: {
    walletAddress: string;
    tokenMint: string;
    amount: string;
  }): Promise<MarginfiAction> {
    try {
      const response = await axios.post(
        `${MARGINFI_API_BASE}/transactions/borrow`,
        {
          wallet: walletAddress,
          tokenMint,
          amount,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        blockhash: response.data.blockhash,
        expectedBalance: response.data.expectedBalance,
      };
    } catch (error) {
      console.error("Error creating MarginFi borrow transaction:", error);
      throw new Error(
        `Failed to create borrow transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a repay transaction
   * @param params - Repay parameters
   * @param params.walletAddress - User's wallet address
   * @param params.tokenMint - Token mint address to repay
   * @param params.amount - Amount to repay in base units
   * @returns Transaction information
   */
  async createRepayTransaction({
    walletAddress,
    tokenMint,
    amount,
  }: {
    walletAddress: string;
    tokenMint: string;
    amount: string;
  }): Promise<MarginfiAction> {
    try {
      const response = await axios.post(
        `${MARGINFI_API_BASE}/transactions/repay`,
        {
          wallet: walletAddress,
          tokenMint,
          amount,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        blockhash: response.data.blockhash,
        expectedBalance: response.data.expectedBalance,
      };
    } catch (error) {
      console.error("Error creating MarginFi repay transaction:", error);
      throw new Error(
        `Failed to create repay transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Execute a MarginFi transaction (deposit, withdraw, borrow, or repay)
   * @param params - Execution parameters
   * @param params.transactionData - Transaction data from one of the create*Transaction methods
   * @param params.walletAddress - User's wallet address
   * @param params.signTransaction - Function to sign the transaction
   * @returns Transaction signature
   */
  async executeTransaction({
    transactionData,
    walletAddress,
    signTransaction,
  }: {
    transactionData: MarginfiAction;
    walletAddress: string;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
  }): Promise<string> {
    try {
      const transaction = Transaction.from(
        Buffer.from(transactionData.transaction, "base64")
      );

      transaction.feePayer = new PublicKey(walletAddress);

      const signedTransaction = await signTransaction(transaction);

      const txid = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        { skipPreflight: false }
      );

      return txid;
    } catch (error) {
      console.error("Error executing MarginFi transaction:", error);
      throw new Error(
        `Failed to execute transaction: ${(error as Error).message}`
      );
    }
  }
}
