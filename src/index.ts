:root {
  --bg: #0f172a;
  --surface: #1e293b;
  --border: #334155;
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --blue: #3b82f6;
  --red: #ef4444;
  --green: #22c55e;
  --orange: #f97316;
}

[data-theme="light"] {
  --bg: #f1f5f9;
  --surface: #ffffff;
  --border: #cbd5e1;
  --text: #1e293b;
  --text-muted: #64748b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Courier New', monospace;
  font-size: 13px;
}
