import { Connection, PublicKey } from "@solana/web3.js";
import {
  MarginfiClient,
  getConfig,
  MarginfiAccountWrapper,
  AccountType,
  Bank,
} from "@mrgnlabs/marginfi-client-v2";
import { NodeWallet } from "@mrgnlabs/mrgn-common";

/**
 * Service for MarginFi protocol actions.
 * Wraps marginfi-client-v2 SDK for account, deposit, borrow, repay, withdraw, loop, flashloan, and liquidation workflows.
 */
export class MarginfiService {
  private connection: Connection;
  private wallet: NodeWallet;
  private client: MarginfiClient;
  private config: any; // MarginfiConfig

  /**
   * Setup MarginFi with a Solana connection and Anchor-compliant wallet.
   * @param rpcUrl RPC endpoint for Solana
   * @param environment "dev" | "production"
   */
  constructor(rpcUrl: string, environment: "dev" | "production" = "dev") {
    this.connection = new Connection(rpcUrl, { commitment: "confirmed" });
    this.wallet = NodeWallet.local(); // Reads from ~/.config/solana/id.json
    this.config = getConfig(environment);
  }

  /**
   * Initialize and fetch client. Must run before other actions.
   */
  async initialize(): Promise<void> {
    this.client = await MarginfiClient.fetch(
      this.config,
      this.wallet,
      this.connection
    );
  }

  /**
   * Create a new MarginFi account.
   */
  async createAccount(): Promise<MarginfiAccountWrapper> {
    return await this.client.createMarginfiAccount();
  }

  /**
   * Fetch an existing MarginFi account by address.
   */
  async fetchAccount(
    accountAddress: PublicKey
  ): Promise<MarginfiAccountWrapper> {
    return await MarginfiAccountWrapper.fetch(accountAddress, this.client);
  }

  /**
   * Get all MarginFi account addresses under current authority.
   */
  async getAllAccountAddresses(): Promise<PublicKey[]> {
    return await this.client.getAllMarginfiAccountAddresses();
  }

  // BANKS

  /**
   * Fetch all available banks (asset pools).
   * Simplified implementation due to API complexity
   */
  async getAllBanks(): Promise<any[]> {
    try {
      const bankPubKeys = await this.client.getAllProgramAccountAddresses(
        AccountType.Bank
      );
      // Return bank addresses for now, full Bank objects require complex setup
      return bankPubKeys;
    } catch (error) {
      console.error("Error fetching banks:", error);
      return [];
    }
  }

  /**
   * Get a bank by token symbol.
   */
  async getBankByTokenSymbol(tokenSymbol: string): Promise<Bank | null> {
    return await this.client.getBankByTokenSymbol(tokenSymbol);
  }

  /**
   * Get a bank by mint.
   */
  async getBankByMint(mint: PublicKey): Promise<Bank | null> {
    return await this.client.getBankByMint(mint);
  }

  /**
   * Get oracle price for a bank.
   */
  async getOraclePriceByBank(bankAddress: PublicKey): Promise<any> {
    return await this.client.getOraclePriceByBank(bankAddress);
  }

  // ACCOUNT ACTIONS

  /**
   * Deposit asset to a Marginfi account.
   * @param marginfiAccount Marginfi account wrapper
   * @param amount Asset amount
   * @param bankAddress Bank to deposit into
   */
  async deposit(
    marginfiAccount: MarginfiAccountWrapper,
    amount: number,
    bankAddress: PublicKey
  ): Promise<string> {
    return await marginfiAccount.deposit(amount, bankAddress);
  }

  /**
   * Borrow asset from a Marginfi account.
   * @param marginfiAccount Marginfi account wrapper
   * @param amount Asset amount
   * @param bankAddress Bank to borrow from
   */
  async borrow(
    marginfiAccount: MarginfiAccountWrapper,
    amount: number,
    bankAddress: PublicKey
  ): Promise<string[]> {
    return await marginfiAccount.borrow(amount, bankAddress);
  }

  /**
   * Repay borrowed asset in Marginfi account.
   * @param marginfiAccount Marginfi account wrapper
   * @param amount Asset amount to repay
   * @param bankAddress Bank to repay to
   * @param repayAll Repay entire amount
   */
  async repay(
    marginfiAccount: MarginfiAccountWrapper,
    amount: number,
    bankAddress: PublicKey,
    repayAll = false
  ): Promise<string> {
    return await marginfiAccount.repay(amount, bankAddress, repayAll);
  }

  /**
   * Withdraw asset from a Marginfi account.
   * @param marginfiAccount Marginfi account wrapper
   * @param amount Asset amount to withdraw
   * @param bankAddress Bank to withdraw from
   * @param withdrawAll Withdraw entire amount
   */
  async withdraw(
    marginfiAccount: MarginfiAccountWrapper,
    amount: number,
    bankAddress: PublicKey,
    withdrawAll = false
  ): Promise<string[]> {
    return await marginfiAccount.withdraw(amount, bankAddress, withdrawAll);
  }

  /**
   * Withdraw emissions from a specified bank.
   */
  async withdrawEmissions(
    marginfiAccount: MarginfiAccountWrapper,
    bankAddress: PublicKey
  ): Promise<string> {
    return await marginfiAccount.withdrawEmissions([bankAddress]);
  }

  /**
   * Get account balances for a specific MarginFi account.
   */
  async getAccountBalances(
    marginfiAccount: MarginfiAccountWrapper
  ): Promise<any[]> {
    await marginfiAccount.reload();
    return marginfiAccount.activeBalances;
  }
}

export default MarginfiService;
