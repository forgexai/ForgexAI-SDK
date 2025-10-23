import axios, { AxiosRequestConfig } from "axios";
import { Connection } from "@solana/web3.js";

//---------------------- CONSTANTS ---------------------
const JUPITER_BASE = "https://lite-api.jup.ag";

//---------------------- COMMON TYPES ------------------
export interface JupiterSwapQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: { amount: string; feeBps: number };
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}
export interface JupiterSwapResult {
  swapTransaction: string;
  lastValidBlockHeight?: number;
  prioritizationFeeLamports?: number;
}
export interface JupiterTokenInfo {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags: string[];
  daily_volume?: number;
  created_at?: string;
  freeze_authority?: string;
  mint_authority?: string;
}
export interface JupiterPriceData {
  [mintAddress: string]: {
    id: string;
    mintSymbol: string;
    vsToken: string;
    vsTokenSymbol: string;
    price: number;
  };
}

//---------------- COMMON TOKEN MINTS EXPORTED ----------
export const COMMON_TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  SRM: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt",
};

//--------------------- MAIN CLASS ----------------------
export class JupiterClient {
  constructor(private connection: Connection) {}

  // -------- ULTRA SWAP -------------
  async getUltraOrder(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    userPublicKey?: string;
    slippageBps?: number;
    swapMode?: "ExactIn" | "ExactOut";
  }): Promise<any> {
    return (await axios.get(`${JUPITER_BASE}/ultra/v1/order`, { params })).data;
  }
  async executeUltraOrder(tx: string): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/ultra/v1/execute`, { tx })).data;
  }
  async getUltraHoldings(address: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/ultra/v1/holdings`, {
        params: { address },
      })
    ).data;
  }
  async getUltraShield(mint: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/ultra/v1/shield`, { params: { mint } })
    ).data;
  }
  async searchUltraTokens(query: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/ultra/v1/search`, { params: { query } })
    ).data;
  }
  async getUltraRouters(): Promise<any> {
    return (await axios.get(`${JUPITER_BASE}/ultra/v1/routers`)).data;
  }

  // -------- LEGACY SWAP -----------
  async getSwapQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: number;
    slippageBps?: number;
    swapMode?: "ExactIn" | "ExactOut";
    restrictIntermediateTokens?: boolean;
    onlyDirectRoutes?: boolean;
    dexes?: string[];
    excludeDexes?: string[];
    platformFeeBps?: number;
    maxAccounts?: number;
    instructionVersion?: "V1" | "V2";
  }): Promise<JupiterSwapQuote> {
    return (await axios.get(`${JUPITER_BASE}/swap/v1/quote`, { params })).data;
  }
  async buildSwapTransaction(payload: {
    quoteResponse: JupiterSwapQuote;
    userPublicKey: string;
    wrapAndUnwrapSol?: boolean;
    useSharedAccounts?: boolean;
    feeAccount?: string;
    computeUnitPriceMicroLamports?: string | number;
    prioritizationFeeLamports?: number;
    asLegacyTransaction?: boolean;
    useTokenLedger?: boolean;
    dynamicComputeUnitLimit?: boolean;
  }): Promise<JupiterSwapResult> {
    return (await axios.post(`${JUPITER_BASE}/swap/v1/swap`, payload)).data;
  }
  async getSwapInstructions(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/swap/v1/swap-instructions`, payload)
    ).data;
  }
  async getDexLabels(): Promise<any> {
    return (await axios.get(`${JUPITER_BASE}/swap/v1/program-id-to-label`))
      .data;
  }

  // --------- LEND (BETA) ----------
  async lendEarn(params: any): Promise<any> {
    return (await axios.get(`${JUPITER_BASE}/lend/v1/earn`, { params })).data;
  }

  // ------ TRIGGER ORDERS ----------
  async createTriggerOrder(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/trigger/v1/createOrder`, payload))
      .data;
  }
  async executeTriggerOrder(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/trigger/v1/execute`, payload))
      .data;
  }
  async cancelTriggerOrder(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/trigger/v1/cancelOrder`, payload))
      .data;
  }
  async cancelBatchTriggerOrders(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/trigger/v1/cancelOrders`, payload)
    ).data;
  }
  async getTriggerOrders(address: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/trigger/v1/getTriggerOrders`, {
        params: { address },
      })
    ).data;
  }

  // ------- RECURRING ORDERS -------
  async createRecurringOrder(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/recurring/v1/createOrder`, payload)
    ).data;
  }
  async executeRecurringOrder(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/recurring/v1/execute`, payload))
      .data;
  }
  async cancelRecurringOrder(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/recurring/v1/cancelOrder`, payload)
    ).data;
  }
  async getRecurringOrders(address: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/recurring/v1/getRecurringOrders`, {
        params: { address },
      })
    ).data;
  }

  // ----------- TOKENS -------------
  async searchTokens(query: string): Promise<JupiterTokenInfo[]> {
    return (
      await axios.get(`${JUPITER_BASE}/tokens/v2/search`, { params: { query } })
    ).data;
  }
  async getTokensByCategory(category: string): Promise<JupiterTokenInfo[]> {
    return (await axios.get(`${JUPITER_BASE}/tokens/v2/mints/${category}`))
      .data;
  }
  async getAllTokensLegacy(): Promise<JupiterTokenInfo[]> {
    return (await axios.get(`${JUPITER_BASE}/tokens/v2/mints`)).data;
  }

  // ------------ PRICE --------------
  async getTokenPrice(
    tokenMint: string,
    vsToken: string = COMMON_TOKENS.USDC
  ): Promise<{ price: number; mintSymbol: string; vsTokenSymbol: string }> {
    const res = await axios.get(`${JUPITER_BASE}/price/v3/price`, {
      params: { ids: tokenMint, vsToken },
    });
    const data = res.data[tokenMint];
    return {
      price: data.price,
      mintSymbol: data.mintSymbol || tokenMint,
      vsTokenSymbol: data.vsTokenSymbol,
    };
  }
  async getMultipleTokenPrices(
    tokenMints: string[],
    vsToken: string = COMMON_TOKENS.USDC
  ): Promise<JupiterPriceData> {
    return (
      await axios.get(`${JUPITER_BASE}/price/v3/price`, {
        params: { ids: tokenMints.join(","), vsToken },
      })
    ).data;
  }
  async getTWAP(
    tokenMint: string,
    vsToken: string = COMMON_TOKENS.USDC
  ): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/price/v3/twap`, {
        params: { ids: tokenMint, vsToken },
      })
    ).data;
  }

  // ------------- SEND ---------------
  async craftSend(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/send/v1/craft-send`, payload))
      .data;
  }
  async craftClawback(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/send/v1/craft-clawback`, payload))
      .data;
  }
  async getPendingInvites(address: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/send/v1/pending-invites`, {
        params: { address },
      })
    ).data;
  }
  async getInviteHistory(address: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/send/v1/invite-history`, {
        params: { address },
      })
    ).data;
  }

  // ------------ STUDIO (DBC) -----------
  async studioCreateDBCPool(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/studio/v1/dbc-pool-create-tx`, payload)
    ).data;
  }
  async studioSubmitPool(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/studio/v1/dbc-pool-submit`, payload)
    ).data;
  }
  async studioGetAddressesByMint(mint: string): Promise<any> {
    return (
      await axios.get(`${JUPITER_BASE}/studio/v1/dbc-pool-addresses-by-mint`, {
        params: { mint },
      })
    ).data;
  }
  async studioClaimFee(payload: any): Promise<any> {
    return (await axios.post(`${JUPITER_BASE}/studio/v1/dbc-fee`, payload))
      .data;
  }
  async studioCreateFeeTx(payload: any): Promise<any> {
    return (
      await axios.post(`${JUPITER_BASE}/studio/v1/dbc-fee-create-tx`, payload)
    ).data;
  }

  // ------------------- UTILITY METHODS ------------------
  static toRawAmount(amount: number, decimals: number): number {
    return Math.floor(amount * Math.pow(10, decimals));
  }
  static fromRawAmount(rawAmount: string | number, decimals: number): number {
    return Number(rawAmount) / Math.pow(10, decimals);
  }
  static calculatePriceImpact(
    inputAmount: number,
    outputAmount: number,
    marketPrice: number
  ): number {
    const expectedOutput = inputAmount * marketPrice;
    return ((expectedOutput - outputAmount) / expectedOutput) * 100;
  }
}
