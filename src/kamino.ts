import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  Signer,
} from "@solana/web3.js";
import {
  KaminoMarket,
  KaminoAction,
  KaminoObligation,
  VanillaObligation,
  KaminoReserve,
  DEFAULT_RECENT_SLOT_DURATION_MS,
  ObligationType,
} from "@kamino-finance/klend-sdk";
import {
  Kamino as KaminoLiquidity,
  StrategyWithAddress,
  StrategiesFilters,
  WithdrawShares,
} from "@kamino-finance/kliquidity-sdk";
import { Address, TransactionSigner, Rpc, Instruction } from "@solana/kit";
import { address } from "@solana/addresses";
import { WhirlpoolStrategy } from "@kamino-finance/kliquidity-sdk/dist/@codegen/kliquidity/accounts";
import Decimal from "decimal.js";

/**
 * Utility function to convert PublicKey to Address
 */
function toAddress(publicKey: PublicKey): Address {
  return address(publicKey.toBase58());
}

/**
 * Utility function to convert Address to PublicKey
 */
function toPublicKey(addr: Address): PublicKey {
  return new PublicKey(addr);
}

/**
 * Comprehensive Kamino Finance Service
 * Integrates both Lending (klend) and Liquidity (kliquidity) protocols
 *
 * @author Vairamuthu M
 * @version 2.0.0
 */
export class KaminoService {
  private connection: Connection;
  private cluster: "mainnet-beta" | "devnet";

  // Kamino Lending
  private kaminoMarket?: KaminoMarket;
  private marketAddress: PublicKey;
  private lendingProgramId: PublicKey;

  // Kamino Liquidity
  private kaminoLiquidity: KaminoLiquidity;
  private liquidityProgramId: PublicKey;

  /**
   * Initialize Kamino Service with connection and cluster
   * @param connection - Solana RPC connection
   * @param cluster - Network cluster (mainnet-beta or devnet)
   * @param marketAddress - Kamino lending market address (defaults to Main market)
   * @param lendingProgramId - Kamino Lend program ID (optional)
   * @param liquidityProgramId - Kamino Liquidity program ID (optional)
   */
  constructor(
    connection: Connection,
    cluster: "mainnet-beta" | "devnet" = "mainnet-beta",
    marketAddress?: PublicKey,
    lendingProgramId?: PublicKey,
    liquidityProgramId?: PublicKey
  ) {
    this.connection = connection;
    this.cluster = cluster;

    // Default to Main market on mainnet
    this.marketAddress =
      marketAddress ||
      new PublicKey("7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF");

    // Program IDs
    this.lendingProgramId =
      lendingProgramId ||
      new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");
    this.liquidityProgramId =
      liquidityProgramId ||
      new PublicKey("E35i5qn7872eEmBt15e5VGhziUBzCTm43XCSWvDoQNNv");

    // Initialize Kamino Liquidity with connection cast as Rpc type
    this.kaminoLiquidity = new KaminoLiquidity(cluster, connection as any);
  }

  // ============================================
  // KAMINO LENDING (KLEND)
  // ============================================

  /**
   * Load and initialize Kamino lending market
   */
  async loadLendingMarket(forceRefresh = false): Promise<KaminoMarket> {
    try {
      if (!this.kaminoMarket || forceRefresh) {
        this.kaminoMarket = await KaminoMarket.load(
          this.connection as any,
          toAddress(this.marketAddress),
          DEFAULT_RECENT_SLOT_DURATION_MS,
          toAddress(this.lendingProgramId)
        );
      }
      return this.kaminoMarket!;
    } catch (error) {
      throw this.handleError("loadLendingMarket", error);
    }
  }

  /**
   * Get lending market reserves
   */
  async getReserves(): Promise<KaminoReserve[]> {
    try {
      const market = await this.loadLendingMarket();
      await market.loadReserves();
      return market.getReserves();
    } catch (error) {
      throw this.handleError("getReserves", error);
    }
  }

