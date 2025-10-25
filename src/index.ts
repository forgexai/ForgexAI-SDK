// Protocol Services - Standardized naming convention
export { JupiterService } from "./jupiter";
export { KaminoService } from "./kamino";
export { TensorService } from "./tensor";
export { MarinadeService } from "./marinade";
export { DriftClient } from "./drift";
export { PythSolanaService } from "./pyth";
export { SquadsService } from "./squads";
export { RaydiumV2Service } from "./raydium";
export { MayanSolanaService } from "./mayan";
export { SanctumService } from "./sanctum";
export { MeteoraService } from "./meteora";
export { MarginfiService } from "./marginfi";
export { HeliusClient } from "./helius";
export { ElusivClient } from "./elusiv";
export { SolendClient } from "./solend";
export { BirdeyeClient } from "./birdeye";
export { ClockworkService } from "./clockwork";
export { CrossmintWalletService } from "./crossmint";
export { DexScreenerClient } from "./dexscreener";
export { DialectService } from "./dialect";
export { ShyftService } from "./shyft";

// Legacy exports for backward compatibility
export { JupiterService as JupiterClient } from "./jupiter";
export { KaminoService as KaminoClient } from "./kamino";
export { TensorService as TensorClient } from "./tensor";
export { MarinadeService as MarinadeClient } from "./marinade";
export { PythSolanaService as PythClient } from "./pyth";
export { SquadsService as SquadsClient } from "./squads";
export { RaydiumV2Service as RaydiumClient } from "./raydium";
export { MayanSolanaService as MayanClient } from "./mayan";
export { SanctumService as SanctumClient } from "./sanctum";
export { MeteoraService as MeteoraClient } from "./meteora";
export { MarginfiService as MarginfiClient } from "./marginfi";
export * from "./wallet";

export * from "./utils/connection";

// Type exports - Main SDK types
export type {
  SwapQuote,
  SwapResult,
  LoanHealth,
  NFTFloorPrice,
  StakingInfo,
  PerpPosition,
  PriceData,
  TransactionResult,
  TokenBalance,
  SDKError,
  SolanaNetwork,
  ConnectionConfig,
  SDKConfig,
  DeFiPortfolio,
  MarketOverview,
} from "./types";

// Protocol-specific type exports
export type {
  QuoteParams as JupiterQuoteParams,
  QuoteResponse as JupiterQuoteResponse,
  SwapRequest as JupiterSwapRequest,
  TokenInfo as JupiterTokenInfo,
  PriceResponse as JupiterPriceResponse,
} from "./jupiter";

export type { DexPair } from "./dexscreener";

import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { Wallet } from "@marinade.finance/marinade-ts-sdk";
import { JupiterService } from "./jupiter";
import { KaminoService } from "./kamino";
import { TensorService } from "./tensor";
import { MarinadeService } from "./marinade";
import { DriftClient } from "./drift";
import { PythSolanaService } from "./pyth";
import { SquadsService } from "./squads";
import { RaydiumV2Service } from "./raydium";
import { MayanSolanaService } from "./mayan";
import { SanctumService } from "./sanctum";
import { MeteoraService } from "./meteora";
import { MarginfiService } from "./marginfi";
import { HeliusClient } from "./helius";
import { ElusivClient } from "./elusiv";
import { SolendClient } from "./solend";
import { BirdeyeClient } from "./birdeye";
import { ClockworkService } from "./clockwork";
import { CrossmintWalletService } from "./crossmint";
import { DexScreenerClient } from "./dexscreener";
import { DialectService } from "./dialect";
import { ShyftService } from "./shyft";
import type { SDKConfig, SolanaNetwork } from "./types";

