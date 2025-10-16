import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { FirebaseService } from './services/firebase.service';
import { getDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-simple-permission-test',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h2>🔧 Simple Permission Test</h2>
      
      <div style="margin: 20px 0;">
        <h3>Current User:</h3>
        <pre>{{ currentUser | json }}</pre>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Firebase Auth:</h3>
        <pre>{{ firebaseUser | json }}</pre>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Test Results:</h3>
        <div *ngIf="testResults">
          <p><strong>Can Read Bangve:</strong> {{ testResults.canReadBangve ? '✅' : '❌' }}</p>
          <p><strong>Can Write Bangve:</strong> {{ testResults.canWriteBangve ? '✅' : '❌' }}</p>
          <p><strong>Can Read UserBangve:</strong> {{ testResults.canReadUserBangve ? '✅' : '❌' }}</p>
          <p><strong>Can Write UserBangve:</strong> {{ testResults.canWriteUserBangve ? '✅' : '❌' }}</p>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <button (click)="runTests()" [disabled]="testing" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          {{ testing ? 'Testing...' : 'Run Permission Tests' }}
        </button>
        
        <button (click)="testWriteBangve()" [disabled]="testing" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
          Test Write Bangve
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Test Log:</h3>
        <div style="background: #000; color: #0f0; padding: 10px; border-radius: 4px; font-family: monospace; max-height: 200px; overflow-y: auto;">
          <div *ngFor="let log of logs">{{ log }}</div>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class SimplePermissionTestComponent implements OnInit {
  currentUser: any = {};
  firebaseUser: any = {};
  testResults: any = {};
  testing = false;
  logs: string[] = [];

  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  loadUserInfo() {
    const user = this.authService.getCurrentUser();
    this.currentUser = {
      id: user?.id,
      uid: user?.uid,
      email: user?.email,
      username: user?.username,
      roles: user?.roles,
      fullName: user?.fullName
    };

    const firebaseAuth = this.firebaseService.getAuth();
    const fbUser = firebaseAuth.currentUser;
    this.firebaseUser = {
      uid: fbUser?.uid,
      email: fbUser?.email,
      displayName: fbUser?.displayName,
      emailVerified: fbUser?.emailVerified
    };
  }

  async runTests() {
    this.testing = true;
    this.logs = [];
    this.addLog('Starting permission tests...');

    try {
      // Test 1: Can read bangve
      this.addLog('Testing bangve read permission...');
      const bangveDocRef = doc(this.firebaseService.getFirestore(), 'bangve', 'test');
      try {
        await getDoc(bangveDocRef);
        this.testResults.canReadBangve = true;
        this.addLog('✅ Can read bangve');
      } catch (error: any) {
        this.testResults.canReadBangve = false;
        this.addLog('❌ Cannot read bangve: ' + error.message);
      }

      // Test 2: Can write bangve
      this.addLog('Testing bangve write permission...');
      try {
        await updateDoc(bangveDocRef, {
          test_field: 'test_value',
          updated_at: Timestamp.fromDate(new Date())
        });
        this.testResults.canWriteBangve = true;
        this.addLog('✅ Can write bangve');
      } catch (error: any) {
        this.testResults.canWriteBangve = false;
        this.addLog('❌ Cannot write bangve: ' + error.message);
      }

      // Test 3: Can read user_bangve
      this.addLog('Testing user_bangve read permission...');
      const userBangveDocRef = doc(this.firebaseService.getFirestore(), 'user_bangve', 'test');
      try {
        await getDoc(userBangveDocRef);
        this.testResults.canReadUserBangve = true;
        this.addLog('✅ Can read user_bangve');
      } catch (error: any) {
        this.testResults.canReadUserBangve = false;
        this.addLog('❌ Cannot read user_bangve: ' + error.message);
      }

      // Test 4: Can write user_bangve
      this.addLog('Testing user_bangve write permission...');
      try {
        await updateDoc(userBangveDocRef, {
          test_field: 'test_value',
          updated_at: Timestamp.fromDate(new Date())
        });
        this.testResults.canWriteUserBangve = true;
        this.addLog('✅ Can write user_bangve');
      } catch (error: any) {
        this.testResults.canWriteUserBangve = false;
        this.addLog('❌ Cannot write user_bangve: ' + error.message);
      }

    } catch (error: any) {
      this.addLog('❌ Test error: ' + error.message);
    }

    this.testing = false;
    this.addLog('Permission tests completed.');
  }

  async testWriteBangve() {
    this.testing = true;
    this.addLog('Testing actual bangve write...');

    try {
      // Create a test bangve document
      const testBangveRef = doc(this.firebaseService.getFirestore(), 'bangve', 'test-' + Date.now());
      await updateDoc(testBangveRef, {
        kyhieubangve: 'TEST-' + Date.now(),
        trang_thai: 1,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date()),
        isActive: true
      });
      
      this.addLog('✅ Successfully created test bangve document');
      
      // Test user_bangve write
      const testUserBangveRef = doc(this.firebaseService.getFirestore(), 'user_bangve', 'test-' + Date.now());
      await updateDoc(testUserBangveRef, {
        bangve_id: testBangveRef.id,
        user_id: this.currentUser.id,
        permission_type: 'gia_cong',
        status: true,
        created_at: Timestamp.fromDate(new Date()),
        updated_at: Timestamp.fromDate(new Date())
      });
      
      this.addLog('✅ Successfully created test user_bangve document');
      
    } catch (error: any) {
      this.addLog('❌ Write test failed: ' + error.message);
    }

    this.testing = false;
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}
