import { Routes } from '@angular/router';
import { guestGuard } from '@core/auth/guest.guard';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPage, canActivate: [guestGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
