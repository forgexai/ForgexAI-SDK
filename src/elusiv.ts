import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountIdempotent } from "@solana/spl-token";
import {
  Elusiv,
  getTokenInfo,
  SEED_MESSAGE,
  airdropToken,
  TokenType,
} from "@elusiv/sdk";
import { sign } from "@noble/ed25519";
import { Cluster } from "@solana/web3.js";

export interface ElusivPrivateTransferParams {
  amount: number;
  recipient: PublicKey;
  token: TokenType;
  memo?: string;
}

export interface ElusivTopUpParams {
  amount: number;
  token: TokenType;
}

export interface ElusivWithdrawParams {
  amount: number;
  token: TokenType;
  recipient: PublicKey;
}

export interface ElusivBalanceInfo {
  token: TokenType;
  publicBalance: bigint;
  privateBalance: bigint;
  formattedPublicBalance: string;
  formattedPrivateBalance: string;
  decimals: number;
}

export interface ElusivTransactionResult {
  signature: string;
  explorerUrl: string;
  isPrivate: boolean;
}

export interface ElusivConfig {
  cluster: "mainnet-beta" | "devnet" | "testnet";
  commitment?: "processed" | "confirmed" | "finalized";
}

/**
 * Elusiv Client for Zero-Knowledge Private Transactions on Solana
 *
 * Enables private SPL token transfers using zero-knowledge proofs.
 * Users can deposit tokens into a private pool and transfer them
 * without revealing sender/receiver information on-chain.
 */
export class ElusivClient {
  private connection: Connection;
  private cluster: Cluster;
  private elusivInstance?: Elusiv;
  private keypair?: Keypair;
  private config: ElusivConfig;

  constructor(connection: Connection, config: ElusivConfig) {
    this.connection = connection;
    this.cluster = config.cluster;
    this.config = config;
  }

  /**
   * Initialize the Elusiv instance with a user's keypair
   * This must be called before performing any private operations
   */
  public async initialize(keypair: Keypair): Promise<void> {
    try {
      this.keypair = keypair;

      // Generate seed for Elusiv instance
      const seed = await sign(
        Buffer.from(SEED_MESSAGE, "utf-8"),
        keypair.secretKey.slice(0, 32)
      );

      // Create Elusiv instance
      this.elusivInstance = await Elusiv.getElusivInstance(
        seed,
        keypair.publicKey,
        this.connection,
        this.cluster
      );

      console.log(
        `Elusiv instance initialized for ${keypair.publicKey.toBase58()}`
      );
    } catch (error) {
      console.error("Failed to initialize Elusiv:", error);
      throw new Error(`Elusiv initialization failed: ${error}`);
    }
  }

  /**
   * Get supported tokens by Elusiv protocol
   */
  public getSupportedTokens(): TokenType[] {
    return [
      "LAMPORTS",
      "USDC",
      "USDT",
      "mSOL",
      "stSOL",
      "BONK",
      "SEND",
    ] as TokenType[];
  }

  /**
   * Get token information for a supported currency
   */
  public getTokenInfo(token: TokenType) {
    try {
      return getTokenInfo(token);
    } catch (error) {
      throw new Error(`Failed to get token info for ${token}: ${error}`);
    }
  }

