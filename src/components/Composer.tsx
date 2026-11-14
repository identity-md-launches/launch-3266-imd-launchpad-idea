import { useRef, useState, type FormEvent } from "react";
import {
  DEFAULT_FEES,
  DEFAULT_SUPPLY,
  DEVELOPER_ALLOCATION_PERCENT,
  EXAMPLE_IDEA,
  MAX_INITIAL_BUY_SOL,
  createPlan,
  validate,
  type FeeSplit,
  type FieldErrors,
  type Mode,
  type ProSettings,
  type ProjectPlan,
} from "../lib/plan";

interface Props {
  onPlan: (plan: ProjectPlan) => void;
}

const FEE_FIELDS: { key: keyof FeeSplit; label: string }[] = [
  { key: "creators", label: "Creators" },
  { key: "holders", label: "Holders" },
  { key: "treasury", label: "Project treasury" },
];

export function Composer({ onPlan }: Props) {
  const [idea, setIdea] = useState("");
  const [mode, setMode] = useState<Mode>("easy");
  const [pro, setPro] = useState<ProSettings>({
    name: "",
    ticker: "",
    supply: String(DEFAULT_SUPPLY),
    initialBuySol: "",
    fees: { ...DEFAULT_FEES },
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const ideaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    const found = validate(idea, mode, pro);
    setErrors(found);
    const firstKey = (["idea", "name", "ticker", "supply", "initialBuySol", "fees"] as const).find((k) => found[k]);
    if (firstKey) {
      const target = formRef.current?.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
      target?.focus();
      return;
    }
    onPlan(createPlan(idea, mode, pro));
  }

  function clearError(key: keyof FieldErrors) {
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function setFee(key: keyof FeeSplit, raw: string) {
    const value = raw === "" ? 0 : Math.round(Number(raw));
    clearError("fees");
    setPro((p) => ({ ...p, fees: { ...p.fees, [key]: Number.isFinite(value) ? value : 0 } }));
  }

  const feeTotal = pro.fees.creators + pro.fees.holders + pro.fees.treasury;

  return (
    <form ref={formRef} className="composer card" onSubmit={submit} noValidate aria-label="Describe your idea">
      <div className="field">
        <div className="field-head">
          <label htmlFor="idea">Describe your idea</label>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIdea(EXAMPLE_IDEA);
              setErrors((e) => ({ ...e, idea: undefined }));
              ideaRef.current?.focus();
            }}
          >
            Use an example
          </button>
        </div>
        <textarea
          id="idea"
          ref={ideaRef}
          data-field="idea"
          name="idea"
          rows={3}
          value={idea}
          onChange={(e) => { setIdea(e.target.value); clearError("idea"); }}
          placeholder="Who is it for, what does it do, and why would people hold the token?"
          aria-invalid={errors.idea ? true : undefined}
          aria-describedby={errors.idea ? "idea-error" : undefined}
        />
        {errors.idea && (
          <p id="idea-error" className="error">
            {errors.idea}
          </p>
        )}
      </div>

      <div className="composer-row">
        <fieldset className="segmented">
          <legend className="visually-hidden">Creation mode</legend>
          {(["easy", "pro"] as const).map((m) => (
            <label key={m} className="segment">
              <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} />
              <span>{m === "easy" ? "Easy mode" : "Pro mode"}</span>
            </label>
          ))}
        </fieldset>
        <button type="submit" className="button button-primary">
          Build my plan
        </button>
      </div>
      <p className="hint">
        {mode === "easy"
          ? "Easy mode picks the token settings for you."
          : "Pro mode lets you set the token and fees."}{" "}
        This page drafts the plan; nothing is launched.
      </p>

      {mode === "pro" && (
        <div className="pro-fields" id="pro-fields">
          <div className="grid-2">
            <div className="field">
              <label htmlFor="pro-name">Token name (optional)</label>
              <input
                id="pro-name"
                data-field="name"
                autoComplete="off"
                value={pro.name}
                onChange={(e) => { setPro({ ...pro, name: e.target.value }); clearError("name"); }}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && <p id="name-error" className="error">{errors.name}</p>}
            </div>
            <div className="field">
              <label htmlFor="pro-ticker">Ticker (optional)</label>
              <input
                id="pro-ticker"
                data-field="ticker"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={pro.ticker}
                onChange={(e) => { setPro({ ...pro, ticker: e.target.value }); clearError("ticker"); }}
                aria-invalid={errors.ticker ? true : undefined}
                aria-describedby={errors.ticker ? "ticker-error" : undefined}
              />
              {errors.ticker && <p id="ticker-error" className="error">{errors.ticker}</p>}
            </div>
            <div className="field">
              <label htmlFor="pro-supply">Total supply</label>
              <input
                id="pro-supply"
                data-field="supply"
                inputMode="numeric"
                autoComplete="off"
                value={pro.supply}
                onChange={(e) => { setPro({ ...pro, supply: e.target.value }); clearError("supply"); }}
                aria-invalid={errors.supply ? true : undefined}
                aria-describedby={errors.supply ? "supply-error supply-hint" : "supply-hint"}
              />
              <p id="supply-hint" className="hint">
                {DEVELOPER_ALLOCATION_PERCENT}% goes to the designated developer; the rest is sold on the bonding curve.
              </p>
              {errors.supply && <p id="supply-error" className="error">{errors.supply}</p>}
            </div>
            <div className="field">
              <label htmlFor="pro-buy">Developer initial purchase (SOL)</label>
              <input
                id="pro-buy"
                data-field="initialBuySol"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={pro.initialBuySol}
                onChange={(e) => { setPro({ ...pro, initialBuySol: e.target.value }); clearError("initialBuySol"); }}
                aria-invalid={errors.initialBuySol ? true : undefined}
                aria-describedby={errors.initialBuySol ? "buy-error buy-hint" : "buy-hint"}
              />
              <p id="buy-hint" className="hint">
                Optional, paid from the developer's own SOL, up to {MAX_INITIAL_BUY_SOL} SOL in this planner.
              </p>
              {errors.initialBuySol && <p id="buy-error" className="error">{errors.initialBuySol}</p>}
            </div>
          </div>
          <fieldset className="fee-fieldset" aria-describedby={errors.fees ? "fees-error fees-total" : "fees-total"}>
            <legend>Creator fee distribution</legend>
            <div className="grid-3">
              {FEE_FIELDS.map(({ key, label }, i) => (
                <div className="field" key={key}>
                  <label htmlFor={`fee-${key}`}>{label} (%)</label>
                  <input
                    id={`fee-${key}`}
                    data-field={i === 0 ? "fees" : undefined}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={100}
                    step={1}
                    value={pro.fees[key]}
                    onChange={(e) => setFee(key, e.target.value)}
                    aria-invalid={errors.fees ? true : undefined}
                  />
                </div>
              ))}
            </div>
            <p id="fees-total" className={feeTotal === 100 ? "hint" : "hint hint-warn"}>
              Total: <span className="num">{feeTotal}%</span> of 100%. Applies where the launch protocol supports fee sharing.
            </p>
            {errors.fees && <p id="fees-error" className="error">{errors.fees}</p>}
          </fieldset>
        </div>
      )}
    </form>
  );
}
