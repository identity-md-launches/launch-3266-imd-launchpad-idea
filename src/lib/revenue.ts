export interface RevenueShare {
  id: string;
  label: string;
  percent: number;
  chain: "Ethereum" | "Platform";
  detail: string;
}

/** The proposed split of eligible net platform revenue. Subject to final approval. */
export const REVENUE_SHARES: RevenueShare[] = [
  { id: "treasury", label: "IMD ecosystem treasury", percent: 40, chain: "Platform", detail: "Held under multisig control for ecosystem programs." },
  { id: "ops", label: "Platform development and operations", percent: 20, chain: "Platform", detail: "Infrastructure, audits, support and new features." },
  { id: "nft", label: "IMD NFT worker rewards", percent: 20, chain: "Ethereum", detail: "Paid in IMD for verified worker contributions." },
  { id: "dev", label: "Developer IMD rewards", percent: 10, chain: "Ethereum", detail: "Paid in IMD to developers who ship on the platform." },
  { id: "burn", label: "IMD buyback and burn", percent: 10, chain: "Ethereum", detail: "Buys IMD on Ethereum and sends it to a burn address." },
];

export function splitRevenue(total: number): { share: RevenueShare; amount: number }[] {
  const safe = Number.isFinite(total) && total > 0 ? total : 0;
  return REVENUE_SHARES.map((share) => ({ share, amount: (safe * share.percent) / 100 }));
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}
