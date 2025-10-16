import { Component, OnInit } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { AuthService } from './services/auth.service';
import { UserManagementFirebaseService } from './services/user-management-firebase.service';
import { FirebaseService } from './services/firebase.service';
import { getDoc, doc } from 'firebase/firestore';

@Component({
  selector: 'app-debug-user-permissions',
  template: `
    <div style="padding: 20px; background: #f5f5f5; margin: 20px; border-radius: 8px;">
      <h2>🔍 Debug User Permissions</h2>
      
      <div style="margin-bottom: 20px;">
        <h3>Current User Info:</h3>
        <pre>{{ currentUserInfo | json }}</pre>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3>Firebase Auth User:</h3>
        <pre>{{ firebaseUserInfo | json }}</pre>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3>Firestore User Document:</h3>
        <pre>{{ firestoreUserInfo | json }}</pre>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3>Permission Check Results:</h3>
        <pre>{{ permissionResults | json }}</pre>
      </div>
      
      <button (click)="refreshData()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Refresh Data
      </button>
    </div>
  `,
  standalone: true,
  imports: [CommonModule, JsonPipe]
})
export class DebugUserPermissionsComponent implements OnInit {
  currentUserInfo: any = {};
  firebaseUserInfo: any = {};
  firestoreUserInfo: any = {};
  permissionResults: any = {};

  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementFirebaseService,
    private firebaseService: FirebaseService
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  async refreshData() {
    console.log('🔍 Starting permission debug...');
    
    // 1. Get current user from AuthService
    const currentUser = this.authService.getCurrentUser();
    this.currentUserInfo = {
      id: currentUser?.id,
      uid: currentUser?.uid,
      email: currentUser?.email,
      username: currentUser?.username,
      roles: currentUser?.roles,
      fullName: currentUser?.fullName
    };
    
    // 2. Get Firebase Auth user
    const firebaseAuth = this.firebaseService.getAuth();
    const firebaseUser = firebaseAuth.currentUser;
    this.firebaseUserInfo = {
      uid: firebaseUser?.uid,
      email: firebaseUser?.email,
      displayName: firebaseUser?.displayName,
      emailVerified: firebaseUser?.emailVerified
    };
    
    // 3. Get user document from Firestore
    if (firebaseUser?.uid) {
      try {
        const userDocRef = doc(this.firebaseService.getFirestore(), 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.firestoreUserInfo = {
            id: userDoc.id,
            data: userData,
            roles: userData['roles'],
            email: userData['email'],
            username: userData['username']
          };
        } else {
          this.firestoreUserInfo = { error: 'User document not found in Firestore' };
        }
      } catch (error: any) {
        this.firestoreUserInfo = { error: error.message };
      }
    }
    
    // 4. Test permission checks
    this.permissionResults = {
      isAuthenticated: this.authService.isAuthenticated(),
      hasAdminRole: await this.testRole('admin'),
      hasManagerRole: await this.testRole('manager'),
      hasTotruongRole: await this.testRole('totruong'),
      canWriteBangve: await this.testBangveWrite(),
      canWriteUserBangve: await this.testUserBangveWrite()
    };
    
    console.log('🔍 Permission debug completed');
  }
  
  private async testRole(roleName: string): Promise<boolean> {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.id) return false;
      
      return await this.userManagementService.hasRole(currentUser.id, roleName).toPromise() || false;
    } catch (error) {
      console.error(`Error testing role ${roleName}:`, error);
      return false;
    }
  }
  
  private async testBangveWrite(): Promise<boolean> {
    try {
      const firebaseAuth = this.firebaseService.getAuth();
      const firebaseUser = firebaseAuth.currentUser;
      if (!firebaseUser) return false;
      
      // Try to read a bangve document to test permissions
      const bangveDocRef = doc(this.firebaseService.getFirestore(), 'bangve', 'test');
      await getDoc(bangveDocRef);
      return true;
    } catch (error) {
      console.error('Error testing bangve write:', error);
      return false;
    }
  }
  
  private async testUserBangveWrite(): Promise<boolean> {
    try {
      const firebaseAuth = this.firebaseService.getAuth();
      const firebaseUser = firebaseAuth.currentUser;
      if (!firebaseUser) return false;
      
      // Try to read a user_bangve document to test permissions
      const userBangveDocRef = doc(this.firebaseService.getFirestore(), 'user_bangve', 'test');
      await getDoc(userBangveDocRef);
      return true;
    } catch (error) {
      console.error('Error testing user_bangve write:', error);
      return false;
    }
  }
}
