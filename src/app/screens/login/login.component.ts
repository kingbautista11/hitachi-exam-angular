import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { WavingLogoComponent } from '../../shared/waving-logo/waving-logo.component';
import { PinDialogComponent } from './pin-dialog.component';
import { usernameError } from '../../core/validators';

// Login screen: logo, a live-validated username field, and an "Enter" button
// that activates only when the username is valid. A valid username opens the
// PIN modal.
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WavingLogoComponent, PinDialogComponent],
  animations: [
    // One-shot fade + rise used to introduce the login screen.
    trigger('entrance', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate(
          '600ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
    ]),
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly usernameErr = signal<string | null>(null);
  readonly showPin = signal(false);
  readonly errorMsg = signal<string | null>(null);

  readonly canEnter = computed(
    () => this.username().length > 0 && this.usernameErr() === null,
  );

  constructor() {
    // An error handed back from the loading screen (rejected login / network
    // error) arrives via in-memory router state — never a URL or storage.
    const msg = (history.state as { errorMessage?: string } | null)
      ?.errorMessage;
    if (msg) this.errorMsg.set(msg);
  }

  onInput(value: string): void {
    this.username.set(value);
    this.usernameErr.set(usernameError(value));
  }

  onEnter(): void {
    if (this.canEnter()) this.showPin.set(true);
  }

  onPinSubmitted(pin: string): void {
    this.showPin.set(false);
    void this.router.navigate(['/loading'], {
      replaceUrl: true,
      state: { userName: this.username(), otp: pin },
    });
  }

  onPinClosed(): void {
    this.showPin.set(false);
  }

  dismissError(): void {
    this.errorMsg.set(null);
  }
}
