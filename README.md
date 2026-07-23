# Expenzo — Expense Tracker

A modern, responsive personal expense tracker built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**. Data is persisted locally in the browser via `localStorage` (demo mode — no backend, no accounts).

## Features

- **Add / edit / delete expenses** with date, amount, category, and description
- **Form validation** — positive amounts, max 2 decimals, no future dates, required description
- **Dashboard** — summary cards (total, this month, avg/day, top category), a category donut chart, and a 6-month spending bar chart
- **Expense list** with **search**, **category filter**, and **date-range filter**
- **CSV export** of the current (filtered) view
- **Currency & date formatting** via the native `Intl` API
- **Responsive** — table layout on desktop, card layout on mobile
- **Visual feedback** — toasts, loading skeletons, empty states, and inline errors

## Tech notes

- **No charting dependency** — charts are hand-built with SVG/CSS to keep the dependency surface small and easy to audit.
- **Native date picker** (`<input type="date">`) — works well on desktop and iOS, no extra library.
- All dependencies are **pinned to exact versions**; commit `package-lock.json` to source control.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Testing the features manually

1. **Empty state** — first load shows the dashboard empty state. Click **Add your first expense**.
2. **Add** — enter an amount, pick a category, choose a date, add a description → **Add expense**. A toast confirms it and the dashboard updates.
3. **Validation** — try submitting with a blank/zero/negative amount, a future date, or an empty description; inline errors appear and submission is blocked.
4. **Dashboard** — add a few expenses across categories and months; watch the summary cards, donut chart, and monthly bar chart update. Hover a bar to see its total.
5. **Expenses page** — go to **Expenses** in the nav. Use **search**, the **category** dropdown, and the **From/To** date filters. The header total reflects the filtered set.
6. **Edit** — click the pencil icon on any row, change values, **Save changes**.
7. **Delete** — click the trash icon → confirm in the dialog.
8. **Export** — click **Export CSV**; it downloads the currently filtered rows as `expenses-YYYY-MM-DD.csv`.
9. **Persistence** — refresh the page; your data is still there (stored under `localStorage` key `expense-tracker.expenses.v1`).
10. **Responsive** — narrow the window (or use device emulation); the list switches to mobile cards and the nav/summary reflow.

## Running on iPhone 17 Pro (not yet implemented — notes only)

The layout is already mobile-responsive and includes iOS-friendly touches: `viewport-fit=cover` with `env(safe-area-inset-*)` padding so content clears the Dynamic Island and home indicator, `apple-web-app` metadata, and a theme color. To actually run it on your device later, the two realistic paths are:

- **Same-Wi-Fi dev preview** — run `npm run dev` on your machine and open `http://<your-mac-LAN-IP>:3000` in Safari on the iPhone. Fastest way to see it live.
- **Deploy + install as a PWA** — host it (e.g. Vercel), open in Safari, then *Share → Add to Home Screen* for an app-like, full-screen experience. Making it a true installable PWA would add a web app manifest, icons, and optionally an offline service worker — a small, self-contained follow-up.

Because all data lives in `localStorage`, it stays on that one device/browser. If you want the same expenses across your Mac and iPhone, that would require a backend + sync (out of scope for this demo).

## Data & privacy

All data is stored in your browser's `localStorage` only. Clearing site data or using a different browser/device starts fresh. No data leaves the device.
