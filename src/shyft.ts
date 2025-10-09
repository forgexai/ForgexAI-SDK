import { ShyftSdk, Network, ValidDepthSizePair } from "@shyft-to/js";

export class ShyftService {
  private shyft: ShyftSdk;
  private network: Network;

  constructor(apiKey: string, network: Network = Network.Mainnet) {
    this.network = network;
    this.shyft = new ShyftSdk({ apiKey, network });
  }

  // ============ Wallet APIs ============

  /**
   * Get wallet balance
   * @param wallet - Wallet address
   * @returns Balance information
   */
  async getWalletBalance(wallet: string): Promise<any> {
    try {
      const balance = await this.shyft.wallet.getBalance({ wallet });
      return balance;
    } catch (error) {
      throw new Error(`Failed to fetch wallet balance: ${error.message}`);
    }
  }

  /**
   * Send SOL from one wallet to another
   * @param fromAddress - Sender wallet address
   * @param toAddress - Recipient wallet address
   * @param amount - Amount in SOL
   * @returns Transaction details
   */
  async sendSol(
    fromAddress: string,
    toAddress: string,
    amount: number
  ): Promise<any> {
    try {
      const result = await this.shyft.wallet.sendSol({
        fromAddress,
        toAddress,
        amount,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to send SOL: ${error.message}`);
    }
  }

  /**
   * Get balance of a specific token in wallet
   * @param wallet - Wallet address
   * @param tokenAddress - Token mint address
   * @returns Token balance
   */
  async getTokenBalance(wallet: string, tokenAddress: string): Promise<any> {
    try {
      const balance = await this.shyft.wallet.getTokenBalance({
        wallet,
        token: tokenAddress,
      });
      return balance;
    } catch (error) {
      throw new Error(`Failed to fetch token balance: ${error.message}`);
    }
  }

  /**
   * Get all token balances in wallet
   * @param wallet - Wallet address
   * @returns All token balances
   */
  async getAllTokenBalances(wallet: string): Promise<any> {
    try {
      const balances = await this.shyft.wallet.getAllTokenBalance({ wallet });
      return balances;
    } catch (error) {
      throw new Error(`Failed to fetch all token balances: ${error.message}`);
    }
  }

  /**
   * Get wallet portfolio (all tokens and NFTs)
   * @param wallet - Wallet address
   * @returns Portfolio information
   */
  async getPortfolio(wallet: string): Promise<any> {
    try {
      const portfolio = await this.shyft.wallet.getPortfolio({ wallet });
      return portfolio;
    } catch (error) {
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }
  }

  /**
   * Get transaction history
   * @param wallet - Wallet address
   * @param beforeSignature - Optional: Get transactions before this signature
   * @param limit - Number of transactions to fetch
   * @returns Transaction history
   */
  async getTransactionHistory(
    wallet: string,
    beforeSignature?: string,
    limit: number = 10
  ): Promise<any> {
    try {
      const history = await this.shyft.wallet.transactionHistory({
        network: this.network,
        wallet,
        beforeTxSignature: beforeSignature,
        limit,
      });
      return history;
    } catch (error) {
      throw new Error(`Failed to fetch transaction history: ${error.message}`);
    }
  }

  // ============ NFT APIs ============

  /**
   * Get NFT by mint address
   * @param mint - NFT mint address
   * @returns NFT details
   */
  async getNftByMint(mint: string): Promise<any> {
    try {
      const nft = await this.shyft.nft.getNftByMint({ mint });
      return nft;
    } catch (error) {
      throw new Error(`Failed to fetch NFT: ${error.message}`);
    }
  }

  /**
   * Get all NFTs owned by a wallet
   * @param owner - Wallet address
   * @returns Array of NFTs
   */
  async getNftsByOwner(owner: string): Promise<any> {
    try {
      const nfts = await this.shyft.nft.getNftByOwner({ owner });
      return nfts;
    } catch (error) {
      throw new Error(`Failed to fetch NFTs by owner: ${error.message}`);
    }
  }

  /**
   * Get NFTs by owner with pagination
   * @param owner - Wallet address
   * @param page - Page number
   * @param size - Page size (max 50)
   * @returns Paginated NFT list
   */
  async getNftsByOwnerPaginated(
    owner: string,
    page: number = 1,
    size: number = 50
  ): Promise<any> {
    try {
      const nfts = await this.shyft.nft.getNftsByOwnerV2({
        owner,
        page,
        size,
      });
      return nfts;
    } catch (error) {
      throw new Error(`Failed to fetch paginated NFTs: ${error.message}`);
    }
  }

  /**
   * Create NFT from metadata URI
   * @param creatorWallet - Creator wallet address
   * @param metadataUri - URI to metadata JSON
   * @param maxSupply - Maximum supply (optional, for editions)
   * @returns Transaction details
   */
  async createNftFromMetadata(
    creatorWallet: string,
    metadataUri: string,
    maxSupply?: number
  ): Promise<any> {
    try {
      const result = await this.shyft.nft.createFromMetadata({
        receiver: creatorWallet,
        metadataUri,
        maxSupply,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to create NFT: ${error.message}`);
    }
  }

  /**
   * Transfer NFT
   * @param fromAddress - Sender wallet
   * @param toAddress - Recipient wallet
   * @param nftAddress - NFT mint address
   * @returns Transaction details
   */
  async transferNft(
    fromAddress: string,
    toAddress: string,
    nftAddress: string
  ): Promise<any> {
    try {
      const result = await this.shyft.nft.transfer({
        fromAddress,
        toAddress,
        mint: nftAddress,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to transfer NFT: ${error.message}`);
    }
  }

  /**
   * Burn NFT
   * @param wallet - Wallet address
   * @param nftAddress - NFT mint address
   * @returns Transaction details
   */
  async burnNft(wallet: string, nftAddress: string): Promise<any> {
    try {
      const result = await this.shyft.nft.burn({
        wallet,
        mint: nftAddress,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to burn NFT: ${error.message}`);
    }
  }

  // ============ Compressed NFT APIs ============
  /**
   * Create merkle tree for compressed NFTs
   * @param creatorWallet - Creator wallet address
   * @param maxDepth - Tree depth (choose valid preset)
   * @param maxBufferSize - Buffer size (choose valid preset)
   * @returns Merkle tree details
   */
  async createMerkleTree(
    creatorWallet: string,
    maxDepth: 14 | 15 | 16 | 17 | 18 | 19 | 20 | 24 | 26 | 30 = 14,
    maxBufferSize: 64 | 256 | 512 | 1024 | 2048 = 64
  ): Promise<any> {
    try {
      const maxDepthSizePair = {
        maxDepth,
        maxBufferSize,
      } as unknown as ValidDepthSizePair;

      const result = await this.shyft.nft.compressed.createMerkleTree({
        walletAddress: creatorWallet,
        maxDepthSizePair,
        canopyDepth: 0,
      });
      return result;
    } catch (error: any) {
      throw new Error(`Failed to create merkle tree: ${error.message}`);
    }
  }

  /**
   * Mint compressed NFT
   * @param creatorWallet - Creator wallet address
   * @param merkleTree - Merkle tree address
   * @param metadataUri - Metadata URI
   * @param collectionAddress - Collection address
   * @param receiver - Receiver wallet address
   * @returns Minted cNFT details
   */
  async mintCompressedNft(
    feePayer: string | undefined,
    merkleTree: string,
    metadataUri: string,
    collectionAddress: string,
    receiver: string
  ): Promise<any> {
    try {
      const params: any = {
        merkleTree,
        metadataUri,
        collectionAddress,
        receiver,
      };
      if (feePayer) {
        params.feePayer = feePayer;
      }

      const result = await this.shyft.nft.compressed.mint(params);
      return result;
    } catch (error) {
      throw new Error(`Failed to mint compressed NFT: ${error.message}`);
    }
  }

  /**
   * Read compressed NFT data
   * @param nftAddress - cNFT address
   * @returns cNFT details
   */
  async readCompressedNft(nftAddress: string): Promise<any> {
    try {
      const result = await this.shyft.nft.compressed.read({
        mint: nftAddress,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to read compressed NFT: ${error.message}`);
    }
  }

  /**
   * Get all compressed NFTs in a wallet
   * @param wallet - Wallet address
   * @param page - Page number
   * @param size - Page size (max 50)
   * @returns Array of cNFTs
   */
  async getAllCompressedNfts(
    wallet: string,
    page: number = 1,
    size: number = 50
  ): Promise<any> {
    try {
      const result = await this.shyft.nft.compressed.readAllV2({
        walletAddress: wallet,
        page,
        size,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch compressed NFTs: ${error.message}`);
    }
  }

  /**
   * Transfer compressed NFT
   * @param fromAddress - Sender wallet
   * @param toAddress - Recipient wallet
   * @param nftAddress - cNFT address
   * @returns Transaction details
   */
  async transferCompressedNft(
    fromAddress: string,
    toAddress: string,
    nftAddress: string
  ): Promise<any> {
    try {
      const result = await this.shyft.nft.compressed.transfer({
        fromAddress,
        toAddress,
        mint: nftAddress,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to transfer compressed NFT: ${error.message}`);
    }
  }

  // ============ Token APIs ============

  /**
   * Get token information
   * @param tokenAddress - Token mint address
   * @returns Token information
   */
  async getTokenInfo(tokenAddress: string): Promise<any> {
    try {
      const info = await this.shyft.token.getInfo({
        network: this.network,
        tokenAddress,
      });
      return info;
    } catch (error) {
      throw new Error(`Failed to fetch token info: ${error.message}`);
    }
  }

  /**
   * Create fungible token
   * @param creatorWallet - Creator wallet address
   * @param name - Token name
   * @param symbol - Token symbol
   * @param decimals - Token decimals
   * @param image - Token image file (required by SDK)
   * @param description - Optional token description
   * @param initialSupply - Optional initial supply to mint to creator
   * @returns Created token details
   */
  async createToken(
    creatorWallet: string,
    name: string,
    symbol: string,
    decimals: number,
    image: File,
    description?: string,
    initialSupply?: number
  ): Promise<any> {
    try {
      const result = await this.shyft.token.create({
        creatorWallet,
        name,
        symbol,
        description,
        decimals,
        image,
      });

      if (initialSupply && initialSupply > 0) {
        const tokenAddress =
          (result as any).tokenAddress ||
          (result as any).mint ||
          (result as any).address;
        if (tokenAddress) {
          await this.shyft.token.mint({
            tokenAddress,
            mintAuthority: creatorWallet,
            receiver: creatorWallet,
            amount: initialSupply,
          });
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to create token: ${error.message}`);
    }
  }
  /**
   * Mint additional tokens
   * @param tokenAddress - Token mint address
   * @param mintAuthority - Mint authority wallet address (required by SDK)
   * @param receiverWallet - Receiver wallet address
   * @param amount - Amount to mint
   * @returns Transaction details
   */
  async mintTokens(
    tokenAddress: string,
    mintAuthority: string,
    receiverWallet: string,
    amount: number
  ): Promise<any> {
    try {
      const result = await this.shyft.token.mint({
        tokenAddress,
        mintAuthority,
        receiver: receiverWallet,
        amount,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  }

  /**
   * Transfer tokens
   * @param fromAddress - Sender wallet
   * @param toAddress - Recipient wallet
   * @param tokenAddress - Token mint address
   * @param amount - Amount to transfer
   * @returns Transaction details
   */
  async transferTokens(
    fromAddress: string,
    toAddress: string,
    tokenAddress: string,
    amount: number
  ): Promise<any> {
    try {
      const result = await this.shyft.token.transfer({
        fromAddress,
        toAddress,
        tokenAddress,
        amount,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to transfer tokens: ${error.message}`);
    }
  }

  // ============ Marketplace APIs ============

  /**
   * Create a marketplace
   * @param creatorWallet - Creator wallet address
   * @param transactionFee - Transaction fee percentage
   * @returns Marketplace details
   */
  async createMarketplace(
    creatorWallet: string,
    transactionFee: number = 2
  ): Promise<any> {
    try {
      const result = await this.shyft.marketplace.create({
        creatorWallet,
        transactionFee,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to create marketplace: ${error.message}`);
    }
  }

  /**
   * List NFT on marketplace
   * @param marketplaceAddress - Marketplace address
   * @param nftAddress - NFT address
   * @param price - Listing price in SOL
   * @param sellerWallet - Seller wallet address
   * @returns Listing details
   */
  async listNft(
    marketplaceAddress: string,
    nftAddress: string,
    price: number,
    sellerWallet: string
  ): Promise<any> {
    try {
      const result = await this.shyft.marketplace.listing.list({
        marketplaceAddress,
        nftAddress,
        price,
        sellerWallet,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to list NFT: ${error.message}`);
    }
  }

  /**
   * Get active listings on marketplace
   * @param marketplaceAddress - Marketplace address
   * @param page - Page number
   * @param size - Page size
   * @returns Active listings
   */
  async getActiveListings(
    marketplaceAddress: string,
    page: number = 1,
    size: number = 10
  ): Promise<any> {
    try {
      const listings = await this.shyft.marketplace.listing.active({
        network: this.network,
        marketplaceAddress,
        page,
        size,
      });
      return listings;
    } catch (error) {
      throw new Error(`Failed to fetch active listings: ${error.message}`);
    }
  }

  /**
   * Buy NFT from marketplace
   * @param marketplaceAddress - Marketplace address
   * @param nftAddress - NFT address
   * @param price - Purchase price
   * @param sellerWallet - Seller wallet address
   * @param buyerWallet - Buyer wallet address
   * @returns Transaction details
   */
  async buyNft(
    marketplaceAddress: string,
    nftAddress: string,
    price: number,
    sellerWallet: string,
    buyerWallet: string
  ): Promise<any> {
    try {
      const result = await this.shyft.marketplace.listing.buy({
        network: this.network,
        marketplaceAddress,
        nftAddress,
        price,
        sellerWallet,
        buyerWallet,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to buy NFT: ${error.message}`);
    }
  }

  // ============ Storage APIs ============

  /**
   * Upload asset to IPFS
   * @param file - File to upload
   * @returns IPFS URI
   */
  async uploadAsset(file: File): Promise<{ uri: string }> {
    try {
      const result = await this.shyft.storage.uploadAsset({ file });
      return result;
    } catch (error) {
      throw new Error(`Failed to upload asset: ${error.message}`);
    }
  }

  /**
   * Create NFT metadata on IPFS
   * @param params - Metadata parameters
   * @returns Metadata URI
   */
  async createMetadata(params: {
    creator: string;
    image: string;
    name: string;
    symbol: string;
    description: string;
    attributes: Array<{ trait_type: string; value: any }>;
    sellerFeeBasisPoints: number;
  }): Promise<{ uri: string }> {
    try {
      const result = await this.shyft.storage.createMetadata(params);
      return result;
    } catch (error) {
      throw new Error(`Failed to create metadata: ${error.message}`);
    }
  }

  // ============ Transaction Relayer APIs ============

  /**
   * Get or create transaction relayer
   * @returns Relayer wallet address
   */
  async getOrCreateRelayer(): Promise<any> {
    try {
      const relayer = await this.shyft.txnRelayer.getOrCreate();
      return relayer;
    } catch (error) {
      throw new Error(`Failed to get/create relayer: ${error.message}`);
    }
  }

  /**
   * Sign and send transaction using relayer
   * @param encodedTransaction - Encoded transaction string
   * @returns Transaction signature
   */
  async signWithRelayer(encodedTransaction: string): Promise<any> {
    try {
      const result = await this.shyft.txnRelayer.sign({
        network: this.network,
        encodedTransaction,
      });
      return result;
    } catch (error) {
      throw new Error(`Failed to sign with relayer: ${error.message}`);
    }
  }

  // ============ RPC/DAS APIs ============

  /**
   * Get asset by ID (DAS API)
   * @param assetId - Asset ID
   * @returns Asset details
   */
  async getAsset(assetId: string): Promise<any> {
    try {
      const asset = await this.shyft.rpc.getAsset({ id: assetId });
      return asset;
    } catch (error) {
      throw new Error(`Failed to fetch asset: ${error.message}`);
    }
  }

  /**
   * Get assets by collection
   * @param collectionAddress - Collection address
   * @param page - Page number
   * @param limit - Results per page (max 1000)
   * @returns Collection assets
   */
  async getAssetsByCollection(
    collectionAddress: string,
    page: number = 1,
    limit: number = 1000
  ): Promise<any> {
    try {
      const response = await this.shyft.rpc.getAssetsByGroup({
        groupKey: "collection",
        groupValue: collectionAddress,
        sortBy: { sortBy: "created", sortDirection: "asc" },
        page,
        limit,
      });
      return response;
    } catch (error) {
      throw new Error(`Failed to fetch collection assets: ${error.message}`);
    }
  }

  /**
   * Get SDK instance for advanced operations
   * @returns ShyftSdk instance
   */
  getSdk(): ShyftSdk {
    return this.shyft;
  }
}
