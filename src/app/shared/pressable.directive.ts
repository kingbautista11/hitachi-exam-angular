import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
  inject,
} from '@angular/core';

// Scales the host element down slightly while pressed for tactile feedback.
// Usage: <div appPressable [pressScale]="0.9"> ... </div>
@Directive({
  selector: '[appPressable]',
  standalone: true,
})
export class PressableDirective {
  @Input() pressScale = 0.94;

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  constructor() {
    const node = this.el.nativeElement as HTMLElement;
    this.renderer.setStyle(node, 'transition', 'transform 120ms ease-out');
    this.renderer.setStyle(node, 'will-change', 'transform');
    this.renderer.setStyle(node, 'cursor', 'pointer');
  }

  private set(scale: number): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `scale(${scale})`,
    );
  }

  @HostListener('pointerdown')
  onDown(): void {
    this.set(this.pressScale);
  }

  @HostListener('pointerup')
  @HostListener('pointerleave')
  @HostListener('pointercancel')
  onUp(): void {
    this.set(1);
  }
}
