import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
  Signer,
} from "@solana/web3.js";
import { HermesClient } from "@pythnetwork/hermes-client";
import {
  PythSolanaReceiver,
  InstructionWithEphemeralSigners,
  PythTransactionBuilder,
} from "@pythnetwork/pyth-solana-receiver";

/**
 * Custom Wallet interface that's compatible with both transaction types
 */
export interface CompatibleWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]>;
}

/**
 * Price feed data structure
 */
export interface PythPrice {
  price: string;
  conf: string;
  exponent: number;
  publishTime: number;
}

/**
 * Price update options
 */
export interface PriceUpdateOptions {
  closeUpdateAccounts?: boolean;
  computeUnitPriceMicroLamports?: number;
  skipPreflight?: boolean;
}

/**
 * Price feed account configuration
 */
export interface PriceFeedAccountConfig {
  shardId: number; // 0-65535, use different shards to avoid congestion
  priceFeedId: string; // Hex string of price feed ID
}

/**
 * Comprehensive Pyth Network Service for Solana
 * Handles real-time price feeds and price feed account management
 *
 * @author Vairamuthu M
 * @version 2.0.0
 */
export class PythSolanaService {
  private connection: Connection;
  private wallet: CompatibleWallet;
  private hermesClient: HermesClient;
  private pythReceiver: PythSolanaReceiver;
  private hermesUrl: string;

  /**
   * Well-known Pyth price feed IDs
   */
  static readonly PRICE_FEED_IDS = {
    BTC_USD:
      "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43",
    ETH_USD:
      "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    SOL_USD:
      "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
    USDC_USD:
      "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a",
    USDT_USD:
      "0x2b89b9dc8fdf9f34709a5b106b472f0f39bb6ca9ce04b0fd7f2e971688e2e53b",
    BNB_USD:
      "0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f",
    AVAX_USD:
      "0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7",
    MATIC_USD:
      "0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52",
    ARB_USD:
      "0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5",
  };

  /**
   * Default Hermes endpoints
   */
  static readonly HERMES_ENDPOINTS = {
    PUBLIC: "https://hermes.pyth.network/",
    STABLE: "https://hermes-beta.pyth.network/",
  };

  /**
   * Initialize Pyth Solana Service
   * @param connection Solana RPC connection
   * @param wallet Compatible wallet for signing transactions
   * @param hermesUrl Custom Hermes URL (optional)
   */
  constructor(
    connection: Connection,
    wallet: CompatibleWallet,
    hermesUrl: string = PythSolanaService.HERMES_ENDPOINTS.PUBLIC
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.hermesUrl = hermesUrl;

    // Initialize Hermes client for fetching price updates
    this.hermesClient = new HermesClient(hermesUrl, {
      timeout: 30000,
      httpRetries: 3,
    });

    // Initialize Pyth Solana receiver with compatible wallet
    this.pythReceiver = new PythSolanaReceiver({
      connection,
      wallet: wallet as any, // Cast to satisfy the type requirement
    });
  }

  // ============================================
  // PRICE FEED ACCOUNTS (Continuous Updates)
  // ============================================

  /**
   * Get price feed account address for a given price feed ID
   * Uses program-derived addresses for deterministic account lookup
   */
  getPriceFeedAccountAddress(config: PriceFeedAccountConfig): PublicKey {
    try {
      return this.pythReceiver.getPriceFeedAccountAddress(
        config.shardId,
        config.priceFeedId
      );
    } catch (error) {
      throw this.handleError("getPriceFeedAccountAddress", error);
    }
  }

  /**
   * Get multiple price feed account addresses
   */
  getMultiplePriceFeedAddresses(
    configs: PriceFeedAccountConfig[]
  ): PublicKey[] {
    try {
      return configs.map((config) => this.getPriceFeedAccountAddress(config));
    } catch (error) {
      throw this.handleError("getMultiplePriceFeedAddresses", error);
    }
  }

  /**
   * Get price feed account for commonly used feeds on shard 0
   */
  getSponsoredFeedAddress(
    symbol: keyof typeof PythSolanaService.PRICE_FEED_IDS
  ): PublicKey {
    try {
      const priceFeedId = PythSolanaService.PRICE_FEED_IDS[symbol];
      return this.getPriceFeedAccountAddress({
        shardId: 0, // Sponsored feeds are on shard 0
        priceFeedId,
      });
    } catch (error) {
      throw this.handleError("getSponsoredFeedAddress", error);
    }
  }

