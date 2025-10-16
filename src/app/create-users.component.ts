import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { AuthService } from './services/auth.service';
import { getDocs, collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-create-users',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h2>🔧 Create Users for Testing</h2>
      
      <div style="margin: 20px 0;">
        <h3>Current Users in Firestore:</h3>
        <div *ngIf="users.length > 0">
          <div *ngFor="let user of users" style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px;">
            <strong>{{ user.username || user.email }}</strong> - {{ user.email }} - Roles: {{ user.roles | json }}
          </div>
        </div>
        <div *ngIf="users.length === 0">
          <p>No users found in Firestore</p>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Create Test Users:</h3>
        <button (click)="createBoidaycaoUser()" [disabled]="loading" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Create Boidaycao User
        </button>
        
        <button (click)="createBoidayhaUser()" [disabled]="loading" style="padding: 10px 20px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Create Boidayha User
        </button>
        
        <button (click)="loadUsers()" [disabled]="loading" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">
          Refresh Users
        </button>
        
        <button (click)="testLogin()" [disabled]="loading" style="padding: 10px 20px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer;">
          Test Login
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Test Login:</h3>
        <div style="background: white; padding: 15px; border-radius: 4px;">
          <p><strong>Boidaycao:</strong></p>
          <p>Email: boidaycao@thibidi.com</p>
          <p>Password: 123456</p>
          <br>
          <p><strong>Boidayha:</strong></p>
          <p>Email: boidayha@thibidi.com</p>
          <p>Password: 123456</p>
        </div>
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
export class CreateUsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  logs: string[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.addLog('Loading users from Firestore...');

    try {
      const usersSnapshot = await getDocs(collection(this.firebaseService.getFirestore(), 'users'));
      this.users = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        this.users.push({
          id: doc.id,
          ...userData
        });
      });
      
      this.addLog(`Found ${this.users.length} users in Firestore`);
      
    } catch (error: any) {
      this.addLog('❌ Error loading users: ' + error.message);
    }

    this.loading = false;
  }

  async createBoidaycaoUser() {
    this.loading = true;
    this.addLog('Creating boidaycao user...');

    try {
      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        this.firebaseService.getAuth(), 
        'boidaycao@thibidi.com', 
        '123456'
      );
      const firebaseUser = credential.user;
      
      this.addLog('✅ Firebase Auth user created: ' + firebaseUser.uid);
      
      // Sign out the new user immediately
      await signOut(this.firebaseService.getAuth());
      this.addLog('✅ Signed out new user');
      
      // Create Firestore user document
      const userData = {
        username: 'boidaycao',
        email: 'boidaycao@thibidi.com',
        fullName: 'Boidaycao User',
        roles: ['quandaycao', 'boidaycao'],
        isActive: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        department: 'Production',
        khau_sx: 'quandaycao'
      };

      const userDocRef = doc(this.firebaseService.getFirestore(), 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);
      
      this.addLog('✅ Firestore user document created');
      this.addLog('📧 Email: boidaycao@thibidi.com');
      this.addLog('🔑 Password: 123456');
      
      // Reload users
      await this.loadUsers();
      
    } catch (error: any) {
      this.addLog('❌ Error creating boidaycao user: ' + error.message);
      if (error.code === 'auth/email-already-in-use') {
        this.addLog('ℹ️ User already exists in Firebase Auth');
      }
    }

    this.loading = false;
  }

  async createBoidayhaUser() {
    this.loading = true;
    this.addLog('Creating boidayha user...');

    try {
      // Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(
        this.firebaseService.getAuth(), 
        'boidayha@thibidi.com', 
        '123456'
      );
      const firebaseUser = credential.user;
      
      this.addLog('✅ Firebase Auth user created: ' + firebaseUser.uid);
      
      // Sign out the new user immediately
      await signOut(this.firebaseService.getAuth());
      this.addLog('✅ Signed out new user');
      
      // Create Firestore user document
      const userData = {
        username: 'boidayha',
        email: 'boidayha@thibidi.com',
        fullName: 'Boidayha User',
        roles: ['quandayha', 'boidayha'],
        isActive: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        department: 'Production',
        khau_sx: 'quandayha'
      };

      const userDocRef = doc(this.firebaseService.getFirestore(), 'users', firebaseUser.uid);
      await setDoc(userDocRef, userData);
      
      this.addLog('✅ Firestore user document created');
      this.addLog('📧 Email: boidayha@thibidi.com');
      this.addLog('🔑 Password: 123456');
      
      // Reload users
      await this.loadUsers();
      
    } catch (error: any) {
      this.addLog('❌ Error creating boidayha user: ' + error.message);
      if (error.code === 'auth/email-already-in-use') {
        this.addLog('ℹ️ User already exists in Firebase Auth');
      }
    }

    this.loading = false;
  }

  async testLogin() {
    this.loading = true;
    this.addLog('Testing login with boidaycao...');

    try {
      // Test login with boidaycao
      const credential = await signInWithEmailAndPassword(
        this.firebaseService.getAuth(),
        'boidaycao@thibidi.com',
        '123456'
      );
      
      this.addLog('✅ Login successful!');
      this.addLog('User UID: ' + credential.user.uid);
      this.addLog('User Email: ' + credential.user.email);
      
      // Sign out after test
      await signOut(this.firebaseService.getAuth());
      this.addLog('✅ Signed out after test');
      
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

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }
}
