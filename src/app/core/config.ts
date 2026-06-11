import { environment } from '../../environments/environment';

// Build-time configuration, read from the environment files so the client id
// and endpoint aren't hardcoded throughout the app.
export const AppConfig = {
  clientId: environment.clientId,
  apiBaseUrl: environment.apiBaseUrl,
  apiTimeoutMs: environment.apiTimeoutMs,
} as const;