  /**
   * Fetch price feed account data
   */
  async fetchPriceFeedAccount(config: PriceFeedAccountConfig) {
    try {
      return await this.pythReceiver.fetchPriceFeedAccount(
        config.shardId,
        config.priceFeedId
      );
    } catch (error) {
      throw this.handleError("fetchPriceFeedAccount", error);
    }
  }

  // ============================================
  // PRICE UPDATES (Ephemeral Accounts)
  // ============================================

  /**
   * Fetch latest price updates from Hermes
   */
  async fetchLatestPriceUpdates(
    priceFeedIds: string[],
    encoding: "hex" | "base64" = "base64"
  ): Promise<string[]> {
    try {
      const priceUpdates = await this.hermesClient.getLatestPriceUpdates(
        priceFeedIds,
        { encoding }
      );
      return priceUpdates.binary.data;
    } catch (error) {
      throw this.handleError("fetchLatestPriceUpdates", error);
    }
  }

  /**
   * Fetch price updates at a specific timestamp
   * Fixed: Using correct method name
   */
  async fetchPriceUpdatesAtTimestamp(
    priceFeedIds: string[],
    publishTime: number,
    encoding: "hex" | "base64" = "base64"
  ): Promise<string[]> {
    try {
      const priceUpdates = await this.hermesClient.getPriceUpdatesAtTimestamp(
        publishTime,
        priceFeedIds,
        { encoding }
      );
      return priceUpdates.binary.data;
    } catch (error) {
      throw this.handleError("fetchPriceUpdatesAtTimestamp", error);
    }
  }

  /**
   * Get streaming price updates
   */
  async getStreamingPriceUpdates(
    priceFeedIds: string[],
    options?: {
      encoding?: "hex" | "base64";
      parsed?: boolean;
      allowUnordered?: boolean;
      benchmarksOnly?: boolean;
    }
  ): Promise<EventSource> {
    try {
      return await this.hermesClient.getPriceUpdatesStream(
        priceFeedIds,
        options
      );
    } catch (error) {
      throw this.handleError("getStreamingPriceUpdates", error);
    }
  }

  /**
   * Post price updates to Solana and execute custom instructions
   */
  async postPriceUpdatesWithInstructions(
    priceUpdateData: string[],
    instructionBuilder: (
      getPriceUpdateAccount: (priceFeedId: string) => PublicKey
    ) => Promise<InstructionWithEphemeralSigners[]>,
    options: PriceUpdateOptions = {}
  ): Promise<string[]> {
    try {
      const transactionBuilder = this.pythReceiver.newTransactionBuilder({
        closeUpdateAccounts: options.closeUpdateAccounts ?? true,
      });

      // Add price updates to transaction
      await transactionBuilder.addPostPriceUpdates(priceUpdateData);

      // Add custom instructions
      await transactionBuilder.addPriceConsumerInstructions(instructionBuilder);

      // Build and send transactions
      const transactions = await transactionBuilder.buildVersionedTransactions({
        computeUnitPriceMicroLamports:
          options.computeUnitPriceMicroLamports ?? 50000,
      });

      const signatures = await this.pythReceiver.provider.sendAll(
        transactions,
        { skipPreflight: options.skipPreflight ?? true }
      );

      return signatures;
    } catch (error) {
      throw this.handleError("postPriceUpdatesWithInstructions", error);
    }
  }

  /**
   * Post partially verified price updates (faster but less secure)
   */
  async postPartiallyVerifiedPriceUpdates(
    priceUpdateData: string[],
    instructionBuilder: (
      getPriceUpdateAccount: (priceFeedId: string) => PublicKey
    ) => Promise<InstructionWithEphemeralSigners[]>,
    options: PriceUpdateOptions = {}
  ): Promise<string[]> {
    try {
      const transactionBuilder = this.pythReceiver.newTransactionBuilder({
        closeUpdateAccounts: options.closeUpdateAccounts ?? true,
      });

      // Add partially verified price updates
      await transactionBuilder.addPostPartiallyVerifiedPriceUpdates(
        priceUpdateData
      );

      // Add custom instructions
      await transactionBuilder.addPriceConsumerInstructions(instructionBuilder);

      // Build and send transactions
      const transactions = await transactionBuilder.buildVersionedTransactions({
        computeUnitPriceMicroLamports:
          options.computeUnitPriceMicroLamports ?? 50000,
      });

      const signatures = await this.pythReceiver.provider.sendAll(
        transactions,
        { skipPreflight: options.skipPreflight ?? true }
      );

      return signatures;
    } catch (error) {
      throw this.handleError("postPartiallyVerifiedPriceUpdates", error);
    }
  }

