import axios, { AxiosInstance } from "axios";

const BIRDEYE_API = "https://public-api.birdeye.so";

export class BirdeyeClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: BIRDEYE_API,
      headers: {
        "X-API-KEY": apiKey,
      },
    });
  }

  async getTokenPrice(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/price`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token price: ${error.message}`);
    }
  }

  async getMultiplePrices(tokenAddresses: string[]) {
    try {
      const response = await this.client.get(`/defi/multi_price`, {
        params: { list_address: tokenAddresses.join(",") },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get multiple prices: ${error.message}`);
    }
  }

  async getTokenPriceHistory(tokenAddress: string, timeframe: string = "24H") {
    try {
      const response = await this.client.get(`/defi/history_price`, {
        params: {
          address: tokenAddress,
          address_type: "token",
          type: timeframe,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get price history: ${error.message}`);
    }
  }

  async getTokenOverview(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/token_overview`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token overview: ${error.message}`);
    }
  }

  async getTrendingTokens(
    sortBy: string = "rank",
    sortType: string = "asc",
    offset: number = 0,
    limit: number = 20
  ) {
    try {
      const response = await this.client.get(`/defi/token_trending`, {
        params: { sort_by: sortBy, sort_type: sortType, offset, limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get trending tokens: ${error.message}`);
    }
  }

  async getTokenSecurity(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/token_security`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token security: ${error.message}`);
    }
  }

  async getWalletPortfolio(walletAddress: string) {
    try {
      const response = await this.client.get(`/v1/wallet/token_list`, {
        params: { wallet: walletAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet portfolio: ${error.message}`);
    }
  }

  async getOHLCV(
    tokenAddress: string,
    timeframe: string = "15m",
    time_from?: number,
    time_to?: number
  ) {
    try {
      const response = await this.client.get(`/defi/ohlcv`, {
        params: {
          address: tokenAddress,
          type: timeframe,
          time_from,
          time_to,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get OHLCV data: ${error.message}`);
    }
  }

  // ========== TRADES ENDPOINTS ==========
  async getTokenTrades(
    tokenAddress: string,
    txType?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/txs/token`, {
        params: {
          address: tokenAddress,
          tx_type: txType,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token trades: ${error.message}`);
    }
  }

  async getPairTrades(
    pairAddress: string,
    txType?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/txs/pair`, {
        params: {
          address: pairAddress,
          tx_type: txType,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get pair trades: ${error.message}`);
    }
  }

  async getTokenTradesV3(
    tokenAddress: string,
    txType?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v3/token/txs`, {
        params: {
          address: tokenAddress,
          tx_type: txType,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token trades V3: ${error.message}`);
    }
  }

  async getRecentTrades(limit?: number) {
    try {
      const response = await this.client.get(`/defi/v3/txs/recent`, {
        params: { limit },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get recent trades: ${error.message}`);
    }
  }

  // ========== TOKEN ENDPOINTS ==========
  async getTokenList(
    sortBy?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/tokenlist`, {
        params: {
          sort_by: sortBy,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token list: ${error.message}`);
    }
  }

  async getTokenListV3(
    sortBy?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v3/token/list`, {
        params: {
          sort_by: sortBy,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token list V3: ${error.message}`);
    }
  }

  async getTokenMetadata(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/v3/token/meta-data/single`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token metadata: ${error.message}`);
    }
  }

  async getMultipleTokenMetadata(tokenAddresses: string[]) {
    try {
      const response = await this.client.get(`/defi/v3/token/meta-data/multiple`, {
        params: { list_address: tokenAddresses.join(",") },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get multiple token metadata: ${error.message}`);
    }
  }

  async getTokenMarketData(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/v3/token/market-data`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token market data: ${error.message}`);
    }
  }

  async getTokenTradeData(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/v3/token/trade-data/single`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token trade data: ${error.message}`);
    }
  }

  async getNewListings(
    sortBy?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v2/tokens/new_listing`, {
        params: {
          sort_by: sortBy,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get new listings: ${error.message}`);
    }
  }

  async getTopTraders(
    tokenAddress: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v2/tokens/top_traders`, {
        params: {
          address: tokenAddress,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get top traders: ${error.message}`);
    }
  }

  async getAllMarkets(
    sortBy?: string,
    sortType?: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v2/markets`, {
        params: {
          sort_by: sortBy,
          sort_type: sortType,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get all markets: ${error.message}`);
    }
  }

  async getTokenCreationInfo(tokenAddress: string) {
    try {
      const response = await this.client.get(`/defi/token_creation_info`, {
        params: { address: tokenAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token creation info: ${error.message}`);
    }
  }

  async getTokenHolders(
    tokenAddress: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v3/token/holder`, {
        params: {
          address: tokenAddress,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get token holders: ${error.message}`);
    }
  }

  // ========== WALLET ENDPOINTS ==========
  async getWalletTokenBalance(
    walletAddress: string,
    tokenAddress?: string
  ) {
    try {
      const response = await this.client.get(`/v1/wallet/token_balance`, {
        params: {
          wallet: walletAddress,
          token: tokenAddress,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet token balance: ${error.message}`);
    }
  }

  async getWalletTransactionHistory(
    walletAddress: string,
    offset?: number,
    limit?: number
  ) {
    try {
      const response = await this.client.get(`/v1/wallet/tx_list`, {
        params: {
          wallet: walletAddress,
          offset,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet transaction history: ${error.message}`);
    }
  }

  async getWalletNetWorth(walletAddress: string) {
    try {
      const response = await this.client.get(`/wallet/v2/current-net-worth`, {
        params: { wallet: walletAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet net worth: ${error.message}`);
    }
  }

  async getWalletNetWorthChart(
    walletAddress: string,
    timeframe?: string
  ) {
    try {
      const response = await this.client.get(`/wallet/v2/net-worth`, {
        params: {
          wallet: walletAddress,
          type: timeframe,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet net worth chart: ${error.message}`);
    }
  }

  async getWalletPnL(
    walletAddress: string,
    tokenAddress?: string
  ) {
    try {
      const response = await this.client.get(`/wallet/v2/pnl`, {
        params: {
          wallet: walletAddress,
          token: tokenAddress,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get wallet PnL: ${error.message}`);
    }
  }

  // ========== PAIR ENDPOINTS ==========
  async getPairOverview(pairAddress: string) {
    try {
      const response = await this.client.get(`/defi/v3/pair/overview/single`, {
        params: { address: pairAddress },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get pair overview: ${error.message}`);
    }
  }

  async getMultiplePairOverview(pairAddresses: string[]) {
    try {
      const response = await this.client.get(`/defi/v3/pair/overview/multiple`, {
        params: { list_address: pairAddresses.join(",") },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get multiple pair overview: ${error.message}`);
    }
  }

  // ========== SEARCH & UTILS ==========
  async searchTokens(query: string, limit?: number) {
    try {
      const response = await this.client.get(`/defi/v3/search`, {
        params: {
          keyword: query,
          limit,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to search tokens: ${error.message}`);
    }
  }

  async getSupportedNetworks() {
    try {
      const response = await this.client.get(`/defi/networks`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get supported networks: ${error.message}`);
    }
  }

  async getLatestBlockNumber() {
    try {
      const response = await this.client.get(`/defi/v3/txs/latest-block`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get latest block number: ${error.message}`);
    }
  }

  // ========== PRICE VOLUME ENDPOINTS ==========
  async getPriceVolume(tokenAddress: string, timeframe?: string) {
    try {
      const response = await this.client.get(`/defi/price_volume/single`, {
        params: {
          address: tokenAddress,
          type: timeframe,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get price volume: ${error.message}`);
    }
  }

  async getHistoricalPriceByUnix(
    tokenAddress: string,
    unixTime: number
  ) {
    try {
      const response = await this.client.get(`/defi/historical_price_unix`, {
        params: {
          address: tokenAddress,
          unix_time: unixTime,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get historical price by unix: ${error.message}`);
    }
  }

  // ========== OHLCV ADDITIONAL ENDPOINTS ==========
  async getOHLCVPair(
    baseAddress: string,
    quoteAddress: string,
    timeframe?: string,
    time_from?: number,
    time_to?: number
  ) {
    try {
      const response = await this.client.get(`/defi/ohlcv/pair`, {
        params: {
          base_address: baseAddress,
          quote_address: quoteAddress,
          type: timeframe,
          time_from,
          time_to,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get OHLCV pair data: ${error.message}`);
    }
  }

  async getOHLCVV3(
    tokenAddress: string,
    timeframe?: string,
    time_from?: number,
    time_to?: number
  ) {
    try {
      const response = await this.client.get(`/defi/v3/ohlcv`, {
        params: {
          address: tokenAddress,
          type: timeframe,
          time_from,
          time_to,
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(`Failed to get OHLCV V3 data: ${error.message}`);
    }
  }
}
