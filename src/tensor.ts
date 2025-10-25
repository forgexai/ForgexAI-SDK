import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  TensorSwapSDK,
  TensorWhitelistSDK,
  computeTakerPrice,
  TakerSide,
  castPoolConfigAnchor,
  findWhitelistPDA,
} from "@tensor-oss/tensorswap-sdk";
import {
  TCompSDK,
  findListStatePda,
  findTreeAuthorityPda,
  Target,
} from "@tensor-oss/tcomp-sdk";
import {
  getLeafAssetId,
  computeMetadataArgsHash,
} from "@tensor-hq/tensor-common";
import { TokenStandard } from "@metaplex-foundation/mpl-bubblegum";
import BN from "bn.js";
import { keccak_256 } from "js-sha3";
import axios from "axios";

/**
 * Configuration for TensorService
 */
export interface TensorServiceConfig {
  connection: Connection;
  wallet?: Wallet;
  apiKey?: string; // For Tensor API access
  heliusApiKey?: string; // For DAS API (compressed NFTs)
}

/**
 * Pool configuration from Tensor
 */
export interface PoolConfig {
  poolType: "TOKEN" | "TRADE" | "NFT";
  curveType: "LINEAR" | "EXPONENTIAL";
  startingPrice: BN;
  delta: BN;
  mmFeeBps: number | null;
  mmCompoundFees: boolean;
}

/**
 * Price computation parameters
 */
export interface ComputePriceParams {
  takerSide: TakerSide;
  poolAddress: PublicKey;
  extraNFTsSelected?: number;
  slippage?: number;
  marginated?: boolean;
}

/**
 * Buy NFT parameters
 */
export interface BuyNftParams {
  whitelist: PublicKey;
  nftMint: PublicKey;
  nftBuyerAcc: PublicKey;
  owner: PublicKey;
  buyer: PublicKey;
  config: any;
  maxPrice: BN;
}

/**
 * Sell NFT parameters
 */
export interface SellNftParams {
  type: "token" | "trade";
  whitelist: PublicKey;
  nftMint: PublicKey;
  nftSellerAcc: PublicKey;
  owner: PublicKey;
  seller: PublicKey;
  config: any;
  minPrice: BN;
  proof?: Buffer[];
}

/**
 * List cNFT parameters
 */
export interface ListCNftParams {
  merkleTree: PublicKey;
  root: Buffer;
  canopyDepth: number;
  index: number;
  proof: Buffer[];
  dataHash: Buffer;
  creatorsHash: Buffer;
  delegate?: PublicKey;
  owner: PublicKey;
  rentPayer?: PublicKey;
  amount: BN;
  currency?: PublicKey | null;
  expireInSec?: BN | null;
  privateTaker?: PublicKey | null;
}

/**
 * Buy cNFT parameters
 */
export interface BuyCNftParams {
  merkleTree: PublicKey;
  root: Buffer;
  canopyDepth: number;
  index: number;
  proof: Buffer[];
  sellerFeeBasisPoints: number;
  metaHash: Buffer;
  creators: any[];
  payer: PublicKey;
  buyer: PublicKey;
  owner: PublicKey;
  makerBroker?: PublicKey;
  rentDest: PublicKey;
  maxAmount: BN;
  optionalRoyaltyPct?: number;
}

/**
 * Bid on cNFT parameters
 */
export interface BidCNftParams {
  owner: PublicKey;
  rentPayer?: PublicKey;
  amount: BN;
  expireInSec?: BN | null;
  privateTaker?: PublicKey | null;
  bidId: PublicKey;
  targetId: PublicKey;
  target: Target;
  quantity: number;
  margin?: any;
  field?: any;
  fieldId?: any;
}

/**
 * Collection information from API
 */
export interface CollectionInfo {
  id: string;
  slug: string;
  name: string;
  imageUri?: string;
  statsV2?: {
    floorPrice?: number;
    numListed?: number;
    numMints?: number;
  };
}

/**
 * Mint proof from API
 */
export interface MintProof {
  proof: string[];
  mint: string;
  root: string;
}

/**
 * DAS API Asset Response
 */
export interface DASAsset {
  compression: {
    data_hash: string;
    creator_hash: string;
    asset_hash: string;
    tree: string;
    leaf_id: number;
  };
  content: {
    metadata: {
      name: string;
      symbol: string;
      token_standard: string;
    };
    json_uri: string;
  };
  royalty: {
    basis_points: number;
    primary_sale_happened: boolean;
  };
  creators: Array<{
    address: string;
    share: number;
    verified: boolean;
  }>;
  uses?: {
    use_method: string;
    remaining: number;
    total: number;
  };
  grouping: Array<{
    group_key: string;
    group_value: string;
  }>;
  supply?: {
    edition_nonce: number | null;
  };
  ownership: {
    owner: string;
    delegate: string | null;
  };
  mutable: boolean;
}

