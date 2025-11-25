import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, Usuario } from '../../services/auth.service';
import { LoginComponent } from '../../componente/login/login.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser$: Observable<Usuario | null> = this.authService.currentUser$;
  showAuthModal = false;

  ngOnInit(): void {
    // Observable subscription handled in template
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAuthModal(): void {
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getRoleLabel(role: Usuario['role']): string {
    switch (role) {
      case 'mediador': return 'Mediador';
      case 'voluntario': return 'Voluntário';
      case 'doador': return 'Doador';
      default: return role;
    }
  }
}
