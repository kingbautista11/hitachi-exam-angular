import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

// The three brand icons stacked diagonally. When [animate] is true they bob up
// and down in a staggered left-to-right wave. The animation runs on the
// compositor and each tile is its own paint-contained layer (`contain: paint`).
@Component({
  selector: 'app-waving-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="logo" [class.animate]="animate">
      <div class="tile youtube">
        <img src="assets/youtube.png" alt="YouTube" />
      </div>
      <div class="tile spotify">
        <img src="assets/spotify.png" alt="Spotify" />
      </div>
      <div class="tile facebook">
        <img src="assets/facebook.png" alt="Facebook" />
      </div>
    </div>
  `,
  styleUrl: './waving-logo.component.scss',
})
export class WavingLogoComponent {
  @Input() animate = true;
}
