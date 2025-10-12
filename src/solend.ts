import {
  SolendActionCore,
  fetchPools,
  formatWalletAssets,
  fetchWalletAssets,
  PoolType,
  ActionType,
  InputReserveType,
  SaveWallet,
} from "@solendprotocol/solend-sdk";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";

export interface InputPoolType {
  address: string;
  owner: string;
  name: string | null;
  authorityAddress: string;
  reserves: Array<{
    address: string;
    pythOracle: string;
    switchboardOracle: string;
    mintAddress: string;
    liquidityFeeReceiverAddress: string;
  }>;
}

export interface SolendLoanHealth {
  borrowLimit: number;
  borrowed: number;
  healthRatio: number;
  canBorrow: boolean;
}

export interface SolendReserveInfo {
  symbol: string;
  name: string;
  totalSupply: BigNumber;
  totalBorrow: BigNumber;
  supplyApy: number;
  borrowApy: number;
  utilization: number;
  available: BigNumber;
}

export interface SolendPosition {
  reserve: string;
  symbol: string;
  depositedAmount: BigNumber;
  borrowedAmount: BigNumber;
  collateralValue: BigNumber;
  borrowLimit: BigNumber;
}

export class SolendClient {
  private connection: Connection;
  private environment: string;
  private pools: { [key: string]: PoolType } = {};

  constructor(connection: Connection, environment: string = "production") {
    this.connection = connection;
    this.environment = environment;
  }

  /**
   * Initialize and fetch all pools
   */
  public async initialize(): Promise<void> {
    try {
      this.pools = await fetchPools(
        [],
        this.connection,
        null as any,
        "So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo",
        await this.connection.getSlot(),
        false,
        false
      );
      console.log("Initialized Solend with pools:", Object.keys(this.pools));
    } catch (error) {
      console.error("Failed to initialize Solend:", error);
      throw error;
    }
  }

  /**
   * Get all available pools
   */
  public getPools(): { [key: string]: PoolType } {
    return this.pools;
  }

  /**
   * Get reserve info by symbol
   */
  public getReserveBySymbol(symbol: string, poolName = "main"): any {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    return pool.reserves.find(
      (reserve: any) => reserve.symbol?.toLowerCase() === symbol.toLowerCase()
    );
  }

  /**
   * Get all reserves for a pool
   */
  public getReserves(poolName = "main"): SolendReserveInfo[] {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    return pool.reserves.map((reserve: any) => ({
      symbol: reserve.symbol || "Unknown",
      name: reserve.name || reserve.symbol || "Unknown",
      totalSupply: reserve.totalSupply || new BigNumber(0),
      totalBorrow: reserve.totalBorrow || new BigNumber(0),
      supplyApy: reserve.supplyInterest
        ? Number(reserve.supplyInterest) * 100
        : 0,
      borrowApy: reserve.borrowInterest
        ? Number(reserve.borrowInterest) * 100
        : 0,
      utilization: reserve.reserveUtilization
        ? Number(reserve.reserveUtilization) * 100
        : 0,
      available: reserve.availableAmount || new BigNumber(0),
    }));
  }

  /**
   * Get wallet assets
   */
  public async getWalletAssets(walletAddress: string): Promise<any[]> {
    try {
      const pool = this.pools["main"];
      if (!pool) {
        throw new Error("Main pool not found");
      }

      const uniqueAssets = pool.reserves.map((r: any) => r.address);
      const rawWalletData = await fetchWalletAssets(
        uniqueAssets,
        walletAddress,
        this.connection,
        false
      );

      return rawWalletData.userAssociatedTokenAccounts.filter(
        (account) => account !== null
      );
    } catch (error) {
      console.error("Failed to fetch wallet assets:", error);
      return [];
    }
  }

