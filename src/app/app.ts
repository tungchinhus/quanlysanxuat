import { Component, signal, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './core/layout/header/header';
import { SidebarComponent } from './core/layout/sidebar/sidebar';
import { AuthService } from './services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('Quản Lý Sản Xuất');
  isSidebarCollapsed = false;
  isMobile = false;
  isAuthenticated = false;
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Listen to authentication state changes
    this.authService.isAuthenticated
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        // Temporarily disable redirect for testing
        console.log('Auth state:', isAuth, 'Current URL:', this.router.url);
        // if (!isAuth && !this.router.url.includes('/login') && !this.router.url.includes('/firebase-test')) {
        //   this.router.navigate(['/login']);
        // }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSidebarCollapsed = false;
    }
  }

  onSidebarToggle() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onMobileSidebarToggle() {
    // This will be handled by the sidebar component itself
  }
}
