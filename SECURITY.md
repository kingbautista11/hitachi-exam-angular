# Security Notes

This app handles authentication for a fintech context. This document records the
security controls it implements and is honest about the limits of what a browser
can enforce.

## Configuration / secrets

The API client id and base URL are **not hardcoded** across the source. They
live in `src/environments/environment.ts` (dev) and `environment.prod.ts`
(prod), surfaced through `src/app/core/config.ts` (`AppConfig`). Swap values per
environment via Angular's `fileReplacements` (already wired for the production
configuration), CI secret injection, or a runtime config endpoint.

## Controls

| Area | Control in this app |
|------|---------------------|
| Transport | `ApiService.endpoint()` rejects any non-`https:` URL; CSP `upgrade-insecure-requests` + `connect-src https://indexcodex.com`; HSTS at the edge (`deploy/_headers`). |
| Link launcher | `WebViewComponent` validates `https:`, then opens the site in a new tab with `noopener,noreferrer`. No iframes are used (`frame-src 'none'`); it shows a launcher preview instead. |
| Sensitive data | PIN lives only in `PinDialogComponent` signal state; the OTP is passed to the loading screen via in-memory router `state` — never written to `localStorage`/`sessionStorage`, never placed in a URL, never logged. Input is `inputmode="numeric"` and stripped to digits. |
| Error handling | `ApiException` carries only safe copy ("Unable to reach the server…"); raw server/network errors are swallowed in `ApiService`. |
| Network resiliency | RxJS `timeout(AppConfig.apiTimeoutMs)` (20s) on every request. |
| Content injection | Strict CSP (meta + server headers), `X-Content-Type-Options: nosniff`, `object-src 'none'`, `base-uri 'self'`. External URLs are only ever opened in a new tab after the `https:` check — never bound into the DOM. |
| Clickjacking | `frame-ancestors 'none'` + `X-Frame-Options: DENY` at the edge. |
| Screen capture deterrent | Best-effort only: `user-select: none` on sensitive views (`.no-select`). **See limitations.** |

## The "Visit" button: new tab instead of an in-app web view

Requirement #18 asks the **Visit** button to take the user to the social media
site. The Flutter build did this by loading the site inside an in-app `WebView`.
On the web that approach is neither possible nor safe, so this build opens the
destination in a new browser tab (with `noopener,noreferrer`) after a short brand
preview. The user still reaches the correct site — the requirement's intent is
met — but the mechanism differs, for four reasons:

- **The target sites refuse to be framed.** youtube.com, facebook.com and
  open.spotify.com all send `X-Frame-Options` / CSP `frame-ancestors`, which the
  browser enforces — an `<iframe>` to them just renders blank. A native `WebView`
  is an engine the app controls directly and isn't bound by another site's
  framing policy, which is why it worked in Flutter but cannot in a browser.
- **Embedding them would require breaking security on purpose.** The only way to
  force it is a proxy that strips those anti-clickjacking headers and re-serves
  the sites — including their login pages — from our own origin. We will not do
  that.
- **Framing a third-party login is a phishing/clickjacking risk.** #18 includes
  Facebook's sign-in screen; rendering someone else's credential form inside our
  app is exactly the attack those headers prevent, and browsers, password
  managers, and the providers block it anyway.
- **An iframe shares our browser context.** It would share cookies, storage and
  the keyboard/focus surface with the host page, widening the attack surface
  around the user's session — a native WebView is isolated and does not.

A new tab keeps each site under its own origin and protections, with no proxying
or header-stripping. The CSP keeps `frame-src 'none'` so no external content is
ever embedded.

## Defense-in-depth headers

A `<meta http-equiv="Content-Security-Policy">` ships in `index.html` for the
baseline, but a meta tag cannot express `frame-ancestors`, HSTS, or reporting.
The authoritative policy must be set at the server/CDN:

- `deploy/_headers` — Netlify / Cloudflare Pages format.
- `deploy/security-headers.conf` — nginx `add_header` snippet.

## Known limitations / next steps

- **No real screenshot/recording block.** A browser tab can always be captured
  by the OS. The `.no-select` class only deters casual copy. Treat this as
  unenforceable on web.
- **Client id in the bundle.** As with any client-shipped value, it is
  extractable. For production, proxy privileged calls through a backend and
  never embed long-lived secrets client-side.
- **Destination sites can't be framed.** The "Visit" flow opens a new tab rather
  than an in-app web view — see the section above for the full reasoning.
- **Certificate pinning** is not available to browser JavaScript. Rely on the
  platform CA store + HSTS preload instead.
- **`history.state`** survives a manual page refresh of the same entry. The OTP
  is only ever placed there in transit to the loading screen and is not read
  back after login; for stricter handling, clear it after consumption.
