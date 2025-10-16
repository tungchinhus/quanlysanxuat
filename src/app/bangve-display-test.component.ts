import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { FirebaseUserBangVeService } from './services/firebase-user-bangve.service';
import { FirebaseUserManagementService } from './services/firebase-user-management.service';
import { FirebaseBangVeService } from './services/firebase-bangve.service';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-bangve-display-test',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h2>🔧 Bangve Display Test</h2>
      
      <div style="margin: 20px 0;">
        <h3>Authentication:</h3>
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
          <p><strong>Firebase UID:</strong> {{ firebaseUID }}</p>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>User Assignments:</h3>
        <button (click)="loadUserAssignments()" [disabled]="loading" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Load User Assignments
        </button>
        
        <button (click)="loadAssignedBangve()" [disabled]="loading" style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Load Assigned Bangve
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>User Assignments ({{ userAssignments.length }}):</h3>
        <div style="background: white; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto;">
          <div *ngFor="let assignment of userAssignments; let i = index" style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
            <strong>Assignment {{ i + 1 }}:</strong><br>
            ID: {{ assignment.id }}<br>
            User ID: {{ assignment.user_id }}<br>
            Firebase UID: {{ assignment.firebase_uid }}<br>
            Bangve ID: {{ assignment.bangve_id }}<br>
            Khau SX: {{ assignment.khau_sx }}<br>
            Status: {{ assignment.status }}<br>
            BD Ha ID: {{ assignment.bd_ha_id }}<br>
            BD Cao ID: {{ assignment.bd_cao_id }}
          </div>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Assigned Bangve ({{ assignedBangve.length }}):</h3>
        <div style="background: white; padding: 15px; border-radius: 4px; max-height: 200px; overflow-y: auto;">
          <div *ngFor="let bangve of assignedBangve; let i = index" style="margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">
            <strong>Bangve {{ i + 1 }}:</strong><br>
            ID: {{ bangve.id }}<br>
            Ky Hieu: {{ bangve.kyhieubangve }}<br>
            Cong Suat: {{ bangve.congsuat }}<br>
            Trang Thai: {{ bangve.trang_thai }}
          </div>
        </div>
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
export class BangveDisplayTestComponent {
  loading = false;
  logs: string[] = [];
  isAuthenticated = false;
  currentUser: any = null;
  userRoles: string[] = [];
  firebaseUID = '';
  userAssignments: any[] = [];
  assignedBangve: any[] = [];

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
    this.firebaseUID = this.currentUser?.uid || this.currentUser?.id || '';
    this.addLog(`Auth Status: ${this.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
    if (this.currentUser) {
      this.addLog(`User: ${this.currentUser.email || this.currentUser.username}`);
      this.addLog(`Roles: ${JSON.stringify(this.userRoles)}`);
      this.addLog(`Firebase UID: ${this.firebaseUID}`);
    }
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
      this.userAssignments = [];
      this.assignedBangve = [];
    } catch (error: any) {
      this.addLog('❌ Sign out failed: ' + error.message);
    }

    this.loading = false;
  }

  async loadUserAssignments() {
    this.loading = true;
    this.addLog('Loading user assignments...');

    try {
      if (!this.currentUser?.email) {
        this.addLog('❌ No user email available');
        return;
      }

      // Lấy user từ Firestore
      const user = await this.firebaseUserManagementService.getUserByEmail(this.currentUser.email);
      if (!user) {
        this.addLog('❌ User not found in Firestore');
        return;
      }

      this.addLog(`Found user in Firestore: ${user.id} - ${user.email}`);

      // Lấy assignments theo user_id
      const assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(user.id));
      this.addLog(`Found ${assignmentsByUserId.length} assignments by user_id`);

      // Lấy assignments theo firebase_uid
      const assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.firebaseUID);
      this.addLog(`Found ${assignmentsByFirebaseUID.length} assignments by firebase_uid`);

      // Kết hợp và loại bỏ trùng lặp
      const allAssignments = [...assignmentsByUserId, ...assignmentsByFirebaseUID];
      this.userAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );

      this.addLog(`Total unique assignments: ${this.userAssignments.length}`);

      // Log chi tiết từng assignment
      this.userAssignments.forEach((assignment, index) => {
        this.addLog(`Assignment ${index + 1}: ID=${assignment.id}, UserID=${assignment.user_id}, FirebaseUID=${assignment.firebase_uid}, BangveID=${assignment.bangve_id}, KhauSX=${assignment.khau_sx}`);
      });

    } catch (error: any) {
      this.addLog('❌ Error loading user assignments: ' + error.message);
    }

    this.loading = false;
  }

  async loadAssignedBangve() {
    this.loading = true;
    this.addLog('Loading assigned bangve...');

    try {
      if (this.userAssignments.length === 0) {
        this.addLog('❌ No user assignments available. Please load assignments first.');
        return;
      }

      // Lấy danh sách bangve_id từ assignments
      const assignedBangVeIds = this.userAssignments.map(assignment => assignment.bangve_id);
      this.addLog(`Looking for bangve IDs: ${assignedBangVeIds.join(', ')}`);

      // Lấy tất cả bangve từ Firebase
      const allBangVe = await this.firebaseBangVeService.getAllBangVe();
      this.addLog(`Total bangve in Firebase: ${allBangVe.length}`);

      // Filter bangve được gán
      this.assignedBangve = allBangVe.filter(bangVe => 
        assignedBangVeIds.includes(String(bangVe.id))
      );

      this.addLog(`Found ${this.assignedBangve.length} assigned bangve`);

      // Log chi tiết từng bangve
      this.assignedBangve.forEach((bangve, index) => {
        this.addLog(`Bangve ${index + 1}: ID=${bangve.id}, KyHieu=${bangve.kyhieubangve}, CongSuat=${bangve.congsuat}, TrangThai=${bangve.trang_thai}`);
      });

    } catch (error: any) {
      this.addLog('❌ Error loading assigned bangve: ' + error.message);
    }

    this.loading = false;
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}