  /**
   * Get both public and private balances for a token
   */
  public async getBalances(token: TokenType): Promise<ElusivBalanceInfo> {
    if (!this.elusivInstance || !this.keypair) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(token);
      const decimals = tokenInfo.decimals;
      const divisor = BigInt(10 ** decimals);

      // Get private balance
      const privateBalance = await this.elusivInstance.getLatestPrivateBalance(
        token
      );

      // Get public balance
      let publicBalance = BigInt(0);
      if (token === "LAMPORTS") {
        publicBalance = BigInt(
          await this.connection.getBalance(this.keypair.publicKey)
        );
      } else {
        try {
          const mintAddress =
            this.cluster === "devnet"
              ? tokenInfo.mintDevnet
              : tokenInfo.mintMainnet;
          const ata = await createAssociatedTokenAccountIdempotent(
            this.connection,
            this.keypair,
            mintAddress,
            this.keypair.publicKey,
            { commitment: this.config.commitment || "confirmed" }
          );

          const tokenAccount = await this.connection.getTokenAccountBalance(
            ata
          );
          publicBalance = BigInt(tokenAccount.value.amount);
        } catch {
          // ATA doesn't exist or no balance
          publicBalance = BigInt(0);
        }
      }

      return {
        token,
        publicBalance,
        privateBalance,
        formattedPublicBalance: (
          Number(publicBalance) / Number(divisor)
        ).toString(),
        formattedPrivateBalance: (
          Number(privateBalance) / Number(divisor)
        ).toString(),
        decimals,
      };
    } catch (error) {
      throw new Error(`Failed to get balances for ${token}: ${error}`);
    }
  }

  /**
   * Top up private balance by depositing from public balance
   */
  public async topUpPrivateBalance(
    params: ElusivTopUpParams
  ): Promise<ElusivTransactionResult> {
    if (!this.elusivInstance || !this.keypair) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(params.token);
      const lamportAmount = params.amount * 10 ** tokenInfo.decimals;

      console.log(
        `Topping up ${params.amount} ${params.token} to private balance...`
      );

      const topupTx = await this.elusivInstance.buildTopUpTx(
        lamportAmount,
        params.token
      );
      topupTx.tx.partialSign(this.keypair);

      const result = await this.elusivInstance.sendElusivTx(topupTx);

      return {
        signature: result.signature,
        explorerUrl: this.getExplorerUrl(result.signature),
        isPrivate: false, // Top-up is a public transaction
      };
    } catch (error) {
      throw new Error(`Failed to top up private balance: ${error}`);
    }
  }

  /**
   * Send a private transfer to another wallet
   */
  public async sendPrivateTransfer(
    params: ElusivPrivateTransferParams
  ): Promise<ElusivTransactionResult> {
    if (!this.elusivInstance || !this.keypair) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(params.token);
      const lamportAmount = params.amount * 10 ** tokenInfo.decimals;

      // Check private balance
      const privateBalance = await this.elusivInstance.getLatestPrivateBalance(
        params.token
      );
      if (privateBalance < BigInt(lamportAmount)) {
        throw new Error(
          `Insufficient private balance. Have: ${privateBalance}, Need: ${lamportAmount}`
        );
      }

      console.log(
        `Sending ${params.amount} ${
          params.token
        } privately to ${params.recipient.toBase58()}...`
      );

      const sendTx = await this.elusivInstance.buildSendTx(
        lamportAmount,
        params.recipient,
        params.token
      );

      const result = await this.elusivInstance.sendElusivTx(sendTx);

      return {
        signature: result.signature,
        explorerUrl: this.getExplorerUrl(result.signature),
        isPrivate: true,
      };
    } catch (error) {
      throw new Error(`Failed to send private transfer: ${error}`);
    }
  }

  /**
   * Withdraw from private balance to public balance
   */
  public async withdrawFromPrivate(
    params: ElusivWithdrawParams
  ): Promise<ElusivTransactionResult> {
    if (!this.elusivInstance || !this.keypair) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(params.token);
      const lamportAmount = params.amount * 10 ** tokenInfo.decimals;

      // Check private balance
      const privateBalance = await this.elusivInstance.getLatestPrivateBalance(
        params.token
      );
      if (privateBalance < BigInt(lamportAmount)) {
        throw new Error(
          `Insufficient private balance. Have: ${privateBalance}, Need: ${lamportAmount}`
        );
      }

      console.log(
        `Withdrawing ${params.amount} ${params.token} from private balance...`
      );

      const sendTx = await this.elusivInstance.buildSendTx(
        lamportAmount,
        params.recipient,
        params.token
      );

      const result = await this.elusivInstance.sendElusivTx(sendTx);

      return {
        signature: result.signature,
        explorerUrl: this.getExplorerUrl(result.signature),
        isPrivate: true,
      };
    } catch (error) {
      throw new Error(`Failed to withdraw from private balance: ${error}`);
    }
  }

  /**
   * Verify if a transaction maintains privacy (sender not visible on-chain)
   */
  public async verifyTransactionPrivacy(signature: string): Promise<{
    isPrivate: boolean;
    senderInTransaction: boolean;
    accounts: string[];
  }> {
    if (!this.keypair) {
      throw new Error("Keypair not available for verification");
    }

    try {
      const txDetail = await this.connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!txDetail) {
        throw new Error("Transaction not found");
      }

      const readonly = txDetail.meta?.loadedAddresses?.readonly ?? [];
      const writable = txDetail.meta?.loadedAddresses?.writable ?? [];
      const allAccounts = [...new Set([...readonly, ...writable])];

      const accountStrings = allAccounts.map((pubKey) => pubKey.toBase58());
      const senderInTransaction = accountStrings.includes(
        this.keypair.publicKey.toBase58()
      );

      return {
        isPrivate: !senderInTransaction,
        senderInTransaction,
        accounts: accountStrings,
      };
    } catch (error) {
      throw new Error(`Failed to verify transaction privacy: ${error}`);
    }
  }

  /**
   * Get transaction history for the user (public transactions only)
   * Private transactions cannot be traced back to the sender
   */
  public async getTransactionHistory(limit: number = 10): Promise<any[]> {
    if (!this.keypair) {
      throw new Error("Keypair not available");
    }

    try {
      const signatures = await this.connection.getSignaturesForAddress(
        this.keypair.publicKey,
        { limit }
      );

      return signatures;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error}`);
    }
  }

  /**
   * Airdrop test tokens for devnet testing
   */
  public async airdropTestTokens(
    token: TokenType,
    amount: number
  ): Promise<void> {
    if (this.cluster !== "devnet") {
      throw new Error("Airdrop only available on devnet");
    }

    if (!this.keypair) {
      throw new Error("Keypair not available");
    }

    try {
      const tokenInfo = this.getTokenInfo(token);
      const lamportAmount = amount * 10 ** tokenInfo.decimals;

      if (token === "LAMPORTS") {
        // Airdrop SOL
        const signature = await this.connection.requestAirdrop(
          this.keypair.publicKey,
          lamportAmount
        );
        await this.connection.confirmTransaction(signature);
        console.log(`Airdropped ${amount} SOL`);
      } else {
        // Airdrop SPL token
        const mintAddress = tokenInfo.mintDevnet;
        const ata = await createAssociatedTokenAccountIdempotent(
          this.connection,
          this.keypair,
          mintAddress,
          this.keypair.publicKey,
          { commitment: this.config.commitment || "confirmed" }
        );

        await airdropToken(token, lamportAmount, ata);
        console.log(`Airdropped ${amount} ${token}`);
      }
    } catch (error) {
      throw new Error(`Failed to airdrop test tokens: ${error}`);
    }
  }

  /**
   * Get explorer URL for a transaction
   */
  private getExplorerUrl(signature: string): string {
    const clusterParam =
      this.cluster === "mainnet-beta" ? "" : `?cluster=${this.cluster}`;
    return `https://explorer.solana.com/tx/${signature}${clusterParam}`;
  }

  /**
   * Get the Elusiv instance (for advanced usage)
   */
  public getElusivInstance(): Elusiv | undefined {
    return this.elusivInstance;
  }

  /**
   * Check if Elusiv is initialized
   */
  public isInitialized(): boolean {
    return !!this.elusivInstance && !!this.keypair;
  }
}

export default ElusivClient;
