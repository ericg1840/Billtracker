# Bill Tracker

A self-hosted, client-only web app for tracking recurring home utility bills
(electric, gas, water, internet, etc.) month to month. No backend, no
accounts, no cloud sync — all data lives in your browser's `localStorage`.

## Features

- Track recurring monthly bills and one-time bills.
- Add bills manually, import from CSV, or extract from an uploaded PDF bill
  (with a human review step before anything is saved).
- Dashboard with month-over-month spend trend, category breakdown, and
  due/overdue status at a glance.
- Due-soon widget surfaces bills due within 5 days regardless of month view.
- Backup/restore your data as a JSON file.
- Works fully offline after first load.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

This app is a static site meant for GitHub Pages. Pushing to `main` deploys
automatically via the included GitHub Actions workflow
(`.github/workflows/deploy.yml`).