export class ForgeXSolanaSDK {
  public connection: Connection;
  public jupiter: JupiterService;
  public kamino: KaminoService;
  public tensor?: TensorService;
  public marinade?: MarinadeService;
  public drift: DriftClient;
  public pyth?: PythSolanaService;
  public squads?: SquadsService;
  public raydium?: RaydiumV2Service;
  public mayan?: MayanSolanaService;
  public sanctum?: SanctumService;
  public meteora?: MeteoraService;
  public marginfi?: MarginfiService;
  public helius: HeliusClient;
  public solend: SolendClient;
  public birdeye?: BirdeyeClient;
  public clockwork?: ClockworkService;
  public crossmint?: CrossmintWalletService;
  public dexscreener: DexScreenerClient;
  public dialect?: DialectService;
  public shyft?: ShyftService;

  constructor(config: SDKConfig) {
    const endpoint =
      config.connection.endpoint ||
      this.getDefaultEndpoint(config.connection.network);
    this.connection = new Connection(endpoint, {
      commitment: config.connection.commitment || "confirmed",
    });

    // Core working services (no wallet required)
    this.jupiter = new JupiterService({ connection: this.connection });
    this.kamino = new KaminoService(this.connection);
    this.drift = new DriftClient(this.connection);
    this.helius = new HeliusClient(
      this.connection,
      config.apiKeys?.helius || ""
    );
    this.solend = new SolendClient(this.connection);
    this.dexscreener = new DexScreenerClient();

    // Services with API key requirements
    if (config.apiKeys?.tensor) {
      this.tensor = new TensorService({
        connection: this.connection,
        apiKey: config.apiKeys.tensor,
      });
    }

    // Services requiring additional setup
    if (config.apiKeys?.squads) {
      this.squads = new SquadsService({
        connection: this.connection,
      });
    }

    if (config.apiKeys?.sanctum) {
      this.sanctum = new SanctumService(config.apiKeys.sanctum);
    }

    if (config.apiKeys?.meteora) {
      this.meteora = new MeteoraService(this.connection);
    }

    if (config.apiKeys?.marginfi) {
      this.marginfi = new MarginfiService(
        config.connection.endpoint ||
          this.getDefaultEndpoint(config.connection.network),
        "production"
      );
    }

    // Wallet-dependent services (will be initialized when wallet is connected)
    // Note: These services require a connected wallet to function properly
    // Call initializeWalletServices(wallet) after user connects their wallet

    if (config.apiKeys?.birdeye) {
      this.birdeye = new BirdeyeClient(config.apiKeys.birdeye);
    }

    if (config.apiKeys?.shyft) {
      this.shyft = new ShyftService(config.apiKeys.shyft);
    }

    if (config.apiKeys?.crossmint) {
      this.crossmint = new CrossmintWalletService({
        apiKey: config.apiKeys.crossmint.apiKey,
      });
    }

    if (config.apiKeys?.clockwork) {
      this.clockwork = new ClockworkService("mainnet-beta");
    }

    if (config.apiKeys?.dialect) {
      this.dialect = new DialectService(
        undefined,
        undefined,
        undefined,
        config.apiKeys.dialect
      );
    }
  }

