import { Routes } from '@angular/router';
import { HomeComponent } from './componente/home/home.component';
import { LoginComponent } from './componente/login/login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: LoginComponent },
  { path: 'painel-mediador', component: HomeComponent },
  { path: '**', redirectTo: '' }
];
