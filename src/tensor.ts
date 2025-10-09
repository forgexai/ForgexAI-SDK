import axios from "axios";

const TENSOR_API = "https://api.tensor.so/graphql";
const TENSOR_REST_API = "https://api.mainnet.tensordev.io/api/v1";

export interface TensorFloorPrice {
  collectionId: string;
  floorPrice: number;
  currency: string;
  volume24h: number;
  volume7d?: number;
  listedCount: number;
  sales24h: number;
  totalSupply?: number;
  holders?: number;
  timestamp: number;
}

export interface TensorCollectionStats {
  slug: string;
  name: string;
  symbol?: string;
  floorPrice: number;
  currency: string;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  volumeAll: number;
  sales24h: number;
  sales7d: number;
  sales30d: number;
  salesAll: number;
  numListed: number;
  numMints: number;
  holders: number;
  marketCap: number;
  avgSalePrice24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
}

export interface TensorNftListing {
  mint: string;
  price: number;
  currency: string;
  seller: string;
  source: string;
  tx?: string;
  timestamp: number;
}

export interface TensorNftSale {
  mint: string;
  price: number;
  currency: string;
  buyer: string;
  seller: string;
  source: string;
  tx: string;
  timestamp: number;
}

export interface TensorCollection {
  slug: string;
  name: string;
  symbol?: string;
  description?: string;
  imageUri?: string;
  creator?: string;
  verified: boolean;
  totalSupply: number;
  royaltyFeeBps?: number;
}

export interface TensorAttributeFilter {
  traitType: string;
  values: string[];
}

export interface TensorSearchParams {
  sortBy?:
    | "priceAsc"
    | "priceDesc"
    | "rarityAsc"
    | "rarityDesc"
    | "listTimeAsc"
    | "listTimeDesc";
  attributes?: TensorAttributeFilter[];
  priceMin?: number;
  priceMax?: number;
  rarityMin?: number;
  rarityMax?: number;
  limit?: number;
  offset?: number;
}

