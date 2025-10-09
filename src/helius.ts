import axios from "axios";
import { Connection, PublicKey } from "@solana/web3.js";
import type {
  HeliusNftMetadata,
  HeliusWalletActivity,
  HeliusWebhookConfig,
} from "./types";

const HELIUS_API_BASE = "https://api.helius.xyz/v1";

/**
 * Client for interacting with Helius API for NFT metadata and wallet events
 */
export class HeliusClient {
  private apiKey: string;
  private connection: Connection;

  /**
   * Create a new Helius client instance
   * @param connection - Solana connection
   * @param apiKey - Helius API key (required)
   */
  constructor(connection: Connection, apiKey: string) {
    if (!apiKey) {
      throw new Error("Helius API key is required");
    }
    this.connection = connection;
    this.apiKey = apiKey;
  }

  /**
   * Get NFT metadata by mint address
   * @param mintAddress - NFT mint address
   * @returns NFT metadata
   */
  async getNftMetadata(mintAddress: string): Promise<HeliusNftMetadata> {
    try {
      const response = await axios.post(
        `${HELIUS_API_BASE}/nfts?api-key=${this.apiKey}`,
        {
          query: {
            mintAccounts: [mintAddress],
          },
          options: {
            showCollectionMetadata: true,
          },
        }
      );

      if (
        !response.data ||
        !response.data.result ||
        response.data.result.length === 0
      ) {
        throw new Error(`No metadata found for NFT ${mintAddress}`);
      }

      const nft = response.data.result[0];

      return {
        mint: nft.mint,
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        image: nft.image,
        attributes: nft.attributes,
        collection: nft.collection,
        properties: nft.properties,
        creators: nft.creators,
        owner: nft.owner,
        tokenStandard: nft.tokenStandard,
        royalty: nft.royalty,
      };
    } catch (error) {
      console.error(`Error fetching NFT metadata for ${mintAddress}:`, error);
      throw new Error(
        `Failed to fetch NFT metadata: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get multiple NFT metadata by mint addresses
   * @param mintAddresses - Array of NFT mint addresses
   * @returns Array of NFT metadata
   */
  async getBatchNftMetadata(
    mintAddresses: string[]
  ): Promise<HeliusNftMetadata[]> {
    try {
      const response = await axios.post(
        `${HELIUS_API_BASE}/nfts?api-key=${this.apiKey}`,
        {
          query: {
            mintAccounts: mintAddresses,
          },
          options: {
            showCollectionMetadata: true,
          },
        }
      );

      if (
        !response.data ||
        !response.data.result ||
        response.data.result.length === 0
      ) {
        throw new Error("No metadata found for provided NFTs");
      }

      return response.data.result.map((nft: any) => ({
        mint: nft.mint,
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        image: nft.image,
        attributes: nft.attributes,
        collection: nft.collection,
        properties: nft.properties,
        creators: nft.creators,
        owner: nft.owner,
        tokenStandard: nft.tokenStandard,
        royalty: nft.royalty,
      }));
    } catch (error) {
      console.error("Error fetching batch NFT metadata:", error);
      throw new Error(
        `Failed to fetch batch NFT metadata: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get all NFTs owned by a wallet
   * @param walletAddress - Wallet address
   * @returns Array of NFTs owned by the wallet
   */
  async getWalletNfts(walletAddress: string): Promise<HeliusNftMetadata[]> {
    try {
      const response = await axios.post(
        `${HELIUS_API_BASE}/nfts?api-key=${this.apiKey}`,
        {
          query: {
            ownerAddress: walletAddress,
          },
          options: {
            showCollectionMetadata: true,
          },
        }
      );

      if (
        !response.data ||
        !response.data.result ||
        response.data.result.length === 0
      ) {
        return [];
      }

      return response.data.result.map((nft: any) => ({
        mint: nft.mint,
        name: nft.name,
        symbol: nft.symbol,
        description: nft.description,
        image: nft.image,
        attributes: nft.attributes,
        collection: nft.collection,
        properties: nft.properties,
        creators: nft.creators,
        owner: nft.owner,
        tokenStandard: nft.tokenStandard,
        royalty: nft.royalty,
      }));
    } catch (error) {
      console.error(`Error fetching NFTs for wallet ${walletAddress}:`, error);
      throw new Error(
        `Failed to fetch wallet NFTs: ${(error as Error).message}`
      );
    }
  }

  /**
   * Get recent wallet activity for a wallet
   * @param walletAddress - Wallet address
   * @param limit - Maximum number of activities to return (default: 10)
   * @returns Array of wallet activities
   */
  async getWalletActivity(
    walletAddress: string,
    limit = 10
  ): Promise<HeliusWalletActivity[]> {
    try {
      const response = await axios.post(
        `${HELIUS_API_BASE}/transactions?api-key=${this.apiKey}`,
        {
          query: {
            accounts: [walletAddress],
          },
          options: {
            limit,
          },
        }
      );

      if (
        !response.data ||
        !response.data.result ||
        response.data.result.length === 0
      ) {
        return [];
      }

      return response.data.result.map((activity: any) => ({
        signature: activity.signature,
        timestamp: activity.timestamp,
        type: activity.type,
        fee: activity.fee,
        feePayer: activity.feePayer,
        nativeTransfers: activity.nativeTransfers,
        tokenTransfers: activity.tokenTransfers,
        accountData: activity.accountData,
        source: activity.source,
      }));
    } catch (error) {
      console.error(
        `Error fetching wallet activity for ${walletAddress}:`,
        error
      );
      throw new Error(
        `Failed to fetch wallet activity: ${(error as Error).message}`
      );
    }
  }

  /**
   * Create a webhook for wallet events
   * @param params - Webhook configuration
   * @param params.webhookURL - The URL that will receive webhook events
   * @param params.walletAddresses - Array of wallet addresses to monitor
   * @param params.eventTypes - Array of event types to monitor (e.g., "NFT_MINT", "NFT_SALE", "TOKEN_TRANSFER")
   * @param params.webhookName - Optional name for the webhook
   * @returns Webhook configuration including ID
   */
  async createWebhook({
    webhookURL,
    walletAddresses,
    eventTypes,
    webhookName,
  }: {
    webhookURL: string;
    walletAddresses: string[];
    eventTypes: string[];
    webhookName?: string;
  }): Promise<HeliusWebhookConfig> {
    try {
      const response = await axios.post(
        `${HELIUS_API_BASE}/webhooks?api-key=${this.apiKey}`,
        {
          webhookURL,
          accountAddresses: walletAddresses,
          transactionTypes: eventTypes,
          webhookType: "enhanced",
          webhookName:
            webhookName || `Webhook for ${walletAddresses.length} wallets`,
        }
      );

      return {
        webhookID: response.data.webhookID,
        webhookURL: response.data.webhookURL,
        walletAddresses: response.data.accountAddresses,
        eventTypes: response.data.transactionTypes,
        webhookName: response.data.webhookName,
      };
    } catch (error) {
      console.error("Error creating Helius webhook:", error);
      throw new Error(`Failed to create webhook: ${(error as Error).message}`);
    }
  }

  /**
   * Delete a webhook
   * @param webhookID - ID of the webhook to delete
   * @returns Success status
   */
  async deleteWebhook(webhookID: string): Promise<{ success: boolean }> {
    try {
      await axios.delete(
        `${HELIUS_API_BASE}/webhooks/${webhookID}?api-key=${this.apiKey}`
      );

      return { success: true };
    } catch (error) {
      console.error(`Error deleting webhook ${webhookID}:`, error);
      throw new Error(`Failed to delete webhook: ${(error as Error).message}`);
    }
  }

  /**
   * Get all active webhooks
   * @returns Array of active webhook configurations
   */
  async getWebhooks(): Promise<HeliusWebhookConfig[]> {
    try {
      const response = await axios.get(
        `${HELIUS_API_BASE}/webhooks?api-key=${this.apiKey}`
      );

      return response.data.map((webhook: any) => ({
        webhookID: webhook.webhookID,
        webhookURL: webhook.webhookURL,
        walletAddresses: webhook.accountAddresses,
        eventTypes: webhook.transactionTypes,
        webhookName: webhook.webhookName,
      }));
    } catch (error) {
      console.error("Error fetching Helius webhooks:", error);
      throw new Error(`Failed to fetch webhooks: ${(error as Error).message}`);
    }
  }
}