/**
 * Service class for Tensor Protocol operations
 * Handles both regular NFTs (TensorSwap) and compressed NFTs (TComp)
 */
export class TensorService {
  private connection: Connection;
  private provider: AnchorProvider;
  private swapSdk: TensorSwapSDK;
  private whitelistSdk: TensorWhitelistSDK;
  private tcompSdk: TCompSDK;
  private apiKey?: string;
  private heliusApiKey?: string;
  private apiBaseUrl = "https://api.tensor.so/graphql";

  constructor(config: TensorServiceConfig) {
    this.connection = config.connection;
    this.apiKey = config.apiKey;
    this.heliusApiKey = config.heliusApiKey;

    // Create provider with wallet or empty wallet
    const wallet = config.wallet || new Wallet(Keypair.generate());
    this.provider = new AnchorProvider(
      this.connection,
      wallet,
      AnchorProvider.defaultOptions()
    );

    // Initialize SDKs
    this.swapSdk = new TensorSwapSDK({ provider: this.provider });
    this.whitelistSdk = new TensorWhitelistSDK({ provider: this.provider });
    this.tcompSdk = new TCompSDK({ provider: this.provider });
  }

  // ==================== Utility Methods ====================

  /**
   * Get provider
   */
  getProvider(): AnchorProvider {
    return this.provider;
  }

  /**
   * Get connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Convert UUID to buffer for whitelist PDA
   */
  uuidToBuffer(uuid: string): number[] {
    return Buffer.from(uuid.replace("-", "")).toJSON().data;
  }

  /**
   * Find whitelist PDA from UUID
   */
  findWhitelistPda(uuid: string): [PublicKey, number] {
    const uuidArray = this.uuidToBuffer(uuid);
    return findWhitelistPDA({ uuid: uuidArray });
  }

  // ==================== TensorSwap (Regular NFTs) ====================

  /**
   * Fetch pool data
   */
  async fetchPool(poolAddress: PublicKey) {
    return await this.swapSdk.fetchPool(poolAddress);
  }
  /**
   * Compute current price for buying or selling
   */
  async computePrice(params: ComputePriceParams): Promise<BN> {
    const pool = await this.fetchPool(params.poolAddress);
    const config = castPoolConfigAnchor(pool.config);

    return computeTakerPrice({
      takerSide: params.takerSide,
      extraNFTsSelected: params.extraNFTsSelected || 0,
      config,
      takerSellCount: pool.takerSellCount,
      takerBuyCount: pool.takerBuyCount,
      maxTakerSellCount: pool.maxTakerSellCount,
      statsTakerSellCount: pool.stats.takerSellCount,
      statsTakerBuyCount: pool.stats.takerBuyCount,
      marginated: params.marginated || false,
      slippage: params.slippage,
    });
  }

  async buyNft(params: BuyNftParams): Promise<{ ixs: any[] }> {
    const {
      tx: { ixs },
    } = await this.swapSdk.buyNft({
      whitelist: params.whitelist,
      nftMint: params.nftMint,
      nftBuyerAcc: params.nftBuyerAcc,
      owner: params.owner,
      buyer: params.buyer,
      config: params.config,
      maxPrice: params.maxPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
    });

    return { ixs };
  }

  /**
   * Sell NFT to pool
   */
  async sellNft(params: SellNftParams): Promise<{ ixs: any[] }> {
    // Step 1: Check if mint proof is required
    if (params.proof) {
      const proofTx = await this.initMintProof(
        params.seller,
        params.whitelist,
        params.nftMint,
        params.proof
      );
      // Note: proofTx should be sent before sellTx
      return proofTx;
    }

    // Step 2: Sell NFT
    const {
      tx: { ixs },
    } = await this.swapSdk.sellNft({
      type: params.type,
      whitelist: params.whitelist,
      nftMint: params.nftMint,
      nftSellerAcc: params.nftSellerAcc,
      owner: params.owner,
      seller: params.seller,
      config: params.config,
      minPrice: params.minPrice,
      tokenProgram: TOKEN_PROGRAM_ID,
    });

    return { ixs };
  }

