/**
 * Angular dev-server proxy.
 *
 * Forwards the REST API so the browser makes a same-origin request and CORS
 * does not apply: `environment.ts` uses the relative base `'/api/v1'`, and the
 * dev server makes the real HTTPS call to indexcodex.com server-side.
 */
module.exports = {
  '/api': {
    target: 'https://indexcodex.com',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
  },
};
