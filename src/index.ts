export { JupiterClient } from "./jupiter";
export { KaminoClient } from "./kamino";
export { TensorClient } from "./tensor";
export { MarinadeClient } from "./marinade";
export { DriftClient } from "./drift";
export { PythClient, PYTH_FEEDS } from "./pyth";
export { SquadsClient } from "./squads";
export { RaydiumClient } from "./raydium";
export * from "./wallet";

export * from "./utils/connection";

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

export type { TokenInfo as RaydiumTokenInfo } from "./raydium";
export type { JupiterTokenInfo } from "./jupiter";
export type { KaminoLoanHealth } from "./kamino";
export type { TensorFloorPrice, TensorCollectionStats } from "./tensor";
export type { MarinadeStakingInfo } from "./marinade";
export type { DriftPerpPosition } from "./drift";
export type { PythPriceData } from "./pyth";
export type { SquadsMultisig, SquadsProposal } from "./squads";

import { Connection } from "@solana/web3.js";
import { JupiterClient } from "./jupiter";
import { KaminoClient } from "./kamino";
import { TensorClient } from "./tensor";
import { MarinadeClient } from "./marinade";
import { DriftClient } from "./drift";
import { PythClient } from "./pyth";
import { SquadsClient } from "./squads";
import { RaydiumClient } from "./raydium";
import type { SDKConfig, SolanaNetwork } from "./types";

export class ForgeXSolanaSDK {
  public connection: Connection;
  public jupiter: JupiterClient;
  public kamino: KaminoClient;
  public tensor: TensorClient;
  public marinade: MarinadeClient;
  public drift: DriftClient;
  public pyth: PythClient;
  public squads: SquadsClient;
  public raydium: RaydiumClient;

  constructor(config: SDKConfig) {
    const endpoint =
      config.connection.endpoint ||
      this.getDefaultEndpoint(config.connection.network);
    this.connection = new Connection(endpoint, {
      commitment: config.connection.commitment || "confirmed",
    });

    this.jupiter = new JupiterClient(this.connection);
    this.kamino = new KaminoClient(this.connection);
    this.tensor = new TensorClient(config.apiKeys?.tensor);
    this.marinade = new MarinadeClient(this.connection);
    this.drift = new DriftClient(this.connection);
    this.pyth = new PythClient(this.connection);
    this.squads = new SquadsClient(this.connection, config.apiKeys?.squads);
    this.raydium = new RaydiumClient(this.connection);
  }

  /**
   * Create SDK instance with default mainnet configuration
   */
  static mainnet(apiKeys?: {
    tensor?: string;
    squads?: string;
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
    apiKeys?: { tensor?: string; squads?: string }
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
      const [solBalance, loanHealth, stakingInfo, perpPositions] =
        await Promise.allSettled([
          this.connection.getBalance(
            new (
              await import("@solana/web3.js")
            ).PublicKey(walletAddress)
          ),
          this.kamino.getLoanHealth(walletAddress).catch(() => null),
          this.marinade.getStakingAPY("mSOL").catch(() => null),
          this.drift.getPositionDetails(walletAddress).catch(() => []),
        ]);

      return {
        wallet: walletAddress,
        solBalance:
          solBalance.status === "fulfilled" ? solBalance.value / 1e9 : 0,
        lending: loanHealth.status === "fulfilled" ? loanHealth.value : null,
        staking: stakingInfo.status === "fulfilled" ? stakingInfo.value : null,
        perpetuals:
          perpPositions.status === "fulfilled" ? perpPositions.value : [],
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get portfolio: ${error.message}`);
    }
  }

  /**
   * Get market overview data
   */
  async getMarketOverview() {
    try {
      const [prices, marinadeInfo, tensorTopCollections] =
        await Promise.allSettled([
          this.pyth.getMultiplePrices([
            "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", // SOL/USD
            "0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", // BTC/USD
            "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", // ETH/USD
          ]),
          this.marinade.getStakingAPY("mSOL"),
          this.tensor.getCollectionsByVolume("24h", 5),
        ]);

      return {
        prices: {
          sol: prices.status === "fulfilled" ? prices.value[0]?.price || 0 : 0,
          btc: prices.status === "fulfilled" ? prices.value[1]?.price || 0 : 0,
          eth: prices.status === "fulfilled" ? prices.value[2]?.price || 0 : 0,
        },
        staking:
          marinadeInfo.status === "fulfilled" ? marinadeInfo.value : null,
        nfts:
          tensorTopCollections.status === "fulfilled"
            ? tensorTopCollections.value
            : [],
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
      marinade: false,
      drift: false,
      pyth: false,
      squads: false,
      raydium: false,
    };

    try {
      await this.connection.getSlot();
      checks.connection = true;
    } catch {}

    try {
      await this.jupiter.getTokenList();
      checks.jupiter = true;
    } catch {}

    try {
      await this.kamino.getMarkets();
      checks.kamino = true;
    } catch {}

    try {
      await this.tensor.getCollectionsByVolume("24h", 1);
      checks.tensor = true;
    } catch {}

    try {
      await this.marinade.getStakingAPY("mSOL");
      checks.marinade = true;
    } catch {}

    try {
      await this.drift.getAllMarkets();
      checks.drift = true;
    } catch {}

    try {
      await this.pyth.getAssetPrice(
        "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
      );
      checks.pyth = true;
    } catch {}

    try {
      await this.raydium.getPriorityFee();
      checks.raydium = true;
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
