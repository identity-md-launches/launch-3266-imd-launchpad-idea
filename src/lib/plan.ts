export type Mode = "easy" | "pro";

export interface FeeSplit {
  creators: number;
  holders: number;
  treasury: number;
}

export interface ProSettings {
  name: string;
  ticker: string;
  supply: string;
  initialBuySol: string;
  fees: FeeSplit;
}

export type TaskStatus = "review" | "approved" | "changes";

export interface SwarmTask {
  id: string;
  worker: string;
  deliverable: string;
  summary: string;
  status: TaskStatus;
  note?: string;
}

export interface ProjectPlan {
  version: 1;
  createdAt: string;
  mode: Mode;
  idea: string;
  name: string;
  ticker: string;
  categories: string[];
  supply: number;
  developerAllocation: number;
  curveAllocation: number;
  initialBuySol: number;
  fees: FeeSplit;
  tasks: SwarmTask[];
  posts: { x: string; telegram: string };
}

export const DEFAULT_FEES: FeeSplit = { creators: 50, holders: 30, treasury: 20 };
export const DEFAULT_SUPPLY = 1_000_000_000;
/** Every launch reserves 1% of supply for the designated developer. */
export const DEVELOPER_ALLOCATION_PERCENT = 1;
export const MAX_INITIAL_BUY_SOL = 100;

export const EXAMPLE_IDEA =
  "A racing game where players breed snail champions, with a token for entry fees and a weekly community tournament on Telegram.";

const STOP = new Set(
  "a an and the for with where who that this to of in on at by from my our your their is are be it as or into about which will can game app token coin project community players people users weekly daily based build create make makes breed breeds track tracks help helps let lets earn earns play plays run runs turn turns where".split(" "),
);

const CATEGORY_RULES: { id: string; label: string; words: RegExp }[] = [
  { id: "game", label: "Game", words: /\b(game|games|gaming|play|player|players|race|racing|quest|arcade|tournament)\b/i },
  { id: "app", label: "Application", words: /\b(app|apps|tool|tools|platform|dashboard|bot|wallet|tracker|marketplace)\b/i },
  { id: "meme", label: "Meme", words: /\b(meme|memes|dog|cat|frog|pepe|joke|funny)\b/i },
  { id: "defi", label: "DeFi", words: /\b(defi|yield|stake|staking|lend|lending|swap|liquidity)\b/i },
  { id: "art", label: "Art and NFTs", words: /\b(art|artist|nft|nfts|collection|music|musician)\b/i },
  { id: "ai", label: "AI", words: /\b(ai|agent|agents|model|assistant)\b/i },
];

export interface FieldErrors {
  idea?: string;
  name?: string;
  ticker?: string;
  supply?: string;
  initialBuySol?: string;
  fees?: string;
}

