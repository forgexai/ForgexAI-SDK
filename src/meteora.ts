import axios from "axios";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import type {
  MeteoraVaultInfo,
  MeteoraDepositResult,
  MeteoraVault,
} from "./types";

const METEORA_API_BASE = "https://api.meteora.ag/v1";

/**
 * Client for interacting with Meteora liquidity vaults and pools
 */
export class MeteoraClient {
  private connection: Connection;
  private apiKey?: string;

  /**
   * Create a new Meteora client instance
   * @param connection - Solana connection
   * @param apiKey - Optional Meteora API key for higher rate limits
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
      headers["x-api-key"] = this.apiKey;
    }
    return headers;
  }

  /**
   * Get all available Meteora vaults
   * @returns Array of vault information
   */
  async getAllVaults(): Promise<MeteoraVault[]> {
    try {
      const response = await axios.get(`${METEORA_API_BASE}/vaults`, {
        headers: this.getHeaders(),
      });

      return response.data.vaults.map((vault: any) => ({
        address: vault.address,
        name: vault.name,
        tokenA: {
          mint: vault.tokenA.mint,
          symbol: vault.tokenA.symbol,
          decimals: vault.tokenA.decimals,
        },
        tokenB: {
          mint: vault.tokenB.mint,
          symbol: vault.tokenB.symbol,
          decimals: vault.tokenB.decimals,
        },
        tvl: vault.tvl,
        apr: vault.apr,
        strategyType: vault.strategyType,
      }));
    } catch (error) {
      console.error("Error fetching Meteora vaults:", error);
      throw new Error(`Failed to fetch vaults: ${(error as Error).message}`);
    }
  }

  /**
   * Get detailed information for a specific vault
   * @param vaultAddress - The address of the vault
   * @returns Detailed vault information including performance metrics
   */
  async getVaultPerformance(vaultAddress: string): Promise<MeteoraVaultInfo> {
    try {
      const response = await axios.get(
        `${METEORA_API_BASE}/vaults/${vaultAddress}`,
        {
          headers: this.getHeaders(),
        }
      );

      const vault = response.data;

      return {
        address: vault.address,
        name: vault.name,
        tokenA: {
          mint: vault.tokenA.mint,
          symbol: vault.tokenA.symbol,
          decimals: vault.tokenA.decimals,
        },
        tokenB: {
          mint: vault.tokenB.mint,
          symbol: vault.tokenB.symbol,
          decimals: vault.tokenB.decimals,
        },
        tvl: vault.tvl,
        apr: vault.apr,
        apy: vault.apy,
        volume24h: vault.volume24h,
        fees24h: vault.fees24h,
        strategyType: vault.strategyType,
        feesTier: vault.feesTier,
        drawdown: vault.drawdown || 0,
        sharePriceHistory: vault.sharePriceHistory || [],
        lpTokenMint: vault.lpTokenMint,
      };
    } catch (error) {
      console.error(`Error fetching Meteora vault ${vaultAddress}:`, error);
      throw new Error(
        `Failed to fetch vault info: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a deposit transaction for a Meteora vault
   * @param params - Deposit parameters
   * @param params.vaultAddress - The address of the target vault
   * @param params.walletAddress - User's wallet address
   * @param params.amountA - Amount of token A to deposit (in base units)
   * @param params.amountB - Amount of token B to deposit (in base units)
   * @returns Transaction information for depositing to the vault
   */
  async createDepositTransaction({
    vaultAddress,
    walletAddress,
    amountA,
    amountB,
  }: {
    vaultAddress: string;
    walletAddress: string;
    amountA: string;
    amountB: string;
  }): Promise<MeteoraDepositResult> {
    try {
      const response = await axios.post(
        `${METEORA_API_BASE}/vaults/${vaultAddress}/deposit`,
        {
          userWallet: walletAddress,
          amountA,
          amountB,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        expectedLpAmount: response.data.expectedLpAmount,
        blockhash: response.data.blockhash,
      };
    } catch (error) {
      console.error("Error creating Meteora deposit transaction:", error);
      throw new Error(
        `Failed to create deposit transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a withdrawal transaction from a Meteora vault
   * @param params - Withdrawal parameters
   * @param params.vaultAddress - The address of the target vault
   * @param params.walletAddress - User's wallet address
   * @param params.lpAmount - Amount of LP tokens to withdraw (in base units)
   * @returns Transaction information for withdrawing from the vault
   */
  async createWithdrawTransaction({
    vaultAddress,
    walletAddress,
    lpAmount,
  }: {
    vaultAddress: string;
    walletAddress: string;
    lpAmount: string;
  }): Promise<MeteoraDepositResult> {
    try {
      const response = await axios.post(
        `${METEORA_API_BASE}/vaults/${vaultAddress}/withdraw`,
        {
          userWallet: walletAddress,
          lpAmount,
        },
        { headers: this.getHeaders() }
      );

      return {
        transaction: response.data.transaction,
        expectedAmountA: response.data.expectedAmountA,
        expectedAmountB: response.data.expectedAmountB,
        blockhash: response.data.blockhash,
      };
    } catch (error) {
      console.error("Error creating Meteora withdrawal transaction:", error);
      throw new Error(
        `Failed to create withdrawal transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Execute a vault deposit or withdrawal transaction
   * @param params - Execution parameters
   * @param params.transactionData - Transaction data from createDepositTransaction or createWithdrawTransaction
   * @param params.walletAddress - User's wallet address
   * @param params.signTransaction - Function to sign the transaction
   * @returns Transaction signature
   */
  async executeVaultTransaction({
    transactionData,
    walletAddress,
    signTransaction,
  }: {
    transactionData: MeteoraDepositResult;
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
      console.error("Error executing Meteora vault transaction:", error);
      throw new Error(
        `Failed to execute vault transaction: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get user's positions in Meteora vaults
   * @param walletAddress - User's wallet address
   * @returns Array of user's vault positions
   */
  async getUserPositions(walletAddress: string): Promise<
    Array<{
      vaultAddress: string;
      vaultName: string;
      lpBalance: string;
      valueUsd: number;
      tokenAAmount: string;
      tokenBAmount: string;
      share: number;
    }>
  > {
    try {
      const response = await axios.get(
        `${METEORA_API_BASE}/users/${walletAddress}/positions`,
        {
          headers: this.getHeaders(),
        }
      );

      return response.data.positions;
    } catch (error) {
      console.error(
        `Error fetching Meteora positions for ${walletAddress}:`,
        error
      );
      throw new Error(`Failed to fetch positions: ${(error as Error).message}`);
    }
  }
}