  /**
   * Simple price update without custom instructions
   */
  async postPriceUpdates(
    priceUpdateData: string[],
    options: PriceUpdateOptions = {}
  ): Promise<string[]> {
    return this.postPriceUpdatesWithInstructions(
      priceUpdateData,
      async () => [],
      options
    );
  }

  /**
   * Update price feed accounts (continuous feeds)
   */
  async updatePriceFeeds(
    priceUpdateData: string[],
    shardId: number = 0,
    options: PriceUpdateOptions = {}
  ): Promise<string[]> {
    try {
      const transactionBuilder = this.pythReceiver.newTransactionBuilder({
        closeUpdateAccounts: options.closeUpdateAccounts ?? true,
      });

      // Add update price feed instructions
      await transactionBuilder.addUpdatePriceFeed(priceUpdateData, shardId);

      // Build and send transactions
      const transactions = await transactionBuilder.buildVersionedTransactions({
        computeUnitPriceMicroLamports:
          options.computeUnitPriceMicroLamports ?? 50000,
      });

      const signatures = await this.pythReceiver.provider.sendAll(
        transactions,
        { skipPreflight: options.skipPreflight ?? true }
      );

      return signatures;
    } catch (error) {
      throw this.handleError("updatePriceFeeds", error);
    }
  }

  // ============================================
  // TWAP (Time-Weighted Average Price)
  // ============================================

  /**
   * Fetch latest TWAP updates from Hermes
   */
  async fetchLatestTwaps(
    priceFeedIds: string[],
    windowSeconds: number,
    encoding: "hex" | "base64" = "base64"
  ): Promise<string[]> {
    try {
      // Validate window (max 600 seconds / 10 minutes)
      if (windowSeconds <= 0 || windowSeconds > 600) {
        throw new Error("TWAP window must be between 1 and 600 seconds");
      }

      const twapUpdates = await this.hermesClient.getLatestTwaps(
        priceFeedIds,
        windowSeconds,
        { encoding }
      );
      return twapUpdates.binary.data;
    } catch (error) {
      throw this.handleError("fetchLatestTwaps", error);
    }
  }

  // ============================================
  // PRICE FEED METADATA
  // ============================================

  /**
   * Get all available price feeds
   */
  async getAllPriceFeeds(options?: {
    query?: string;
    assetType?: "crypto" | "equity" | "fx" | "metal" | "rates";
  }): Promise<any> {
    try {
      return await this.hermesClient.getPriceFeeds(options);
    } catch (error) {
      throw this.handleError("getAllPriceFeeds", error);
    }
  }

  /**
   * Search for price feeds by query
   */
  async searchPriceFeeds(query: string): Promise<any> {
    try {
      return await this.hermesClient.getPriceFeeds({ query });
    } catch (error) {
      throw this.handleError("searchPriceFeeds", error);
    }
  }

  /**
   * Get price feeds by asset type
   */
  async getPriceFeedsByAssetType(
    assetType: "crypto" | "equity" | "fx" | "metal" | "rates"
  ): Promise<any> {
    try {
      return await this.hermesClient.getPriceFeeds({ assetType });
    } catch (error) {
      throw this.handleError("getPriceFeedsByAssetType", error);
    }
  }

  // ============================================
  // PUBLISHER CAPS
  // ============================================

  async getLatestPublisherCaps(options?: {
    encoding?: "hex" | "base64";
    parsed?: boolean;
  }): Promise<any> {
    return await this.hermesClient.getLatestPublisherCaps(options);
  }

  // ============================================
  // HIGH-LEVEL WORKFLOWS
  // ============================================

