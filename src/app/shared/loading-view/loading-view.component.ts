import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// Centered spinner with a caption, used for all loading/status screens
// ("Logging In", "Fetching Data", "Logging Out", "Login Failed").
@Component({
  selector: 'app-loading-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="spinner" [class.failed]="failed" aria-hidden="true"></div>
      <p class="label" [class.failed]="failed">{{ label }}</p>
    </div>
  `,
  styleUrl: './loading-view.component.scss',
})
export class LoadingViewComponent {
  @Input({ required: true }) label = '';
  @Input() failed = false;
}
