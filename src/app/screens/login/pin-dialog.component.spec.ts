import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PinDialogComponent } from './pin-dialog.component';

describe('PinDialogComponent', () => {
  let fixture: ComponentFixture<PinDialogComponent>;
  let component: PinDialogComponent;

  function hiddenInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input.hidden-input');
  }

  function enterButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.enter');
  }

  function typeInto(value: string): void {
    const el = hiddenInput();
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PinDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('strips non-digits and caps the PIN at six characters', () => {
    typeInto('1a2b3c4d5e6f7g');
    expect(component.pin()).toBe('123456');
    expect(hiddenInput().value).toBe('123456');
  });

  it('keeps the Enter button disabled until six digits are entered', () => {
    typeInto('123');
    expect(enterButton().disabled).toBeTrue();

    typeInto('123456');
    expect(enterButton().disabled).toBeFalse();
  });

  it('emits the PIN only once it is complete', () => {
    const emitted: string[] = [];
    component.submitted.subscribe((pin) => emitted.push(pin));

    typeInto('123');
    component.submit();
    expect(emitted).toEqual([]);

    typeInto('123456');
    component.submit();
    expect(emitted).toEqual(['123456']);
  });

  it('clears the PIN and emits closed on close', () => {
    let closed = false;
    component.closed.subscribe(() => (closed = true));

    typeInto('123456');
    component.close();

    expect(component.pin()).toBe('');
    expect(closed).toBeTrue();
  });
});