  /**
   * Initialize or update mint proof (required for some collections)
   */
  async initMintProof(
    user: PublicKey,
    whitelist: PublicKey,
    mint: PublicKey,
    proof: Buffer[]
  ): Promise<{ ixs: any[] }> {
    const {
      tx: { ixs },
    } = await this.whitelistSdk.initUpdateMintProof({
      user,
      whitelist,
      mint,
      proof,
    });

    return { ixs };
  }

  /**
   * Fetch whitelist data
   */
  async fetchWhitelist(whitelistAddress: PublicKey) {
    return await this.whitelistSdk.fetchWhitelist(whitelistAddress);
  }

  /**
   * Check if mint proof is required for collection
   */
  async isMintProofRequired(whitelistAddress: PublicKey): Promise<boolean> {
    const wl = await this.fetchWhitelist(whitelistAddress);
    const zeroArray = Array(32).fill(0);
    return JSON.stringify(wl.rootHash) !== JSON.stringify(zeroArray);
  }

  // ==================== TComp (Compressed NFTs) ====================

  /**
   * List compressed NFT
   */
  async listCNft(params: ListCNftParams): Promise<{ ixs: any[] }> {
    const {
      tx: { ixs },
    } = await this.tcompSdk.list({
      merkleTree: params.merkleTree,
      root: Array.from(params.root),
      canopyDepth: params.canopyDepth,
      index: params.index,
      proof: params.proof,
      dataHash: params.dataHash,
      creatorsHash: params.creatorsHash,
      delegate: params.delegate,
      owner: params.owner,
      rentPayer: params.rentPayer,
      amount: params.amount,
      currency: params.currency,
      expireInSec: params.expireInSec,
      privateTaker: params.privateTaker,
    });

    return { ixs };
  }

  /**
   * Fetch listing state for cNFT
   */
  async fetchListState(assetId: PublicKey) {
    const listState = findListStatePda({ assetId });
    return await this.tcompSdk.fetchListState(listState[0]);
  }

  /**
   * Get asset ID from merkle tree and index
   */
  getLeafAssetId(merkleTree: PublicKey, index: number): PublicKey {
    const nonce = new BN(index);
    return getLeafAssetId(merkleTree, nonce);
  }

  /**
   * Buy compressed NFT
   */
  async buyCNft(params: BuyCNftParams): Promise<{ ixs: any[] }> {
    const {
      tx: { ixs },
    } = await this.tcompSdk.buy({
      merkleTree: params.merkleTree,
      root: Array.from(params.root),
      canopyDepth: params.canopyDepth,
      index: params.index,
      proof: params.proof,
      sellerFeeBasisPoints: params.sellerFeeBasisPoints,
      metaHash: params.metaHash,
      creators: params.creators,
      payer: params.payer,
      buyer: params.buyer,
      owner: params.owner,
      makerBroker: params.makerBroker,
      rentDest: params.rentDest,
      maxAmount: params.maxAmount,
      optionalRoyaltyPct: params.optionalRoyaltyPct || 100,
    });

    return { ixs };
  }

  /**
   * Bid on compressed NFT
   */
  async bidCNft(params: BidCNftParams): Promise<{ ixs: any[] }> {
    const {
      tx: { ixs },
    } = await this.tcompSdk.bid({
      owner: params.owner,
      rentPayer: params.rentPayer,
      amount: params.amount,
      expireInSec: params.expireInSec,
      privateTaker: params.privateTaker,
      bidId: params.bidId,
      targetId: params.targetId,
      target: params.target,
      quantity: params.quantity,
      margin: params.margin,
      field: params.field,
      fieldId: params.fieldId,
    });

    return { ixs };
  }

  // ==================== DAS API (Helius) ====================

