import axios from "axios";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const SQUADS_API = "https://api.squads.so/v3";
const SQUADS_INDEXER_API = "https://indexer.squads.so/v1";

export interface SquadsMultisig {
  publicKey: string;
  threshold: number;
  members: Array<{
    key: string;
    permissions: {
      mask: number;
      vote: boolean;
      execute: boolean;
      initiate: boolean;
    };
  }>;
  transactionIndex: number;
  staleTransactionIndex: number;
  timelock: number;
  createKey: string;
  allowExternalExecute: boolean;
  rentCollector?: string;
}

export interface SquadsProposal {
  publicKey: string;
  multisig: string;
  transactionIndex: number;
  creator: string;
  status:
    | "Draft"
    | "Active"
    | "ExecuteReady"
    | "Executed"
    | "Rejected"
    | "Cancelled"
    | "Stale";
  approvals: string[];
  rejections: string[];
  cancelled: boolean;
  executed: boolean;
  executedAt?: number;
  message?: string;
  transactionMessage?: {
    accountKeys: string[];
    instructions: Array<{
      programId: string;
      data: string;
      accounts: number[];
    }>;
    recentBlockhash: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface SquadsTreasuryBalance {
  address: string;
  sol: number;
  tokens: Array<{
    mint: string;
    symbol?: string;
    decimals: number;
    amount: number;
    uiAmount: number;
    value?: number;
  }>;
  totalValue?: number;
  timestamp: number;
}

export interface SquadsTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  status: "success" | "failed";
  fee: number;
  type: "multisig" | "proposal" | "vote" | "execute";
  multisig: string;
  proposal?: string;
  signer: string;
  memo?: string;
}

export interface SquadsVault {
  publicKey: string;
  index: number;
  multisig: string;
  creator: string;
  balance: number;
  tokens: Array<{
    mint: string;
    amount: number;
    decimals: number;
  }>;
}

export interface SquadsActivity {
  type:
    | "proposal_created"
    | "proposal_approved"
    | "proposal_rejected"
    | "proposal_executed"
    | "member_added"
    | "member_removed";
  timestamp: number;
  signer: string;
  multisig: string;
  proposal?: string;
  details?: any;
}

export class SquadsClient {
  constructor(private connection: Connection, private apiKey?: string) {}

