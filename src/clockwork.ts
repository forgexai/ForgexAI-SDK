import { ClockworkProvider } from "@clockwork-xyz/sdk";
import { AnchorProvider } from "@project-serum/anchor";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Commitment,
  TransactionInstruction,
} from "@solana/web3.js";

export class ClockworkService {
  private keypair: Keypair;
  private connection: Connection;
  private anchorProvider: AnchorProvider;
  private clockworkProvider: ClockworkProvider;
  private readonly commitment: Commitment = "processed";

  constructor(
    private readonly network: "mainnet-beta" | "devnet" | "testnet" = "devnet",
    private readonly secretKey?: Uint8Array
  ) {
    this.keypair = secretKey
      ? Keypair.fromSecretKey(secretKey)
      : Keypair.generate();

    this.connection = new Connection(
      clusterApiUrl(this.network),
      this.commitment
    );

    this.anchorProvider = new AnchorProvider(
      this.connection,
      this.keypair as unknown as NodeWallet,
      {}
    );

    this.clockworkProvider = ClockworkProvider.fromAnchorProvider(
      this.anchorProvider
    );
  }

  /**
   * Returns all threads for the current authority.
   */
  public async getAllThreads() {
    try {
      const program = this.clockworkProvider.threadProgram;
      const threads = await program.account.thread.all();
      return threads;
    } catch (error) {
      console.error("❌ Error fetching threads:", error);
      throw error;
    }
  }

  /**
   * Fetch a thread account by its public key.
   */
  public async getThreadAccount(pubkey: string) {
    try {
      const thread = await this.clockworkProvider.getThreadAccount(
        new PublicKey(pubkey)
      );
      return thread;
    } catch (error) {
      console.error(`❌ Error fetching thread ${pubkey}:`, error);
      throw error;
    }
  }

  /**
   * Create a new thread.
   */
  public async createThread(
    id: string,
    instructions: TransactionInstruction[],
    trigger: any,
    amount = 0
  ) {
    try {
      const authority = this.keypair.publicKey;
      const ix = await this.clockworkProvider.threadCreate(
        authority,
        id,
        instructions,
        trigger,
        amount
      );
      return ix;
    } catch (error) {
      console.error("❌ Error creating thread:", error);
      throw error;
    }
  }

  /**
   * Delete a thread.
   */
  public async deleteThread(threadPubkey: string) {
    try {
      const authority = this.keypair.publicKey;
      const ix = await this.clockworkProvider.threadDelete(
        authority,
        new PublicKey(threadPubkey)
      );
      return ix;
    } catch (error) {
      console.error("❌ Error deleting thread:", error);
      throw error;
    }
  }

  /**
   * Pause a thread.
   */
  public async pauseThread(threadPubkey: string) {
    try {
      const authority = this.keypair.publicKey;
      const ix = await this.clockworkProvider.threadPause(
        authority,
        new PublicKey(threadPubkey)
      );
      return ix;
    } catch (error) {
      console.error("❌ Error pausing thread:", error);
      throw error;
    }
  }

  /**
   * Resume a thread.
   */
  public async resumeThread(threadPubkey: string) {
    try {
      const authority = this.keypair.publicKey;
      const ix = await this.clockworkProvider.threadResume(
        authority,
        new PublicKey(threadPubkey)
      );
      return ix;
    } catch (error) {
      console.error("❌ Error resuming thread:", error);
      throw error;
    }
  }

  /**
   * Utility: get wallet pubkey
   */
  public getWalletPublicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  /**
   * Utility: get connection
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Utility: get threadProgram instance
   */
  public getProgram() {
    return this.clockworkProvider.threadProgram;
  }
}