  /**
   * Fetch asset data from DAS API
   */
  async fetchAssetFromDAS(assetId: string): Promise<DASAsset | null> {
    if (!this.heliusApiKey) {
      throw new Error("Helius API key required for DAS API calls");
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${this.heliusApiKey}`;

    try {
      const response = await axios.post(url, {
        jsonrpc: "2.0",
        id: "0",
        method: "getAsset",
        params: {
          id: assetId,
        },
      });

      return response.data.result;
    } catch (error) {
      console.error("Error fetching asset from DAS:", error);
      return null;
    }
  }

  /**
   * Construct metadata hash for compressed NFT
   * This is required for buying/selling cNFTs
   */
  async constructMetaHash(mint: string): Promise<PublicKey | null> {
    const asset = await this.fetchAssetFromDAS(mint);
    if (!asset) return null;

    const {
      compression,
      content,
      royalty,
      creators,
      uses,
      grouping,
      supply,
      mutable,
    } = asset;

    const coll = grouping.find(
      (group) => group.group_key === "collection"
    )?.group_value;
    const tokenStandard = content.metadata.token_standard;
    const dataHashBuffer = new PublicKey(compression.data_hash).toBuffer();

    // Construct metadata args
    let metadataArgs: any = {
      name: content?.metadata?.name ?? "",
      symbol: content?.metadata?.symbol ?? " ",
      uri: content?.json_uri ?? "",
      sellerFeeBasisPoints: royalty.basis_points,
      creators: creators.map((creator) => ({
        address: new PublicKey(creator.address),
        share: creator.share,
        verified: creator.verified,
      })),
      primarySaleHappened: royalty.primary_sale_happened,
      isMutable: mutable,
      editionNonce: supply?.edition_nonce != null ? supply.edition_nonce : null,
      tokenStandard:
        tokenStandard === "Fungible"
          ? TokenStandard.Fungible
          : tokenStandard === "NonFungibleEdition"
          ? TokenStandard.NonFungibleEdition
          : tokenStandard === "FungibleAsset"
          ? TokenStandard.FungibleAsset
          : TokenStandard.NonFungible,
      collection: coll ? { key: new PublicKey(coll), verified: true } : null,
      uses: uses
        ? {
            useMethod:
              uses.use_method === "Burn"
                ? 0
                : uses.use_method === "Multiple"
                ? 1
                : 2,
            remaining: uses.remaining,
            total: uses.total,
          }
        : null,
      tokenProgramVersion: 0,
    };

    const originalMetadata = { ...metadataArgs };
    const sellerFeeBasisPointsBuffer = new BN(royalty.basis_points).toBuffer(
      "le",
      2
    );

    // Hash function to compare against data_hash
    const makeDataHash = (metadataArgs: any) =>
      Buffer.from(
        keccak_256.digest(
          Buffer.concat([
            new PublicKey(computeMetadataArgsHash(metadataArgs)).toBuffer(),
            sellerFeeBasisPointsBuffer,
          ])
        )
      );

    // Try different variations to match data hash
    let hash = makeDataHash(metadataArgs);
    if (hash.equals(dataHashBuffer))
      return new PublicKey(computeMetadataArgsHash(metadataArgs));

    // Try tokenStandard = null
    metadataArgs.tokenStandard = null;
    hash = makeDataHash(metadataArgs);
    if (hash.equals(dataHashBuffer))
      return new PublicKey(computeMetadataArgsHash(metadataArgs));

    // Try name + uri = "", tokenStandard = null
    metadataArgs.name = "";
    metadataArgs.uri = "";
    hash = makeDataHash(metadataArgs);
    if (hash.equals(dataHashBuffer))
      return new PublicKey(computeMetadataArgsHash(metadataArgs));

    // Try name + uri = "", tokenStandard = 0
    metadataArgs.tokenStandard = 0;
    hash = makeDataHash(metadataArgs);
    if (hash.equals(dataHashBuffer))
      return new PublicKey(computeMetadataArgsHash(metadataArgs));

    // Try reversing creators
    metadataArgs.creators.reverse();
    metadataArgs.name = originalMetadata.name;
    metadataArgs.uri = originalMetadata.uri;
    metadataArgs.tokenStandard = originalMetadata.tokenStandard;
    hash = makeDataHash(metadataArgs);
    if (hash.equals(dataHashBuffer))
      return new PublicKey(computeMetadataArgsHash(metadataArgs));

    // Can't match - return null
    return null;
  }

  // ==================== Tensor API Methods ====================

  /**
   * Make GraphQL query to Tensor API
   */
  private async queryTensorApi(query: string, variables?: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Tensor API key required for API calls");
    }

    try {
      const response = await axios.post(
        this.apiBaseUrl,
        {
          query,
          variables,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "X-TENSOR-API-KEY": this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error querying Tensor API:", error);
      throw error;
    }
  }

  /**
   * Get all collections
   */
  async getAllCollections(limit: number = 100): Promise<CollectionInfo[]> {
    const query = `
      query GetCollections($limit: Int!) {
        instrumentTV2(
          limit: $limit
        ) {
          id
          slug
          name
          imageUri
          statsV2 {
            floorPrice
            numListed
            numMints
          }
        }
      }
    `;

    const response = await this.queryTensorApi(query, { limit });
    return response.data?.instrumentTV2 || [];
  }

  /**
   * Get collection by slug
   */
  async getCollectionBySlug(slug: string): Promise<CollectionInfo | null> {
    const query = `
      query GetCollection($slug: String!) {
        instrumentTV2(slug: $slug) {
          id
          slug
          name
          imageUri
          statsV2 {
            floorPrice
            numListed
            numMints
          }
        }
      }
    `;

    const response = await this.queryTensorApi(query, { slug });
    return response.data?.instrumentTV2?.[0] || null;
  }

  /**
   * Get collection by mint address
   */
  async getCollectionByMint(mint: string): Promise<CollectionInfo | null> {
    const query = `
      query GetCollectionByMint($mint: String!) {
        mint(mint: $mint) {
          instrumentTV2 {
            id
            slug
            name
            imageUri
            statsV2 {
              floorPrice
              numListed
              numMints
            }
          }
        }
      }
    `;

    const response = await this.queryTensorApi(query, { mint });
    return response.data?.mint?.instrumentTV2 || null;
  }

  /**
   * Get mint proof from Tensor API
   * Required for selling/depositing NFTs in some collections
   */
  async getMintProof(mint: string): Promise<MintProof | null> {
    const query = `
      query GetMintProof($mint: String!) {
        mintProof(mint: $mint) {
          proof
          mint
          root
        }
      }
    `;

    const response = await this.queryTensorApi(query, { mint });
    return response.data?.mintProof || null;
  }

  /**
   * Get active listings for a collection
   */
  async getActiveListings(slug: string, limit: number = 20): Promise<any[]> {
    const query = `
      query GetListings($slug: String!, $limit: Int!) {
        activeListingsV2(slug: $slug, limit: $limit) {
          txs {
            mint
            tx {
              grossAmount
              grossAmountUnit
            }
            seller
          }
        }
      }
    `;

    const response = await this.queryTensorApi(query, { slug, limit });
    return response.data?.activeListingsV2?.txs || [];
  }

  /**
   * Get floor price for a collection
   */
  async getFloorPrice(slug: string): Promise<number | null> {
    const collection = await this.getCollectionBySlug(slug);
    return collection?.statsV2?.floorPrice || null;
  }

  // ==================== Helper Methods ====================

  /**
   * Get collection UUID from slug
   * UUID is used for whitelist PDA derivation
   */
  async getCollectionUuid(slug: string): Promise<string | null> {
    const collection = await this.getCollectionBySlug(slug);
    return collection?.id || null;
  }

  /**
   * Prepare sell transaction with automatic proof handling
   */
  async prepareSellTransaction(params: SellNftParams): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    // Check if mint proof is required
    const proofRequired = await this.isMintProofRequired(params.whitelist);

    if (proofRequired) {
      // Fetch proof from API
      const mintProofData = await this.getMintProof(params.nftMint.toString());

      if (mintProofData) {
        const proof = mintProofData.proof.map((p) => Buffer.from(p, "hex"));

        // Create proof transaction
        const { ixs: proofIxs } = await this.initMintProof(
          params.seller,
          params.whitelist,
          params.nftMint,
          proof
        );

        const proofTx = new Transaction();
        proofIxs.forEach((ix) => proofTx.add(ix));
        transactions.push(proofTx);
      }
    }

    // Create sell transaction
    const { ixs: sellIxs } = await this.sellNft(params);
    const sellTx = new Transaction();
    sellIxs.forEach((ix) => sellTx.add(ix));
    transactions.push(sellTx);

    return transactions;
  }

  /**
   * Prepare buy transaction
   */
  async prepareBuyTransaction(params: BuyNftParams): Promise<Transaction> {
    const { ixs } = await this.buyNft(params);
    const tx = new Transaction();
    ixs.forEach((ix) => tx.add(ix));
    return tx;
  }

  /**
   * Get best bid and ask for a collection
   */
  async getBestBidAsk(
    slug: string
  ): Promise<{ bid: number | null; ask: number | null }> {
    const query = `
      query GetBidAsk($slug: String!) {
        instrumentTV2(slug: $slug) {
          statsV2 {
            floorPrice
            highestBid
          }
        }
      }
    `;

    const response = await this.queryTensorApi(query, { slug });
    const stats = response.data?.instrumentTV2?.[0]?.statsV2;

    return {
      ask: stats?.floorPrice || null,
      bid: stats?.highestBid || null,
    };
  }
}

// Export types and enums
export { TakerSide, Target };
export type { PoolConfig as TensorPoolConfig };
