import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-auth-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-debug" style="padding: 20px; border: 1px solid #ccc; margin: 10px; background: #f9f9f9;">
      <h3>🔍 Authentication Debug Info</h3>
      
      <div class="debug-section">
        <h4>Current State:</h4>
        <p><strong>Is Authenticated:</strong> {{ isAuthenticated }}</p>
        <p><strong>Has Token:</strong> {{ hasToken }}</p>
        <p><strong>Token Valid:</strong> {{ tokenValid }}</p>
        <p><strong>User Loaded:</strong> {{ userLoaded }}</p>
      </div>

      <div class="debug-section" *ngIf="currentUser">
        <h4>User Info:</h4>
        <p><strong>ID:</strong> {{ currentUser.id }}</p>
        <p><strong>Username:</strong> {{ currentUser.username }}</p>
        <p><strong>Email:</strong> {{ currentUser.email }}</p>
        <p><strong>Full Name:</strong> {{ currentUser.fullName }}</p>
        <p><strong>Roles:</strong> {{ getRolesString() }}</p>
        <p><strong>Is Active:</strong> {{ currentUser.isActive }}</p>
      </div>

      <div class="debug-section">
        <h4>LocalStorage:</h4>
        <p><strong>currentUser:</strong> {{ localStorageUser ? 'Present' : 'Missing' }}</p>
        <p><strong>authToken:</strong> {{ localStorageToken ? 'Present' : 'Missing' }}</p>
        <p><strong>rememberMe:</strong> {{ localStorageRememberMe }}</p>
      </div>

      <div class="debug-section">
        <h4>Actions:</h4>
        <button (click)="refreshAuthState()" class="btn btn-primary">🔄 Refresh Auth State</button>
        <button (click)="clearAuthData()" class="btn btn-danger">🗑️ Clear Auth Data</button>
        <button (click)="testEnsureAuthState()" class="btn btn-info">⏳ Test Ensure Auth State</button>
      </div>

      <div class="debug-section" *ngIf="debugMessages.length > 0">
        <h4>Debug Messages:</h4>
        <div *ngFor="let message of debugMessages" class="debug-message">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-section {
      margin: 15px 0;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    
    .debug-message {
      padding: 5px;
      margin: 5px 0;
      background: #e8f4fd;
      border-left: 3px solid #2196F3;
      font-family: monospace;
      font-size: 12px;
    }
    
    .btn {
      padding: 8px 16px;
      margin: 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-danger {
      background: #dc3545;
      color: white;
    }
    
    .btn-info {
      background: #17a2b8;
      color: white;
    }
  `]
})
export class AuthDebugComponent implements OnInit {
  isAuthenticated = false;
  hasToken = false;
  tokenValid = false;
  userLoaded = false;
  currentUser: User | null = null;
  localStorageUser: string | null = null;
  localStorageToken: string | null = null;
  localStorageRememberMe: string | null = null;
  debugMessages: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.updateDebugInfo();
    
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.userLoaded = !!user;
      this.updateDebugInfo();
      this.addDebugMessage(`User state changed: ${user ? user.username : 'null'}`);
    });

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      this.updateDebugInfo();
      this.addDebugMessage(`Authentication state changed: ${isAuth}`);
    });
  }

  updateDebugInfo(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.hasToken = !!this.authService.getToken();
    this.tokenValid = this.authService.isTokenValid();
    this.userLoaded = !!this.currentUser;
    
    // Check localStorage
    this.localStorageUser = localStorage.getItem('currentUser');
    this.localStorageToken = localStorage.getItem('authToken');
    this.localStorageRememberMe = localStorage.getItem('rememberMe');
  }

  getRolesString(): string {
    if (!this.currentUser || !this.currentUser.roles) {
      return 'No roles';
    }
    return Array.isArray(this.currentUser.roles) 
      ? this.currentUser.roles.join(', ') 
      : String(this.currentUser.roles);
  }

  refreshAuthState(): void {
    this.addDebugMessage('Refreshing auth state...');
    this.authService.refreshUserData().then(() => {
      this.updateDebugInfo();
      this.addDebugMessage('Auth state refreshed successfully');
    }).catch(error => {
      this.addDebugMessage(`Error refreshing auth state: ${error.message}`);
    });
  }

  clearAuthData(): void {
    this.addDebugMessage('Clearing auth data...');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
    this.updateDebugInfo();
    this.addDebugMessage('Auth data cleared');
  }

  async testEnsureAuthState(): Promise<void> {
    this.addDebugMessage('Testing ensureAuthStateLoaded...');
    try {
      const user = await this.authService.ensureAuthStateLoaded();
      this.addDebugMessage(`ensureAuthStateLoaded result: ${user ? user.username : 'null'}`);
    } catch (error: any) {
      this.addDebugMessage(`ensureAuthStateLoaded error: ${error.message}`);
    }
  }

  private addDebugMessage(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.debugMessages.unshift(`[${timestamp}] ${message}`);
    
    // Keep only last 10 messages
    if (this.debugMessages.length > 10) {
      this.debugMessages = this.debugMessages.slice(0, 10);
    }
  }
}
