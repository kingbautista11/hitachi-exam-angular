import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

// Secure link launcher. Browsers can't embed the full youtube.com /
// facebook.com / open.spotify.com sites (X-Frame-Options / frame-ancestors), so
// this shows a clean preview and opens the real site in a new tab with
// `noopener,noreferrer`. Only HTTPS URLs are allowed.
@Component({
  selector: 'app-web-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './web-view.component.html',
  styleUrl: './web-view.component.scss',
})
export class WebViewComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly title = signal('');
  readonly color = signal('#1877f2');
  readonly rawUrl = signal('');
  readonly hostname = signal('');
  readonly initial = signal('?');
  readonly asset = signal<string | null>(null);
  readonly blocked = signal(false);

  constructor() {
    const state = history.state as
      | { url?: string; title?: string; color?: string; asset?: string }
      | null;

    if (!state?.url) {
      void this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    this.title.set(state.title ?? '');
    this.color.set(state.color ?? '#1877f2');
    this.rawUrl.set(state.url);
    this.initial.set((state.title ?? '?').trim().charAt(0).toUpperCase() || '?');
    this.asset.set(state.asset ? String(state.asset) : null);

    try {
      const u = new URL(state.url);
      if (u.protocol === 'https:') {
        this.hostname.set(u.hostname.replace(/^www\./, ''));
      } else {
        this.blocked.set(true);
      }
    } catch {
      this.blocked.set(true);
    }
  }

  back(): void {
    this.location.back();
  }

  open(): void {
    if (this.blocked()) return;
    window.open(this.rawUrl(), '_blank', 'noopener,noreferrer');
  }
}
