// Solana addresses are base58 public keys: 32 to 44 characters, no 0, O, I or l.
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isSolanaMint(value: string): boolean {
  return BASE58.test(value.trim());
}

export const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

export function dexScreenerUrl(mint: string): string {
  return `https://dexscreener.com/solana/${encodeURIComponent(mint)}`;
}

export function raydiumSwapUrl(mint: string): string {
  return `https://raydium.io/swap/?inputMint=sol&outputMint=${encodeURIComponent(mint)}`;
}

export function solscanUrl(mint: string): string {
  return `https://solscan.io/token/${encodeURIComponent(mint)}`;
}
