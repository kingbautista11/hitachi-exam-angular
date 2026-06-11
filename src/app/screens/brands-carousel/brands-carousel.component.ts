import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  signal,
  inject,
} from '@angular/core';
import { Location } from '@angular/common';

interface Brand {
  name: string;
  asset: string;
  url: string;
}

// Auto-playing carousel of additional brands (Samsung, Apple, Windows) whose
// name and "Visit" button update per slide. "Visit" opens the brand site in a
// new tab.
@Component({
  selector: 'app-brands-carousel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './brands-carousel.component.html',
  styleUrl: './brands-carousel.component.scss',
})
export class BrandsCarouselComponent implements OnInit, OnDestroy {
  private readonly location = inject(Location);

  readonly brands: Brand[] = [
    { name: 'Samsung', asset: 'assets/samsung.png', url: 'https://www.samsung.com' },
    { name: 'Apple', asset: 'assets/apple.png', url: 'https://www.apple.com' },
    { name: 'Windows', asset: 'assets/windows.png', url: 'https://www.microsoft.com' },
  ];

  readonly current = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  get name(): string {
    return this.brands[this.current()].name;
  }

  // Centers the active card: (100% - 60%)/2 - index*60% of the viewport width.
  get trackOffset(): string {
    return `translateX(calc(20% - ${this.current() * 60}%))`;
  }

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.current.update((i) => (i + 1) % this.brands.length);
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  select(index: number): void {
    this.current.set(index);
  }

  back(): void {
    this.location.back();
  }

  visit(): void {
    window.open(this.brands[this.current()].url, '_blank', 'noopener,noreferrer');
  }
}