export class TensorClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.TENSOR_API_KEY || "";
  }

  /**
   * Get floor price and basic stats for a collection
   */
  async getFloorPrice(collectionSlug: string): Promise<TensorFloorPrice> {
    try {
      const query = `
        query CollectionStats($slug: String!) {
          instrumentTV2(slug: $slug) {
            slug
            statsV2 {
              currency
              floorPrice
              numListed
              numMints
              salesAll
              sales1h
              sales24h
              volume1h
              volume24h
              volume7d
              volume30d
              volumeAll
              holders
            }
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: { slug: collectionSlug },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const data = response.data.data?.instrumentTV2;

      if (!data) {
        throw new Error("Collection not found");
      }

      const stats = data.statsV2;

      return {
        collectionId: collectionSlug,
        floorPrice: stats.floorPrice ? stats.floorPrice / 1e9 : 0,
        currency: stats.currency || "SOL",
        volume24h: stats.volume24h ? stats.volume24h / 1e9 : 0,
        volume7d: stats.volume7d ? stats.volume7d / 1e9 : 0,
        listedCount: stats.numListed || 0,
        sales24h: stats.sales24h || 0,
        totalSupply: stats.numMints || 0,
        holders: stats.holders || 0,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get Tensor floor price: ${error.message}`);
    }
  }

  /**
   * Get comprehensive collection statistics
   */
  async getCollectionStats(
    collectionSlug: string
  ): Promise<TensorCollectionStats> {
    try {
      const query = `
        query CollectionStatsDetailed($slug: String!) {
          instrumentTV2(slug: $slug) {
            slug
            name
            symbol
            statsV2 {
              currency
              floorPrice
              numListed
              numMints
              salesAll
              sales1h
              sales24h
              sales7d
              sales30d
              volume1h
              volume24h
              volume7d
              volume30d
              volumeAll
              holders
              marketCap
              avgSalePrice24h
              priceChange24h
              priceChangePercent24h
            }
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: { slug: collectionSlug },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const data = response.data.data?.instrumentTV2;

      if (!data) {
        throw new Error("Collection not found");
      }

      const stats = data.statsV2;

      return {
        slug: data.slug,
        name: data.name,
        symbol: data.symbol,
        floorPrice: stats.floorPrice ? stats.floorPrice / 1e9 : 0,
        currency: stats.currency || "SOL",
        volume24h: stats.volume24h ? stats.volume24h / 1e9 : 0,
        volume7d: stats.volume7d ? stats.volume7d / 1e9 : 0,
        volume30d: stats.volume30d ? stats.volume30d / 1e9 : 0,
        volumeAll: stats.volumeAll ? stats.volumeAll / 1e9 : 0,
        sales24h: stats.sales24h || 0,
        sales7d: stats.sales7d || 0,
        sales30d: stats.sales30d || 0,
        salesAll: stats.salesAll || 0,
        numListed: stats.numListed || 0,
        numMints: stats.numMints || 0,
        holders: stats.holders || 0,
        marketCap: stats.marketCap ? stats.marketCap / 1e9 : 0,
        avgSalePrice24h: stats.avgSalePrice24h
          ? stats.avgSalePrice24h / 1e9
          : 0,
        priceChange24h: stats.priceChange24h ? stats.priceChange24h / 1e9 : 0,
        priceChangePercent24h: stats.priceChangePercent24h || 0,
      };
    } catch (error: any) {
      throw new Error(`Failed to get collection stats: ${error.message}`);
    }
  }

  /**
   * Get current listings for a collection
   */
  async getCollectionListings(
    collectionSlug: string,
    searchParams: TensorSearchParams = {}
  ): Promise<TensorNftListing[]> {
    try {
      const {
        sortBy = "priceAsc",
        limit = 50,
        offset = 0,
        priceMin,
        priceMax,
        rarityMin,
        rarityMax,
      } = searchParams;

      const query = `
        query CollectionListings(
          $slug: String!
          $sortBy: String!
          $limit: Int!
          $offset: Int!
          $priceMin: Float
          $priceMax: Float
          $rarityMin: Int
          $rarityMax: Int
        ) {
          activeMintListings(
            slug: $slug
            sortBy: $sortBy
            limit: $limit
            offset: $offset
            priceMin: $priceMin
            priceMax: $priceMax
            rarityMin: $rarityMin
            rarityMax: $rarityMax
          ) {
            mint
            price
            seller
            source
            tx
            timestamp
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: {
            slug: collectionSlug,
            sortBy,
            limit,
            offset,
            priceMin,
            priceMax,
            rarityMin,
            rarityMax,
          },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const listings = response.data.data?.activeMintListings || [];

      return listings.map((listing: any) => ({
        mint: listing.mint,
        price: listing.price ? listing.price / 1e9 : 0,
        currency: "SOL",
        seller: listing.seller,
        source: listing.source,
        tx: listing.tx,
        timestamp: listing.timestamp,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get collection listings: ${error.message}`);
    }
  }

  /**
   * Get recent sales for a collection
   */
  async getCollectionSales(
    collectionSlug: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TensorNftSale[]> {
    try {
      const query = `
        query CollectionSales($slug: String!, $limit: Int!, $offset: Int!) {
          recentSales(slug: $slug, limit: $limit, offset: $offset) {
            mint
            price
            buyer
            seller
            source
            tx
            timestamp
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: { slug: collectionSlug, limit, offset },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      const sales = response.data.data?.recentSales || [];

      return sales.map((sale: any) => ({
        mint: sale.mint,
        price: sale.price ? sale.price / 1e9 : 0,
        currency: "SOL",
        buyer: sale.buyer,
        seller: sale.seller,
        source: sale.source,
        tx: sale.tx,
        timestamp: sale.timestamp,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get collection sales: ${error.message}`);
    }
  }

  /**
   * Get collections ranked by volume
   */
  async getCollectionsByVolume(
    period: "1h" | "24h" | "7d" | "30d" = "24h",
    limit: number = 10
  ): Promise<TensorCollection[]> {
    try {
      const response = await axios.get(`${TENSOR_REST_API}/collections/top`, {
        params: {
          limit,
          sortBy: `volume${period}`,
          period,
        },
        headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
      });

      return response.data.map((collection: any) => ({
        slug: collection.slug,
        name: collection.name,
        symbol: collection.symbol,
        description: collection.description,
        imageUri: collection.imageUri,
        creator: collection.creator,
        verified: collection.verified || false,
        totalSupply: collection.totalSupply || 0,
        royaltyFeeBps: collection.royaltyFeeBps,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get top collections: ${error.message}`);
    }
  }

  /**
   * Search for collections by name
   */
  async searchCollections(
    query: string,
    limit: number = 20
  ): Promise<TensorCollection[]> {
    try {
      const response = await axios.get(
        `${TENSOR_REST_API}/collections/search`,
        {
          params: { q: query, limit },
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      return response.data.map((collection: any) => ({
        slug: collection.slug,
        name: collection.name,
        symbol: collection.symbol,
        description: collection.description,
        imageUri: collection.imageUri,
        creator: collection.creator,
        verified: collection.verified || false,
        totalSupply: collection.totalSupply || 0,
        royaltyFeeBps: collection.royaltyFeeBps,
      }));
    } catch (error: any) {
      throw new Error(`Failed to search collections: ${error.message}`);
    }
  }

  /**
   * Get NFT details by mint address
   */
  async getNftDetails(mintAddress: string): Promise<any> {
    try {
      const query = `
        query NftDetails($mint: String!) {
          nft(mint: $mint) {
            mint
            name
            imageUri
            metadataUri
            owner
            collection {
              slug
              name
            }
            rarity {
              rank
              score
            }
            lastSale {
              price
              timestamp
            }
            listing {
              price
              seller
              source
            }
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: { mint: mintAddress },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data?.nft;
    } catch (error: any) {
      throw new Error(`Failed to get NFT details: ${error.message}`);
    }
  }

  /**
   * Get wallet's NFT holdings for a specific collection
   */
  async getWalletNfts(
    walletAddress: string,
    collectionSlug?: string
  ): Promise<any[]> {
    try {
      const query = `
        query WalletNfts($wallet: String!, $slug: String) {
          walletNfts(wallet: $wallet, slug: $slug) {
            mint
            name
            imageUri
            collection {
              slug
              name
            }
            rarity {
              rank
              score
            }
            lastSale {
              price
              timestamp
            }
            listing {
              price
              seller
              source
            }
          }
        }
      `;

      const response = await axios.post(
        TENSOR_API,
        {
          query,
          variables: { wallet: walletAddress, slug: collectionSlug },
        },
        {
          headers: this.apiKey ? { "X-TENSOR-API-KEY": this.apiKey } : {},
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data?.walletNfts || [];
    } catch (error: any) {
      throw new Error(`Failed to get wallet NFTs: ${error.message}`);
    }
  }

  /**
   * Utility method to convert SOL to lamports
   */
  static toLamports(sol: number): number {
    return Math.floor(sol * 1e9);
  }

  /**
   * Utility method to convert lamports to SOL
   */
  static fromLamports(lamports: number): number {
    return lamports / 1e9;
  }

  /**
   * Calculate price change percentage
   */
  static calculatePriceChangePercent(
    currentPrice: number,
    previousPrice: number
  ): number {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice) * 100;
  }

  /**
   * Format price with appropriate decimals
   */
  static formatPrice(price: number, decimals: number = 3): string {
    return price.toFixed(decimals);
  }
}
