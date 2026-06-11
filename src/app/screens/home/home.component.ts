import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingViewComponent } from '../../shared/loading-view/loading-view.component';
import { PressableDirective } from '../../shared/pressable.directive';
import { ApiService, type Social } from '../../core/api.service';

interface TileSpec {
  name: string;
  asset: string;
  color: string;
}

// Home screen: avatar, name and id, plus a 2x2 grid of social icons built from
// the API data.
@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingViewComponent, PressableDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly socials = signal<Social[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly showLogoutSheet = signal(false);
  readonly loggingOut = signal(false);

  readonly userName = signal('User');
  readonly userId = signal('');
  readonly avatarUrl = signal<string | null>(null);

  // The orange "Others" tile uses an inline login glyph instead of a brand png.
  readonly brandTiles: TileSpec[] = [
    { name: 'YouTube', asset: 'assets/youtube.png', color: '#ff0000' },
    { name: 'Spotify', asset: 'assets/spotify.png', color: '#1db954' },
    { name: 'Facebook', asset: 'assets/facebook.png', color: '#1877f2' },
  ];
  readonly orange = '#ffa000';

  ngOnInit(): void {
    const data = (history.state as { userData?: Record<string, unknown> } | null)
      ?.userData;
    if (data) {
      this.userName.set(String(data['userName'] ?? 'User'));
      this.userId.set(data['userId'] != null ? String(data['userId']) : '');
      const pic = data['profilePicture'];
      this.avatarUrl.set(pic ? String(pic) : null);
    }
    void this.fetchSocials();
  }

  private async fetchSocials(): Promise<void> {
    try {
      const result = await this.api.getSocials();
      this.socials.set(result);
      this.loading.set(false);
    } catch {
      this.error.set('Failed to load socials.');
      this.loading.set(false);
    }
  }

  private findSocial(name: string): Social | null {
    return (
      this.socials().find(
        (s) => String(s['name'] ?? '').toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  openSocial(tile: TileSpec): void {
    void this.router.navigate(['/social'], {
      state: {
        name: tile.name,
        asset: tile.asset,
        color: tile.color,
        socialData: this.findSocial(tile.name),
      },
    });
  }

  openBrands(): void {
    void this.router.navigate(['/brands']);
  }

  // ---- Logout action sheet ----------------------------------------------
  openLogoutSheet(): void {
    this.showLogoutSheet.set(true);
  }

  cancelLogout(): void {
    this.showLogoutSheet.set(false);
  }

  confirmLogout(): void {
    this.showLogoutSheet.set(false);
    this.loggingOut.set(true);
    setTimeout(() => {
      void this.router.navigate(['/login'], { replaceUrl: true });
    }, 3000);
  }
}
