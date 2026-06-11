import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { AppConfig } from './config';

/** API failure carrying a user-safe message. Raw server/network errors are
 *  never propagated to the UI so we don't leak internals. */
export class ApiException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiException';
  }
}

export type LoginResult = Record<string, unknown>;
export type Social = Record<string, unknown>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // Custom header expected by the assessment API.
  private get headers(): HttpHeaders {
    return new HttpHeaders({ CLIENT_ID: AppConfig.clientId });
  }

  // Resolves a path against the configured base URL and rejects non-TLS hosts —
  // the transport guard from ApiService._endpoint.
  private endpoint(path: string): string {
    const base = AppConfig.apiBaseUrl;

    // Absolute URL (e.g. https://indexcodex.com/api/v1): enforce HTTPS so we
    // never send credentials over cleartext.
    if (/^https?:\/\//i.test(base)) {
      const url = new URL(`${base}${path}`);
      if (url.protocol !== 'https:') {
        throw new ApiException('Insecure connection blocked.');
      }
      return url.toString();
    }

    // Relative base (e.g. '/api/v1'): a same-origin request that the dev server
    // (or a production reverse proxy) forwards to the HTTPS API. There is no
    // cross-origin or cleartext exposure to guard against here.
    return `${base}${path}`;
  }

  async login(userName: string, otp: string): Promise<LoginResult> {
    let url: string;
    try {
      url = this.endpoint('/login');
    } catch (e) {
      // Surface the HTTPS guard as-is.
      throw e instanceof ApiException ? e : new ApiException('Insecure connection blocked.');
    }
    try {
      const response = await firstValueFrom(
        this.http
          .post<LoginResult>(
            url,
            { userName, otp },
            {
              headers: this.headers.set('Content-Type', 'application/json'),
            },
          )
          .pipe(timeout(AppConfig.apiTimeoutMs)),
      );
      return response ?? {};
    } catch (_) {
      throw new ApiException('Unable to reach the server. Please try again.');
    }
  }

  async getSocials(): Promise<Social[]> {
    let url: string;
    try {
      url = this.endpoint('/socials');
    } catch (e) {
      throw e instanceof ApiException ? e : new ApiException('Insecure connection blocked.');
    }
    try {
      const response = await firstValueFrom(
        this.http
          .get<Social[]>(url, { headers: this.headers })
          .pipe(timeout(AppConfig.apiTimeoutMs)),
      );
      return response ?? [];
    } catch (_) {
      throw new ApiException('Unable to load data. Please try again.');
    }
  }
}
