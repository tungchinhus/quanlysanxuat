import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

@Component({
  selector: 'app-test-login',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h2>🔧 Test Login Debug</h2>
      
      <div style="margin: 20px 0;">
        <h3>Test Login:</h3>
        <button (click)="testBoidaycaoLogin()" [disabled]="loading" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Test Boidaycao Login
        </button>
        
        <button (click)="testBoidayhaLogin()" [disabled]="loading" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Test Boidayha Login
        </button>
        
        <button (click)="signOut()" [disabled]="loading" style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Sign Out
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Current User Info:</h3>
        <div style="background: white; padding: 15px; border-radius: 4px;">
          <p><strong>Authenticated:</strong> {{ isAuthenticated }}</p>
          <p><strong>User:</strong> {{ currentUser | json }}</p>
          <p><strong>Roles:</strong> {{ userRoles | json }}</p>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Test Navigation:</h3>
        <button (click)="navigateToDashboard()" [disabled]="loading" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Go to Dashboard
        </button>
        
        <button (click)="navigateToDsQuanDay()" [disabled]="loading" style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Go to DS Quan Day
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Log:</h3>
        <div style="background: #000; color: #0f0; padding: 10px; border-radius: 4px; font-family: monospace; max-height: 200px; overflow-y: auto;">
          <div *ngFor="let log of logs">{{ log }}</div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class TestLoginComponent {
  loading = false;
  logs: string[] = [];
  isAuthenticated = false;
  currentUser: any = null;
  userRoles: string[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUser();
    this.userRoles = this.currentUser?.roles || [];
    this.addLog(`Auth Status: ${this.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
    if (this.currentUser) {
      this.addLog(`User: ${this.currentUser.email || this.currentUser.username}`);
      this.addLog(`Roles: ${JSON.stringify(this.userRoles)}`);
    }
  }

  async testBoidaycaoLogin() {
    this.loading = true;
    this.addLog('Testing boidaycao login...');

    try {
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.getAuth(),
        'boidaycao@thibidi.com',
        '123456'
      );
      
      this.addLog('✅ Login successful!');
      this.addLog('User UID: ' + credential.user.uid);
      this.addLog('User Email: ' + credential.user.email);
      
      // Wait a bit for auth service to update
      setTimeout(() => {
        this.checkAuthStatus();
      }, 1000);
      
    } catch (error: any) {
      this.addLog('❌ Login failed: ' + error.message);
      if (error.code === 'auth/user-not-found') {
        this.addLog('ℹ️ User not found in Firebase Auth');
      } else if (error.code === 'auth/wrong-password') {
        this.addLog('ℹ️ Wrong password');
      } else if (error.code === 'auth/invalid-email') {
        this.addLog('ℹ️ Invalid email');
      }
    }

    this.loading = false;
  }

  async testBoidayhaLogin() {
    this.loading = true;
    this.addLog('Testing boidayha login...');

    try {
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.getAuth(),
        'boidayha@thibidi.com',
        '123456'
      );
      
      this.addLog('✅ Login successful!');
      this.addLog('User UID: ' + credential.user.uid);
      this.addLog('User Email: ' + credential.user.email);
      
      // Wait a bit for auth service to update
      setTimeout(() => {
        this.checkAuthStatus();
      }, 1000);
      
    } catch (error: any) {
      this.addLog('❌ Login failed: ' + error.message);
      if (error.code === 'auth/user-not-found') {
        this.addLog('ℹ️ User not found in Firebase Auth');
      } else if (error.code === 'auth/wrong-password') {
        this.addLog('ℹ️ Wrong password');
      } else if (error.code === 'auth/invalid-email') {
        this.addLog('ℹ️ Invalid email');
      }
    }

    this.loading = false;
  }

  async signOut() {
    this.loading = true;
    this.addLog('Signing out...');

    try {
      await signOut(this.firebaseService.getAuth());
      this.addLog('✅ Signed out successfully');
      this.checkAuthStatus();
    } catch (error: any) {
      this.addLog('❌ Sign out failed: ' + error.message);
    }

    this.loading = false;
  }

  navigateToDashboard() {
    this.addLog('Navigating to dashboard...');
    window.location.href = '/dashboard';
  }

  navigateToDsQuanDay() {
    this.addLog('Navigating to ds-quan-day...');
    window.location.href = '/ds-quan-day';
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}

