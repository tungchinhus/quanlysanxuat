import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Menu Debug - Kiểm tra hiển thị menu KCS Manager</h2>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Current User Info</h3>
        <p><strong>User:</strong> {{ userInfo | json }}</p>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Permission Checks</h3>
        <p><strong>hasKcsManagerPermission():</strong> {{ hasKcsManagerPermission }}</p>
        <p><strong>hasDashboardPermission():</strong> {{ hasDashboardPermission }}</p>
        <p><strong>hasBangVePermission():</strong> {{ hasBangVePermission }}</p>
        <p><strong>hasAdminRole():</strong> {{ hasAdminRole }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Role Analysis</h3>
        <p><strong>User Roles:</strong> {{ userRoles | json }}</p>
        <p><strong>Role Names:</strong> {{ roleNames | json }}</p>
        <p><strong>Has KCS Role:</strong> {{ hasKcsRole }}</p>
        <p><strong>Has Admin Role:</strong> {{ hasAdminRoleCheck }}</p>
        <p><strong>Has Manager Role:</strong> {{ hasManagerRole }}</p>
        <p><strong>Is QuanBoiDay:</strong> {{ isQuanBoiDay }}</p>
      </div>

      <button (click)="runDebug()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Debug
      </button>
    </div>
  `
})
export class MenuDebugComponent implements OnInit {
  userInfo: any = null;
  isAuthenticated = false;
  hasKcsManagerPermission = false;
  hasDashboardPermission = false;
  hasBangVePermission = false;
  hasAdminRole = false;
  userRoles: any[] = [];
  roleNames: string[] = [];
  hasKcsRole = false;
  hasAdminRoleCheck = false;
  hasManagerRole = false;
  isQuanBoiDay = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.runDebug();
  }

  runDebug() {
    console.log('=== MENU DEBUG START ===');
    
    // Get current user
    this.userInfo = this.authService.getCurrentUser();
    this.isAuthenticated = this.authService.isAuthenticated();
    
    console.log('User Info:', this.userInfo);
    console.log('Is Authenticated:', this.isAuthenticated);
    
    if (!this.userInfo) {
      console.log('No user found');
      return;
    }

    // Get roles
    this.userRoles = Array.isArray(this.userInfo.roles) ? this.userInfo.roles : [];
    this.roleNames = this.userRoles.map((role: any) => 
      typeof role === 'string' ? role : (role as any).name
    );
    
    console.log('User Roles:', this.userRoles);
    console.log('Role Names:', this.roleNames);

    // Check individual roles (case insensitive)
    this.hasKcsRole = this.roleNames.some(role => role?.toLowerCase() === 'kcs');
    this.hasAdminRoleCheck = this.roleNames.some(role => role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'super_admin');
    this.hasManagerRole = this.roleNames.some(role => role?.toLowerCase() === 'manager');
    
    // Check if user is quanboiday
    this.isQuanBoiDay = this.roleNames.some(role => 
      role?.toLowerCase().includes('quanboiday') || 
      role?.toLowerCase().includes('quandayha') || 
      role?.toLowerCase().includes('quandaycao') || 
      role?.toLowerCase().includes('epboiday') ||
      role?.toLowerCase().includes('boidayha') ||
      role?.toLowerCase().includes('boidaycao') ||
      role?.toLowerCase().includes('boidayep')
    );

    // Test permission methods
    this.hasKcsManagerPermission = this.testHasKcsManagerPermission();
    this.hasDashboardPermission = this.testHasDashboardPermission();
    this.hasBangVePermission = this.testHasBangVePermission();
    this.hasAdminRole = this.testHasAdminRole();

    console.log('=== MENU DEBUG RESULTS ===');
    console.log('hasKcsManagerPermission:', this.hasKcsManagerPermission);
    console.log('hasDashboardPermission:', this.hasDashboardPermission);
    console.log('hasBangVePermission:', this.hasBangVePermission);
    console.log('hasAdminRole:', this.hasAdminRole);
    console.log('=== END MENU DEBUG ===');
  }

  private testHasKcsManagerPermission(): boolean {
    if (!this.userInfo) return false;
    
    const roles = Array.isArray(this.userInfo.roles) ? this.userInfo.roles : [];
    if (roles.length === 0) return false;
    
    // Check for KCS, admin roles only (manager is totruong khau quan day, not KCS)
    const hasPermission = roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase() === 'kcs' || roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin';
    });
    
    // Check if user is quanboiday (should NOT have access)
    const isQuanBoiDay = roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase().includes('quanboiday') || 
             roleName?.toLowerCase().includes('quandayha') || 
             roleName?.toLowerCase().includes('quandaycao') || 
             roleName?.toLowerCase().includes('epboiday') ||
             roleName?.toLowerCase().includes('boidayha') ||
             roleName?.toLowerCase().includes('boidaycao') ||
             roleName?.toLowerCase().includes('boidayep');
    });
    
    if (isQuanBoiDay) return false;
    
    return hasPermission;
  }

  private testHasDashboardPermission(): boolean {
    if (!this.userInfo) return false;
    const roles = Array.isArray(this.userInfo.roles) ? this.userInfo.roles : [];
    return roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin' || roleName?.toLowerCase() === 'manager' || roleName?.toLowerCase() === 'kcs' || roleName?.toLowerCase() === 'totruong';
    });
  }

  private testHasBangVePermission(): boolean {
    if (!this.userInfo) return false;
    const roles = Array.isArray(this.userInfo.roles) ? this.userInfo.roles : [];
    return roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin' || roleName?.toLowerCase() === 'manager' || roleName?.toLowerCase() === 'totruong';
    });
  }

  private testHasAdminRole(): boolean {
    if (!this.userInfo) return false;
    const roles = Array.isArray(this.userInfo.roles) ? this.userInfo.roles : [];
    if (roles.length === 0) {
      return this.userInfo.department === 'admin';
    }
    return roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : (role as any).name;
      return roleName?.toLowerCase() === 'admin' || roleName?.toLowerCase() === 'super_admin';
    });
  }
}
