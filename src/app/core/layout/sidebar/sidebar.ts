import { Component, Input, HostListener, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isCollapsed: boolean = false;
  @Output() mobileToggle = new EventEmitter<void>();
  
  isMobileOpen: boolean = false;
  isMobile: boolean = false;
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
    if (!this.isMobile) {
      this.isMobileOpen = false;
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  toggleMobileSidebar() {
    this.isMobileOpen = !this.isMobileOpen;
    this.mobileToggle.emit();
  }

  closeMobileSidebar() {
    this.isMobileOpen = false;
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.closeMobileSidebar();
    }
  }

  canManageUsers(): boolean {
    return this.authService.hasPermission('all');
  }

  canManageRoles(): boolean {
    return this.authService.hasPermission('all') || this.authService.hasPermission('role_manage');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        if (this.isMobile) {
          this.closeMobileSidebar();
        }
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still navigate to login even if logout fails
        this.router.navigate(['/login']);
      }
    });
  }
}
