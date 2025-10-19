// src/components/shared/GlobalThemeStyles.jsx
export default function GlobalThemeStyles() {
  return (
    <style>{`
/* Defaults (dark) */
:root {
  --app-bg: #0b0614;
  --surface-0: rgba(6,0,16,0.9);
  --surface-1: #0b0614;
  --card: #0a0616;
  --border-0: #222;
  --border-1: #241d3b;
  --text-0: #ffffff;
  --text-1: #bfb9cf;
  --muted: #bfb9cf;
  --accent: #0d6efd;
  --ok: #20c997;
  --danger: #dc3545;
  --shadow-strong: 0 10px 30px rgba(0,0,0,.35);
}

/* Dark theme */
:root[data-theme="dark"] {
  --app-bg: #0b0614;
  --surface-0: rgba(6,0,16,0.9);
  --surface-1: #0b0614;
  --card: #0a0616;
  --border-0: #222;
  --border-1: #241d3b;
  --text-0: #ffffff;
  --text-1: #bfb9cf;
  --muted: #bfb9cf;
  --accent: #0d6efd;
  --ok: #20c997;
  --danger: #dc3545;
}

/* Light theme */
:root[data-theme="light"] {
  --app-bg: #ffffff;
  --surface-0: rgba(255,255,255,0.85); /* semi transparent to keep the glass look */
  --surface-1: #ffffff;
  --card: #ffffff;
  --border-0: #dcdce0;
  --border-1: #cfcfda;
  --text-0: #232129;
  --text-1: #555268;
  --muted: #6b6980;
  --accent: #0d6efd;
  --ok: #198754;
  --danger: #dc3545;
}

/* Apply app background + default text color globally */
html, body {
  background: var(--app-bg) !important;
  color: var(--text-0);
}

/* A few helpers used by dock theme components */
.vl-card {
  border: 1px solid var(--border-1);
  background: var(--surface-0);
  border-radius: 14px;
  box-shadow: var(--shadow-strong), inset 0 1px 0 rgba(255,255,255,.03);
  overflow: hidden;
  color: var(--text-0);
}
.vl-card-header {
  background: linear-gradient(180deg, rgba(255,255,255,.04), transparent);
  border-bottom: 1px solid var(--border-1);
}
.vl-muted { color: var(--muted); }
.vl-btn-ghost {
  background: transparent; color: var(--text-0); border: 1px solid var(--border-1);
}
.vl-btn-ghost:hover {
  background: rgba(0,0,0,.06); border-color: var(--border-0);
}

/* Dock */
.dock-panel {
  background-color: var(--surface-0);
  border: 1px solid var(--border-0);
}
.dock-item {
  background-color: var(--surface-0);
  border: 1px solid var(--border-0);
  color: var(--text-0);
}
.dock-label {
  border: 1px solid var(--border-0);
  background-color: var(--surface-0);
  color: var(--text-0);
}
.dock-badge {
  background: var(--accent);
}

/* Cards and list items that used bg-light / bg-dark should swap to variables */
.card {
  background: var(--surface-0);
  color: var(--text-0);
  border-color: var(--border-1);
}
.list-group-item {
  background: var(--surface-0);
  color: var(--text-0);
  border-color: var(--border-1);
}
hr, .border, .border-top, .border-bottom {
  border-color: var(--border-1) !important;
}
`}</style>
  );
}