  /**
   * Get multisig information and configuration
   */
  async getMultisigInfo(multisigAddress: string): Promise<SquadsMultisig> {
    try {
      const response = await axios.get(
        `${SQUADS_API}/multisig/${multisigAddress}`,
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data) {
        throw new Error("Multisig not found");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get multisig info: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get all proposals for a multisig
   */
  async getProposals(
    multisigAddress: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SquadsProposal[]> {
    try {
      const params: any = {
        limit,
        offset,
      };

      if (status) {
        params.status = status;
      }

      const response = await axios.get(
        `${SQUADS_API}/multisig/${multisigAddress}/proposals`,
        {
          params,
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get proposals: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get new/active proposals for a multisig
   */
  async getNewProposals(multisigAddress: string): Promise<SquadsProposal[]> {
    try {
      return await this.getProposals(multisigAddress, "Active");
    } catch (error: any) {
      throw new Error(`Failed to get new proposals: ${error.message}`);
    }
  }

  /**
   * Get specific proposal details
   */
  async getProposal(proposalAddress: string): Promise<SquadsProposal> {
    try {
      const response = await axios.get(
        `${SQUADS_API}/proposal/${proposalAddress}`,
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data) {
        throw new Error("Proposal not found");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to get proposal: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get treasury balance including SOL and SPL tokens
   */
  async getTreasuryBalance(
    multisigAddress: string
  ): Promise<SquadsTreasuryBalance> {
    try {
      const pubkey = new PublicKey(multisigAddress);
      const solBalance = await this.connection.getBalance(pubkey);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        pubkey,
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        }
      );

      const tokens = tokenAccounts.value
        .map((account) => {
          const accountInfo = account.account.data.parsed.info;
          return {
            mint: accountInfo.mint,
            decimals: accountInfo.tokenAmount.decimals,
            amount: parseInt(accountInfo.tokenAmount.amount),
            uiAmount: accountInfo.tokenAmount.uiAmount,
          };
        })
        .filter((token) => token.amount > 0);

      return {
        address: multisigAddress,
        sol: solBalance / LAMPORTS_PER_SOL,
        tokens,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      throw new Error(`Failed to get treasury balance: ${error.message}`);
    }
  }

  /**
   * Get multisig vaults
   */
  async getVaults(multisigAddress: string): Promise<SquadsVault[]> {
    try {
      const response = await axios.get(
        `${SQUADS_API}/multisig/${multisigAddress}/vaults`,
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get vaults: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get transaction history for a multisig
   */
  async getTransactionHistory(
    multisigAddress: string,
    limit: number = 50,
    before?: string
  ): Promise<SquadsTransaction[]> {
    try {
      const params: any = { limit };
      if (before) params.before = before;

      const response = await axios.get(
        `${SQUADS_INDEXER_API}/multisig/${multisigAddress}/transactions`,
        {
          params,
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get transaction history: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get activity feed for a multisig
   */
  async getActivity(
    multisigAddress: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SquadsActivity[]> {
    try {
      const response = await axios.get(
        `${SQUADS_API}/multisig/${multisigAddress}/activity`,
        {
          params: { limit, offset },
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get activity: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Get multisigs where a user is a member
   */
  async getUserMultisigs(userAddress: string): Promise<SquadsMultisig[]> {
    try {
      const response = await axios.get(
        `${SQUADS_API}/user/${userAddress}/multisigs`,
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      return response.data || [];
    } catch (error: any) {
      throw new Error(
        `Failed to get user multisigs: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Create a new proposal transaction
   */
  async buildCreateProposalTransaction(
    multisigAddress: string,
    creatorPublicKey: string,
    instructions: any[],
    message?: string
  ): Promise<{ transaction: string }> {
    try {
      const response = await axios.post(
        `${SQUADS_API}/multisig/${multisigAddress}/proposal`,
        {
          creator: creatorPublicKey,
          instructions,
          message,
        },
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build create proposal transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build create proposal transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build approve proposal transaction
   */
  async buildApproveProposalTransaction(
    proposalAddress: string,
    memberPublicKey: string
  ): Promise<{ transaction: string }> {
    try {
      const response = await axios.post(
        `${SQUADS_API}/proposal/${proposalAddress}/approve`,
        {
          member: memberPublicKey,
        },
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build approve proposal transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build approve proposal transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build reject proposal transaction
   */
  async buildRejectProposalTransaction(
    proposalAddress: string,
    memberPublicKey: string
  ): Promise<{ transaction: string }> {
    try {
      const response = await axios.post(
        `${SQUADS_API}/proposal/${proposalAddress}/reject`,
        {
          member: memberPublicKey,
        },
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build reject proposal transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build reject proposal transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Build execute proposal transaction
   */
  async buildExecuteProposalTransaction(
    proposalAddress: string,
    executorPublicKey: string
  ): Promise<{ transaction: string }> {
    try {
      const response = await axios.post(
        `${SQUADS_API}/proposal/${proposalAddress}/execute`,
        {
          executor: executorPublicKey,
        },
        {
          headers: this.apiKey ? { "X-API-KEY": this.apiKey } : {},
        }
      );

      if (!response.data || !response.data.transaction) {
        throw new Error("Failed to build execute proposal transaction");
      }

      return response.data;
    } catch (error: any) {
      throw new Error(
        `Failed to build execute proposal transaction: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  /**
   * Check if a proposal has enough approvals to execute
   */
  static canExecuteProposal(
    proposal: SquadsProposal,
    multisig: SquadsMultisig
  ): boolean {
    return proposal.approvals.length >= multisig.threshold;
  }

  /**
   * Check if a user can vote on a proposal
   */
  static canUserVote(
    userAddress: string,
    proposal: SquadsProposal,
    multisig: SquadsMultisig
  ): boolean {
    const isMember = multisig.members.some(
      (member) => member.key === userAddress
    );
    const hasVoted =
      proposal.approvals.includes(userAddress) ||
      proposal.rejections.includes(userAddress);
    return isMember && !hasVoted && proposal.status === "Active";
  }

  /**
   * Get proposal voting status
   */
  static getProposalVotingStatus(
    proposal: SquadsProposal,
    multisig: SquadsMultisig
  ): {
    approvalsNeeded: number;
    approvalsReceived: number;
    canExecute: boolean;
    votingComplete: boolean;
  } {
    const approvalsReceived = proposal.approvals.length;
    const approvalsNeeded = multisig.threshold;
    const canExecute = approvalsReceived >= approvalsNeeded;
    const totalVotes = proposal.approvals.length + proposal.rejections.length;
    const votingComplete = canExecute || totalVotes >= multisig.members.length;

    return {
      approvalsNeeded,
      approvalsReceived,
      canExecute,
      votingComplete,
    };
  }

  /**
   * Calculate time until proposal expires (if applicable)
   */
  static getProposalTimeRemaining(
    proposal: SquadsProposal,
    multisig: SquadsMultisig
  ): {
    timeRemaining: number;
    isExpired: boolean;
  } {
    if (multisig.timelock === 0) {
      return { timeRemaining: Infinity, isExpired: false };
    }

    const expirationTime = proposal.createdAt + multisig.timelock;
    const now = Date.now() / 1000;
    const timeRemaining = Math.max(0, expirationTime - now);
    const isExpired = timeRemaining === 0;

    return { timeRemaining, isExpired };
  }

  /**
   * Format proposal status for display
   */
  static formatProposalStatus(proposal: SquadsProposal): string {
    switch (proposal.status) {
      case "Draft":
        return "Draft";
      case "Active":
        return "Active - Voting in Progress";
      case "ExecuteReady":
        return "Ready to Execute";
      case "Executed":
        return "Executed";
      case "Rejected":
        return "Rejected";
      case "Cancelled":
        return "Cancelled";
      case "Stale":
        return "Stale - Expired";
      default:
        return proposal.status;
    }
  }
}
