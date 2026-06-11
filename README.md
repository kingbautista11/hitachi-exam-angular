# Hitachi Mobile Exam — Angular Web App

An Angular web application implementing a three-screen authentication and content
flow against a REST API, with attention to styling, animation, security, and
runtime performance.

## Summary

The app walks the user through a complete login-to-content journey:

- **Splash** — an animated launch screen where three brand icons (YouTube,
  Spotify, Facebook) bob in a staggered wave, then fades into login.
- **Login** — a username field with live validation (required, max 24
  characters, alphanumeric) and an "Enter" button that enables only when the
  input is valid. A valid username opens a "Verify It's You" modal for the
  6-digit PIN.
- **Loading** — shows the login status, calls the login endpoint, returns to
  login with an error on rejection, or proceeds to home on success.
- **Home** — built from API data: the user avatar, name, and id, plus a 2×2 grid
  of social icons. Each brand opens a detail page with a "Visit" button; the
  fourth tile opens an auto-playing carousel of additional brands. Tapping the
  avatar logs out.

**Tech:** Angular 19 (standalone components, signals), Angular Router (lazy
routes), `@angular/animations`, `@angular/common/http`, SCSS.

### Test accounts

- **Username:** any value (letters/numbers, up to 24 characters)
- **PIN / OTP:** `123456` or `123123`

## Security measures

- **HTTPS only** — `ApiService` rejects any non-`https:` endpoint; the link
  launcher validates `https:` before opening a destination.
- **No data at rest** — the PIN/OTP live only in component and in-memory router
  state; never in `localStorage`/`sessionStorage`, a URL, or logs.
- **Hardened external links** — opened in a new tab with `noopener,noreferrer`;
  no iframes (`frame-src 'none'`).
- **Safe errors** — network/parse failures are wrapped in `ApiException` with
  user-safe messages; raw errors never reach the UI.
- **Content-Security-Policy** — shipped as a meta tag and as server header files
  in [`deploy/`](deploy); strict `connect-src`, `object-src 'none'`, nosniff.
- **Externalised config** — client id and base URL come from environment files,
  not hardcoded in the source.

Full details are in [`SECURITY.md`](SECURITY.md).

## Performance

- **Lazy-loaded routes** — every screen is a `loadComponent` chunk, so the
  initial bundle only ships the splash/login path and the rest loads on demand.
- **OnPush + signals** — all components use `ChangeDetectionStrategy.OnPush` with
  signal state, so change detection runs only when inputs or signals actually
  change instead of on every event.
- **Coalesced change detection** — `provideZoneChangeDetection({ eventCoalescing:
  true })` collapses bursts of events into a single CD pass.
- **Browser HTTP cache** — `provideHttpClient(withFetch())` plus `loading="lazy"`
  on images means avatars and banners are fetched once and served from cache on
  repeat views.
- **Compositor-friendly animations** — the splash wave animates only `transform`
  inside `contain: paint` layers, keeping work off the main thread; animations
  also honour `prefers-reduced-motion`.
- **AOT production build** — `ng build` is AOT-compiled, minified, and
  tree-shaken, with bundle budgets enforced in `angular.json`.

## Clone, install, and run

### Prerequisites

- Node.js 18.19+ (or 20+) and npm

### Clone

```bash
git clone https://github.com/kingbautista11/hitachi-exam-angular.git
cd hitachi-exam-angular
```

### Install

```bash
npm install
```

### Run (development)

```bash
npm start
```

Then open http://localhost:4200. The dev server proxies `/api` to the HTTPS API
(`proxy.conf.js`), so no CORS setup is needed.

### Test

```bash
npm test           # watch mode
npm run test:ci    # headless, single run
```

### Build (production)

```bash
npm run build      # outputs to dist/hitachi-exam-angular/browser
```

Serve the build as static files behind a server that applies the headers in
[`deploy/`](deploy) and falls back to `index.html` for client-side routes. To
point at a different API or client id, edit `src/environments/environment.ts`
(dev) or `environment.prod.ts` (prod).
