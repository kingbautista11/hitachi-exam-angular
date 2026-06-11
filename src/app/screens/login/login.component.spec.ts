import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { LoginComponent } from './login.component';

// The username field gates the Enter button and surfaces the alphanumeric error.
describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;

  function input(): HTMLInputElement {
    return fixture.nativeElement.querySelector('input.username');
  }

  function enterButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button.enter');
  }

  function type(value: string): void {
    const el = input();
    el.value = value;
    el.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('shows a disabled Enter button initially', () => {
    expect(enterButton().disabled).toBeTrue();
  });

  it('typing special characters shows the alphanumeric error', () => {
    type('user_name');
    const err = fixture.nativeElement.querySelector('.field-error');
    expect(err?.textContent).toContain('Values must be alphanumeric');
  });

  it('valid username enables the Enter button', () => {
    type('validuser');
    expect(enterButton().disabled).toBeFalse();
  });
});
