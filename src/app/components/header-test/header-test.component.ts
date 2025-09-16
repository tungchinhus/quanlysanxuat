import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/layout/header/header';
import { SidebarComponent } from '../../core/layout/sidebar/sidebar';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-header-test',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="test-container">
      <h2>Header Test Component</h2>
      
      <div class="auth-status">
        <p><strong>Authentication Status:</strong> {{ isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}</p>
        <p><strong>Current User:</strong> {{ currentUser ? (currentUser.displayName || currentUser.email) : 'None' }}</p>
        <p><strong>User Role:</strong> {{ currentUser?.role || 'None' }}</p>
      </div>
      
      <div class="test-buttons">
        <button (click)="simulateLogin()" [disabled]="isAuthenticated">Simulate Login</button>
        <button (click)="simulateLogout()" [disabled]="!isAuthenticated">Simulate Logout</button>
      </div>
      
      <!-- Show header only when authenticated -->
      <div class="header-test" *ngIf="isAuthenticated">
        <h3>Header Component Test:</h3>
        <app-header 
          [isMobile]="false"
          (sidebarToggle)="onSidebarToggle()"
          (mobileSidebarToggle)="onMobileSidebarToggle()">
        </app-header>
      </div>
      
      <!-- Show sidebar test -->
      <div class="sidebar-test" *ngIf="isAuthenticated">
        <h3>Sidebar Component Test:</h3>
        <app-sidebar 
          [isCollapsed]="false"
          (mobileToggle)="onMobileSidebarToggle()">
        </app-sidebar>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .auth-status {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    .test-buttons {
      margin: 20px 0;
    }
    
    .test-buttons button {
      margin-right: 10px;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
    }
    
    .test-buttons button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .header-test, .sidebar-test {
      margin: 20px 0;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      padding: 10px;
    }
    
    .header-test h3, .sidebar-test h3 {
      margin-bottom: 10px;
      color: #495057;
    }
  `]
})
export class HeaderTestComponent implements OnInit {
  private authService = inject(AuthService);
  
  isAuthenticated = false;
  currentUser: User | null = null;

  ngOnInit() {
    this.authService.isAuthenticated.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  simulateLogin() {
    // Create a mock user for testing
    const mockUser: User = {
      id: 'test-user-1',
      uid: 'test-user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      role: UserRole.ADMIN,
      department: 'IT',
      isActive: true,
      createdAt: new Date()
    };
    
    // Simulate login by directly setting the auth state
    (this.authService as any).authState.next({
      isAuthenticated: true,
      user: mockUser,
      loading: false,
      error: null
    });
  }

  simulateLogout() {
    this.authService.logout().subscribe();
  }

  onSidebarToggle() {
    console.log('Sidebar toggle clicked');
  }

  onMobileSidebarToggle() {
    console.log('Mobile sidebar toggle clicked');
  }
}
