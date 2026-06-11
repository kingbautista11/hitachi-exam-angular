// Production configuration. Swap these values per environment at build time
// (file replacement, CI secret injection, or a runtime config endpoint).
//
// NOTE — like any client-shipped secret, the client id is extractable from the
// bundle. For a real fintech app, privileged calls should be proxied through a
// backend and long-lived secrets must never be embedded client-side. See
// SECURITY.md ("Known limitations").
export const environment = {
  production: true,
  clientId: 'rgbexam',
  apiBaseUrl: 'https://indexcodex.com/api/v1',
  apiTimeoutMs: 20000,
};
