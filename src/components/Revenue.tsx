import { useId, useState } from "react";
import { formatUsd, splitRevenue } from "../lib/revenue";

export function Revenue() {
  const [raw, setRaw] = useState("10000");
  const id = useId();
  const value = Number(raw.replace(/[,$\s]/g, ""));
  const valid = raw.trim() !== "" && Number.isFinite(value) && value >= 0;
  const rows = splitRevenue(valid ? value : 0);

  return (
    <div className="revenue card">
      <div className="field revenue-input">
        <label htmlFor={id}>Eligible net platform revenue (USD)</label>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          aria-invalid={valid ? undefined : true}
          aria-describedby={valid ? undefined : `${id}-error`}
        />
        {!valid && <p id={`${id}-error`} className="error">Enter an amount in US dollars, for example 10000.</p>}
      </div>
      <table className="split-table">
        <caption className="visually-hidden">Proposed revenue distribution</caption>
        <thead>
          <tr>
            <th scope="col">Allocation</th>
            <th scope="col" className="right">Share</th>
            <th scope="col" className="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ share, amount }) => (
            <tr key={share.id}>
              <th scope="row">
                <span className="split-label">{share.label}</span>
                <span className="split-bar" aria-hidden="true"><span style={{ inlineSize: `${share.percent * 2.5}%` }} /></span>
                <span className="muted split-detail">{share.detail}</span>
              </th>
              <td className="right num">{share.percent}%</td>
              <td className="right num">{formatUsd(amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hint">A proposed model, subject to final approval.</p>
    </div>
  );
}