  /**
   * Build deposit transaction
   */
  public async buildDepositTransaction(
    amount: number,
    symbol: string,
    walletPublicKey: PublicKey,
    poolName = "main"
  ): Promise<SolendActionCore> {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    const reserve = this.getReserveBySymbol(symbol, poolName);
    if (!reserve) {
      throw new Error(`Reserve "${symbol}" not found in pool "${poolName}"`);
    }

    const wallet: SaveWallet = { publicKey: walletPublicKey };
    const amountBN = new BN(amount * Math.pow(10, reserve.decimals || 6));

    const poolInput: InputPoolType = {
      address: pool.address,
      owner: pool.authorityAddress,
      name: pool.name,
      authorityAddress: pool.authorityAddress,
      reserves: pool.reserves.map((r: any) => ({
        address: r.address,
        pythOracle: r.pythOracle,
        switchboardOracle: r.switchboardOracle,
        mintAddress: r.mintAddress,
        liquidityFeeReceiverAddress: r.feeReceiverAddress,
      })),
    };

    const reserveInput: InputReserveType = {
      address: reserve.address,
      liquidityAddress: reserve.liquidityAddress,
      cTokenMint: reserve.cTokenMint,
      cTokenLiquidityAddress: reserve.cTokenLiquidityAddress,
      pythOracle: reserve.pythOracle,
      switchboardOracle: reserve.switchboardOracle,
      mintAddress: reserve.mintAddress,
      liquidityFeeReceiverAddress: reserve.feeReceiverAddress,
    };

    return await SolendActionCore.buildDepositTxns(
      poolInput,
      reserveInput,
      this.connection,
      amountBN.toString(),
      wallet,
      { environment: this.environment as any }
    );
  }

  /**
   * Build borrow transaction
   */
  public async buildBorrowTransaction(
    amount: number,
    symbol: string,
    walletPublicKey: PublicKey,
    poolName = "main"
  ): Promise<SolendActionCore> {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    const reserve = this.getReserveBySymbol(symbol, poolName);
    if (!reserve) {
      throw new Error(`Reserve "${symbol}" not found in pool "${poolName}"`);
    }

    const wallet: SaveWallet = { publicKey: walletPublicKey };
    const amountBN = new BN(amount * Math.pow(10, reserve.decimals || 6));

    const poolInput: InputPoolType = {
      address: pool.address,
      owner: pool.authorityAddress,
      name: pool.name,
      authorityAddress: pool.authorityAddress,
      reserves: pool.reserves.map((r: any) => ({
        address: r.address,
        pythOracle: r.pythOracle,
        switchboardOracle: r.switchboardOracle,
        mintAddress: r.mintAddress,
        liquidityFeeReceiverAddress: r.feeReceiverAddress,
      })),
    };

    const reserveInput: InputReserveType = {
      address: reserve.address,
      liquidityAddress: reserve.liquidityAddress,
      cTokenMint: reserve.cTokenMint,
      cTokenLiquidityAddress: reserve.cTokenLiquidityAddress,
      pythOracle: reserve.pythOracle,
      switchboardOracle: reserve.switchboardOracle,
      mintAddress: reserve.mintAddress,
      liquidityFeeReceiverAddress: reserve.feeReceiverAddress,
    };

    return await SolendActionCore.buildBorrowTxns(
      poolInput,
      reserveInput,
      this.connection,
      amountBN.toString(),
      wallet,
      { environment: this.environment as any }
    );
  }

