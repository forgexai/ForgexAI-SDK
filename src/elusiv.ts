import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
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

      const seed = await sign(
        Buffer.from(SEED_MESSAGE, "utf-8"),
        keypair.secretKey.slice(0, 32)
      );

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
   * Get or create associated token account (idempotent)
   * Returns existing ATA if it exists, creates new one if it doesn't
   */
  private async getOrCreateAssociatedTokenAccount(
    mint: PublicKey,
    owner: PublicKey,
    payer: Keypair
  ): Promise<PublicKey> {
    try {
      // Get the associated token address
      const associatedTokenAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        owner
      );

      // Try to get account info to see if it exists
      const accountInfo = await this.connection.getAccountInfo(
        associatedTokenAddress
      );

      if (accountInfo) {
        // Account already exists, return it
        return associatedTokenAddress;
      }

      // Account doesn't exist, create it
      const transaction = new Transaction().add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          associatedTokenAddress,
          owner,
          payer.publicKey
        )
      );

      const signature = await this.connection.sendTransaction(transaction, [
        payer,
      ]);
      await this.connection.confirmTransaction(
        signature,
        this.config.commitment || "confirmed"
      );

      return associatedTokenAddress;
    } catch (error) {
      console.error("Error in getOrCreateAssociatedTokenAccount:", error);
      throw error;
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

      const privateBalance = await this.elusivInstance.getLatestPrivateBalance(
        token
      );

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

          const ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mintAddress,
            this.keypair.publicKey
          );

          const tokenAccount = await this.connection.getTokenAccountBalance(
            ata,
            this.config.commitment || "confirmed"
          );
          publicBalance = BigInt(tokenAccount.value.amount);
        } catch {
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
        isPrivate: false,
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
        const signature = await this.connection.requestAirdrop(
          this.keypair.publicKey,
          lamportAmount
        );
        await this.connection.confirmTransaction(signature);
        console.log(`Airdropped ${amount} SOL`);
      } else {
        const mintAddress = tokenInfo.mintDevnet;
        const ata = await this.getOrCreateAssociatedTokenAccount(
          mintAddress,
          this.keypair.publicKey,
          this.keypair
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

  /**
   * Get all account balances (public and private) for all supported tokens
   */
  public async getAllBalances(): Promise<ElusivBalanceInfo[]> {
    if (!this.elusivInstance || !this.keypair) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    const tokens = this.getSupportedTokens();
    const balances: ElusivBalanceInfo[] = [];

    for (const token of tokens) {
      try {
        const balance = await this.getBalances(token);
        balances.push(balance);
      } catch (error) {
        console.error(`Error fetching balance for ${token}:`, error);
      }
    }

    return balances;
  }

  /**
   * Estimate transaction fee for a private transfer
   */
  public async estimatePrivateTransferFee(
    token: TokenType,
    amount: number
  ): Promise<{ fee: number; feeInSOL: string }> {
    if (!this.elusivInstance) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(token);
      const lamportAmount = amount * 10 ** tokenInfo.decimals;

      // Elusiv transactions typically cost around 0.001-0.002 SOL
      // This is an estimate as exact fees depend on network conditions
      const estimatedFee = 1_500_000; // 0.0015 SOL in lamports

      return {
        fee: estimatedFee,
        feeInSOL: (estimatedFee / 1e9).toString(),
      };
    } catch (error) {
      throw new Error(`Failed to estimate fee: ${error}`);
    }
  }

  /**
   * Check if sufficient private balance exists for a transfer
   */
  public async canSendPrivateTransfer(
    token: TokenType,
    amount: number
  ): Promise<{ canSend: boolean; currentBalance: string; required: string }> {
    if (!this.elusivInstance) {
      throw new Error("Elusiv not initialized. Call initialize() first.");
    }

    try {
      const tokenInfo = this.getTokenInfo(token);
      const lamportAmount = amount * 10 ** tokenInfo.decimals;
      const privateBalance = await this.elusivInstance.getLatestPrivateBalance(
        token
      );

      return {
        canSend: privateBalance >= BigInt(lamportAmount),
        currentBalance: (
          Number(privateBalance) /
          10 ** tokenInfo.decimals
        ).toString(),
        required: amount.toString(),
      };
    } catch (error) {
      throw new Error(`Failed to check transfer eligibility: ${error}`);
    }
  }
}

export default ElusivClient;
