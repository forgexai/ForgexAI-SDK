import {
  Dialect,
  TokenStore,
  EncryptionKeysStore,
  ThreadMemberScope,
  type Thread,
  type CreateThreadCommand,
  type SendMessageCommand,
  type FindThreadByIdQuery,
  type Dapp,
  DialectSdk,
  BlockchainType,
} from "@dialectlabs/sdk";

import {
  NodeDialectSolanaWalletAdapter,
  Solana,
  SolanaSdkFactory,
} from "@dialectlabs/blockchain-sdk-solana";

import { PublicKey, Connection, Keypair } from "@solana/web3.js";

/**
 * DialectService
 * -------------------
 * A modern service wrapper for interacting with Dialect’s messaging & dapp APIs.
 * Supports:
 *  - Messaging (threads, messages)
 *  - Dapp registration
 *  - Wallet notifications
 */
export class DialectService {
  private sdk: DialectSdk<Solana>;

  constructor(
    private readonly network:
      | "mainnet-beta"
      | "devnet"
      | "testnet" = "mainnet-beta",
    private readonly rpcUrl?: string,
    private readonly dialectApiUrl?: string
  ) {}

  /**
   * Initialize the Dialect SDK
   * NOTE: Requires DIALECT_SDK_CREDENTIALS in your environment
   *       (Solana keypair JSON array)
   */
  public async init() {
    try {
      const credentials = process.env.DIALECT_SDK_CREDENTIALS;
      if (!credentials) {
        throw new Error(
          "Missing DIALECT_SDK_CREDENTIALS (expects a JSON array keypair)"
        );
      }

      const secret = Uint8Array.from(JSON.parse(credentials));
      const keypair = Keypair.fromSecretKey(secret);

      const rpc =
        this.rpcUrl ||
        (this.network === "mainnet-beta"
          ? "https://api.mainnet-beta.solana.com"
          : "https://api.devnet.solana.com");

      const dialectCloud = {
        url: this.dialectApiUrl || "https://api.dialect.to",
        tokenStore: TokenStore.createInMemory(),
      };

      const environment =
        this.network === "mainnet-beta" ? "production" : "development";

      const encryptionKeysStore = EncryptionKeysStore.createInMemory();

      const walletAdapter = NodeDialectSolanaWalletAdapter.create();

      this.sdk = Dialect.sdk(
        {
          environment,
          dialectCloud,
          encryptionKeysStore,
        },
        SolanaSdkFactory.create({
          wallet: walletAdapter,
        })
      );

      console.log("✅ Dialect SDK initialized for", this.network);
    } catch (err) {
      console.error("❌ Failed to initialize Dialect SDK:", err);
      throw err;
    }
  }

  /**
   * Get all message threads for the connected wallet.
   */
  public async getAllThreads(): Promise<Thread[]> {
    this.ensureInitialized();
    try {
      return await this.sdk.threads.findAll();
    } catch (err) {
      console.error("❌ Error fetching threads:", err);
      throw err;
    }
  }

  /**
   * Get a specific thread by ID.
   */
  public async getThreadById(
    query: FindThreadByIdQuery
  ): Promise<Thread | null> {
    this.ensureInitialized();
    try {
      return await this.sdk.threads.find(query);
    } catch (err) {
      console.error("❌ Error fetching thread:", err);
      throw err;
    }
  }

  /**
   * Create a new message thread between current wallet & recipient.
   */
  public async createThread(recipientPubkey: string): Promise<Thread> {
    this.ensureInitialized();
    try {
      const recipientPublicKey = new PublicKey(recipientPubkey);

      const command = {
        encrypted: false,
        me: {
          scopes: [ThreadMemberScope.ADMIN, ThreadMemberScope.WRITE],
        },
        otherMembers: [
          {
            member: recipientPublicKey.toBase58(),
            scopes: [ThreadMemberScope.ADMIN, ThreadMemberScope.WRITE],
          },
        ],
      } as unknown as CreateThreadCommand;
      return await this.sdk.threads.create(command);
      return await this.sdk.threads.create(command);
    } catch (err) {
      console.error("❌ Error creating thread:", err);
      throw err;
    }
  }

  /**
   * Send a message within a thread.
   */
  public async sendMessage(thread: Thread, text: string): Promise<void> {
    this.ensureInitialized();
    try {
      const command: SendMessageCommand = { text };
      await thread.send(command);
    } catch (err) {
      console.error("❌ Error sending message:", err);
      throw err;
    }
  }

  /**
   * Retrieve messages from a thread.
   */
  public async getMessages(thread: Thread): Promise<any[]> {
    this.ensureInitialized();
    try {
      return await thread.messages();
    } catch (err) {
      console.error("❌ Error fetching messages:", err);
      throw err;
    }
  }

  /**
   * Delete a thread.
   */
  public async deleteThread(thread: Thread): Promise<void> {
    this.ensureInitialized();
    try {
      await thread.delete();
    } catch (err) {
      console.error("❌ Error deleting thread:", err);
      throw err;
    }
  }

  /**
   * Register a new dapp for notifications.
   */
  public async registerDapp(name: string, description: string): Promise<any> {
    this.ensureInitialized();
    try {
      const dapp = await this.sdk.dapps.create({
        name,
        description,
        blockchainType: BlockchainType.SOLANA,
      });
      console.log(`✅ Dapp registered: ${name}`);
      return dapp;
    } catch (err) {
      console.error("❌ Error registering dapp:", err);
      throw err;
    }
  }

  /**
   * Fetch the connected wallet’s dapp (if exists).
   */
  public async getDapp(): Promise<Dapp | null> {
    this.ensureInitialized();
    try {
      return await this.sdk.dapps.find();
    } catch (err) {
      console.error("❌ Error fetching dapp:", err);
      throw err;
    }
  }

  /**
   * Get all registered dapps.
   */
  public async getAllDapps(): Promise<any[]> {
    this.ensureInitialized();
    try {
      return await this.sdk.dapps.findAll();
    } catch (err) {
      console.error("❌ Error fetching dapps:", err);
      throw err;
    }
  }

  /**
   * Get all whitelisted dapp messages.
   */
  public async getWhitelistedMessages() {
    this.ensureInitialized();
    try {
      return await this.sdk.wallet.messages.findAllFromDapps({
        dappVerified: true,
      });
    } catch (err) {
      console.error("❌ Error fetching whitelisted messages:", err);
      throw err;
    }
  }

  /**
   * Utility: return wallet’s public key.
   */
  public getWalletPublicKey(): string {
    this.ensureInitialized();
    return this.sdk.wallet.address ?? "unknown";
  }

  private ensureInitialized() {
    if (!this.sdk) {
      throw new Error("⚠️ DialectService not initialized. Call init() first.");
    }
  }
}
