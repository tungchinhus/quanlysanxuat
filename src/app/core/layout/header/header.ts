import { Component, Output, EventEmitter, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { User, UserRole, USER_ROLES } from '../../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() isMobile: boolean = false;
  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() mobileSidebarToggle = new EventEmitter<void>();

  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: User | null) => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    if (this.isMobile) {
      this.mobileSidebarToggle.emit();
    } else {
      this.sidebarToggle.emit();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Still navigate to login even if logout fails
        this.router.navigate(['/login']);
      }
    });
  }

  getRoleDisplayName(role: UserRole): string {
    return USER_ROLES[role]?.name || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'primary',
      [UserRole.TOTRUONG_QUANDAY]: 'accent',
      [UserRole.QUANDAY_HA]: 'warn',
      [UserRole.QUANDAY_CAO]: 'warn',
      [UserRole.EP_BOIDAY]: 'warn',
      [UserRole.KCS]: 'warn'
    };
    return colors[role] || 'primary';
  }

  canManageUsers(): boolean {
    return this.authService.hasPermission('all');
  }

  getUserInitials(user: User): string {
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    // Fallback to email initials
    const emailParts = user.email.split('@')[0];
    if (emailParts.length >= 2) {
      return emailParts.substring(0, 2).toUpperCase();
    }
    return emailParts[0].toUpperCase();
  }
}
