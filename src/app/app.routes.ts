import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'schedule' },
      { path: 'schedule', loadComponent: () => import('./pages/schedule/schedule.page').then((m) => m.SchedulePage) },
      { path: 'history', loadComponent: () => import('./pages/history/history.page').then((m) => m.HistoryPage) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.page').then((m) => m.SettingsPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
