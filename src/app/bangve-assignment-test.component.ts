import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { FirebaseUserBangVeService } from './services/firebase-user-bangve.service';
import { FirebaseUserManagementService } from './services/firebase-user-management.service';
import { FirebaseBangVeService } from './services/firebase-bangve.service';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-bangve-assignment-test',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h2>🔧 Bangve Assignment Test</h2>
      
      <div style="margin: 20px 0;">
        <h3>Authentication:</h3>
        <button (click)="loginAsBoidaycao()" [disabled]="loading" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Login as Boidaycao
        </button>
        
        <button (click)="loginAsBoidayha()" [disabled]="loading" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Login as Boidayha
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
        <h3>Test Bangve Assignment:</h3>
        <button (click)="testCreateUserBangve()" [disabled]="loading" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Test Create User Bangve
        </button>
        
        <button (click)="testReadUserBangve()" [disabled]="loading" style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Test Read User Bangve
        </button>
        
        <button (click)="testCreateBangve()" [disabled]="loading" style="padding: 10px 20px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Test Create Bangve
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Log:</h3>
        <div style="background: #000; color: #0f0; padding: 10px; border-radius: 4px; font-family: monospace; max-height: 300px; overflow-y: auto;">
          <div *ngFor="let log of logs">{{ log }}</div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class BangveAssignmentTestComponent {
  loading = false;
  logs: string[] = [];
  isAuthenticated = false;
  currentUser: any = null;
  userRoles: string[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseUserManagementService: FirebaseUserManagementService,
    private firebaseBangVeService: FirebaseBangVeService
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

  async loginAsBoidaycao() {
    this.loading = true;
    this.addLog('Logging in as boidaycao...');

    try {
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.getAuth(),
        'boidaycao@thibidi.com',
        '123456'
      );
      
      this.addLog('✅ Login successful!');
      this.addLog('User UID: ' + credential.user.uid);
      this.addLog('User Email: ' + credential.user.email);
      
      setTimeout(() => {
        this.checkAuthStatus();
      }, 1000);
      
    } catch (error: any) {
      this.addLog('❌ Login failed: ' + error.message);
    }

    this.loading = false;
  }

  async loginAsBoidayha() {
    this.loading = true;
    this.addLog('Logging in as boidayha...');

    try {
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.getAuth(),
        'boidayha@thibidi.com',
        '123456'
      );
      
      this.addLog('✅ Login successful!');
      this.addLog('User UID: ' + credential.user.uid);
      this.addLog('User Email: ' + credential.user.email);
      
      setTimeout(() => {
        this.checkAuthStatus();
      }, 1000);
      
    } catch (error: any) {
      this.addLog('❌ Login failed: ' + error.message);
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

  async testCreateUserBangve() {
    this.loading = true;
    this.addLog('Testing create user_bangve...');

    try {
      const testData = {
        user_id: 1,
        firebase_uid: this.currentUser?.uid || 'test-uid',
        bangve_id: 'test-bangve-' + Date.now(),
        permission_type: 'gia_cong',
        status: true,
        trang_thai_bv: 0,
        trang_thai_bd_ha: 0,
        trang_thai_bd_cao: 0,
        assigned_at: new Date(),
        assigned_by_user_id: this.currentUser?.uid || 'test-uid',
        created_at: new Date(),
        updated_at: new Date(),
        khau_sx: 'bd_ha'
      };

      this.addLog('Creating user_bangve with data: ' + JSON.stringify(testData, null, 2));
      
      const docId = await this.firebaseUserBangVeService.createUserBangVe(testData);
      this.addLog('✅ Successfully created user_bangve with ID: ' + docId);
      
    } catch (error: any) {
      this.addLog('❌ Error creating user_bangve: ' + error.message);
      this.addLog('Error details: ' + JSON.stringify(error, null, 2));
    }

    this.loading = false;
  }

  async testReadUserBangve() {
    this.loading = true;
    this.addLog('Testing read user_bangve...');

    try {
      const userBangVeList = await this.firebaseUserBangVeService.getAllUserBangVe();
      this.addLog('✅ Successfully read user_bangve. Count: ' + userBangVeList.length);
      
      if (userBangVeList.length > 0) {
        this.addLog('Sample record: ' + JSON.stringify(userBangVeList[0], null, 2));
      }
      
    } catch (error: any) {
      this.addLog('❌ Error reading user_bangve: ' + error.message);
      this.addLog('Error details: ' + JSON.stringify(error, null, 2));
    }

    this.loading = false;
  }

  async testCreateBangve() {
    this.loading = true;
    this.addLog('Testing create bangve...');

    try {
      const testBangveData = {
        kyhieubangve: 'TEST-BV-' + Date.now(),
        congsuat: 100,
        tbkt: 'TEST-TBKT',
        dienap: '220V',
        soboiday: '1',
        bd_ha_trong: 'TEST-HA-TRONG',
        bd_ha_ngoai: 'TEST-HA-NGOAI',
        bd_cao: 'TEST-CAO',
        bd_ep: 'TEST-EP',
        user_create: this.currentUser?.email || 'test@test.com',
        trang_thai: 0,
        created_at: new Date(),
        username: this.currentUser?.username || 'testuser',
        email: this.currentUser?.email || 'test@test.com',
        role_name: this.userRoles[0] || 'user'
      };

      this.addLog('Creating bangve with data: ' + JSON.stringify(testBangveData, null, 2));
      
      const docId = await this.firebaseBangVeService.createBangVe(testBangveData);
      this.addLog('✅ Successfully created bangve with ID: ' + docId);
      
    } catch (error: any) {
      this.addLog('❌ Error creating bangve: ' + error.message);
      this.addLog('Error details: ' + JSON.stringify(error, null, 2));
    }

    this.loading = false;
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}
