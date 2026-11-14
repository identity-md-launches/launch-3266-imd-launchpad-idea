import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DEVELOPER_ALLOCATION_PERCENT, formatNumber, type ProjectPlan, type SwarmTask } from "../lib/plan";

interface Props {
  plan: ProjectPlan | null;
  onChange: (plan: ProjectPlan) => void;
  onClear: () => void;
  onStart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}

const TABS = [
  { id: "tasks", label: "Tasks" },
  { id: "token", label: "Token" },
  { id: "social", label: "Social" },
  { id: "launch", label: "Launch" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const STATUS_LABEL: Record<SwarmTask["status"], string> = {
  review: "Waiting for your review",
  approved: "Approved",
  changes: "Changes requested",
};

export function Studio({ plan, onChange, onClear, onStart, headingRef }: Props) {
  const [tab, setTab] = useState<TabId>("tasks");
  const [status, setStatus] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setTab("tasks");
  }, [plan?.createdAt]);

  if (!plan) {
    return (
      <div className="studio-empty card">
        <h2 id="studio-title" ref={headingRef} tabIndex={-1}>
          Your project studio
        </h2>
        <p>
          Describe an idea above and build a plan. Its Swarm tasks, token settings, social drafts and launch steps
          will appear here, saved in this browser.
        </p>
        <button type="button" className="button" onClick={onStart}>
          Describe an idea
        </button>
      </div>
    );
  }

  const current = plan;
  const approved = current.tasks.filter((t) => t.status === "approved").length;

  function updateTask(id: string, patch: Partial<SwarmTask>) {
    onChange({ ...current, tasks: current.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    if (next < 0) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  }

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(`${what} copied.`);
    } catch {
      setStatus(`Unable to copy. Select the ${what.toLowerCase()} text and copy it manually.`);
    }
  }

  function download() {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.ticker.toLowerCase()}-plan.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Plan downloaded as JSON.");
  }

  return (
    <div className="studio card">
      <div className="studio-head">
        <div>
          <h2 id="studio-title" ref={headingRef} tabIndex={-1}>
            {current.name} <span className="ticker">${current.ticker}</span>
          </h2>
          <p className="muted">
            {current.mode === "easy" ? "Easy mode" : "Pro mode"}
            {current.categories.length ? `, ${current.categories.join(", ")}` : ""}. {approved} of{" "}
            {current.tasks.length} deliverables approved.
          </p>
        </div>
        <div className="actions">
          <button type="button" className="button" onClick={download}>
            Download plan
          </button>
          <button type="button" className="button button-quiet" onClick={onClear}>
            Clear plan
          </button>
        </div>
      </div>
      <p className="progress" aria-hidden="true">
        <span style={{ inlineSize: `${(approved / current.tasks.length) * 100}%` }} />
      </p>

      <div role="tablist" aria-label="Project studio" className="tabs">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (tabRefs.current[i] = el)}
            role="tab"
            type="button"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            className="tab"
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="panel" tabIndex={0}>
        {tab === "tasks" && (
          <ul className="task-list">
            {current.tasks.map((task) => (
              <TaskRow key={task.id} task={task} onUpdate={(patch) => updateTask(task.id, patch)} />
            ))}
          </ul>
        )}

        {tab === "token" && (
          <dl className="facts">
            <div><dt>Name and ticker</dt><dd>{current.name}, <span className="num">${current.ticker}</span></dd></div>
            <div><dt>Total supply</dt><dd className="num">{formatNumber(current.supply)}</dd></div>
            <div>
              <dt>Developer allocation ({DEVELOPER_ALLOCATION_PERCENT}%)</dt>
              <dd className="num">{formatNumber(current.developerAllocation)}</dd>
            </div>
            <div><dt>Sold on the bonding curve</dt><dd className="num">{formatNumber(current.curveAllocation)}</dd></div>
            <div>
              <dt>Developer initial purchase</dt>
              <dd className="num">{current.initialBuySol ? `${current.initialBuySol} SOL, from the developer's own wallet` : "None"}</dd>
            </div>
            <div>
              <dt>Creator fee distribution</dt>
              <dd className="num">
                Creators {current.fees.creators}%, holders {current.fees.holders}%, treasury {current.fees.treasury}%
              </dd>
            </div>
          </dl>
        )}

        {tab === "social" && (
          <div className="drafts">
            <div className="draft">
              <h3>X announcement</h3>
              <p className="draft-text">{current.posts.x}</p>
              <div className="draft-foot">
                <span className="muted num">{current.posts.x.length} of 280 characters</span>
                <button type="button" className="button" onClick={() => copy(current.posts.x, "X post")}>
                  Copy X post
                </button>
              </div>
            </div>
            <div className="draft">
              <h3>Telegram welcome</h3>
              <p className="draft-text">{current.posts.telegram}</p>
              <div className="draft-foot">
                <span className="muted">Pinned in the group after you authorize it.</span>
                <button type="button" className="button" onClick={() => copy(current.posts.telegram, "Telegram message")}>
                  Copy Telegram message
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "launch" && (
          <ol className="steps">
            <li>
              <h3>Approve the deliverables</h3>
              <p>{approved === current.tasks.length ? "Done: every deliverable is approved." : `${current.tasks.length - approved} still need your review in Tasks.`}</p>
            </li>
            <li>
              <h3>Review and sign the token creation</h3>
              <p>Your Solana wallet shows the exact transaction. AI workers never hold your keys or sign for you.</p>
            </li>
            <li>
              <h3>Trade on the bonding curve</h3>
              <p>The launch protocol, such as Raydium LaunchLab, opens trading on a bonding curve with {current.ticker}'s settings.</p>
            </li>
            <li>
              <h3>Graduate to a Raydium pool</h3>
              <p>When the curve reaches the protocol's graduation target, liquidity moves into a Raydium pool.</p>
            </li>
          </ol>
        )}
      </div>
      <p className="visually-hidden" role="status">{status}</p>
      {status && <p className="hint" aria-hidden="true">{status}</p>}
    </div>
  );
}

