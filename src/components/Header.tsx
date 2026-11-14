import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#studio", label: "Studio" },
  { href: "#launch", label: "Launch" },
  { href: "#trade", label: "Trade" },
  { href: "#swarm", label: "Swarm" },
  { href: "#rewards", label: "Rewards" },
  { href: "#community", label: "Community" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="header">
      <div className="wrap header-row">
        <a className="brand" href="#main" aria-label="IMD Launchpad, back to top">
          <img src="./favicon.svg" alt="" width="28" height="28" />
          <span>IMD Launchpad</span>
        </a>
        <button
          ref={toggle}
          type="button"
          className="button button-quiet menu-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close menu" : "Menu"}
        </button>
        <nav id="site-nav" className={open ? "nav nav-open" : "nav"} aria-label="Sections">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
