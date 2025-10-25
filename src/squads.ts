import * as multisig from "@sqds/multisig";
import {
  Connection,
  PublicKey,
  Keypair,
  TransactionMessage,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import * as beet from "@metaplex-foundation/beet";

/**
 * Configuration options for SquadsService
 */
export interface SquadsServiceConfig {
  connection: Connection;
  programId?: PublicKey;
}

/**
 * Member configuration for multisig
 */
export interface MemberConfig {
  key: PublicKey;
  permissions: multisig.types.Permissions;
}

/**
 * Multisig creation parameters
 */
export interface CreateMultisigParams {
  creator: Keypair;
  createKey: PublicKey;
  members: MemberConfig[];
  threshold: number;
  timeLock?: number;
  configAuthority?: PublicKey | null;
  rentCollector?: PublicKey | null;
}

/**
 * Vault transaction parameters
 */
export interface CreateVaultTransactionParams {
  multisigPda: PublicKey;
  creator: PublicKey;
  vaultIndex: number;
  instructions: TransactionInstruction[];
  ephemeralSigners?: number;
  memo?: string;
}

/**
 * Config transaction action types
 */
export type ConfigAction =
  | { __kind: "AddMember"; newMember: MemberConfig }
  | { __kind: "RemoveMember"; oldMember: PublicKey }
  | { __kind: "ChangeThreshold"; newThreshold: number }
  | { __kind: "SetTimeLock"; newTimeLock: number }
  | { __kind: "SetRentCollector"; newRentCollector: PublicKey | null }
  | {
      __kind: "AddSpendingLimit";
      createKey: PublicKey;
      vaultIndex: number;
      mint: PublicKey;
      amount: beet.bignum;
      period: multisig.generated.Period;
      members: PublicKey[];
      destinations: PublicKey[];
    }
  | { __kind: "RemoveSpendingLimit"; spendingLimit: PublicKey };

/**
 * Batch transaction parameters
 */
export interface BatchTransactionParams {
  multisigPda: PublicKey;
  creator: PublicKey;
  vaultIndex: number;
  transactions: TransactionInstruction[][];
  memo?: string;
}

/**
 * Service class for interacting with Squads Protocol v4
 * Provides methods for multisig creation, transaction management, and proposal handling
 */
export class SquadsService {
  private connection: Connection;
  private programId: PublicKey;

  constructor(config: SquadsServiceConfig) {
    this.connection = config.connection;
    this.programId =
      config.programId ||
      new PublicKey("SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf");
  }

  /**
   * Get the program ID
   */
  getProgramId(): PublicKey {
    return this.programId;
  }

  /**
   * Get the connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  // ==================== PDA Derivation Methods ====================

  /**
   * Derive multisig PDA from createKey
   */
  getMultisigPda(createKey: PublicKey): [PublicKey, number] {
    return multisig.getMultisigPda({
      createKey,
    });
  }

  /**
   * Derive vault PDA from multisig PDA and vault index
   */
  getVaultPda(multisigPda: PublicKey, index: number): [PublicKey, number] {
    return multisig.getVaultPda({
      multisigPda,
      index,
    });
  }

  /**
   * Derive transaction PDA
   */
  getTransactionPda(
    multisigPda: PublicKey,
    transactionIndex: bigint
  ): [PublicKey, number] {
    return multisig.getTransactionPda({
      multisigPda,
      index: transactionIndex,
    });
  }

  /**
   * Derive proposal PDA
   */
  getProposalPda(
    multisigPda: PublicKey,
    transactionIndex: bigint
  ): [PublicKey, number] {
    return multisig.getProposalPda({
      multisigPda,
      transactionIndex,
    });
  }

  /**
   * Derive spending limit PDA
   */
  getSpendingLimitPda(
    multisigPda: PublicKey,
    createKey: PublicKey
  ): [PublicKey, number] {
    return multisig.getSpendingLimitPda({
      multisigPda,
      createKey,
    });
  }

  /**
   * Derive batch PDA (for a specific transaction in the batch).
   * Note: the underlying library requires a transactionIndex, so a default of 0 is provided for callers that don't need a specific transaction.
   */
  getBatchPda(
    multisigPda: PublicKey,
    batchIndex: bigint,
    transactionIndex: number = 0
  ): [PublicKey, number] {
    return multisig.getBatchTransactionPda({
      multisigPda,
      batchIndex,
      transactionIndex,
    });
  }

  // ==================== Account Fetching Methods ====================

  /**
   * Fetch multisig account data
   */
  async getMultisigAccount(
    multisigPda: PublicKey
  ): Promise<multisig.accounts.Multisig> {
    return await multisig.accounts.Multisig.fromAccountAddress(
      this.connection,
      multisigPda
    );
  }

  /**
   * Fetch vault transaction account data
   */
  async getVaultTransactionAccount(
    transactionPda: PublicKey
  ): Promise<multisig.accounts.VaultTransaction> {
    return await multisig.accounts.VaultTransaction.fromAccountAddress(
      this.connection,
      transactionPda
    );
  }

  /**
   * Fetch config transaction account data
   */
  async getConfigTransactionAccount(
    transactionPda: PublicKey
  ): Promise<multisig.accounts.ConfigTransaction> {
    return await multisig.accounts.ConfigTransaction.fromAccountAddress(
      this.connection,
      transactionPda
    );
  }

  /**
   * Fetch proposal account data
   */
  async getProposalAccount(
    proposalPda: PublicKey
  ): Promise<multisig.accounts.Proposal> {
    return await multisig.accounts.Proposal.fromAccountAddress(
      this.connection,
      proposalPda
    );
  }

  /**
   * Fetch batch account data
   */
  async getBatchAccount(batchPda: PublicKey): Promise<multisig.accounts.Batch> {
    return await multisig.accounts.Batch.fromAccountAddress(
      this.connection,
      batchPda
    );
  }

  /**
   * Get current transaction index from multisig
   */
  async getCurrentTransactionIndex(
    multisigPda: PublicKey
  ): Promise<beet.bignum> {
    const multisigInfo = await this.getMultisigAccount(multisigPda);
    return multisigInfo.transactionIndex;
  }

  /**
   * Get next transaction index
   */
  async getNextTransactionIndex(multisigPda: PublicKey): Promise<bigint> {
    const currentIndex = await this.getCurrentTransactionIndex(multisigPda);
    const nextIndex = BigInt(currentIndex.toString()) + 1n;
    return nextIndex;
  }

  // ==================== Vault Checking ====================

  /**
   * Check if an address is a valid Squads vault (V3 or V4)
   * @param address - The address to check
   * @returns Object containing isSquad (boolean) and version (string)
   */
  async isSquadsVault(
    address: PublicKey
  ): Promise<{ isSquad: boolean; version: string }> {
    try {
      const response = await fetch(
        `https://4fnetmviidiqkjzenwxe66vgoa0soerr.lambda-url.us-east-1.on.aws/isSquad/${address.toString()}`
      );
      const data = await response.json();
      return {
        isSquad: data.isSquad || false,
        version: data.version || "",
      };
    } catch (error) {
      console.error("Error checking vault:", error);
      return { isSquad: false, version: "" };
    }
  }

  // ==================== Multisig Creation ====================

  /**
   * Create a new multisig
   */
  async createMultisig(
    params: CreateMultisigParams
  ): Promise<TransactionInstruction> {
    const [multisigPda] = this.getMultisigPda(params.createKey);
    const programConfigPda = multisig.getProgramConfigPda({})[0];

    const programConfig =
      await multisig.accounts.ProgramConfig.fromAccountAddress(
        this.connection,
        programConfigPda
      );

    return await multisig.instructions.multisigCreateV2({
      createKey: params.createKey,
      creator: params.creator.publicKey,
      multisigPda,
      configAuthority: params.configAuthority ?? null,
      timeLock: params.timeLock ?? 0,
      members: params.members,
      threshold: params.threshold,
      treasury: programConfig.treasury,
      rentCollector: params.rentCollector ?? null,
    });
  }

  // ==================== Vault Transaction Methods ====================

  /**
   * Create a vault transaction
   */
  async createVaultTransaction(
    params: CreateVaultTransactionParams
  ): Promise<TransactionInstruction> {
    const [vaultPda] = this.getVaultPda(params.multisigPda, params.vaultIndex);
    const transactionIndex = await this.getNextTransactionIndex(
      params.multisigPda
    );

    const recentBlockhash = (await this.connection.getLatestBlockhash())
      .blockhash;

    const transactionMessage = new TransactionMessage({
      payerKey: vaultPda,
      recentBlockhash,
      instructions: params.instructions,
    });

    return await multisig.instructions.vaultTransactionCreate({
      multisigPda: params.multisigPda,
      transactionIndex,
      creator: params.creator,
      vaultIndex: params.vaultIndex,
      ephemeralSigners: params.ephemeralSigners ?? 0,
      transactionMessage,
      memo: params.memo,
    });
  }

  /**
   * Execute a vault transaction
   */
  async executeVaultTransaction(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    const result = await multisig.instructions.vaultTransactionExecute({
      connection: this.connection,
      multisigPda,
      transactionIndex,
      member,
      programId: this.programId,
    });
    return result.instruction;
  }

  // ==================== Config Transaction Methods ====================

  /**
   * Create a config transaction
   */
  async createConfigTransaction(
    multisigPda: PublicKey,
    creator: PublicKey,
    actions: ConfigAction[]
  ): Promise<TransactionInstruction> {
    const transactionIndex = await this.getNextTransactionIndex(multisigPda);

    return await multisig.instructions.configTransactionCreate({
      multisigPda,
      transactionIndex,
      creator,
      actions,
    });
  }

  /**
   * Execute a config transaction
   */
  async executeConfigTransaction(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.configTransactionExecute({
      multisigPda,
      transactionIndex,
      member,
    });
  }

  // ==================== Proposal Methods ====================

  /**
   * Create a proposal
   */
  async createProposal(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    creator: PublicKey,
    isDraft: boolean = false
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.proposalCreate({
      multisigPda,
      transactionIndex,
      creator,
      isDraft,
    });
  }

  /**
   * Activate a draft proposal
   */
  async activateProposal(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.proposalActivate({
      multisigPda,
      transactionIndex,
      member,
    });
  }

  /**
   * Approve a proposal
   */
  async approveProposal(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.proposalApprove({
      multisigPda,
      transactionIndex,
      member,
    });
  }

  /**
   * Reject a proposal
   */
  async rejectProposal(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.proposalReject({
      multisigPda,
      transactionIndex,
      member,
    });
  }

  /**
   * Cancel a proposal
   */
  async cancelProposal(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.proposalCancel({
      multisigPda,
      transactionIndex,
      member,
    });
  }

  // ==================== Batch Methods ====================

  /**
   * Create a batch transaction
   */
  async createBatch(
    params: BatchTransactionParams
  ): Promise<TransactionInstruction[]> {
    const batchIndex = await this.getNextTransactionIndex(params.multisigPda);
    const [vaultPda] = this.getVaultPda(params.multisigPda, params.vaultIndex);

    const instructions: TransactionInstruction[] = [];

    // Create batch
    const batchCreateIx = await multisig.instructions.batchCreate({
      multisigPda: params.multisigPda,
      batchIndex,
      creator: params.creator,
      vaultIndex: params.vaultIndex,
      memo: params.memo,
    });
    instructions.push(batchCreateIx);

    // Create draft proposal
    const proposalCreateIx = await multisig.instructions.proposalCreate({
      multisigPda: params.multisigPda,
      transactionIndex: batchIndex,
      creator: params.creator,
      isDraft: true,
    });
    instructions.push(proposalCreateIx);

    // Add transactions to batch
    const recentBlockhash = (await this.connection.getLatestBlockhash())
      .blockhash;

    for (let i = 0; i < params.transactions.length; i++) {
      const transactionMessage = new TransactionMessage({
        payerKey: vaultPda,
        recentBlockhash,
        instructions: params.transactions[i],
      });

      const batchAddIx = await multisig.instructions.batchAddTransaction({
        multisigPda: params.multisigPda,
        batchIndex,
        vaultIndex: params.vaultIndex,
        transactionIndex: i + 1, // Batch transaction index starts at 1
        transactionMessage,
        ephemeralSigners: 0,
        member: params.creator,
      });
      instructions.push(batchAddIx);
    }

    return instructions;
  }

  /**
   * Execute a batch transaction
   */
  async executeBatch(
    multisigPda: PublicKey,
    batchIndex: bigint,
    transactionIndex: number,
    member: PublicKey
  ): Promise<TransactionInstruction> {
    const result = await multisig.instructions.batchExecuteTransaction({
      connection: this.connection,
      multisigPda,
      batchIndex,
      transactionIndex,
      member,
      programId: this.programId,
    });
    return result.instruction;
  }

  // ==================== Controlled Multisig Methods (Config Authority) ====================

  /**
   * Add member via config authority (controlled multisig only)
   */
  async addMemberControlled(
    multisigPda: PublicKey,
    configAuthority: Keypair,
    newMember: MemberConfig,
    rentPayer: Keypair
  ): Promise<string> {
    return await multisig.rpc.multisigAddMember({
      connection: this.connection,
      feePayer: configAuthority,
      multisigPda,
      configAuthority: configAuthority.publicKey,
      rentPayer,
      newMember,
      programId: this.programId,
    });
  }

  /**
   * Remove member via config authority (controlled multisig only)
   */
  async removeMemberControlled(
    multisigPda: PublicKey,
    configAuthority: Keypair,
    oldMember: PublicKey
  ): Promise<string> {
    return await multisig.rpc.multisigRemoveMember({
      connection: this.connection,
      feePayer: configAuthority,
      multisigPda,
      configAuthority: configAuthority.publicKey,
      oldMember,
      programId: this.programId,
    });
  }

  /**
   * Set rent collector via config authority (controlled multisig only)
   */
  async setRentCollectorControlled(
    multisigPda: PublicKey,
    configAuthority: Keypair,
    newRentCollector: PublicKey,
    rentPayer: PublicKey
  ): Promise<string> {
    return await multisig.rpc.multisigSetRentCollector({
      connection: this.connection,
      feePayer: configAuthority,
      multisigPda,
      configAuthority: configAuthority.publicKey,
      newRentCollector,
      rentPayer,
      programId: this.programId,
    });
  }

  /**
   * Add spending limit via config authority (controlled multisig only)
   */
  async addSpendingLimitControlled(
    multisigPda: PublicKey,
    configAuthority: Keypair,
    createKey: PublicKey,
    vaultIndex: number,
    mint: PublicKey,
    amount: bigint,
    period: multisig.generated.Period,
    members: PublicKey[] | null,
    destinations: PublicKey[],
    rentPayer: Keypair
  ): Promise<string> {
    const [spendingLimitPda] = this.getSpendingLimitPda(multisigPda, createKey);

    return await multisig.rpc.multisigAddSpendingLimit({
      connection: this.connection,
      feePayer: configAuthority,
      multisigPda,
      spendingLimit: spendingLimitPda,
      createKey,
      rentPayer,
      amount,
      configAuthority: configAuthority.publicKey,
      period,
      mint,
      destinations,
      members,
      vaultIndex,
      programId: this.programId,
    });
  }

  /**
   * Remove spending limit via config authority (controlled multisig only)
   */
  async removeSpendingLimitControlled(
    multisigPda: PublicKey,
    configAuthority: Keypair,
    spendingLimitPda: PublicKey,
    rentCollector: PublicKey
  ): Promise<string> {
    return await multisig.rpc.multisigRemoveSpendingLimit({
      connection: this.connection,
      feePayer: configAuthority,
      multisigPda,
      spendingLimit: spendingLimitPda,
      configAuthority: configAuthority.publicKey,
      rentCollector,
      programId: this.programId,
    });
  }

  // ==================== Account Closing ====================

  /**
   * Close vault transaction account and reclaim rent
   */
  async closeVaultTransaction(
    multisigPda: PublicKey,
    transactionIndex: bigint,
    rentCollector: PublicKey
  ): Promise<TransactionInstruction> {
    return await multisig.instructions.vaultTransactionAccountsClose({
      multisigPda,
      rentCollector,
      transactionIndex,
    });
  }

  // ==================== Utility Methods ====================

  /**
   * Get all permissions
   */
  static getAllPermissions(): multisig.types.Permissions {
    return multisig.types.Permissions.all();
  }

  /**
   * Get specific permissions
   */
  static getPermissions(
    permissions: multisig.types.Permission[]
  ): multisig.types.Permissions {
    return multisig.types.Permissions.fromPermissions(permissions);
  }

  /**
   * Create a simple SOL transfer instruction
   */
  createSolTransferInstruction(
    from: PublicKey,
    to: PublicKey,
    lamports: number
  ): TransactionInstruction {
    return SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports,
    });
  }

  /**
   * Helper to create a member config with all permissions
   */
  static createMemberWithAllPermissions(key: PublicKey): MemberConfig {
    return {
      key,
      permissions: multisig.types.Permissions.all(),
    };
  }

  /**
   * Helper to create a member config with voter permissions only
   */
  static createMemberWithVoterPermissions(key: PublicKey): MemberConfig {
    return {
      key,
      permissions: multisig.types.Permissions.fromPermissions([
        multisig.types.Permission.Vote,
      ]),
    };
  }

  /**
   * Helper to create a member config with custom permissions
   */
  static createMemberWithCustomPermissions(
    key: PublicKey,
    permissions: multisig.types.Permission[]
  ): MemberConfig {
    return {
      key,
      permissions: multisig.types.Permissions.fromPermissions(permissions),
    };
  }

  /**
   * Get proposal status as string
   */
  getProposalStatusString(status: multisig.generated.ProposalStatus): string {
    if ("active" in status) return "Active";
    if ("approved" in status) return "Approved";
    if ("rejected" in status) return "Rejected";
    if ("cancelled" in status) return "Cancelled";
    if ("executed" in status) return "Executed";
    if ("draft" in status) return "Draft";
    return "Unknown";
  }
}

// Export types for external use
export { multisig };
export type { Permission, Permissions, Period } from "@sqds/multisig/lib/types";
export type { ProposalStatus } from "@sqds/multisig/lib/generated/types/ProposalStatus";