function TaskRow({ task, onUpdate }: { task: SwarmTask; onUpdate: (patch: Partial<SwarmTask>) => void }) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(task.note ?? "");
  const [error, setError] = useState("");
  const noteId = `note-${task.id}`;

  return (
    <li className="task">
      <div className="task-main">
        <h3>{task.deliverable}</h3>
        <p className="muted">{task.worker}</p>
        <p>{task.summary}</p>
        {task.status === "changes" && task.note && !editing && <p className="task-note">Your note: {task.note}</p>}
      </div>
      <div className="task-side">
        <p className={`status status-${task.status}`}>
          <span aria-hidden="true">{task.status === "approved" ? "✓" : task.status === "changes" ? "↺" : "○"}</span>{" "}
          {STATUS_LABEL[task.status]}
        </p>
        {!editing && (
          <div className="actions">
            {task.status !== "approved" ? (
              <button type="button" className="button button-small" onClick={() => onUpdate({ status: "approved" })}>
                Approve<span className="visually-hidden"> {task.deliverable}</span>
              </button>
            ) : (
              <button type="button" className="button button-small button-quiet" onClick={() => onUpdate({ status: "review" })}>
                Undo approval<span className="visually-hidden"> of {task.deliverable}</span>
              </button>
            )}
            <button type="button" className="button button-small button-quiet" onClick={() => setEditing(true)}>
              Request changes<span className="visually-hidden"> to {task.deliverable}</span>
            </button>
          </div>
        )}
      </div>
      {editing && (
        <form
          className="note-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (note.trim().length < 3) {
              setError("Say what should change, for example a color or a feature.");
              return;
            }
            onUpdate({ status: "changes", note: note.trim() });
            setEditing(false);
            setError("");
          }}
        >
          <label htmlFor={noteId}>What should change in the {task.deliverable.toLowerCase()}?</label>
          <textarea
            id={noteId}
            rows={2}
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setEditing(false);
            }}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${noteId}-error` : undefined}
          />
          {error && <p id={`${noteId}-error`} className="error">{error}</p>}
          <div className="actions">
            <button type="submit" className="button button-small">Send request</button>
            <button type="button" className="button button-small button-quiet" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
