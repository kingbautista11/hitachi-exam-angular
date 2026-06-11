import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';

// Cross-screen fade applied on every route change.
export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    query(
      ':enter',
      [style({ opacity: 0 }), animate('400ms ease-out', style({ opacity: 1 }))],
      { optional: true },
    ),
  ]),
]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeFade],
  template: `
    <div class="app-frame" [@routeFade]="outlet.isActivated ? outlet.activatedRoute : ''">
      <router-outlet #outlet="outlet"></router-outlet>
    </div>
  `,
  styles: [
    `
      /* Mobile-first: the faithful phone column. */
      .app-frame {
        position: relative;
        width: 100%;
        max-width: 480px;
        margin: 0 auto;
        min-height: 100vh;
        min-height: 100dvh;
        background: #ffffff;
        overflow: hidden;
      }

      /* The outlet renders its component as a sibling; hide the empty element
         so it never affects desktop flex centering. */
      router-outlet {
        display: none;
      }

      /* Tablet: the column goes edge-to-edge — full width, no centered cap —
         and each screen scales its content up to fill it. */
      @media (min-width: 600px) and (max-width: 899.98px) {
        .app-frame {
          max-width: none;
          margin: 0;
        }
      }

      /* Desktop: the app-frame becomes the stage container and centers the
         routed screen, which styles itself as a floating surface. */
      @media (min-width: 900px) {
        .app-frame {
          max-width: none;
          margin: 0;
          background: transparent;
          overflow: visible;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }
      }
    `,
  ],
})
export class AppComponent {}