  /**
   * Initialize wallet-dependent services after user connects their wallet
   * Call this method when the user connects their browser wallet
   */
  async initializeWalletServices(
    walletAdapter: any, // Browser wallet adapter (Phantom, Solflare, etc.)
    options?: {
      referralCode?: PublicKey;
      hermesUrl?: string;
    }
  ): Promise<void> {
    try {
      const walletPublicKey = walletAdapter.publicKey;
      if (!walletPublicKey) {
        throw new Error(
          "Wallet must be connected before initializing services"
        );
      }

      // Initialize Marinade with browser wallet
      if (!this.marinade) {
        try {
          // Create a Marinade-compatible wallet wrapper
          const marinadeWallet = {
            publicKey: walletPublicKey,
            signTransaction: walletAdapter.signTransaction?.bind(walletAdapter),
            signAllTransactions:
              walletAdapter.signAllTransactions?.bind(walletAdapter),
          } as Wallet;

          this.marinade = new MarinadeService(
            this.connection.rpcEndpoint,
            marinadeWallet,
            options?.referralCode
          );
        } catch (error) {
          console.warn("Failed to initialize Marinade service:", error);
        }
      }

      // Initialize Pyth with browser wallet
      if (!this.pyth) {
        try {
          // Create a Pyth-compatible wallet wrapper
          const pythWallet = {
            publicKey: walletPublicKey,
            signTransaction: walletAdapter.signTransaction?.bind(walletAdapter),
            signAllTransactions:
              walletAdapter.signAllTransactions?.bind(walletAdapter),
          };

          this.pyth = new PythSolanaService(
            this.connection,
            pythWallet,
            options?.hermesUrl
          );
        } catch (error) {
          console.warn("Failed to initialize Pyth service:", error);
        }
      }

      // Initialize Mayan with wallet public key
      if (!this.mayan) {
        try {
          this.mayan = new MayanSolanaService(this.connection, walletPublicKey);
        } catch (error) {
          console.warn("Failed to initialize Mayan service:", error);
        }
      }

      // Note: Raydium requires a Keypair (private key) which browser wallets don't expose
      // For security reasons, we cannot initialize Raydium with browser wallets
      // Users should use the Raydium web interface directly for trading
    } catch (error: any) {
      throw new Error(`Failed to initialize wallet services: ${error.message}`);
    }
  }

  /**
   * Check if wallet-dependent services are initialized
   */
  getWalletServicesStatus(): {
    marinade: boolean;
    pyth: boolean;
    mayan: boolean;
    raydium: boolean;
  } {
    return {
      marinade: !!this.marinade,
      pyth: !!this.pyth,
      mayan: !!this.mayan,
      raydium: !!this.raydium, // Will always be false for browser wallets
    };
  }

  /**
   * Disconnect wallet and clear wallet-dependent services
   */
  disconnectWallet(): void {
    this.marinade = undefined;
    this.pyth = undefined;
    this.mayan = undefined;
    this.raydium = undefined;
  }

  /**
   * Create SDK instance with default mainnet configuration
   */
  static mainnet(apiKeys?: {
    tensor?: string;
    squads?: string;
    sanctum?: string;
    meteora?: string;
    marginfi?: string;
    helius?: string;
    birdeye?: string;
    shyft?: string;
    crossmint?: {
      apiKey: string;
      jwt?: string;
    };
    clockwork?: string;
    dialect?: string;
  }): ForgeXSolanaSDK {
    return new ForgeXSolanaSDK({
      connection: {
        network: "mainnet-beta",
        commitment: "confirmed",
      },
      apiKeys,
    });
  }

  /**
   * Create SDK instance with devnet configuration
   */
  static devnet(apiKeys?: {
    tensor?: string;
    squads?: string;
    sanctum?: string;
    meteora?: string;
    marginfi?: string;
    helius?: string;
    birdeye?: string;
    shyft?: string;
    crossmint?: {
      apiKey: string;
      jwt?: string;
    };
    clockwork?: string;
    dialect?: string;
  }): ForgeXSolanaSDK {
    return new ForgeXSolanaSDK({
      connection: {
        network: "devnet",
        commitment: "confirmed",
      },
      apiKeys,
    });
  }

  /**
   * Create SDK instance with custom RPC endpoint
   */
  static custom(
    endpoint: string,
    apiKeys?: {
      tensor?: string;
      squads?: string;
      sanctum?: string;
      meteora?: string;
      marginfi?: string;
      helius?: string;
      birdeye?: string;
      shyft?: string;
      crossmint?: {
        apiKey: string;
        jwt?: string;
      };
      clockwork?: string;
      dialect?: string;
    }
  ): ForgeXSolanaSDK {
    return new ForgeXSolanaSDK({
      connection: {
        network: "mainnet-beta",
        endpoint,
        commitment: "confirmed",
      },
      apiKeys,
    });
  }

