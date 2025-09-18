import { Component, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SidenavService } from './services/sidenav.service';
import { AuthService } from './services/auth.service';
import { MigrationService } from './services/migration.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor(
    public sidenavService: SidenavService,
    private authService: AuthService,
    private migrationService: MigrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Run migration on app startup
    this.runMigration();
    
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
      });
  }

  private async runMigration(): Promise<void> {
    try {
      const needsMigration = await this.migrationService.isMigrationNeeded();
      if (needsMigration) {
        console.log('Running data migration to Firebase...');
        await this.migrationService.migrateToFirebase();
      }
      
      // Always ensure admin user exists
      await this.migrationService.ensureAdminUser();
    } catch (error) {
      console.error('Migration error:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle() {
    this.sidenavService.toggle();
  }

  getCurrentUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'U';
    const name = user.fullName || user.username;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || user?.username || 'Người dùng';
  }

  getCurrentUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'user@company.com';
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return 'User';
    
    // Ensure roles is an array
    const roles = Array.isArray(user.roles) ? user.roles : [];
    if (roles.length === 0) return 'User';
    
    const role = roles[0];
    return typeof role === 'string' ? role : (role as any).name || 'User';
  }

  hasAdminRole(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('hasAdminRole - Current user:', user);
    
    if (!user) {
      console.log('hasAdminRole - No user found');
      return false;
    }
    
    // Ensure roles is an array
    const roles = Array.isArray(user.roles) ? user.roles : [];
    console.log('hasAdminRole - User roles:', roles);
    console.log('hasAdminRole - User department:', user.department);
    
    if (roles.length === 0) {
      console.log('hasAdminRole - User has no roles, checking department');
      // Fallback: check department field for admin role
      if (user.department === 'admin') {
        console.log('hasAdminRole - User has admin department');
        return true;
      }
      return false;
    }
    
    const hasAdmin = roles.some(role => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      console.log('hasAdminRole - Checking role:', roleName);
      return roleName === 'admin' || roleName === 'super_admin';
    });
    
    console.log('hasAdminRole - Has admin role:', hasAdmin);
    return hasAdmin;
  }

  async refreshUserData(): Promise<void> {
    try {
      console.log('Refreshing user data...');
      await this.authService.refreshUserData();
      console.log('User data refreshed');
      
      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  logout(): void {
    this.authService.logout();
    // Stay on current page, just clear authentication
    // The UI will update automatically due to isAuthenticated binding
  }

  toggleSidenav(): void {
    this.sidenavService.toggle();
  }
}
