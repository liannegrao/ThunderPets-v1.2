import { Component, inject, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, HostListener, NgZone } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService, Usuario } from '../../services/auth.service';
import { LoginComponent } from '../../componente/login/login.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule, LoginComponent, NgOptimizedImage],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  @ViewChild('headerRef') headerRef!: ElementRef<HTMLElement>;
  currentUser$: Observable<Usuario | null> = this.authService.currentUser$;
  showAuthModal = false;
  authStartsAsCadastro = false;
  isMenuOpen = false; // Control for mobile menu collapse

  ngOnInit(): void {
    this.openLoginIfRequired();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.openLoginIfRequired());
  }

  private openLoginIfRequired(): void {
    const tree = this.router.parseUrl(this.router.url);
    if (tree.queryParams['login'] !== 'required') return;
    this.openAuthModal(false);
    this.router.navigate([], {
      queryParams: { login: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Keep a reference to the bound function so we can add/remove listeners reliably
  private updateHeaderHeightBound = this.updateHeaderHeight.bind(this);

  ngAfterViewInit(): void {
    // Set the CSS variable with the header height once view is initialized
    this.updateHeaderHeight();
    // Update on orientation change and anchor/hash navigation
    window.addEventListener('hashchange', this.updateHeaderHeightBound);
    window.addEventListener('orientationchange', this.updateHeaderHeightBound);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Reset header height CSS var to avoid stale values when header is destroyed/hidden
    document.documentElement.style.setProperty('--header-height', `0px`);
    window.removeEventListener('hashchange', this.updateHeaderHeightBound);
    window.removeEventListener('orientationchange', this.updateHeaderHeightBound);
  }

  openAuthModal(cadastro = false): void {
    this.authStartsAsCadastro = cadastro;
    this.showAuthModal = true;
  }

  getPanelRoute(role?: Usuario['role'] | null): string {
    return this.authService.getPanelRoute(role);
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

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    // Update when menu toggles because header height may change
    setTimeout(() => this.updateHeaderHeight(), 50);
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    setTimeout(() => this.updateHeaderHeight(), 50);
  }

  // Update the root CSS variable --header-height to match header element height
  updateHeaderHeight(): void {
    try {
      const hdr = this.headerRef?.nativeElement;
      if (!hdr) return;
      const h = hdr.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-height', `${Math.round(h)}px`);
    } catch (err) {
      // safe fallback in case of issues
      document.documentElement.style.setProperty('--header-height', `56px`);
    }
  }
  @HostListener('window:resize')
  handleResize(): void {
    this.updateHeaderHeight();
  }

  // Optional: host listener for resize events handled via Angular's NgZone
  onWindowResize(): void {
    this.updateHeaderHeight();
  }
}
