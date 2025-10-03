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
import { AuthDebugComponent } from './components/auth-debug/auth-debug.component';
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
    MatDividerModule,
    AuthDebugComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  isAuthenticated = false;
  showDebugInfo = false; // Set to true to show debug component
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
        // Trigger change detection when authentication state changes
        this.cdr.detectChanges();
      });

    // Subscribe to current user changes to update menu permissions
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        console.log('App: Current user changed:', user);
        // Add a small delay to ensure user data is fully loaded
        setTimeout(() => {
          this.cdr.detectChanges();
          this.debugMenuVisibility();
        }, 100);
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
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin';
    });
    
    console.log('hasAdminRole - Has admin role:', hasAdmin);
    return hasAdmin;
  }

  hasDashboardPermission(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('hasDashboardPermission - Current user:', user);
    
    if (!user) {
      console.log('hasDashboardPermission - No user found');
      return false;
    }
    
    // Ensure roles is an array
    const roles = Array.isArray(user.roles) ? user.roles : [];
    console.log('hasDashboardPermission - User roles:', roles);
    
    if (roles.length === 0) {
      console.log('hasDashboardPermission - User has no roles');
      return false;
    }
    
    // Check for admin, manager, kcs, totruong roles (case insensitive)
    const hasPermission = roles.some(role => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      console.log('hasDashboardPermission - Checking role:', roleName);
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin' || roleName?.toLowerCase() === 'manager' || roleName?.toLowerCase() === 'kcs' || roleName?.toLowerCase() === 'totruong';
    });
    
    console.log('hasDashboardPermission - Has permission:', hasPermission);
    return hasPermission;
  }

  hasBangVePermission(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('hasBangVePermission - Current user:', user);
    
    if (!user) {
      console.log('hasBangVePermission - No user found');
      return false;
    }
    
    // Ensure roles is an array
    const roles = Array.isArray(user.roles) ? user.roles : [];
    console.log('hasBangVePermission - User roles:', roles);
    
    if (roles.length === 0) {
      console.log('hasBangVePermission - User has no roles');
      return false;
    }
    
    // Check for admin, manager, totruong roles (case insensitive)
    const hasPermission = roles.some(role => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      console.log('hasBangVePermission - Checking role:', roleName);
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin' || roleName?.toLowerCase() === 'manager' || roleName?.toLowerCase() === 'totruong';
    });
    
    console.log('hasBangVePermission - Has permission:', hasPermission);
    return hasPermission;
  }

  hasKcsManagerPermission(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('hasKcsManagerPermission - Current user:', user);
    
    if (!user) {
      console.log('hasKcsManagerPermission - No user found');
      return false;
    }
    
    // Ensure roles is an array
    const roles = Array.isArray(user.roles) ? user.roles : [];
    console.log('hasKcsManagerPermission - User roles:', roles);
    
    if (roles.length === 0) {
      console.log('hasKcsManagerPermission - User has no roles');
      return false;
    }
    
    // Check for KCS, admin roles only (manager is totruong khau quan day, not KCS)
    const hasPermission = roles.some(role => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      console.log('hasKcsManagerPermission - Checking role:', roleName);
      return roleName?.toLowerCase() === 'kcs' || roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin';
    });
    
    // Check if user is quanboiday (should NOT have access)
    const isQuanBoiDay = roles.some(role => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase().includes('quanboiday') || 
             roleName?.toLowerCase().includes('quandayha') || 
             roleName?.toLowerCase().includes('quandaycao') || 
             roleName?.toLowerCase().includes('epboiday') ||
             roleName?.toLowerCase().includes('boidayha') ||
             roleName?.toLowerCase().includes('boidaycao') ||
             roleName?.toLowerCase().includes('boidayep');
    });
    
    if (isQuanBoiDay) {
      console.log('hasKcsManagerPermission - User is quanboiday, denying access');
      return false;
    }
    
    console.log('hasKcsManagerPermission - Has permission:', hasPermission);
    return hasPermission;
  }

  // Debug method to check menu visibility
  debugMenuVisibility(): void {
    console.log('=== MENU VISIBILITY DEBUG ===');
    console.log('isAuthenticated:', this.isAuthenticated);
    console.log('currentUser:', this.authService.getCurrentUser());
    console.log('hasDashboardPermission():', this.hasDashboardPermission());
    console.log('hasBangVePermission():', this.hasBangVePermission());
    console.log('hasKcsManagerPermission():', this.hasKcsManagerPermission());
    console.log('hasAdminRole():', this.hasAdminRole());
    console.log('=== END MENU VISIBILITY DEBUG ===');
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
