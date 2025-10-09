import axios from "axios";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const MARINADE_API = "https://api.marinade.finance";
const JITO_API = "https://kobe.mainnet.jito.network/api/v1";

const MARINADE_PROGRAM_ID = new PublicKey(
  "MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD"
);

export interface MarinadeStakingInfo {
  token: "mSOL" | "jitoSOL" | "bSOL";
  apy: number;
  tvl: number;
  exchangeRate: number;
  totalStaked: number;
  totalValidators?: number;
  fee?: number;
  timestamp: number;
}

export interface MarinadeValidatorInfo {
  voteAccount: string;
  name?: string;
  identity?: string;
  commission: number;
  isActive: boolean;
  stake: number;
  apy?: number;
}

export interface MarinadeTransactionParams {
  amount: number;
  userPublicKey: string;
  referrerAccount?: string;
}

export interface MarinadeTransactionResult {
  transaction: string;
  lastValidBlockHeight?: number;
  priorityFee?: number;
}

export interface MarinadePoolInfo {
  tvl: number;
  totalStakers: number;
  validators: number;
  averageApy: number;
  stakingFee: number;
  unstakingFee: number;
  marinadeOwedLamports: number;
  reserveAccount: string;
  msolSupply: number;
  solLeg: number;
  msolLeg: number;
}

export class MarinadeClient {
  constructor(private connection: Connection) {}

  /**
   * Get staking APY for liquid staking tokens
   */
  async getStakingAPY(
    token: "mSOL" | "jitoSOL" | "bSOL" = "mSOL"
  ): Promise<MarinadeStakingInfo> {
    try {
      if (token === "mSOL") {
        const [apyResponse, tvlResponse, priceResponse] = await Promise.all([
          axios.get(`${MARINADE_API}/msol/apy/7d`),
          axios.get(`${MARINADE_API}/msol/tvl`),
          axios.get(`${MARINADE_API}/msol/price`),
        ]);

        return {
          token: "mSOL",
          apy: apyResponse.data.value || 0,
          tvl: tvlResponse.data.total_staked_sol || 0,
          exchangeRate: priceResponse.data.price || 1,
          totalStaked: tvlResponse.data.total_staked_sol || 0,
          totalValidators: tvlResponse.data.validators_count || 0,
          fee: 0,
          timestamp: Date.now(),
        };
      } else if (token === "jitoSOL") {
        const response = await axios.get(`${JITO_API}/apy/current`);

        return {
          token: "jitoSOL",
          apy: response.data.apy || 0,
          tvl: response.data.tvl || 0,
          exchangeRate: response.data.exchange_rate || 1,
          totalStaked: response.data.total_staked || 0,
          fee: response.data.fee || 0,
          timestamp: Date.now(),
        };
      } else {
        throw new Error("bSOL not yet supported");
      }
    } catch (error: any) {
      throw new Error(
        `Failed to get staking APY for ${token}: ${error.message}`
      );
    }
  }

  /**
   * Get current mSOL price relative to SOL
   */
  async getMsolPrice(): Promise<{ price: number; priceChange24h?: number }> {
    try {
      const response = await axios.get(`${MARINADE_API}/msol/price`);
      return {
        price: response.data.price || 1,
        priceChange24h: response.data.price_change_24h,
      };
    } catch (error: any) {
      throw new Error(`Failed to get mSOL price: ${error.message}`);
    }
  }

  /**
   * Get comprehensive Marinade protocol statistics
   */
  async getMarinadeStats(): Promise<MarinadePoolInfo> {
    try {
      const [stakingInfo, validators, price] = await Promise.all([
        this.getStakingAPY("mSOL"),
        this.getValidators(),
        this.getMsolPrice(),
      ]);

      return {
        tvl: stakingInfo.tvl,
        totalStakers: 0,
        validators: stakingInfo.totalValidators || 0,
        averageApy: stakingInfo.apy,
        stakingFee: 0,
        unstakingFee: 0.3,
        marinadeOwedLamports: 0,
        reserveAccount: "",
        msolSupply: 0,
        solLeg: stakingInfo.totalStaked,
        msolLeg: stakingInfo.totalStaked / price.price,
      };
    } catch (error: any) {
      throw new Error(`Failed to get Marinade stats: ${error.message}`);
    }
  }

