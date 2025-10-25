import {
  Marinade,
  MarinadeConfig,
  Wallet,
  Provider as MarinadeProvider,
  getRefNativeStakeSOLTx,
  getRefNativeStakeAccountTx,
  getPrepareNativeUnstakeSOLIx,
  BN,
} from "@marinade.finance/marinade-ts-sdk";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

/**
 * Service class for interacting with Marinade Finance staking and liquidity pools.
 */
export class MarinadeService {
  private connection: Connection;
  private wallet: Wallet;
  private provider: MarinadeProvider;
  private marinade: Marinade;

  /**
   * Initialize Marinade SDK with connection and Wallet object.
   * You can use your own Wallet implementation or pass a public key for view-only actions.
   * @param rpcUrl The Solana RPC endpoint.
   * @param wallet Wallet instance (from marinade-ts-sdk or custom).
   * @param referralCode Optional referral public key.
   */
  constructor(rpcUrl: string, wallet: Wallet, referralCode?: PublicKey) {
    this.connection = new Connection(rpcUrl, "confirmed");
    this.wallet = wallet;

    // Marinade config, add referral if needed
    const config = new MarinadeConfig({
      connection: this.connection,
      publicKey: this.wallet.publicKey,
      referralCode,
    });

    this.marinade = new Marinade(config);

    this.provider = this.marinade.provider;
  }

  /** Get underlying Marinade instance (for advanced calls). */
  getMarinade(): Marinade {
    return this.marinade;
  }

  /** Get current connection. */
  getConnection(): Connection {
    return this.connection;
  }

  /** Get current wallet. */
  getWallet(): Wallet {
    return this.wallet;
  }

  /** Get current provider. */
  getProvider(): MarinadeProvider {
    return this.provider;
  }

  // =========================
  // Liquid Staking Operations
  // =========================

  /**
   * Stake SOL to receive mSOL (liquid staking).
   * @param lamports Amount of SOL in lamports.
   * @returns Transaction, associated mSOL token account.
   */
  async deposit(lamports: BN) {
    const { associatedMSolTokenAccountAddress, transaction } =
      await this.marinade.deposit(lamports);
    return { associatedMSolTokenAccountAddress, transaction };
  }

  /**
   * Liquid unstake: swap mSOL for SOL instantly via Marinade pool.
   * @param lamports Amount of mSOL in lamports.
   * @returns Transaction, associated mSOL token account.
   */
  async liquidUnstake(lamports: BN) {
    const { associatedMSolTokenAccountAddress, transaction } =
      await this.marinade.liquidUnstake(lamports);
    return { associatedMSolTokenAccountAddress, transaction };
  }

  // =========================
  // Marinade Native Staking & Referral Workflows
  // =========================

  /**
   * Native staking of SOL with referral code (returns VersionedTransaction).
   * @param userPublicKey
   * @param lamports Amount to stake.
   * @param referralCode Referral public key.
   */
  async stakeNativeWithReferral(
    userPublicKey: PublicKey,
    lamports: BN,
    referralCode: string
  ) {
    const versionedTransaction = await getRefNativeStakeSOLTx(
      userPublicKey,
      lamports,
      referralCode
    );
    return versionedTransaction;
  }

  /**
   * Deposit stake account to Marinade Native with referral code.
   * @param userPublicKey
   * @param stakeAccountAddress
   * @param referralCode Referral public key.
   */
  async depositStakeNativeWithReferral(
    userPublicKey: PublicKey,
    stakeAccountAddress: PublicKey,
    referralCode: string
  ) {
    const versionedTransaction = await getRefNativeStakeAccountTx(
      userPublicKey,
      stakeAccountAddress,
      referralCode
    );
    return versionedTransaction;
  }

  /**
   * Prepare and pay fees for Marinade Native unstake.
   * Merges stake accounts and pays fee in SOL.
   * @param userPublicKey
   * @param lamports Amount to unstake.
   */
  async prepareNativeUnstake(userPublicKey: PublicKey, lamports: BN) {
    const transaction = new Transaction();
    const prepareIx = await getPrepareNativeUnstakeSOLIx(
      userPublicKey,
      lamports
    );
    transaction.add(...prepareIx.payFees);
    return transaction;
  }

  // =========================
  // Liquidity Pool Operations
  // =========================

  /** Add liquidity to Marinade pool and receive LP tokens. */
  async addLiquidity(lamports: BN) {
    const { associatedLPTokenAccountAddress, transaction } =
      await this.marinade.addLiquidity(lamports);
    return { associatedLPTokenAccountAddress, transaction };
  }

  /**
   * Remove liquidity from Marinade pool, burning LP tokens.
   * @param lamports Amount of LP tokens to burn.
   * @returns Addresses of LP, mSOL accounts and transaction.
   */
  async removeLiquidity(lamports: number) {
    const {
      associatedLPTokenAccountAddress,
      associatedMSolTokenAccountAddress,
      transaction,
    } = await this.marinade.removeLiquidity(new BN(lamports));
    return {
      associatedLPTokenAccountAddress,
      associatedMSolTokenAccountAddress,
      transaction,
    };
  }

  // =========================
  // Lookup Table Utilities
  // =========================

  /**
   * Marinade address lookup table (used for fee estimation, routing, and CPI).
   */
  static readonly LOOKUP_TABLE = new PublicKey(
    "DCcQeBaCiYsEsjjmEsSYPCr9o4n174LKqXNDvQT5wVd8"
  );
}

// Example usage

/*
import { Keypair, PublicKey } from "@solana/web3.js";
import { Wallet } from '@marinade.finance/marinade-ts-sdk';

const keypair = Keypair.generate();
const wallet = new Wallet(keypair);
const service = new MarinadeService('https://api.mainnet-beta.solana.com', wallet);

// --- Stake 1 SOL (1_000_000_000 lamports)
const { transaction, associatedMSolTokenAccountAddress } = await service.deposit(1_000_000_000);

// --- Liquid unstake 0.5 SOL equivalent in mSOL
const { transaction: unstakeTx } = await service.liquidUnstake(500_000_000);

// --- Add liquidity to pool
const { transaction: addLiquidityTx } = await service.addLiquidity(500_000_000);

// --- Remove liquidity
const { transaction: removeLiquidityTx } = await service.removeLiquidity(500_000_000);

// All transactions can be signed and sent via your wallet/provider.
*/

export default MarinadeService;