export function validate(idea: string, mode: Mode, pro: ProSettings): FieldErrors {
  const errors: FieldErrors = {};
  const trimmed = idea.trim();
  if (trimmed.split(/\s+/).filter(Boolean).length < 4) {
    errors.idea = "Describe your idea in at least 4 words, for example who it is for and what it does.";
  } else if (trimmed.length > 600) {
    errors.idea = "Keep the idea under 600 characters. Details can be added in the studio.";
  }
  if (mode === "pro") {
    if (pro.name.trim() && pro.name.trim().length > 32) errors.name = "Use a name of 32 characters or fewer.";
    if (pro.ticker.trim() && !/^[A-Za-z0-9]{2,10}$/.test(pro.ticker.trim())) {
      errors.ticker = "Use 2 to 10 letters or digits for the ticker.";
    }
    const supply = Number(pro.supply.replace(/[,_\s]/g, ""));
    if (!Number.isInteger(supply) || supply < 1_000_000 || supply > 1_000_000_000_000) {
      errors.supply = "Enter a whole number between 1,000,000 and 1,000,000,000,000.";
    }
    const buy = pro.initialBuySol.trim() === "" ? 0 : Number(pro.initialBuySol);
    if (!Number.isFinite(buy) || buy < 0 || buy > MAX_INITIAL_BUY_SOL) {
      errors.initialBuySol = `Enter an amount from 0 to ${MAX_INITIAL_BUY_SOL} SOL, or leave it empty.`;
    }
    const { creators, holders, treasury } = pro.fees;
    const parts = [creators, holders, treasury];
    if (parts.some((p) => !Number.isInteger(p) || p < 0 || p > 100) || creators + holders + treasury !== 100) {
      errors.fees = `Make the three shares add up to 100%. They add up to ${creators + holders + treasury}% now.`;
    }
  }
  return errors;
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function deriveName(idea: string): string {
  const words = idea
    .replace(/[^A-Za-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));
  const picked = words.slice(0, 2).map(titleCase);
  return picked.length ? picked.join(" ") : "New Project";
}

export function deriveTicker(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts.map((p) => p.slice(0, 2)).join("") : parts[0] ?? "IMD";
  return letters.replace(/[^A-Za-z0-9]/g, "").slice(0, 5).toUpperCase() || "NEW";
}

export function detectCategories(idea: string): string[] {
  return CATEGORY_RULES.filter((rule) => rule.words.test(idea)).map((rule) => rule.label);
}

function buildTasks(name: string, ticker: string, categories: string[], mode: Mode): SwarmTask[] {
  const tasks: Omit<SwarmTask, "status">[] = [
    { id: "brief", worker: "Project director", deliverable: "Project brief and milestones", summary: `Turns the idea into a scoped brief for ${name}, with launch, growth and post-launch milestones.` },
    { id: "token", worker: "Token agent", deliverable: `${ticker} token configuration`, summary: "Prepares name, ticker, supply, the 1% developer allocation and the bonding-curve settings for review." },
    { id: "brand", worker: "Designer", deliverable: "Logo and brand kit", summary: "Drafts a logo, color palette and social banners in three directions to choose from." },
    { id: "site", worker: "Developer", deliverable: "Project website", summary: "Builds a one-page site with the token details, roadmap and community links." },
  ];
  if (categories.includes("Game")) {
    tasks.push({ id: "game", worker: "Developer", deliverable: "Playable browser game", summary: "Builds a first playable version of the game loop that can be shared from the website." });
  }
  if (categories.includes("Application")) {
    tasks.push({ id: "app", worker: "Developer", deliverable: "Application prototype", summary: "Builds a working prototype of the core feature with the screens the brief names." });
  }
  tasks.push(
    { id: "docs", worker: "Developer", deliverable: "Documentation and tokenomics page", summary: "Writes plain-language docs covering supply, allocations, fees and how the launch works." },
    { id: "security", worker: "Security reviewer", deliverable: "Launch configuration review", summary: "Checks the token settings, fee recipients and treasury signers before anything is signed." },
    { id: "marketing", worker: "Marketing agent", deliverable: "Launch campaign", summary: "Plans the announcement schedule, launch-day posts and milestone updates." },
    { id: "social", worker: "Social media manager", deliverable: "X posts and Telegram community", summary: "Drafts posts and a Telegram welcome message. Nothing is published until you authorize it." },
  );
  if (mode === "pro") {
    tasks.push({ id: "analytics", worker: "Analytics agent", deliverable: "Project dashboard", summary: "Sets up holder, volume and community metrics for the project studio." });
  }
  return tasks.map((t) => ({ ...t, status: "review" as const }));
}

function buildPosts(name: string, ticker: string, idea: string): { x: string; telegram: string } {
  const shortIdea = idea.trim().replace(/\s+/g, " ");
  const clipped = shortIdea.length > 150 ? `${shortIdea.slice(0, 147).trimEnd()}…` : shortIdea;
  const x = `${name} ($${ticker}) is coming to Solana. ${clipped} Launching on IMD Launchpad with a transparent 1% developer allocation.`;
  const telegram = `Welcome to the ${name} community. Here is the plan: ${shortIdea}\n\nPinned: token details, the roadmap and how to verify official links. Admins will never message you first or ask for a seed phrase.`;
  return { x: x.length > 280 ? `${x.slice(0, 279)}…` : x, telegram };
}

export function createPlan(idea: string, mode: Mode, pro: ProSettings, now: Date = new Date()): ProjectPlan {
  const name = mode === "pro" && pro.name.trim() ? pro.name.trim() : deriveName(idea);
  const ticker = mode === "pro" && pro.ticker.trim() ? pro.ticker.trim().toUpperCase() : deriveTicker(name);
  const supply = mode === "pro" ? Number(pro.supply.replace(/[,_\s]/g, "")) : DEFAULT_SUPPLY;
  const developerAllocation = Math.floor((supply * DEVELOPER_ALLOCATION_PERCENT) / 100);
  const categories = detectCategories(idea);
  return {
    version: 1,
    createdAt: now.toISOString(),
    mode,
    idea: idea.trim(),
    name,
    ticker,
    categories,
    supply,
    developerAllocation,
    curveAllocation: supply - developerAllocation,
    initialBuySol: mode === "pro" && pro.initialBuySol.trim() ? Number(pro.initialBuySol) : 0,
    fees: mode === "pro" ? { ...pro.fees } : { ...DEFAULT_FEES },
    tasks: buildTasks(name, ticker, categories, mode),
    posts: buildPosts(name, ticker, idea),
  };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const STORAGE_KEY = "imd-launchpad:plan";

export function savePlan(plan: ProjectPlan | null): void {
  try {
    if (plan) localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* Storage can be unavailable in private modes; the plan still works for this visit. */
  }
}

export function loadPlan(): ProjectPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProjectPlan;
    return parsed && parsed.version === 1 && Array.isArray(parsed.tasks) ? parsed : null;
  } catch {
    return null;
  }
}
