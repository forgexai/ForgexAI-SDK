import axios from "axios";

const DEXSCREENER_API = "https://api.dexscreener.com";

export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

export class DexScreenerClient {
  async getTokenPairs(
    chainId: string,
    tokenAddress: string
  ): Promise<DexPair[]> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/latest/dex/tokens/${chainId}/${tokenAddress}`
      );
      return response.data.pairs || [];
    } catch (error: any) {
      throw new Error(`Failed to get token pairs: ${error.message}`);
    }
  }

  async searchPairs(query: string): Promise<DexPair[]> {
    try {
      const response = await axios.get(`${DEXSCREENER_API}/latest/dex/search`, {
        params: { q: query },
      });
      return response.data.pairs || [];
    } catch (error: any) {
      throw new Error(`Failed to search pairs: ${error.message}`);
    }
  }

  async getPairByAddress(
    chainId: string,
    pairAddress: string
  ): Promise<DexPair | null> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/latest/dex/pairs/${chainId}/${pairAddress}`
      );
      return response.data.pairs?.[0] || null;
    } catch (error: any) {
      throw new Error(`Failed to get pair: ${error.message}`);
    }
  }

  async getLatestTokenProfiles() {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/token-profiles/latest/v1`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get token profiles: ${error.message}`);
    }
  }

  async getLatestBoostedTokens() {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/token-boosts/latest/v1`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get boosted tokens: ${error.message}`);
    }
  }

  async getTopBoostedTokens() {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/token-boosts/top/v1`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get top boosted tokens: ${error.message}`);
    }
  }

  /**
   * Get multiple pairs by token addresses (up to 30 addresses)
   * @param chainId - The blockchain chain ID (e.g., 'solana', 'ethereum')
   * @param tokenAddresses - Array of token addresses (max 30)
   */
  async getTokensByAddresses(
    chainId: string,
    tokenAddresses: string[]
  ): Promise<DexPair[]> {
    try {
      if (tokenAddresses.length > 30) {
        throw new Error("Maximum 30 token addresses allowed");
      }
      const addressesParam = tokenAddresses.join(",");
      const response = await axios.get(
        `${DEXSCREENER_API}/tokens/v1/${chainId}/${addressesParam}`
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get tokens by addresses: ${error.message}`);
    }
  }

  /**
   * Get the pools of a given token address
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   */
  async getTokenPools(
    chainId: string,
    tokenAddress: string
  ): Promise<DexPair[]> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/token-pairs/v1/${chainId}/${tokenAddress}`
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get token pools: ${error.message}`);
    }
  }

  /**
   * Get one or multiple pairs by chain and pair address
   * @param chainId - The blockchain chain ID
   * @param pairId - The pair address or comma-separated pair addresses
   */
  async getPairsByChainAndAddress(
    chainId: string,
    pairId: string
  ): Promise<{ schemaVersion: string; pairs: DexPair[] }> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/latest/dex/pairs/${chainId}/${pairId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get pairs by chain and address: ${error.message}`
      );
    }
  }

  /**
   * Check orders paid for a token
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   */
  async getTokenOrders(
    chainId: string,
    tokenAddress: string
  ): Promise<
    Array<{
      type: string;
      status: string;
      paymentTimestamp: number;
    }>
  > {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/orders/v1/${chainId}/${tokenAddress}`
      );
      return response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get token orders: ${error.message}`);
    }
  }

  /**
   * Enhanced search for pairs with better response structure
   * @param query - Search query (token symbol, name, or address)
   */
  async searchPairsEnhanced(
    query: string
  ): Promise<{ schemaVersion: string; pairs: DexPair[] }> {
    try {
      const response = await axios.get(`${DEXSCREENER_API}/latest/dex/search`, {
        params: { q: query },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to search pairs enhanced: ${error.message}`);
    }
  }

  /**
   * Get token pairs with enhanced response structure
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   */
  async getTokenPairsEnhanced(
    chainId: string,
    tokenAddress: string
  ): Promise<{ schemaVersion: string; pairs: DexPair[] }> {
    try {
      const response = await axios.get(
        `${DEXSCREENER_API}/latest/dex/tokens/${chainId}/${tokenAddress}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get token pairs enhanced: ${error.message}`);
    }
  }

  /**
   * Get pairs filtered by minimum liquidity
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   * @param minLiquidityUsd - Minimum liquidity in USD
   */
  async getTokenPairsWithMinLiquidity(
    chainId: string,
    tokenAddress: string,
    minLiquidityUsd: number
  ): Promise<DexPair[]> {
    try {
      const pairs = await this.getTokenPairs(chainId, tokenAddress);
      return pairs.filter((pair) => pair.liquidity.usd >= minLiquidityUsd);
    } catch (error: any) {
      throw new Error(
        `Failed to get pairs with min liquidity: ${error.message}`
      );
    }
  }

  /**
   * Get pairs sorted by volume (24h)
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   * @param ascending - Sort order (default: false for descending)
   */
  async getTokenPairsByVolume(
    chainId: string,
    tokenAddress: string,
    ascending: boolean = false
  ): Promise<DexPair[]> {
    try {
      const pairs = await this.getTokenPairs(chainId, tokenAddress);
      return pairs.sort((a, b) => {
        const volumeA = a.volume.h24 || 0;
        const volumeB = b.volume.h24 || 0;
        return ascending ? volumeA - volumeB : volumeB - volumeA;
      });
    } catch (error: any) {
      throw new Error(`Failed to get pairs by volume: ${error.message}`);
    }
  }

  /**
   * Get the best pair by liquidity for a token
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   */
  async getBestPairByLiquidity(
    chainId: string,
    tokenAddress: string
  ): Promise<DexPair | null> {
    try {
      const pairs = await this.getTokenPairs(chainId, tokenAddress);
      if (pairs.length === 0) return null;

      return pairs.reduce((best, current) =>
        current.liquidity.usd > best.liquidity.usd ? current : best
      );
    } catch (error: any) {
      throw new Error(`Failed to get best pair by liquidity: ${error.message}`);
    }
  }

  /**
   * Get pairs with recent high activity (based on 5m transactions)
   * @param chainId - The blockchain chain ID
   * @param tokenAddress - The token address
   * @param minTxns - Minimum number of transactions in 5m
   */
  async getActivePairs(
    chainId: string,
    tokenAddress: string,
    minTxns: number = 5
  ): Promise<DexPair[]> {
    try {
      const pairs = await this.getTokenPairs(chainId, tokenAddress);
      return pairs.filter((pair) => {
        const totalTxns =
          (pair.txns.m5?.buys || 0) + (pair.txns.m5?.sells || 0);
        return totalTxns >= minTxns;
      });
    } catch (error: any) {
      throw new Error(`Failed to get active pairs: ${error.message}`);
    }
  }
}