  /**
   * Fetch and post latest price updates in one call
   */
  async fetchAndPostPriceUpdates(
    priceFeedIds: string[],
    instructionBuilder: (
      getPriceUpdateAccount: (priceFeedId: string) => PublicKey
    ) => Promise<InstructionWithEphemeralSigners[]>,
    options: PriceUpdateOptions = {}
  ): Promise<{ priceData: string[]; signatures: string[] }> {
    try {
      const priceData = await this.fetchLatestPriceUpdates(priceFeedIds);
      const signatures = await this.postPriceUpdatesWithInstructions(
        priceData,
        instructionBuilder,
        options
      );
      return { priceData, signatures };
    } catch (error) {
      throw this.handleError("fetchAndPostPriceUpdates", error);
    }
  }

  /**
   * Fetch and update price feed accounts
   */
  async fetchAndUpdatePriceFeeds(
    priceFeedIds: string[],
    shardId: number = 0,
    options: PriceUpdateOptions = {}
  ): Promise<{ priceData: string[]; signatures: string[] }> {
    try {
      const priceData = await this.fetchLatestPriceUpdates(priceFeedIds);
      const signatures = await this.updatePriceFeeds(
        priceData,
        shardId,
        options
      );
      return { priceData, signatures };
    } catch (error) {
      throw this.handleError("fetchAndUpdatePriceFeeds", error);
    }
  }

  // ============================================
  // ACCOUNT MANAGEMENT
  // ============================================

  /**
   * Close previous encoded VAA accounts to recover rent
   */
  async closePreviousEncodedVaas(
    maxInstructions: number = 10
  ): Promise<string[]> {
    try {
      const transactionBuilder = this.pythReceiver.newTransactionBuilder({
        closeUpdateAccounts: true,
      });

      await transactionBuilder.addClosePreviousEncodedVaasInstructions(
        maxInstructions
      );

      const transactions = await transactionBuilder.buildVersionedTransactions({
        computeUnitPriceMicroLamports: 50000,
      });

      return await this.pythReceiver.provider.sendAll(transactions);
    } catch (error) {
      throw this.handleError("closePreviousEncodedVaas", error);
    }
  }

  /**
   * Find owned encoded VAA accounts
   */
  async findOwnedEncodedVaaAccounts(): Promise<PublicKey[]> {
    try {
      return await this.pythReceiver.findOwnedEncodedVaaAccounts();
    } catch (error) {
      throw this.handleError("findOwnedEncodedVaaAccounts", error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Convert hex price feed ID to byte array
   */
  static hexToBytes(hex: string): Uint8Array {
    if (hex.startsWith("0x")) {
      hex = hex.slice(2);
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  /**
   * Format price with decimals
   */
  static formatPrice(price: string, exponent: number): string {
    const priceNum = Number(price);
    const factor = Math.pow(10, Math.abs(exponent));
    return (priceNum / factor).toFixed(Math.abs(exponent));
  }

  /**
   * Validate TWAP window
   */
  static isValidTwapWindow(seconds: number): boolean {
    return seconds > 0 && seconds <= 600;
  }

  /**
   * Get all available price feed IDs
   */
  static getAllPriceFeedIds(): string[] {
    return Object.values(this.PRICE_FEED_IDS);
  }

  /**
   * Get price feed ID by symbol
   */
  static getPriceFeedId(
    symbol: keyof typeof PythSolanaService.PRICE_FEED_IDS
  ): string {
    return this.PRICE_FEED_IDS[symbol];
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get wallet
   */
  getWallet(): CompatibleWallet {
    return this.wallet;
  }

  /**
   * Get Hermes client
   */
  getHermesClient(): HermesClient {
    return this.hermesClient;
  }

  /**
   * Get Pyth receiver
   */
  getPythReceiver(): PythSolanaReceiver {
    return this.pythReceiver;
  }

  /**
   * Get Hermes URL
   */
  getHermesUrl(): string {
    return this.hermesUrl;
  }

  /**
   * Create new transaction builder
   */
  newTransactionBuilder(options?: {
    closeUpdateAccounts?: boolean;
  }): PythTransactionBuilder {
    return this.pythReceiver.newTransactionBuilder(options || {});
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  private handleError(method: string, error: any): Error {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error(`[PythSolanaService:${method}] Error:`, errorMessage);
    return new Error(`${method} failed: ${errorMessage}`);
  }
}

export default PythSolanaService;
