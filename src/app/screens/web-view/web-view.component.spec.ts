import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { WebViewComponent } from './web-view.component';

// The launcher must only ever accept https:// destinations; anything else is
// marked blocked and open() becomes a no-op.
describe('WebViewComponent', () => {
  function create(state: Record<string, unknown>): WebViewComponent {
    history.replaceState(state, '');
    TestBed.configureTestingModule({
      imports: [WebViewComponent],
      providers: [provideRouter([])],
    });
    return TestBed.createComponent(WebViewComponent).componentInstance;
  }

  afterEach(() => history.replaceState({}, ''));

  it('accepts an https url and exposes the bare hostname', () => {
    const c = create({ url: 'https://www.youtube.com/watch', title: 'YouTube' });
    expect(c.blocked()).toBeFalse();
    expect(c.hostname()).toBe('youtube.com');
  });

  it('blocks an http url', () => {
    const c = create({ url: 'http://example.com', title: 'X' });
    expect(c.blocked()).toBeTrue();
  });

  it('blocks a malformed url', () => {
    const c = create({ url: 'not a url', title: 'X' });
    expect(c.blocked()).toBeTrue();
  });

  it('does not open a window when blocked', () => {
    const c = create({ url: 'http://example.com', title: 'X' });
    const openSpy = spyOn(window, 'open');
    c.open();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('opens https destinations in a new tab with noopener,noreferrer', () => {
    const c = create({ url: 'https://www.spotify.com', title: 'Spotify' });
    const openSpy = spyOn(window, 'open');
    c.open();
    expect(openSpy).toHaveBeenCalledWith(
      'https://www.spotify.com',
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('redirects home when no url is supplied', () => {
    history.replaceState({}, '');
    TestBed.configureTestingModule({
      imports: [WebViewComponent],
      providers: [provideRouter([])],
    });
    const router = TestBed.inject(Router);
    const navSpy = spyOn(router, 'navigate');
    TestBed.createComponent(WebViewComponent);
    expect(navSpy).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
  });
});