  /**
   * Get specific reserve by symbol
   */
  async getReserve(symbol: string): Promise<KaminoReserve | undefined> {
    try {
      const market = await this.loadLendingMarket();
      await market.loadReserves();
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );
      return reserve;
    } catch (error) {
      throw this.handleError("getReserve", error);
    }
  }

  /**
   * Get reserve by mint address
   */
  async getReserveByMint(mint: PublicKey): Promise<KaminoReserve | undefined> {
    try {
      const market = await this.loadLendingMarket();
      await market.loadReserves();
      return market.getReserveByMint(toAddress(mint));
    } catch (error) {
      throw this.handleError("getReserveByMint", error);
    }
  }

  /**
   * Refresh all market data (reserves, obligations, etc.)
   */
  async refreshMarket(): Promise<void> {
    try {
      const market = await this.loadLendingMarket();
      await market.refreshAll();
    } catch (error) {
      throw this.handleError("refreshMarket", error);
    }
  }

  /**
   * Get user's vanilla obligation
   */
  async getUserObligation(
    userAddress: PublicKey
  ): Promise<KaminoObligation | null> {
    try {
      const market = await this.loadLendingMarket();
      return await market.getUserVanillaObligation(toAddress(userAddress));
    } catch (error) {
      throw this.handleError("getUserObligation", error);
    }
  }

  /**
   * Get all user obligations
   */
  async getAllUserObligations(
    userAddress: PublicKey
  ): Promise<(KaminoObligation | null)[]> {
    try {
      const market = await this.loadLendingMarket();
      return await market.getAllUserObligations(toAddress(userAddress));
    } catch (error) {
      throw this.handleError("getAllUserObligations", error);
    }
  }

  /**
   * Get user obligations for a specific reserve
   */
  async getUserObligationsForReserve(
    userAddress: PublicKey,
    reserve: PublicKey
  ): Promise<KaminoObligation[]> {
    try {
      const market = await this.loadLendingMarket();
      return await market.getAllUserObligationsForReserve(
        toAddress(userAddress),
        toAddress(reserve)
      );
    } catch (error) {
      throw this.handleError("getUserObligationsForReserve", error);
    }
  }

  /**
   * Check if reserve is part of obligation
   */
  async isReserveInObligation(
    obligation: KaminoObligation,
    reserve: PublicKey
  ): Promise<boolean> {
    try {
      const market = await this.loadLendingMarket();
      return market.isReserveInObligation(obligation, toAddress(reserve));
    } catch (error) {
      throw this.handleError("isReserveInObligation", error);
    }
  }

  /**
   * Get obligation by wallet address
   */
  async getObligationByWallet(
    walletAddress: string
  ): Promise<KaminoObligation | null> {
    try {
      const market = await this.loadLendingMarket();
      await market.loadReserves();
      return await market.getObligationByWallet(
        toAddress(new PublicKey(walletAddress)),
        "Vanilla" as any
      );
    } catch (error) {
      throw this.handleError("getObligationByWallet", error);
    }
  }

  // ============================================
  // LENDING ACTIONS
  // ============================================

  /**
   * Build deposit transaction
   */
  async buildDepositTransaction(
    amount: Decimal,
    symbol: string,
    userPublicKey: PublicKey,
    obligation?: VanillaObligation
  ): Promise<KaminoAction> {
    try {
      const market = await this.loadLendingMarket();
      const obligationToUse =
        obligation || new VanillaObligation(toAddress(this.lendingProgramId));

      // Get the reserve by symbol
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );

      if (!reserve) {
        throw new Error(`Reserve for symbol ${symbol} not found`);
      }

      return await KaminoAction.buildDepositTxns(
        market,
        amount.toString(),
        reserve.state.liquidity.mintPubkey,
        { address: toAddress(userPublicKey) } as any,
        obligationToUse,
        true, // useV2Ixs
        undefined // scopeRefreshConfig
      );
    } catch (error) {
      throw this.handleError("buildDepositTransaction", error);
    }
  }

  /**
   * Build withdraw transaction
   */
  async buildWithdrawTransaction(
    amount: Decimal,
    symbol: string,
    userPublicKey: PublicKey,
    obligation?: VanillaObligation
  ): Promise<KaminoAction> {
    try {
      const market = await this.loadLendingMarket();
      const obligationToUse =
        obligation || new VanillaObligation(toAddress(this.lendingProgramId));

      // Get the reserve by symbol
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );

      if (!reserve) {
        throw new Error(`Reserve for symbol ${symbol} not found`);
      }

      return await KaminoAction.buildWithdrawTxns(
        market,
        amount.toString(),
        reserve.state.liquidity.mintPubkey,
        { address: toAddress(userPublicKey) } as any,
        obligationToUse,
        true, // useV2Ixs
        undefined // scopeRefreshConfig
      );
    } catch (error) {
      throw this.handleError("buildWithdrawTransaction", error);
    }
  }

  /**
   * Build borrow transaction
   */
  async buildBorrowTransaction(
    amount: Decimal,
    symbol: string,
    userPublicKey: PublicKey,
    obligation?: VanillaObligation
  ): Promise<KaminoAction> {
    try {
      const market = await this.loadLendingMarket();
      const obligationToUse =
        obligation || new VanillaObligation(toAddress(this.lendingProgramId));

      // Get the reserve by symbol
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );

      if (!reserve) {
        throw new Error(`Reserve for symbol ${symbol} not found`);
      }

      return await KaminoAction.buildBorrowTxns(
        market,
        amount.toString(),
        reserve.state.liquidity.mintPubkey,
        { address: toAddress(userPublicKey) } as any,
        obligationToUse,
        true, // useV2Ixs
        undefined // scopeRefreshConfig
      );
    } catch (error) {
      throw this.handleError("buildBorrowTransaction", error);
    }
  }

  /**
   * Build repay transaction
   */
  async buildRepayTransaction(
    amount: Decimal,
    symbol: string,
    userPublicKey: PublicKey,
    obligation?: VanillaObligation
  ): Promise<KaminoAction> {
    try {
      const market = await this.loadLendingMarket();
      const obligationToUse =
        obligation || new VanillaObligation(toAddress(this.lendingProgramId));

      // Get the reserve by symbol
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );

      if (!reserve) {
        throw new Error(`Reserve for symbol ${symbol} not found`);
      }

      return await KaminoAction.buildRepayTxns(
        market,
        amount.toString(),
        reserve.state.liquidity.mintPubkey,
        { address: toAddress(userPublicKey) } as any,
        obligationToUse,
        true, // useV2Ixs
        undefined, // scopeRefreshConfig
        0n // currentSlot
      );
    } catch (error) {
      throw this.handleError("buildRepayTransaction", error);
    }
  }

  /**
   * Build liquidation transaction
   */
  async buildLiquidationTransaction(
    amount: Decimal,
    symbol: string,
    obligationAddress: PublicKey,
    userPublicKey: PublicKey
  ): Promise<KaminoAction> {
    try {
      const market = await this.loadLendingMarket();

      // Get the reserve by symbol
      const reserves = market.getReserves();
      const reserve = reserves.find((r) =>
        r.state.config.tokenInfo.name
          .toString()
          .toLowerCase()
          .includes(symbol.toLowerCase())
      );

      if (!reserve) {
        throw new Error(`Reserve for symbol ${symbol} not found`);
      }

      return await KaminoAction.buildLiquidateTxns(
        market,
        amount.toString(),
        amount.toString(), // minCollateralReceiveAmount
        reserve.state.liquidity.mintPubkey, // repayTokenMint
        reserve.state.liquidity.mintPubkey, // withdrawTokenMint
        { address: toAddress(userPublicKey) } as any, // liquidator
        toAddress(obligationAddress), // obligationOwner
        "Vanilla" as any, // obligation type
        true // useV2Ixs
      );
    } catch (error) {
      throw this.handleError("buildLiquidationTransaction", error);
    }
  }

  // ============================================
  // KAMINO LIQUIDITY (KLIQUIDITY)
  // ============================================

  /**
   * Get all Kamino liquidity strategies
   */
  async getAllStrategies(): Promise<any[]> {
    try {
      return await this.kaminoLiquidity.getStrategies();
    } catch (error) {
      throw this.handleError("getAllStrategies", error);
    }
  }

  /**
   * Get strategies with filters
   */
  async getStrategiesWithFilters(
    filters: StrategiesFilters
  ): Promise<StrategyWithAddress[]> {
    try {
      return await this.kaminoLiquidity.getAllStrategiesWithFilters(filters);
    } catch (error) {
      throw this.handleError("getStrategiesWithFilters", error);
    }
  }

  /**
   * Get specific strategy by address
   */
  async getStrategy(strategyAddress: PublicKey): Promise<any | null> {
    try {
      return await this.kaminoLiquidity.getStrategyByAddress(
        toAddress(strategyAddress)
      );
    } catch (error) {
      throw this.handleError("getStrategy", error);
    }
  }

  /**
   * Get strategy share price
   */
  async getStrategySharePrice(strategyAddress: PublicKey): Promise<Decimal> {
    try {
      return await this.kaminoLiquidity.getStrategySharePrice(
        toAddress(strategyAddress)
      );
    } catch (error) {
      throw this.handleError("getStrategySharePrice", error);
    }
  }

  /**
   * Get strategy token holders
   */
  async getStrategyHolders(strategyAddress: PublicKey): Promise<any[]> {
    try {
      return await this.kaminoLiquidity.getStrategyHolders(
        toAddress(strategyAddress)
      );
    } catch (error) {
      throw this.handleError("getStrategyHolders", error);
    }
  }

  /**
   * Get Orca whirlpool by address
   */
  async getWhirlpool(whirlpoolAddress: PublicKey): Promise<any> {
    try {
      return await this.kaminoLiquidity.getWhirlpoolByAddress(
        toAddress(whirlpoolAddress)
      );
    } catch (error) {
      throw this.handleError("getWhirlpool", error);
    }
  }

  // ============================================
  // LIQUIDITY STRATEGY ACTIONS
  // ============================================

  /**
   * Create strategy account instruction
   */
  async createStrategyAccount(
    owner: PublicKey,
    newStrategyPubkey: PublicKey
  ): Promise<Transaction> {
    try {
      const instruction = await this.kaminoLiquidity.createStrategyAccount(
        { address: toAddress(owner) } as any,
        { address: toAddress(newStrategyPubkey) } as any
      );

      const tx = new Transaction();
      const txInstruction = this.convertInstruction(instruction);
      tx.add(txInstruction);

      return tx;
    } catch (error) {
      throw this.handleError("createStrategyAccount", error);
    }
  }

  /**
   * Create new Kamino strategy
   */
  async createStrategy(
    newStrategyPubkey: PublicKey,
    pool: PublicKey,
    owner: PublicKey,
    tokenASymbol: "ORCA" | "RAYDIUM" | "METEORA",
    tokenBSymbol: "ORCA" | "RAYDIUM" | "METEORA"
  ): Promise<Transaction> {
    try {
      const instruction = await this.kaminoLiquidity.createStrategy(
        { address: toAddress(newStrategyPubkey) } as any,
        toAddress(pool),
        { address: toAddress(owner) } as any,
        tokenASymbol
      );

      const tx = new Transaction();
      const txInstruction = this.convertInstruction(instruction);
      tx.add(txInstruction);

      return tx;
    } catch (error) {
      throw this.handleError("createStrategy", error);
    }
  }

  /**
   * Build deposit instruction for liquidity strategy
   */
  async buildDepositToStrategy(
    strategy: StrategyWithAddress,
    amountA: Decimal,
    amountB: Decimal,
    owner: PublicKey
  ): Promise<Transaction> {
    try {
      const depositIx = await this.kaminoLiquidity.deposit(
        strategy,
        amountA,
        amountB,
        { address: toAddress(owner) } as any
      );

      const tx = new Transaction();
      const txInstruction = this.convertInstruction(depositIx);
      tx.add(txInstruction);

      return tx;
    } catch (error) {
      throw this.handleError("buildDepositToStrategy", error);
    }
  }

  /**
   * Build withdraw shares instruction
   */
  async buildWithdrawShares(
    strategy: StrategyWithAddress,
    shares: Decimal,
    owner: PublicKey
  ): Promise<Transaction> {
    try {
      const withdrawIx = await this.kaminoLiquidity.withdrawShares(
        strategy,
        shares,
        { address: toAddress(owner) } as any
      );

      const tx = new Transaction();
      const txInstruction = this.convertInstruction(withdrawIx as any);
      tx.add(txInstruction);

      return tx;
    } catch (error) {
      throw this.handleError("buildWithdrawShares", error);
    }
  }

  /**
   * Build withdraw all shares instructions
   */
  async buildWithdrawAllShares(
    strategy: StrategyWithAddress,
    owner: PublicKey
  ): Promise<Transaction | null> {
    try {
      const withdrawIxns = await this.kaminoLiquidity.withdrawAllShares(
        strategy,
        { address: toAddress(owner) } as any
      );

      if (!withdrawIxns) {
        return null;
      }

      const tx = new Transaction();

      // withdrawAllShares may return multiple instructions
      if (Array.isArray(withdrawIxns)) {
        for (const ix of withdrawIxns) {
          const txInstruction = this.convertInstruction(ix);
          tx.add(txInstruction);
        }
      } else {
        const txInstruction = this.convertInstruction(withdrawIxns as any);
        tx.add(txInstruction);
      }

      return tx;
    } catch (error) {
      throw this.handleError("buildWithdrawAllShares", error);
    }
  }

  /**
   * Build collect fees and rewards instruction
   */
  async buildCollectFeesAndRewards(
    strategy: StrategyWithAddress
  ): Promise<Transaction> {
    try {
      const strategyOwner =
        strategy.address ||
        toAddress(new PublicKey("11111111111111111111111111111111"));

      const collectIx = await this.kaminoLiquidity.collectFeesAndRewards(
        strategy,
        { address: strategyOwner } as any
      );

      const tx = new Transaction();
      const txInstruction = this.convertInstruction(collectIx);
      tx.add(txInstruction);

      return tx;
    } catch (error) {
      throw this.handleError("buildCollectFeesAndRewards", error);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Helper method to build transactions from KaminoAction instruction arrays
   * KaminoAction contains multiple instruction arrays that need to be assembled into transactions
   */
  private buildTransactionsFromAction(
    kaminoAction: KaminoAction
  ): Transaction[] {
    const transactions: Transaction[] = [];

    // Collect all instructions in order
    const allInstructions = [
      ...kaminoAction.computeBudgetIxs,
      ...kaminoAction.setupIxs,
      ...kaminoAction.inBetweenIxs,
      ...kaminoAction.lendingIxs,
      ...kaminoAction.cleanupIxs,
    ];

    // If there are no instructions, return empty array
    if (allInstructions.length === 0) {
      return transactions;
    }

    // Create a transaction with all instructions
    const tx = new Transaction();

    for (const ix of allInstructions) {
      // Convert from @solana/kit Instruction to @solana/web3.js TransactionInstruction
      const txInstruction = this.convertInstruction(ix);
      tx.add(txInstruction);
    }

    transactions.push(tx);

    return transactions;
  }

  /**
   * Convert @solana/kit Instruction to @solana/web3.js TransactionInstruction
   */
  private convertInstruction(instruction: Instruction): TransactionInstruction {
    // The Instruction from @solana/kit has:
    // - programAddress: Address
    // - accounts: AccountMeta[]
    // - data: Uint8Array

    const keys =
      instruction.accounts?.map((meta: any) => ({
        pubkey: new PublicKey(meta.address),
        isSigner: meta.role === 0 || meta.role === 1, // AccountRole.WRITABLE_SIGNER = 0, READONLY_SIGNER = 1
        isWritable: meta.role === 0 || meta.role === 2, // AccountRole.WRITABLE_SIGNER = 0, WRITABLE = 2
      })) || [];

    return new TransactionInstruction({
      keys,
      programId: new PublicKey(instruction.programAddress),
      data: Buffer.from(instruction.data || []),
    });
  }

  /**
   * Assign blockhash and fee payer to transaction
   */
  async prepareTransaction(
    tx: Transaction,
    feePayer: PublicKey
  ): Promise<Transaction> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = feePayer;
      return tx;
    } catch (error) {
      throw this.handleError("prepareTransaction", error);
    }
  }

  /**
   * Create transaction with extra compute budget
   */
  createTransactionWithBudget(feePayer: PublicKey): Transaction {
    const tx = new Transaction();
    tx.feePayer = feePayer;
    return tx;
  }

  // ============================================
  // HELPER METHODS FOR COMPLETE WORKFLOWS
  // ============================================

  /**
   * Complete deposit workflow for lending
   */
  async depositToLending(
    amount: number,
    symbol: string,
    userKeypair: Keypair,
    sendTransaction: (tx: Transaction, signers: Signer[]) => Promise<string>
  ): Promise<string> {
    try {
      const market = await this.loadLendingMarket();
      const kaminoAction = await this.buildDepositTransaction(
        new Decimal(amount),
        symbol,
        userKeypair.publicKey
      );

      // Build transactions from KaminoAction instruction arrays
      const transactions = this.buildTransactionsFromAction(kaminoAction);

      // Send transactions
      const signatures: string[] = [];
      for (const tx of transactions) {
        const sig = await sendTransaction(tx, [userKeypair]);
        signatures.push(sig);
      }

      return signatures[signatures.length - 1];
    } catch (error) {
      throw this.handleError("depositToLending", error);
    }
  }

  /**
   * Complete withdraw workflow for lending
   */
  async withdrawFromLending(
    amount: number,
    symbol: string,
    userKeypair: Keypair,
    sendTransaction: (tx: Transaction, signers: Signer[]) => Promise<string>
  ): Promise<string> {
    try {
      const market = await this.loadLendingMarket();
      const kaminoAction = await this.buildWithdrawTransaction(
        new Decimal(amount),
        symbol,
        userKeypair.publicKey
      );

      const transactions = this.buildTransactionsFromAction(kaminoAction);

      const signatures: string[] = [];
      for (const tx of transactions) {
        const sig = await sendTransaction(tx, [userKeypair]);
        signatures.push(sig);
      }

      return signatures[signatures.length - 1];
    } catch (error) {
      throw this.handleError("withdrawFromLending", error);
    }
  }

  /**
   * Complete borrow workflow
   */
  async borrowFromLending(
    amount: number,
    symbol: string,
    userKeypair: Keypair,
    sendTransaction: (tx: Transaction, signers: Signer[]) => Promise<string>
  ): Promise<string> {
    try {
      const market = await this.loadLendingMarket();
      const kaminoAction = await this.buildBorrowTransaction(
        new Decimal(amount),
        symbol,
        userKeypair.publicKey
      );

      const transactions = this.buildTransactionsFromAction(kaminoAction);

      const signatures: string[] = [];
      for (const tx of transactions) {
        const sig = await sendTransaction(tx, [userKeypair]);
        signatures.push(sig);
      }

      return signatures[signatures.length - 1];
    } catch (error) {
      throw this.handleError("borrowFromLending", error);
    }
  }

  /**
   * Complete repay workflow
   */
  async repayToLending(
    amount: number,
    symbol: string,
    userKeypair: Keypair,
    sendTransaction: (tx: Transaction, signers: Signer[]) => Promise<string>
  ): Promise<string> {
    try {
      const market = await this.loadLendingMarket();
      const kaminoAction = await this.buildRepayTransaction(
        new Decimal(amount),
        symbol,
        userKeypair.publicKey
      );

      const transactions = this.buildTransactionsFromAction(kaminoAction);

      const signatures: string[] = [];
      for (const tx of transactions) {
        const sig = await sendTransaction(tx, [userKeypair]);
        signatures.push(sig);
      }

      return signatures[signatures.length - 1];
    } catch (error) {
      throw this.handleError("repayToLending", error);
    }
  }

  // ============================================
  // ERROR HANDLING
  // ============================================

  /**
   * Centralized error handler
   */
  private handleError(method: string, error: any): Error {
    const errorMessage = error?.message || error?.toString() || "Unknown error";
    console.error(`[KaminoService:${method}] Error:`, errorMessage);
    return new Error(`${method} failed: ${errorMessage}`);
  }

  /**
   * Get current connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get current cluster
   */
  getCluster(): string {
    return this.cluster;
  }

  /**
   * Get lending market address
   */
  getMarketAddress(): PublicKey {
    return this.marketAddress;
  }

  /**
   * Get lending program ID
   */
  getLendingProgramId(): PublicKey {
    return this.lendingProgramId;
  }

  /**
   * Get liquidity program ID
   */
  getLiquidityProgramId(): PublicKey {
    return this.liquidityProgramId;
  }

  /**
   * Get Kamino Liquidity instance
   */
  getKaminoLiquidityInstance(): KaminoLiquidity {
    return this.kaminoLiquidity;
  }

  /**
   * Get loaded Kamino Market (if loaded)
   */
  getKaminoMarketInstance(): KaminoMarket | undefined {
    return this.kaminoMarket;
  }
}

// Export types for convenience
export type {
  KaminoMarket,
  KaminoAction,
  KaminoObligation,
  KaminoReserve,
  VanillaObligation,
  StrategyWithAddress,
  StrategiesFilters,
  ObligationType,
};
