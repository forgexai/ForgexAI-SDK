import { Connection, clusterApiUrl, type Commitment } from "@solana/web3.js";

export const getConnection = (
  network: "mainnet-beta" | "devnet" | "testnet" = "mainnet-beta",
  commitment: Commitment = "confirmed"
): Connection => {
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(network);
  return new Connection(rpcUrl, commitment);
};

export const SOLANA_NETWORKS = {
  MAINNET: "mainnet-beta" as const,
  DEVNET: "devnet" as const,
  TESTNET: "testnet" as const,
};

export const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  RAY: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  mSOL: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
  jitoSOL: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn",
};
