import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './pages/header/header.component';
import { FooterComponent } from './pages/footer/footer.component';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'thunderpets-angular';
  isAuthRoute = false;
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize isAuthRoute as false (for home and other pages)
    this.isAuthRoute = false;

    // Listen for route changes to show/hide header/footer
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        // Hide header/footer on auth route and doar route
        this.isAuthRoute = (event.urlAfterRedirects === '/auth' || event.urlAfterRedirects.startsWith('/auth')) ||
                          (event.urlAfterRedirects === '/doar' || event.urlAfterRedirects.startsWith('/doar'));
        console.log('Current route:', event.urlAfterRedirects, 'isAuthRoute:', this.isAuthRoute);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
