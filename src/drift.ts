import {
  DriftClient as Drift,
  Wallet,
  loadKeypair,
  OrderType,
  PositionDirection,
  convertToNumber,
} from "@drift-labs/sdk";
import { Connection } from "@solana/web3.js";

export interface DriftOrderParams {
  marketIndex: number;
  side: "buy" | "sell";
  size: number;
  price?: number;
  orderType?: "market" | "limit";
  reduceOnly?: boolean;
  postOnly?: boolean;
}

export class DriftClient {
  private client: Drift;
  private connection: Connection;
  private wallet?: Wallet;

  constructor(
    rpcUrl: Connection | string,
    keypairPath?: string,
    private env: "mainnet-beta" | "devnet" = "devnet"
  ) {
    if (typeof rpcUrl === "string") {
      this.connection = new Connection(rpcUrl, "confirmed");
    } else {
      this.connection = rpcUrl;
    }

    if (keypairPath) {
      const keypair = loadKeypair(keypairPath);
      this.wallet = new Wallet(keypair);
      this.client = new Drift({
        connection: this.connection,
        wallet: this.wallet,
        env: env,
      } as any);
    } else {
      this.client = new Drift({
        connection: this.connection,
        env: env,
      } as any);
    }
  }
  async init() {
    await this.client.subscribe();
    console.log(`DriftClient initialized for ${this.env}`);
  }

  async getUser() {
    const user = this.client.getUser();
    const totalCollateral = convertToNumber(await user.getTotalCollateral());
    const freeCollateral = convertToNumber(await user.getFreeCollateral());
    const leverage = await user.getLeverage();
    const pnl = await user.getUnrealizedPNL();

    return {
      publicKey: user.userAccountPublicKey.toBase58(),
      totalCollateral,
      freeCollateral,
      leverage,
      pnl: pnl ? convertToNumber(pnl) : 0,
    };
  }

  async getPositions(walletAddress: string) {
    const user = this.client.getUser();
    const positions = user.getActivePerpPositionsForUserAccount(
      walletAddress as any
    );
    const positionDetails = [];

    for (const position of positions) {
      if (position.baseAssetAmount.eqn(0)) continue;

      const marketIndex = position.marketIndex;
      const baseAmount = convertToNumber(position.baseAssetAmount);
      const quoteEntryAmount = convertToNumber(position.quoteEntryAmount);
      const pnl = convertToNumber(
        await user.getUnrealizedPNL(true, marketIndex)
      );

      positionDetails.push({
        marketIndex,
        baseAmount,
        quoteEntryAmount,
        pnl,
      });
    }

    return positionDetails;
  }

  async getPerpPosition(marketIndex: number) {
    const user = this.client.getUser();
    const position = user.getPerpPosition(marketIndex);
    if (!position) return null;

    return {
      marketIndex,
      baseAmount: convertToNumber(position.baseAssetAmount),
      quoteEntryAmount: convertToNumber(position.quoteEntryAmount),
      pnl: convertToNumber(await user.getUnrealizedPNL(true, marketIndex)),
    };
  }

  async getSpotBalance(marketIndex: number = 0) {
    const user = this.client.getUser();
    const tokenAmount = user.getTokenAmount(marketIndex);
    return convertToNumber(tokenAmount);
  }

  async placePerpOrder(order: DriftOrderParams) {
    const params = {
      orderType:
        order.orderType === "market" ? OrderType.MARKET : OrderType.LIMIT,
      marketIndex: order.marketIndex,
      direction:
        order.side === "buy" ? PositionDirection.LONG : PositionDirection.SHORT,
      baseAssetAmount: this.client.convertToPerpPrecision(order.size),
      price: order.price ? this.client.convertToPricePrecision(order.price) : 0,
      reduceOnly: order.reduceOnly || false,
      postOnly:
        order.postOnly === true ? { mustPostOnly: true } : { none: true },
    } as any;

    const txSig = await this.client.placePerpOrder(params);
    console.log(`✅ Order placed with signature: ${txSig}`);
    return txSig;
  }

  async cancelOrder(orderId: number) {
    const txSig = await this.client.cancelOrder(orderId);
    console.log(`🛑 Order ${orderId} canceled - tx: ${txSig}`);
    return txSig;
  }

  async modifyOrder(orderId: number, price?: number, size?: number) {
    const modifyParams: any = { orderId };
    if (price)
      modifyParams.newLimitPrice = this.client.convertToPricePrecision(price);
    if (size)
      modifyParams.newBaseAmount = this.client.convertToPerpPrecision(size);

    const txSig = await this.client.modifyOrder(modifyParams);
    console.log(`✏️ Order ${orderId} modified - tx: ${txSig}`);
    return txSig;
  }

  async deposit(amount: number, marketIndex = 0) {
    const ata = await this.client.getAssociatedTokenAccount(marketIndex);
    const amt = this.client.convertToSpotPrecision(marketIndex, amount);
    const txSig = await this.client.deposit(amt, marketIndex, ata);
    console.log(
      `💰 Deposited ${amount} to market ${marketIndex} - tx: ${txSig}`
    );
    return txSig;
  }

  async withdraw(amount: number, marketIndex = 0) {
    const ata = await this.client.getAssociatedTokenAccount(marketIndex);
    const amt = this.client.convertToSpotPrecision(marketIndex, amount);
    const txSig = await this.client.withdraw(amt, marketIndex, ata);
    console.log(
      `🏦 Withdrawn ${amount} from market ${marketIndex} - tx: ${txSig}`
    );
    return txSig;
  }

  async getMarkets() {
    const spotMarkets = this.client.getSpotMarketAccount(0);
    const perpMarkets = this.client.getPerpMarketAccount(0);
    return { spotMarkets, perpMarkets };
  }

  async close() {
    await this.client.unsubscribe();
    console.log("Drift client unsubscribed and resources freed.");
  }
}
