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
- **Destination sites can't be framed.** A browser cannot embed sites that send
  `X-Frame-Options`/`frame-ancestors` (youtube.com / facebook.com /
  open.spotify.com all do), and the refusal isn't reliably detectable from
  script. Rather than show a broken frame or strip those protections with a
  proxy, the launcher opens the destination in a new tab. `frame-src` is
  `'none'`.
- **Certificate pinning** is not available to browser JavaScript. Rely on the
  platform CA store + HSTS preload instead.
- **`history.state`** survives a manual page refresh of the same entry. The OTP
  is only ever placed there in transit to the loading screen and is not read
  back after login; for stricter handling, clear it after consumption.
