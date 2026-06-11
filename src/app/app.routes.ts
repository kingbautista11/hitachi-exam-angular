import { Routes } from '@angular/router';

// Every screen is lazy-loaded so each one ships in its own chunk and the
// startup bundle stays small. Brand/social detail screens receive their context
// via router `state` (kept in memory, never persisted), so PIN/account data
// never lands in a URL or storage.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./screens/splash/splash.component').then(
        (m) => m.SplashComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./screens/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'loading',
    loadComponent: () =>
      import('./screens/loading/loading.component').then(
        (m) => m.LoadingComponent,
      ),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./screens/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'social',
    loadComponent: () =>
      import('./screens/social-detail/social-detail.component').then(
        (m) => m.SocialDetailComponent,
      ),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./screens/brands-carousel/brands-carousel.component').then(
        (m) => m.BrandsCarouselComponent,
      ),
  },
  {
    path: 'visit',
    loadComponent: () =>
      import('./screens/web-view/web-view.component').then(
        (m) => m.WebViewComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
