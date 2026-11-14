import { useEffect, useState, type FormEvent } from "react";
import { WRAPPED_SOL_MINT, dexScreenerUrl, isSolanaMint, raydiumSwapUrl, solscanUrl } from "../lib/solana";

interface Item {
  mint: string;
  label: string;
}

const KEY = "imd-launchpad:watchlist";

function load(): Item[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Item[]) : [];
    return Array.isArray(parsed) ? parsed.filter((i) => i && isSolanaMint(i.mint)) : [];
  } catch {
    return [];
  }
}

export function Watchlist() {
  const [items, setItems] = useState<Item[]>(load);
  const [mint, setMint] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* Storage unavailable: the list lasts for this visit only. */
    }
  }, [items]);

  function add(event: FormEvent) {
    event.preventDefault();
    const value = mint.trim();
    if (!isSolanaMint(value)) {
      setError("Paste a Solana mint address: 32 to 44 letters and digits, without 0, O, I or l.");
      document.getElementById("mint")?.focus();
      return;
    }
    if (items.some((i) => i.mint === value)) {
      setError("This token is already on your watchlist.");
      document.getElementById("mint")?.focus();
      return;
    }
    const name = label.trim() || `Token ${items.length + 1}`;
    setItems([{ mint: value, label: name }, ...items]);
    setMint("");
    setLabel("");
    setError("");
    setStatus(`${name} added to your watchlist.`);
  }

  function remove(item: Item) {
    setItems(items.filter((i) => i.mint !== item.mint));
    setStatus(`${item.label} removed from your watchlist.`);
  }

  return (
    <div className="watchlist card">
      <form className="watch-form" onSubmit={add} noValidate>
        <div className="field field-grow">
          <label htmlFor="mint">Solana mint address</label>
          <input
            id="mint"
            className="mono-input"
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="none"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "mint-error mint-hint" : "mint-hint"}
          />
        </div>
        <div className="field">
          <label htmlFor="mint-label">Label (optional)</label>
          <input id="mint-label" autoComplete="off" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <button type="submit" className="button">Add to watchlist</button>
      </form>
      <p id="mint-hint" className="hint">
        Saved in this browser only. Not sure where to start?{" "}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMint(WRAPPED_SOL_MINT);
            setLabel("Wrapped SOL");
            setError("");
          }}
        >
          Fill in wrapped SOL
        </button>
      </p>
      {error && <p id="mint-error" className="error">{error}</p>}
      <p className="visually-hidden" role="status">{status}</p>

      {items.length === 0 ? (
        <p className="empty">No tokens on your watchlist yet. Add a mint address to get chart, trade and explorer links in one place.</p>
      ) : (
        <ul className="watch-list">
          {items.map((item) => (
            <li key={item.mint} className="watch-item">
              <div className="watch-id">
                <h3>{item.label}</h3>
                <p className="mint">{item.mint}</p>
              </div>
              <div className="actions">
                <a className="button button-small" href={dexScreenerUrl(item.mint)} target="_blank" rel="noopener noreferrer">
                  Chart on DexScreener
                </a>
                <a className="button button-small" href={raydiumSwapUrl(item.mint)} target="_blank" rel="noopener noreferrer">
                  Trade on Raydium
                </a>
                <a className="button button-small button-quiet" href={solscanUrl(item.mint)} target="_blank" rel="noopener noreferrer">
                  Solscan
                </a>
                <button type="button" className="button button-small button-quiet" onClick={() => remove(item)}>
                  Remove<span className="visually-hidden"> {item.label}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
