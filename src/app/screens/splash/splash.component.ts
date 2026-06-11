import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { WavingLogoComponent } from '../../shared/waving-logo/waving-logo.component';

// Animated splash shown on launch: the brand icons wave, then the app
// transitions into the login screen.
@Component({
  selector: 'app-splash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WavingLogoComponent],
  template: `
    <div class="screen">
      <app-waving-logo [animate]="true"></app-waving-logo>
    </div>
  `,
  styles: [
    `
      .screen {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-height: 100vh;
        min-height: 100dvh;
        background: #fff;
      }

      @media (min-width: 900px) {
        :host {
          display: flex;
          width: 100%;
          max-width: 520px;
          min-height: 440px;
          max-height: calc(100dvh - 96px);
          border-radius: 28px;
          overflow: hidden;
          background: #fff;
          box-shadow:
            0 50px 130px rgba(0, 0, 0, 0.6),
            0 2px 10px rgba(0, 0, 0, 0.35);
        }
        .screen {
          flex: 1;
          min-height: auto;
        }
      }
    `,
  ],
})
export class SplashComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private timer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      void this.router.navigate(['/login'], { replaceUrl: true });
    }, 2600);
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}