  /**
   * Build repay transaction
   */
  public async buildRepayTransaction(
    amount: number,
    symbol: string,
    walletPublicKey: PublicKey,
    poolName = "main"
  ): Promise<SolendActionCore> {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    const reserve = this.getReserveBySymbol(symbol, poolName);
    if (!reserve) {
      throw new Error(`Reserve "${symbol}" not found in pool "${poolName}"`);
    }

    const wallet: SaveWallet = { publicKey: walletPublicKey };
    const amountBN = new BN(amount * Math.pow(10, reserve.decimals || 6));

    const poolInput: InputPoolType = {
      address: pool.address,
      owner: pool.authorityAddress,
      name: pool.name,
      authorityAddress: pool.authorityAddress,
      reserves: pool.reserves.map((r: any) => ({
        address: r.address,
        pythOracle: r.pythOracle,
        switchboardOracle: r.switchboardOracle,
        mintAddress: r.mintAddress,
        liquidityFeeReceiverAddress: r.feeReceiverAddress,
      })),
    };

    const reserveInput: InputReserveType = {
      address: reserve.address,
      liquidityAddress: reserve.liquidityAddress,
      cTokenMint: reserve.cTokenMint,
      cTokenLiquidityAddress: reserve.cTokenLiquidityAddress,
      pythOracle: reserve.pythOracle,
      switchboardOracle: reserve.switchboardOracle,
      mintAddress: reserve.mintAddress,
      liquidityFeeReceiverAddress: reserve.feeReceiverAddress,
    };

    return await SolendActionCore.buildRepayTxns(
      poolInput,
      reserveInput,
      this.connection,
      amountBN.toString(),
      wallet,
      { environment: this.environment as any }
    );
  }

  /**
   * Build withdraw transaction
   */
  public async buildWithdrawTransaction(
    amount: number,
    symbol: string,
    walletPublicKey: PublicKey,
    poolName = "main"
  ): Promise<SolendActionCore> {
    const pool = this.pools[poolName];
    if (!pool) {
      throw new Error(`Pool "${poolName}" not found`);
    }

    const reserve = this.getReserveBySymbol(symbol, poolName);
    if (!reserve) {
      throw new Error(`Reserve "${symbol}" not found in pool "${poolName}"`);
    }

    const wallet: SaveWallet = { publicKey: walletPublicKey };
    const amountBN = new BN(amount * Math.pow(10, reserve.decimals || 6));

    const poolInput: InputPoolType = {
      address: pool.address,
      owner: pool.authorityAddress,
      name: pool.name,
      authorityAddress: pool.authorityAddress,
      reserves: pool.reserves.map((r: any) => ({
        address: r.address,
        pythOracle: r.pythOracle,
        switchboardOracle: r.switchboardOracle,
        mintAddress: r.mintAddress,
        liquidityFeeReceiverAddress: r.feeReceiverAddress,
      })),
    };

    const reserveInput: InputReserveType = {
      address: reserve.address,
      liquidityAddress: reserve.liquidityAddress,
      cTokenMint: reserve.cTokenMint,
      cTokenLiquidityAddress: reserve.cTokenLiquidityAddress,
      pythOracle: reserve.pythOracle,
      switchboardOracle: reserve.switchboardOracle,
      mintAddress: reserve.mintAddress,
      liquidityFeeReceiverAddress: reserve.feeReceiverAddress,
    };

    return await SolendActionCore.buildWithdrawTxns(
      poolInput,
      reserveInput,
      this.connection,
      amountBN.toString(),
      wallet,
      { environment: this.environment as any }
    );
  }

  /**
   * Get lending markets overview
   */
  public getMarketsOverview(): any {
    return Object.entries(this.pools).map(([name, pool]) => ({
      name,
      address: pool.address,
      totalSupply: pool.reserves.reduce(
        (sum: BigNumber, r: any) => sum.plus(r.totalSupply || 0),
        new BigNumber(0)
      ),
      totalBorrow: pool.reserves.reduce(
        (sum: BigNumber, r: any) => sum.plus(r.totalBorrow || 0),
        new BigNumber(0)
      ),
      reserves: pool.reserves.length,
    }));
  }

  /**
   * Execute a Solend action and send transaction
   */
  public async executeAction(
    action: SolendActionCore,
    sendTransaction: (transaction: VersionedTransaction) => Promise<string>
  ): Promise<string> {
    try {
      const transaction = await action.getVersionedTransaction();
      const signature = await sendTransaction(transaction);
      console.log("Solend action executed. Transaction signature:", signature);
      return signature;
    } catch (error) {
      console.error("Failed to execute Solend action:", error);
      throw error;
    }
  }
}