  /**
   * Get list of validators in Marinade stake pool
   */
  async getValidators(): Promise<MarinadeValidatorInfo[]> {
    try {
      const response = await axios.get(`${MARINADE_API}/validators`);

      return response.data.map((validator: any) => ({
        voteAccount: validator.vote_account,
        name: validator.name,
        identity: validator.identity,
        commission: validator.commission || 0,
        isActive: validator.is_active || false,
        stake: validator.stake || 0,
        apy: validator.apy,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get validators: ${error.message}`);
    }
  }

  /**
   * Build stake transaction (SOL -> mSOL)
   */
  async buildStakeTransaction(
    params: MarinadeTransactionParams
  ): Promise<MarinadeTransactionResult> {
    try {
      const response = await axios.post(`${MARINADE_API}/transactions/stake`, {
        amount: params.amount * LAMPORTS_PER_SOL,
        userPublicKey: params.userPublicKey,
        referrerAccount: params.referrerAccount,
      });

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build stake transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build stake transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build unstake transaction (mSOL -> SOL)
   */
  async buildUnstakeTransaction(
    params: MarinadeTransactionParams
  ): Promise<MarinadeTransactionResult> {
    try {
      const response = await axios.post(
        `${MARINADE_API}/transactions/unstake`,
        {
          amount: params.amount * LAMPORTS_PER_SOL,
          userPublicKey: params.userPublicKey,
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build unstake transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build unstake transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build liquid unstake transaction (mSOL -> SOL instantly with fee)
   */
  async buildLiquidUnstakeTransaction(
    params: MarinadeTransactionParams
  ): Promise<MarinadeTransactionResult> {
    try {
      const response = await axios.post(
        `${MARINADE_API}/transactions/liquid-unstake`,
        {
          amount: params.amount * LAMPORTS_PER_SOL,
          userPublicKey: params.userPublicKey,
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build liquid unstake transaction");
      }

      return {
        transaction: response.data.transaction,
        lastValidBlockHeight: response.data.lastValidBlockHeight,
        priorityFee: response.data.priorityFee,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to build liquid unstake transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get unstaking tickets for a wallet
   */
  async getUnstakingTickets(walletAddress: string): Promise<
    Array<{
      ticketAccount: string;
      beneficiary: string;
      amount: number;
      createdEpoch: number;
      claimableEpoch: number;
      isClaimable: boolean;
    }>
  > {
    try {
      const response = await axios.get(
        `${MARINADE_API}/unstaking-tickets/${walletAddress}`
      );

      return response.data.map((ticket: any) => ({
        ticketAccount: ticket.account,
        beneficiary: ticket.beneficiary,
        amount: ticket.amount / LAMPORTS_PER_SOL,
        createdEpoch: ticket.created_epoch,
        claimableEpoch: ticket.claimable_epoch,
        isClaimable: ticket.is_claimable,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get unstaking tickets: ${error.message}`);
    }
  }

  /**
   * Get historical APY data
   */
  async getHistoricalApy(
    token: "mSOL" | "jitoSOL" = "mSOL",
    days: number = 30
  ): Promise<Array<{ timestamp: number; apy: number }>> {
    try {
      if (token === "mSOL") {
        const response = await axios.get(
          `${MARINADE_API}/msol/apy/history?days=${days}`
        );

        return response.data.map((item: any) => ({
          timestamp: item.timestamp,
          apy: item.apy,
        }));
      } else {
        const response = await axios.get(
          `${JITO_API}/apy/history?days=${days}`
        );

        return response.data.map((item: any) => ({
          timestamp: item.timestamp,
          apy: item.apy,
        }));
      }
    } catch (error: any) {
      throw new Error(`Failed to get historical APY: ${error.message}`);
    }
  }

  /**
   * Compare staking options (mSOL vs jitoSOL)
   */
  async compareStakingOptions(): Promise<{
    mSOL: MarinadeStakingInfo;
    jitoSOL: MarinadeStakingInfo;
    recommendation: string;
  }> {
    try {
      const [msolInfo, jitosolInfo] = await Promise.all([
        this.getStakingAPY("mSOL"),
        this.getStakingAPY("jitoSOL"),
      ]);

      let recommendation = "mSOL";
      if (jitosolInfo.apy > msolInfo.apy) {
        recommendation = "jitoSOL (higher APY)";
      } else if (msolInfo.tvl > jitosolInfo.tvl * 2) {
        recommendation = "mSOL (higher TVL, more established)";
      }

      return {
        mSOL: msolInfo,
        jitoSOL: jitosolInfo,
        recommendation,
      };
    } catch (error: any) {
      throw new Error(`Failed to compare staking options: ${error.message}`);
    }
  }

  /**
   * Utility method to convert SOL to lamports
   */
  static toLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }

  /**
   * Utility method to convert lamports to SOL
   */
  static fromLamports(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Calculate staking rewards over time
   */
  static calculateStakingRewards(
    principal: number,
    apy: number,
    days: number
  ): { totalRewards: number; finalAmount: number } {
    const dailyRate = apy / 365 / 100;
    const finalAmount = principal * Math.pow(1 + dailyRate, days);
    const totalRewards = finalAmount - principal;

    return { totalRewards, finalAmount };
  }

  /**
   * Calculate unstaking fee
   */
  static calculateUnstakingFee(
    amount: number,
    isLiquidUnstake: boolean = false
  ): number {
    if (isLiquidUnstake) {
      return amount * 0.003;
    }
    return 0;
  }
}
