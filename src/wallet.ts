import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
} from "@solana/web3.js";

export interface WalletInfo {
  publicKey: string;
  balance: number;
  isConnected: boolean;
  walletType: WalletType;
}

export interface WalletTransaction {
  signature?: string;
  success: boolean;
  error?: string;
  timestamp: number;
}

export enum WalletType {
  PHANTOM = "phantom",
  SOLFLARE = "solflare",
  BACKPACK = "backpack",
  GENERATED = "generated",
  IMPORTED = "imported",
}

export interface WalletAdapter {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  isConnected(): boolean;
  getPublicKey(): string | null;
  walletType: WalletType;
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: Transaction): Promise<Transaction>;
      signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
      isConnected: boolean;
      publicKey: PublicKey | null;
    };
    solflare?: {
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: Transaction): Promise<Transaction>;
      signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
      isConnected: boolean;
      publicKey: PublicKey | null;
    };
    backpack?: {
      connect(): Promise<{ publicKey: PublicKey }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: Transaction): Promise<Transaction>;
      signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
      isConnected: boolean;
      publicKey: PublicKey | null;
    };
  }
}

export class PhantomWalletAdapter implements WalletAdapter {
  walletType = WalletType.PHANTOM;

  async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.solana?.isPhantom) {
      throw new Error("Phantom wallet not found");
    }

    try {
      const response = await window.solana.connect();
      return response.publicKey.toString();
    } catch (error: any) {
      throw new Error(`Failed to connect Phantom: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window?.solana) {
      await window.solana.disconnect();
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!window?.solana?.isConnected) {
      throw new Error("Phantom wallet not connected");
    }
    return await window.solana.signTransaction(transaction);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!window?.solana?.isConnected) {
      throw new Error("Phantom wallet not connected");
    }
    return await window.solana.signAllTransactions(transactions);
  }

  isConnected(): boolean {
    return window?.solana?.isConnected || false;
  }

  getPublicKey(): string | null {
    return window?.solana?.publicKey?.toString() || null;
  }
}

export class SolflareWalletAdapter implements WalletAdapter {
  walletType = WalletType.SOLFLARE;

  async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.solflare) {
      throw new Error("Solflare wallet not found");
    }

    try {
      const response = await window.solflare.connect();
      return response.publicKey.toString();
    } catch (error: any) {
      throw new Error(`Failed to connect Solflare: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window?.solflare) {
      await window.solflare.disconnect();
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!window?.solflare?.isConnected) {
      throw new Error("Solflare wallet not connected");
    }
    return await window.solflare.signTransaction(transaction);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!window?.solflare?.isConnected) {
      throw new Error("Solflare wallet not connected");
    }
    return await window.solflare.signAllTransactions(transactions);
  }

  isConnected(): boolean {
    return window?.solflare?.isConnected || false;
  }

  getPublicKey(): string | null {
    return window?.solflare?.publicKey?.toString() || null;
  }
}

export class BackpackWalletAdapter implements WalletAdapter {
  walletType = WalletType.BACKPACK;

  async connect(): Promise<string> {
    if (typeof window === "undefined" || !window.backpack) {
      throw new Error("Backpack wallet not found");
    }

    try {
      const response = await window.backpack.connect();
      return response.publicKey.toString();
    } catch (error: any) {
      throw new Error(`Failed to connect Backpack: ${error.message}`);
    }
  }

  async disconnect(): Promise<void> {
    if (window?.backpack) {
      await window.backpack.disconnect();
    }
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!window?.backpack?.isConnected) {
      throw new Error("Backpack wallet not connected");
    }
    return await window.backpack.signTransaction(transaction);
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!window?.backpack?.isConnected) {
      throw new Error("Backpack wallet not connected");
    }
    return await window.backpack.signAllTransactions(transactions);
  }

  isConnected(): boolean {
    return window?.backpack?.isConnected || false;
  }

  getPublicKey(): string | null {
    return window?.backpack?.publicKey?.toString() || null;
  }
}

export class KeypairWalletAdapter implements WalletAdapter {
  private keypair: Keypair;
  private _isConnected: boolean = false;
  walletType: WalletType;

  constructor(keypair: Keypair, walletType: WalletType = WalletType.GENERATED) {
    this.keypair = keypair;
    this.walletType = walletType;
  }

  async connect(): Promise<string> {
    this._isConnected = true;
    return this.keypair.publicKey.toString();
  }

  async disconnect(): Promise<void> {
    this._isConnected = false;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this._isConnected) {
      throw new Error("Wallet not connected");
    }
    transaction.sign(this.keypair);
    return transaction;
  }

  async signAllTransactions(
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    if (!this._isConnected) {
      throw new Error("Wallet not connected");
    }
    transactions.forEach((tx) => tx.sign(this.keypair));
    return transactions;
  }

  isConnected(): boolean {
    return this._isConnected;
  }

  getPublicKey(): string | null {
    return this._isConnected ? this.keypair.publicKey.toString() : null;
  }

  getKeypair(): Keypair {
    return this.keypair;
  }
}

