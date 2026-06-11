// Development configuration: the client id and API base URL live here (and in
// environment.prod.ts) instead of being hardcoded throughout the source.
// Defaults match the assessment environment so local runs work out of the box.
export const environment = {
  production: false,
  clientId: 'rgbexam',
  // Relative, same-origin path. `ng serve` proxies /api -> https://indexcodex.com
  // (see proxy.conf.json), so the browser never makes a cross-origin request and
  // CORS does not apply. Use an absolute https URL here only if the API serves
  // CORS headers for http://localhost:4200.
  apiBaseUrl: '/api/v1',
  apiTimeoutMs: 20000,
};
