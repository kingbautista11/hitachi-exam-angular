import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { LoadingViewComponent } from '../../shared/loading-view/loading-view.component';
import { ApiService } from '../../core/api.service';
import { isLoginSuccess } from '../../core/validators';

// Loading screen: shows the login status, calls the login endpoint, returns to
// the login screen with an error on rejection, or proceeds to home on success.
@Component({
  selector: 'app-loading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoadingViewComponent],
  template: `
    <div class="screen">
      <app-loading-view
        [label]="failed() ? 'Login Failed' : 'Logging In'"
        [failed]="failed()"
      ></app-loading-view>
    </div>
  `,
  styles: [
    `
      /* Center the loader at every width. Without align/justify here the
         loading-view (height:100% against a min-height-only parent) collapses
         to content height and pins the spinner to the top — it only centered
         at >=900px before. */
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
          align-items: center;
          justify-content: center;
        }
      }
    `,
  ],
})
export class LoadingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);

  readonly failed = signal(false);

  ngOnInit(): void {
    const state = history.state as
      | { userName?: string; otp?: string }
      | null;
    const userName = state?.userName;
    const otp = state?.otp;

    // Reached without credentials (e.g. direct nav / refresh) — bounce to login.
    if (!userName || !otp) {
      void this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    void this.doLogin(userName, otp);
  }

  private async doLogin(userName: string, otp: string): Promise<void> {
    try {
      const result = await this.api.login(userName, otp);
      if (isLoginSuccess(result)) {
        await this.delay(1000);
        void this.router.navigate(['/home'], {
          replaceUrl: true,
          state: { userData: result },
        });
      } else {
        await this.fail('Login Failed, please try again');
      }
    } catch {
      await this.fail('Network error. Please try again.');
    }
  }

  private async fail(message: string): Promise<void> {
    this.failed.set(true);
    await this.delay(1000);
    void this.router.navigate(['/login'], {
      replaceUrl: true,
      state: { errorMessage: message },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