export class SolanaWalletManager {
  private connection: Connection;
  private currentAdapter: WalletAdapter | null = null;
  private transactions: WalletTransaction[] = [];

  constructor(connection: Connection) {
    this.connection = connection;
  }

  getAvailableWallets(): WalletType[] {
    const available: WalletType[] = [];

    if (typeof window !== "undefined") {
      if (window.solana?.isPhantom) available.push(WalletType.PHANTOM);
      if (window.solflare) available.push(WalletType.SOLFLARE);
      if (window.backpack) available.push(WalletType.BACKPACK);
    }

    return available;
  }

  generateWallet(): KeypairWalletAdapter {
    const keypair = Keypair.generate();
    return new KeypairWalletAdapter(keypair, WalletType.GENERATED);
  }

  importWalletFromPrivateKey(privateKeyArray: number[]): KeypairWalletAdapter {
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    return new KeypairWalletAdapter(keypair, WalletType.IMPORTED);
  }

  async connectWallet(walletType: WalletType): Promise<string> {
    let adapter: WalletAdapter;

    switch (walletType) {
      case WalletType.PHANTOM:
        adapter = new PhantomWalletAdapter();
        break;
      case WalletType.SOLFLARE:
        adapter = new SolflareWalletAdapter();
        break;
      case WalletType.BACKPACK:
        adapter = new BackpackWalletAdapter();
        break;
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }

    const publicKey = await adapter.connect();
    this.currentAdapter = adapter;
    return publicKey;
  }

  async connectKeypairWallet(adapter: KeypairWalletAdapter): Promise<string> {
    const publicKey = await adapter.connect();
    this.currentAdapter = adapter;
    return publicKey;
  }

  async disconnect(): Promise<void> {
    if (this.currentAdapter) {
      await this.currentAdapter.disconnect();
      this.currentAdapter = null;
    }
  }

  async getWalletInfo(): Promise<WalletInfo | null> {
    if (!this.currentAdapter || !this.currentAdapter.isConnected()) {
      return null;
    }

    const publicKey = this.currentAdapter.getPublicKey();
    if (!publicKey) return null;

    try {
      const balance = await this.connection.getBalance(
        new PublicKey(publicKey)
      );
      return {
        publicKey,
        balance: balance / LAMPORTS_PER_SOL,
        isConnected: true,
        walletType: this.currentAdapter.walletType,
      };
    } catch (error) {
      console.error("Error fetching wallet info:", error);
      return {
        publicKey,
        balance: 0,
        isConnected: this.currentAdapter.isConnected(),
        walletType: this.currentAdapter.walletType,
      };
    }
  }

  async sendSOL(
    toAddress: string,
    amount: number,
    options?: { computeUnits?: number; priorityFee?: number }
  ): Promise<WalletTransaction> {
    if (!this.currentAdapter || !this.currentAdapter.isConnected()) {
      throw new Error("No wallet connected");
    }

    const publicKey = this.currentAdapter.getPublicKey();
    if (!publicKey) throw new Error("Unable to get public key");

    try {
      const transaction = new Transaction();

      if (options?.computeUnits) {
        transaction.add(
          ComputeBudgetProgram.setComputeUnitLimit({
            units: options.computeUnits,
          })
        );
      }

      if (options?.priorityFee) {
        transaction.add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: options.priorityFee,
          })
        );
      }

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(publicKey),
          toPubkey: new PublicKey(toAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(publicKey);

      const signedTransaction = await this.currentAdapter.signTransaction(
        transaction
      );

      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);

      const result: WalletTransaction = {
        signature,
        success: true,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    } catch (error: any) {
      const result: WalletTransaction = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    }
  }

  async executeTransaction(
    transaction: Transaction
  ): Promise<WalletTransaction> {
    if (!this.currentAdapter || !this.currentAdapter.isConnected()) {
      throw new Error("No wallet connected");
    }

    try {
      const signedTransaction = await this.currentAdapter.signTransaction(
        transaction
      );
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await this.connection.confirmTransaction(signature);

      const result: WalletTransaction = {
        signature,
        success: true,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    } catch (error: any) {
      const result: WalletTransaction = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    }
  }

  getCurrentAdapter(): WalletAdapter | null {
    return this.currentAdapter;
  }

  getTransactionHistory(): WalletTransaction[] {
    return [...this.transactions];
  }

  async airdropSOL(amount: number = 1): Promise<WalletTransaction> {
    if (!this.currentAdapter || !this.currentAdapter.isConnected()) {
      throw new Error("No wallet connected");
    }

    const publicKey = this.currentAdapter.getPublicKey();
    if (!publicKey) throw new Error("Unable to get public key");

    try {
      const signature = await this.connection.requestAirdrop(
        new PublicKey(publicKey),
        amount * LAMPORTS_PER_SOL
      );

      await this.connection.confirmTransaction(signature);

      const result: WalletTransaction = {
        signature,
        success: true,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    } catch (error: any) {
      const result: WalletTransaction = {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };

      this.transactions.push(result);
      return result;
    }
  }

  validateAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}

export default SolanaWalletManager;
