import {
  ChangeDetectionStrategy,
  Component,
  signal,
  inject,
} from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import type { Social } from '../../core/api.service';

// Social info detail page: brand banner, description, and a "Visit" button that
// opens the site through the link launcher.
@Component({
  selector: 'app-social-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './social-detail.component.html',
  styleUrl: './social-detail.component.scss',
})
export class SocialDetailComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly name = signal('');
  readonly asset = signal('');
  readonly color = signal('#1877f2');
  readonly imgUrl = signal<string | null>(null);
  readonly bannerFailed = signal(false);
  readonly description = signal('No description available.');
  private url = 'https://www.google.com';

  constructor() {
    const state = history.state as
      | {
          name?: string;
          asset?: string;
          color?: string;
          socialData?: Social | null;
        }
      | null;

    if (!state?.name) {
      void this.router.navigate(['/home'], { replaceUrl: true });
      return;
    }

    this.name.set(state.name);
    this.asset.set(state.asset ?? '');
    this.color.set(state.color ?? '#1877f2');

    const data = state.socialData ?? null;
    const img = data?.['imgUrl'];
    this.imgUrl.set(img ? String(img) : null);

    // Show only the first paragraph of the history text.
    const fullHistory = String(data?.['history'] ?? 'No description available.');
    this.description.set(fullHistory.trim().split(/\n\s*\n/)[0].trim());

    const webUrl = data?.['webUrl'];
    this.url = webUrl ? String(webUrl) : this.defaultUrl(state.name);
  }

  onBannerError(): void {
    this.bannerFailed.set(true);
  }

  back(): void {
    this.location.back();
  }

  visit(): void {
    void this.router.navigate(['/visit'], {
      state: {
        url: this.url,
        title: this.name(),
        color: this.color(),
        asset: this.asset(),
      },
    });
  }

  private defaultUrl(name: string): string {
    switch (name.toLowerCase()) {
      case 'youtube':
        return 'https://www.youtube.com';
      case 'spotify':
        return 'https://www.spotify.com';
      case 'facebook':
        return 'https://www.facebook.com';
      default:
        return 'https://www.google.com';
    }
  }
}
