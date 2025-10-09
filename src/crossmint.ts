import {
  CrossmintWallets,
  createCrossmint,
  SolanaWallet,
  EVMWallet,
  type Wallet,
  type Chain,
} from "@crossmint/wallets-sdk";

export interface CrossmintConfig {
  apiKey: string;
  jwt?: string;
}
export interface WalletConfig {
  chain: Chain;
  email: string;
}

export interface TransferParams {
  recipient: string;
  token: "usdc" | "nativeToken";
  amount: string;
}

export interface DelegatedSignerParams {
  signer: string;
}

export interface CustomTransactionParams {
  transaction: any;
}

export class CrossmintWalletService {
  private crossmintWallets: CrossmintWallets;
  private walletCache: Map<string, Wallet<any>> = new Map();

  constructor(config: CrossmintConfig) {
    const crossmint = createCrossmint({
      apiKey: config.apiKey,
      experimental_customAuth: config.jwt ? { jwt: config.jwt } : undefined,
    });

    this.crossmintWallets = CrossmintWallets.from(crossmint);
  }

  /**
   * Get or create a wallet for a user
   */
  async getOrCreateWallet(
    walletConfig: WalletConfig,
    onAuthRequired?: (
      needsAuth: boolean,
      sendEmailWithOtp: () => Promise<void>,
      verifyOtp: (otp: string) => Promise<void>,
      reject: () => void
    ) => Promise<void>
  ): Promise<Wallet<any>> {
    const cacheKey = `${walletConfig.chain}-${walletConfig.email}`;

    if (this.walletCache.has(cacheKey)) {
      return this.walletCache.get(cacheKey)!;
    }

    const wallet = await this.crossmintWallets.getOrCreateWallet({
      chain: walletConfig.chain,
      signer: {
        type: "email",
        email: walletConfig.email,
        onAuthRequired:
          onAuthRequired ||
          (async (needsAuth, sendEmailWithOtp, verifyOtp) => {
            if (needsAuth) {
              await sendEmailWithOtp();
              console.log("OTP sent to email. Please verify.");
            }
          }),
      },
    });

    this.walletCache.set(cacheKey, wallet);
    return wallet;
  }

  /**
   * Get wallet balances
   */
  async getBalances(wallet: Wallet<any>) {
    const balances = await wallet.balances();

    return {
      nativeToken: {
        amount: balances.nativeToken.amount,
        symbol: balances.nativeToken.symbol || "Native",
      },
      usdc: {
        amount: balances.usdc.amount,
        symbol: "USDC",
      },
    };
  }

  /**
   * Transfer tokens from wallet
   */
  async transfer(wallet: Wallet<any>, params: TransferParams) {
    const transaction = await wallet.send(
      params.recipient,
      params.token,
      params.amount
    );

    return {
      explorerLink: transaction.explorerLink,
      transactionHash: transaction.transactionId || transaction.explorerLink,
    };
  }

  /**
   * Get wallet activity
   */
  async getActivity(wallet: Wallet<any>) {
    const activity = await wallet.experimental_activity();

    return {
      events: activity.events,
      totalEvents: activity.events.length,
    };
  }

  /**
   * Add a delegated signer to the wallet
   */
  async addDelegatedSigner(wallet: Wallet<any>, params: DelegatedSignerParams) {
    await wallet.addDelegatedSigner({ signer: params.signer });

    const signers = await wallet.delegatedSigners();
    return signers;
  }

  /**
   * Get all delegated signers
   */
  async getDelegatedSigners(wallet: Wallet<any>) {
    return await wallet.delegatedSigners();
  }

  /**
   * Send a custom Solana transaction
   */
  async sendSolanaTransaction(
    wallet: Wallet<any>,
    params: CustomTransactionParams
  ) {
    const solanaWallet = SolanaWallet.from(wallet);
    const tx = await solanaWallet.sendTransaction({
      transaction: params.transaction,
    });

    return {
      explorerLink: tx.explorerLink,
      transactionHash: tx.transactionId || tx.explorerLink,
    };
  }

  /**
   * Send a custom EVM transaction
   */
  async sendEVMTransaction(
    wallet: Wallet<any>,
    params: CustomTransactionParams
  ) {
    const evmWallet = EVMWallet.from(wallet);
    const tx = await evmWallet.sendTransaction({
      transaction: params.transaction,
    });

    return {
      explorerLink: tx.explorerLink,
      transactionHash: tx.transactionId || tx.explorerLink,
    };
  }

  /**
   * Get wallet address
   */
  getWalletAddress(wallet: Wallet<any>): string {
    return wallet.address;
  }

  /**
   * Clear wallet cache
   */
  clearCache(): void {
    this.walletCache.clear();
  }
}

// Example usage
export async function exampleUsage() {
  // Initialize the service
  const walletService = new CrossmintWalletService({
    apiKey: process.env.CROSSMINT_API_KEY!,
    jwt: process.env.JWT_TOKEN, // Optional for server-side
  });

  // Create or get a wallet
  const wallet = await walletService.getOrCreateWallet({
    chain: "solana",
    email: "user@example.com",
  });

  console.log("Wallet Address:", walletService.getWalletAddress(wallet));

  // Get balances
  const balances = await walletService.getBalances(wallet);
  console.log("Native Token:", balances.nativeToken);
  console.log("USDC:", balances.usdc);

  // Transfer tokens
  const transfer = await walletService.transfer(wallet, {
    recipient: "recipient-address",
    token: "usdc",
    amount: "100",
  });
  console.log("Transfer:", transfer.explorerLink);

  // Get activity
  const activity = await walletService.getActivity(wallet);
  console.log("Activity Events:", activity.totalEvents);

  // Add delegated signer
  const signers = await walletService.addDelegatedSigner(wallet, {
    signer: "signer-address",
  });
  console.log("Delegated Signers:", signers);

  // Send custom Solana transaction
  const solTx = await walletService.sendSolanaTransaction(wallet, {
    transaction: "serialized-transaction",
  });
  console.log("Solana Tx:", solTx.explorerLink);

  // Send custom EVM transaction
  const evmTx = await walletService.sendEVMTransaction(wallet, {
    transaction: "serialized-transaction",
  });
  console.log("EVM Tx:", evmTx.explorerLink);
}
