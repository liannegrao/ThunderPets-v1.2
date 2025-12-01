import { Routes } from '@angular/router';
import { HomeComponent } from './componente/home/home.component';
import { LoginComponent } from './componente/login/login.component';
import { CadastrarPetComponent } from './pages/cadastrar-pet/cadastrar-pet.component';
import { ComentarComponent } from './pages/comentar/comentar.component';
import { PainelMediadorComponent } from './componente/painel-mediador/painel-mediador.component';
import { PainelAdotanteComponent } from './componente/painel-adotante/painel-adotante.component';
import { PainelDoadorComponent } from './componente/painel-doador/painel-doador.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: LoginComponent },
  { path: 'cadastrar-pet', component: CadastrarPetComponent, canActivate: [AuthGuard], data: { roles: ['doador', 'comum'] } },
  {
    path: 'painel-mediador',
    component: PainelMediadorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['mediador'] }
  },
  {
    path: 'meu-painel',
    component: PainelDoadorComponent,
    canActivate: [AuthGuard]
  },
  { path: 'painel-adotante', component: PainelAdotanteComponent, canActivate: [AuthGuard] },
  { path: 'comentar', component: ComentarComponent, canActivate: [AuthGuard] },
  { path: 'doar', redirectTo: 'comentar' },
  // Routes para futuras páginas - redirecionam para home por enquanto
  { path: 'voluntario', redirectTo: 'meu-painel' },
  { path: '**', redirectTo: '' }
];