  /**
   * Get default RPC endpoint for a network
   */
  private getDefaultEndpoint(network: SolanaNetwork): string {
    switch (network) {
      case "mainnet-beta":
        return "https://api.mainnet-beta.solana.com";
      case "devnet":
        return "https://api.devnet.solana.com";
      case "testnet":
        return "https://api.testnet.solana.com";
      default:
        return "https://api.mainnet-beta.solana.com";
    }
  }

  /**
   * Get comprehensive DeFi portfolio for a wallet
   */
  async getPortfolio(walletAddress: string) {
    try {
      const results = await Promise.allSettled([
        // Get SOL balance
        this.connection.getBalance(
          new (
            await import("@solana/web3.js")
          ).PublicKey(walletAddress)
        ),
        // Get Jupiter token holdings if available
        this.jupiter?.getHoldings?.(walletAddress).catch(() => null),
        // Get basic drift positions if available
        this.drift?.getPositions?.(walletAddress).catch(() => []),
        // Try to get Kamino lending info if available
        this.kamino ? this.tryGetKaminoData(walletAddress) : null,
      ]);

      const [solBalance, holdings, perpPositions, lendingData] = results;

      return {
        wallet: walletAddress,
        solBalance:
          solBalance.status === "fulfilled" ? solBalance.value / 1e9 : 0,
        holdings: holdings.status === "fulfilled" ? holdings.value : null,
        lending: lendingData,
        perpetuals:
          perpPositions.status === "fulfilled" ? perpPositions.value : [],
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get portfolio: ${error.message}`);
    }
  }

  /**
   * Try to get Kamino lending data safely
   */
  private async tryGetKaminoData(walletAddress: string) {
    try {
      // Add safe Kamino method calls here when available
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get market overview data
   */
  async getMarketOverview() {
    try {
      const results = await Promise.allSettled([
        // Get Jupiter price data if available
        this.jupiter
          ?.getPrices?.(["So11111111111111111111111111111111111111112"])
          .catch(() => ({})),
        // Get basic connection info
        this.connection.getSlot(),
        // Get DexScreener data
        this.dexscreener
          ?.getTokenPairs?.(
            "solana",
            "So11111111111111111111111111111111111111112"
          )
          .catch(() => []),
      ]);

      const [prices, slot, dexData] = results;

      return {
        prices: {
          sol:
            prices.status === "fulfilled" && prices.value
              ? Object.values(prices.value)[0]?.usdPrice || 0
              : 0,
        },
        network: {
          slot: slot.status === "fulfilled" ? slot.value : 0,
        },
        dex: dexData.status === "fulfilled" ? dexData.value : [],
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get market overview: ${error.message}`);
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    const checks = {
      connection: false,
      jupiter: false,
      kamino: false,
      tensor: false,
      drift: false,
      helius: false,
      solend: false,
      dexscreener: false,
    };

    try {
      await this.connection.getSlot();
      checks.connection = true;
    } catch {}

    try {
      await this.jupiter?.searchTokens?.("SOL");
      checks.jupiter = true;
    } catch {}

    try {
      // Check if kamino service is available
      if (this.kamino) {
        checks.kamino = true;
      }
    } catch {}

    try {
      await this.tensor?.getCollectionBySlug?.("degods");
      checks.tensor = true;
    } catch {}

    try {
      // Check if drift service is available
      if (this.drift) {
        checks.drift = true;
      }
    } catch {}

    try {
      await this.helius?.getWebhooks?.();
      checks.helius = true;
    } catch {}

    try {
      await this.solend?.initialize?.();
      checks.solend = true;
    } catch {}

    try {
      await this.dexscreener?.getTokenPairs?.(
        "solana",
        "So11111111111111111111111111111111111111112"
      );
      checks.dexscreener = true;
    } catch {}

    return {
      ...checks,
      overall:
        Object.values(checks).filter(Boolean).length /
        Object.keys(checks).length,
      timestamp: Date.now(),
    };
  }
}

export default ForgeXSolanaSDK;
