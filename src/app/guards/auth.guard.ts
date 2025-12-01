import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/auth'], { queryParams: { returnUrl: state.url } });
          return false;
        }

        const allowedRoles = route.data['roles'] as Array<string>;
        if (allowedRoles && !allowedRoles.includes(user.role)) {
          // Se o usuário não tem a função necessária, redireciona para o painel principal
          this.router.navigate(['/meu-painel']);
          return false;
        }

        return true; // Acesso permitido
      })
    );
  }
}
