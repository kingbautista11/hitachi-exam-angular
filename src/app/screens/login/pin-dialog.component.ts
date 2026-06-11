import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  signal,
} from '@angular/core';

// Modal "Verify It's You" PIN dialog. Shows entered digits as "1 2 3 - - -"
// using a numeric keypad. A zero-size hidden input captures the digits while a
// styled row renders them. The PIN lives only in this component's memory — it
// is never stored or logged.
@Component({
  selector: 'app-pin-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="backdrop" (click)="onBackdrop($event)">
      <div class="dialog no-select" role="dialog" aria-modal="true" aria-label="Verify It's You">
        <div class="title">Verify It's You</div>
        <div class="subtitle">Please enter your 6 digit PIN</div>

        <!-- Tapping the digit row focuses the hidden field to raise the keyboard. -->
        <div class="digits" (click)="focusInput()">
          @for (slot of slots; track $index) {
            <span class="digit" [class.filled]="$index < pin().length">
              {{ $index < pin().length ? pin()[$index] : '-' }}
            </span>
          }
        </div>

        <!-- Off-screen field that captures numeric input. -->
        <input
          #hidden
          class="hidden-input"
          type="text"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          [value]="pin()"
          (input)="onInput($event)"
          aria-label="6 digit PIN"
        />

        <div class="divider"></div>
        <div class="actions">
          <button
            type="button"
            class="action enter"
            [class.active]="complete()"
            [disabled]="!complete()"
            (click)="submit()"
          >
            Enter
          </button>
          <div class="vdivider"></div>
          <button type="button" class="action close" (click)="close()">
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './pin-dialog.component.scss',
})
export class PinDialogComponent implements AfterViewInit {
  @Output() submitted = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('hidden') hidden!: ElementRef<HTMLInputElement>;

  readonly slots = Array.from({ length: 6 });
  readonly pin = signal('');
  readonly complete = () => this.pin().length === 6;

  ngAfterViewInit(): void {
    // Defer so the dialog is painted before the keyboard is requested.
    setTimeout(() => this.focusInput(), 0);
  }

  focusInput(): void {
    this.hidden?.nativeElement.focus();
  }

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    // Digits only, max 6.
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    this.pin.set(digits);
    (event.target as HTMLInputElement).value = digits;
  }

  submit(): void {
    if (this.complete()) this.submitted.emit(this.pin());
  }

  close(): void {
    this.pin.set('');
    this.closed.emit();
  }

  onBackdrop(event: MouseEvent): void {
    // The backdrop is non-dismissible; clicking it just re-focuses the input.
    if (event.target === event.currentTarget) this.focusInput();
  }
}
