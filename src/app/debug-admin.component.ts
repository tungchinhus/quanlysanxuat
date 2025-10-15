import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MigrationService } from './services/migration.service';
import { AuthService } from './services/auth.service';
import { UserManagementFirebaseService } from './services/user-management-firebase.service';
import { User, PREDEFINED_ROLES } from './models/user.model';

@Component({
  selector: 'app-debug-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatCardModule, MatSnackBarModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="debug-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Debug Admin User</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="debug-info">
            <h3>Current Status:</h3>
            <p><strong>Users in system:</strong> {{ userCount }}</p>
            <p><strong>Admin exists:</strong> {{ adminExists ? 'YES' : 'NO' }}</p>
            <p><strong>Current user:</strong> {{ currentUser?.username || 'Not logged in' }}</p>
            <p><strong>Current user email:</strong> {{ currentUser?.email || 'N/A' }}</p>
            <p><strong>Current user roles:</strong> {{ getCurrentUserRoles() }}</p>
            <p><strong>Is authenticated:</strong> {{ isAuthenticated ? 'YES' : 'NO' }}</p>
            <p><strong>Token valid:</strong> {{ isTokenValid ? 'YES' : 'NO' }}</p>
          </div>
          
          <div class="update-user-section">
            <h3>Update User Role:</h3>
            <mat-form-field appearance="outline" class="email-field">
              <mat-label>User Email</mat-label>
              <input matInput [(ngModel)]="targetUserEmail" placeholder="user@example.com">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="updateUserToAdmin()" [disabled]="!targetUserEmail">
              Update to Admin
            </button>
            <button mat-raised-button color="warn" (click)="restoreSuperAdmin()" [disabled]="!targetUserEmail">
              Restore Super Admin
            </button>
            <button mat-raised-button color="accent" (click)="testDashboardAccess()">
              Test Dashboard Access
            </button>
            <button mat-raised-button color="warn" (click)="refreshUserData()">
              Refresh User Data
            </button>
          </div>
          
          <div class="debug-actions">
            <button mat-raised-button color="primary" (click)="refreshUsers()">
              Refresh Users
            </button>
            <button mat-raised-button color="accent" (click)="createAdminUser()">
              Create Admin User
            </button>
            <button mat-raised-button color="warn" (click)="runMigration()">
              Run Full Migration
            </button>
            <button mat-raised-button (click)="testLogin()">
              Test Login as Admin
            </button>
            <button mat-raised-button color="primary" (click)="checkFirebaseConnection()">
              Check Firebase Connection
            </button>
            <button mat-raised-button color="warn" (click)="createAdminUserDirectly()">
              Create Admin (LocalStorage)
            </button>
            <button mat-raised-button color="primary" (click)="createDemoUsersWithAuth()">
              Create Demo Users (Firebase Auth)
            </button>
            <button mat-raised-button color="accent" (click)="autoRestoreSuperAdmin()">
              Auto Restore Super Admin
            </button>
            <button mat-raised-button color="warn" (click)="emergencySuperAdminFix()">
              Emergency Super Admin Fix
            </button>
            <button mat-raised-button color="primary" (click)="debugUserRoleSync()">
              Debug User Role Sync
            </button>
            <button mat-raised-button color="accent" (click)="forceRefreshFromFirebase()">
              Force Refresh From Firebase
            </button>
            <button mat-raised-button color="primary" (click)="fixChinhDvtUser()">
              Fix chinh.dvt@thibidi.com User
            </button>
            <button mat-raised-button color="warn" (click)="bypassPermissionsAndFix()">
              Bypass Permissions & Fix
            </button>
            <button mat-raised-button color="accent" (click)="testChinhDvtLogin()">
              Test chinhdvt Login
            </button>
            <button mat-raised-button color="primary" (click)="debugUsernameLogin()">
              Debug Username Login
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .debug-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .debug-info {
      margin-bottom: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .debug-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .debug-actions button {
      width: 100%;
    }
    
    .update-user-section {
      margin: 20px 0;
      padding: 15px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }
    
    .email-field {
      width: 100%;
      margin-bottom: 10px;
    }
  `]
})
export class DebugAdminComponent implements OnInit {
  userCount = 0;
  adminExists = false;
  currentUser: User | null = null;
  targetUserEmail = 'chinhdvt@gmail.com';
  isAuthenticated = false;
  isTokenValid = false;

  constructor(
    private migrationService: MigrationService,
    private authService: AuthService,
    private userManagementService: UserManagementFirebaseService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshUsers();
    this.currentUser = this.authService.getCurrentUser();
    this.isAuthenticated = this.authService.isAuthenticated();
    this.isTokenValid = this.authService.isTokenValid();
  }

  async refreshUsers(): Promise<void> {
    try {
      // Try Firebase first
      try {
        const users = await this.authService['userManagementService'].getUsers().pipe().toPromise();
        this.userCount = users?.length || 0;
        this.adminExists = users?.some(user => user.username === 'admin') || false;
        
        if (this.userCount > 0) {
          this.snackBar.open(`Found ${this.userCount} users from Firebase`, 'Close', { duration: 3000 });
          return;
        }
      } catch (firebaseError) {
        console.log('Firebase error, trying localStorage:', firebaseError);
      }

      // Fallback to localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      this.userCount = localUsers.length;
      this.adminExists = localUsers.some((user: any) => user.username === 'admin');
      
      this.snackBar.open(`Found ${this.userCount} users from localStorage`, 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error refreshing users:', error);
      this.snackBar.open('Error refreshing users', 'Close', { duration: 3000 });
    }
  }

  async createAdminUser(): Promise<void> {
    try {
      console.log('Starting to create admin user...');
      await this.migrationService.ensureAdminUser();
      console.log('Admin user creation completed, refreshing users...');
      await this.refreshUsers();
      this.snackBar.open('Admin user created successfully!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error creating admin user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.snackBar.open(`Error creating admin user: ${errorMessage}`, 'Close', { duration: 5000 });
    }
  }

  async runMigration(): Promise<void> {
    try {
      await this.migrationService.migrateToFirebase();
      await this.refreshUsers();
      this.snackBar.open('Migration completed!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error running migration:', error);
      this.snackBar.open('Error running migration', 'Close', { duration: 3000 });
    }
  }

  async testLogin(): Promise<void> {
    try {
      const result = await this.authService.login('admin', 'admin123');
      if (result.success) {
        this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
        this.currentUser = this.authService.getCurrentUser();
      } else {
        this.snackBar.open(`Login failed: ${result.message}`, 'Close', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error testing login:', error);
      this.snackBar.open('Error testing login', 'Close', { duration: 3000 });
    }
  }

  async checkFirebaseConnection(): Promise<void> {
    try {
      console.log('Checking Firebase connection...');
      const firebaseService = this.authService['userManagementService']['firebaseUserService'];
      console.log('Firebase service:', firebaseService);
      console.log('Firestore instance:', firebaseService.getFirestoreInstance());
      
      // Try to read a simple document
      const testCollection = firebaseService.getCollections().USERS;
      console.log('Test collection:', testCollection);
      
      this.snackBar.open('Firebase connection check completed - see console', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Firebase connection error:', error);
      this.snackBar.open(`Firebase connection error: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async createAdminUserDirectly(): Promise<void> {
    try {
      console.log('Creating admin user directly in localStorage...');
      
      // Create admin user data
      const adminUser = {
        id: 'admin-' + Date.now(),
        username: 'admin',
        email: 'admin@company.com',
        fullName: 'Quản trị viên',
        phone: '0901234567',
        department: 'IT',
        position: 'System Administrator',
        isActive: true,
        roles: ['super_admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
        createdBy: 'system',
        updatedBy: 'system'
      };

      // Store in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      existingUsers.push(adminUser);
      localStorage.setItem('users', JSON.stringify(existingUsers));
      
      console.log('Admin user created in localStorage:', adminUser);
      
      // Refresh the display
      await this.refreshUsers();
      
      this.snackBar.open('Admin user created in localStorage!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error creating admin user directly:', error);
      this.snackBar.open(`Error: ${error}`, 'Close', { duration: 5000 });
    }
  }

  getCurrentUserRoles(): string {
    if (!this.currentUser || !this.currentUser.roles) return 'None';
    return this.currentUser.roles.map(role => 
      typeof role === 'string' ? role : (role as any).name
    ).join(', ');
  }

  async updateUserToAdmin(): Promise<void> {
    try {
      console.log(`Updating user ${this.targetUserEmail} to admin...`);
      
      // Get all users
      const users = await this.userManagementService.getUsers().pipe().toPromise();
      console.log('All users:', users);
      
      // Find user by email
      const user = users?.find(u => u.email?.toLowerCase() === this.targetUserEmail.toLowerCase());
      
      if (!user) {
        this.snackBar.open(`User with email ${this.targetUserEmail} not found`, 'Close', { duration: 3000 });
        return;
      }
      
      console.log('Found user:', user);
      console.log('Current roles:', user.roles);
      
      // Update user role to admin
      const updatedUser = await this.userManagementService.updateUser(user.id, {
        roles: [PREDEFINED_ROLES.ADMIN],
        updatedAt: new Date(),
        updatedBy: 'system'
      });
      
      if (updatedUser) {
        console.log('User role updated successfully:', updatedUser);
        this.snackBar.open(`User ${this.targetUserEmail} updated to admin successfully!`, 'Close', { duration: 3000 });
        
        // Refresh users and current user
        await this.refreshUsers();
        this.currentUser = this.authService.getCurrentUser();
      } else {
        this.snackBar.open('Failed to update user role', 'Close', { duration: 3000 });
      }
      
    } catch (error) {
      console.error('Error updating user role:', error);
      this.snackBar.open(`Error updating user role: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async restoreSuperAdmin(): Promise<void> {
    try {
      console.log(`Restoring super admin role for user ${this.targetUserEmail}...`);
      
      // Get all users
      const users = await this.userManagementService.getUsers().pipe().toPromise();
      console.log('All users:', users);
      
      // Find user by email
      const user = users?.find(u => u.email?.toLowerCase() === this.targetUserEmail.toLowerCase());
      
      if (!user) {
        this.snackBar.open(`User with email ${this.targetUserEmail} not found`, 'Close', { duration: 3000 });
        return;
      }
      
      console.log('Found user:', user);
      console.log('Current roles:', user.roles);
      
      // Try to update user role to super_admin
      try {
        const updatedUser = await this.userManagementService.updateUser(user.id, {
          roles: [PREDEFINED_ROLES.SUPER_ADMIN],
          updatedAt: new Date(),
          updatedBy: 'system'
        });
        
        if (updatedUser) {
          console.log('User restored to super admin:', updatedUser);
          this.snackBar.open(`User ${this.targetUserEmail} restored to super admin successfully!`, 'Close', { duration: 3000 });
          
          // Refresh users list
          await this.refreshUsers();
          
          // If this is the current user, refresh their data
          if (this.currentUser && this.currentUser.email?.toLowerCase() === this.targetUserEmail.toLowerCase()) {
            console.log('Refreshing current user data...');
            await this.authService.forceRefreshUserData();
            this.currentUser = this.authService.getCurrentUser();
          }
        } else {
          this.snackBar.open('Failed to restore user to super admin', 'Close', { duration: 3000 });
        }
      } catch (permissionError) {
        console.error('Permission error, trying alternative method:', permissionError);
        
        // Alternative: Try to create a new user with super_admin role
        try {
          const newSuperAdminUser = {
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone || '',
            department: user.department || 'IT',
            position: user.position || 'Super Administrator',
            isActive: true,
            roles: [PREDEFINED_ROLES.SUPER_ADMIN],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            updatedBy: 'system'
          };
          
          // Try to create with Firebase Auth
          const result = await this.authService.createUserWithAuth(newSuperAdminUser, 'TempPassword123!');
          
          if (result.success) {
            console.log('Created new super admin user:', result.user);
            this.snackBar.open(`Created new super admin user for ${this.targetUserEmail}!`, 'Close', { duration: 3000 });
            await this.refreshUsers();
          } else {
            this.snackBar.open(`Failed to create super admin: ${result.message}`, 'Close', { duration: 5000 });
          }
        } catch (createError) {
          console.error('Error creating super admin user:', createError);
          this.snackBar.open(`Error creating super admin: ${createError}`, 'Close', { duration: 5000 });
        }
      }
    } catch (error) {
      console.error('Error restoring user to super admin:', error);
      this.snackBar.open(`Error: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async autoRestoreSuperAdmin(): Promise<void> {
    try {
      console.log('Auto restoring super admin for chinhdvt@thibidi.com...');
      
      // Set target email
      this.targetUserEmail = 'chinhdvt@thibidi.com';
      
      // Call restoreSuperAdmin method
      await this.restoreSuperAdmin();
      
      this.snackBar.open('Auto restore super admin completed!', 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error in auto restore super admin:', error);
      this.snackBar.open(`Error: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async emergencySuperAdminFix(): Promise<void> {
    try {
      console.log('🚨 EMERGENCY SUPER ADMIN FIX - Attempting to restore permissions...');
      
      // Method 1: Try to update current user directly in localStorage
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        console.log('Current user found:', currentUser);
        
        // Update user in localStorage with super_admin role
        const updatedUser = {
          ...currentUser,
          roles: [PREDEFINED_ROLES.SUPER_ADMIN],
          updatedAt: new Date(),
          updatedBy: 'emergency_fix'
        };
        
        // Store in localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        console.log('Updated user in localStorage:', updatedUser);
        
        // Update auth service
        this.authService['currentUserSubject'].next(updatedUser);
        this.currentUser = updatedUser;
        
        this.snackBar.open('Emergency fix applied to localStorage!', 'Close', { duration: 3000 });
        
        // Method 2: Try to create a temporary super admin user
        try {
          const tempSuperAdmin = {
            username: 'temp_superadmin',
            email: 'temp_superadmin@thibidi.com',
            fullName: 'Temporary Super Admin',
            phone: '0123456789',
            department: 'IT',
            position: 'Emergency Administrator',
            isActive: true,
            roles: [PREDEFINED_ROLES.SUPER_ADMIN],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'emergency_fix',
            updatedBy: 'emergency_fix'
          };
          
          const result = await this.authService.createUserWithAuth(tempSuperAdmin, 'Emergency123!');
          
          if (result.success) {
            console.log('Temporary super admin created:', result.user);
            this.snackBar.open('Temporary super admin created! Use temp_superadmin@thibidi.com / Emergency123!', 'Close', { duration: 5000 });
          }
        } catch (createError) {
          console.error('Could not create temporary super admin:', createError);
        }
        
        // Method 3: Try to force refresh user data
        try {
          await this.authService.forceRefreshUserData();
          console.log('Force refresh completed');
        } catch (refreshError) {
          console.error('Force refresh failed:', refreshError);
        }
        
      } else {
        this.snackBar.open('No current user found for emergency fix', 'Close', { duration: 3000 });
      }
      
    } catch (error) {
      console.error('Emergency fix failed:', error);
      this.snackBar.open(`Emergency fix failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async debugUserRoleSync(): Promise<void> {
    try {
      console.log('🔍 DEBUG USER ROLE SYNC - Starting comprehensive debug...');
      
      // Step 1: Check current user state
      const currentUser = this.authService.getCurrentUser();
      console.log('📋 Step 1 - Current User State:');
      console.log('Current user:', currentUser);
      console.log('Current user roles:', currentUser?.roles);
      console.log('Current user email:', currentUser?.email);
      
      // Step 2: Check localStorage
      const storedUser = localStorage.getItem('currentUser');
      console.log('📋 Step 2 - LocalStorage State:');
      console.log('Stored user:', storedUser ? JSON.parse(storedUser) : 'null');
      
      // Step 3: Check Firebase users collection
      console.log('📋 Step 3 - Firebase Users Collection:');
      try {
        await this.userManagementService.loadUsers();
        const users = await this.userManagementService.getUsers().pipe().toPromise();
        console.log('Total users in Firebase:', users?.length || 0);
        
        // Find chinhdvt user
        const chinhdvtUser = users?.find(u => 
          u.email?.toLowerCase().includes('chinhdvt') || 
          u.email?.toLowerCase().includes('chinh.dvt')
        );
        
        if (chinhdvtUser) {
          console.log('✅ Found chinhdvt user in Firebase:', chinhdvtUser);
          console.log('Firebase user roles:', chinhdvtUser.roles);
          console.log('Firebase user email:', chinhdvtUser.email);
          
          // Step 4: Compare with current user
          console.log('📋 Step 4 - Role Comparison:');
          console.log('Firebase roles:', chinhdvtUser.roles);
          console.log('Current user roles:', currentUser?.roles);
          console.log('Roles match:', JSON.stringify(chinhdvtUser.roles) === JSON.stringify(currentUser?.roles));
          
          // Step 5: Force sync if mismatch
          if (JSON.stringify(chinhdvtUser.roles) !== JSON.stringify(currentUser?.roles)) {
            console.log('🔄 Step 5 - Role Mismatch Detected! Forcing sync...');
            
            // Update current user with Firebase data
            const updatedUser: User = {
              ...currentUser!,
              roles: chinhdvtUser.roles,
              updatedAt: new Date(),
              updatedBy: 'debug_sync'
            };
            
            // Update localStorage
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            console.log('Updated localStorage with Firebase roles');
            
            // Update auth service
            this.authService['currentUserSubject'].next(updatedUser);
            this.currentUser = updatedUser;
            console.log('Updated auth service with Firebase roles');
            
            this.snackBar.open('Role sync completed! Reload page to see changes.', 'Close', { duration: 5000 });
          } else {
            console.log('✅ Roles are already in sync');
            this.snackBar.open('Roles are already in sync', 'Close', { duration: 3000 });
          }
        } else {
          console.log('❌ chinhdvt user not found in Firebase');
          this.snackBar.open('chinhdvt user not found in Firebase', 'Close', { duration: 3000 });
        }
      } catch (firebaseError) {
        console.error('❌ Error accessing Firebase:', firebaseError);
        this.snackBar.open(`Firebase error: ${firebaseError}`, 'Close', { duration: 5000 });
      }
      
      // Step 6: Check auth service state
      console.log('📋 Step 6 - Auth Service State:');
      console.log('Auth service current user:', this.authService['currentUserSubject'].value);
      console.log('Is authenticated:', this.authService.isAuthenticated());
      console.log('Token valid:', this.authService.isTokenValid());
      
    } catch (error) {
      console.error('❌ Debug sync failed:', error);
      this.snackBar.open(`Debug failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async forceRefreshFromFirebase(): Promise<void> {
    try {
      console.log('🔄 FORCE REFRESH FROM FIREBASE - Starting...');
      
      // Step 1: Clear current auth data
      console.log('Step 1: Clearing current auth data...');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      this.authService['currentUserSubject'].next(null);
      this.authService['isAuthenticatedSubject'].next(false);
      
      // Step 2: Force reload users from Firebase
      console.log('Step 2: Force reloading users from Firebase...');
      await this.userManagementService.loadUsers();
      const users = await this.userManagementService.getUsers().pipe().toPromise();
      console.log('Users loaded from Firebase:', users?.length || 0);
      
      // Step 3: Find chinhdvt user
      const chinhdvtUser = users?.find(u => 
        u.email?.toLowerCase().includes('chinhdvt') || 
        u.email?.toLowerCase().includes('chinh.dvt')
      );
      
      if (chinhdvtUser) {
        console.log('Step 3: Found chinhdvt user:', chinhdvtUser);
        console.log('User roles in Firebase:', chinhdvtUser.roles);
        
        // Step 4: Force auth service to refresh
        console.log('Step 4: Forcing auth service refresh...');
        await this.authService.forceRefreshUserData();
        
        // Step 5: Check if refresh worked
        const refreshedUser = this.authService.getCurrentUser();
        console.log('Step 5: Refreshed user:', refreshedUser);
        console.log('Refreshed user roles:', refreshedUser?.roles);
        
        if (refreshedUser && refreshedUser.roles?.includes('super_admin')) {
          console.log('✅ Successfully refreshed with super_admin role!');
          this.snackBar.open('Successfully refreshed with super_admin role!', 'Close', { duration: 3000 });
        } else {
          console.log('⚠️ Refresh completed but role may not be correct');
          this.snackBar.open('Refresh completed - check console for details', 'Close', { duration: 3000 });
        }
        
        // Update component state
        this.currentUser = refreshedUser;
        await this.refreshUsers();
        
      } else {
        console.log('❌ chinhdvt user not found in Firebase');
        this.snackBar.open('chinhdvt user not found in Firebase', 'Close', { duration: 3000 });
      }
      
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      this.snackBar.open(`Force refresh failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async fixChinhDvtUser(): Promise<void> {
    try {
      console.log('🔧 FIX CHINH.DVT@THIBIDI.COM USER - Starting...');
      
      // Step 1: Load users from Firebase
      console.log('Step 1: Loading users from Firebase...');
      await this.userManagementService.loadUsers();
      const users = await this.userManagementService.getUsers().pipe().toPromise();
      console.log('Total users loaded:', users?.length || 0);
      
      // Step 2: Find chinhdvt user by username or email
      const chinhdvtUser = users?.find(u => 
        u.username?.toLowerCase() === 'chinhdvt' ||
        u.email?.toLowerCase() === 'chinh.dvt@thibidi.com' ||
        u.email?.toLowerCase() === 'chinhdvt@thibidi.com'
      );
      
      if (chinhdvtUser) {
        console.log('Step 2: Found chinhdvt user:', chinhdvtUser);
        console.log('Current roles:', chinhdvtUser.roles);
        console.log('Current email:', chinhdvtUser.email);
        console.log('Current username:', chinhdvtUser.username);
        
        // Step 3: Update user to super_admin role
        console.log('Step 3: Updating user to super_admin role...');
        try {
          const updatedUser = await this.userManagementService.updateUser(chinhdvtUser.id, {
            roles: [PREDEFINED_ROLES.SUPER_ADMIN],
            email: 'chinh.dvt@thibidi.com', // Ensure correct email
            username: 'chinhdvt', // Ensure correct username
            updatedAt: new Date(),
            updatedBy: 'fix_chinhdvt_user'
          });
          
          if (updatedUser) {
            console.log('✅ User updated successfully:', updatedUser);
            this.snackBar.open('User updated to super_admin successfully!', 'Close', { duration: 3000 });
            
            // Step 4: Force refresh current user if it's the same user
            const currentUser = this.authService.getCurrentUser();
            if (currentUser && (
              currentUser.email?.toLowerCase() === 'chinh.dvt@thibidi.com' ||
              currentUser.username?.toLowerCase() === 'chinhdvt'
            )) {
              console.log('Step 4: Refreshing current user data...');
              await this.authService.forceRefreshUserData();
              this.currentUser = this.authService.getCurrentUser();
              console.log('Current user refreshed:', this.currentUser);
            }
            
            // Step 5: Refresh users list
            await this.refreshUsers();
            
          } else {
            console.log('❌ Failed to update user');
            this.snackBar.open('Failed to update user', 'Close', { duration: 3000 });
          }
        } catch (updateError) {
          console.error('❌ Error updating user:', updateError);
          
          // Fallback: Try to create new user with correct data
          console.log('Step 3b: Trying fallback - create new user...');
          try {
            const newUserData = {
              username: 'chinhdvt',
              email: 'chinh.dvt@thibidi.com',
              fullName: chinhdvtUser.fullName || 'ChinhDo',
              phone: chinhdvtUser.phone || '14456',
              department: chinhdvtUser.department || 'IT',
              position: chinhdvtUser.position || 'IT',
              isActive: true,
              roles: [PREDEFINED_ROLES.SUPER_ADMIN],
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'fix_chinhdvt_user',
              updatedBy: 'fix_chinhdvt_user'
            };
            
            const result = await this.authService.createUserWithAuth(newUserData, 'TempPassword123!');
            
            if (result.success) {
              console.log('✅ Created new user with super_admin role:', result.user);
              this.snackBar.open('Created new user with super_admin role!', 'Close', { duration: 3000 });
              await this.refreshUsers();
            } else {
              console.log('❌ Failed to create new user:', result.message);
              this.snackBar.open(`Failed to create new user: ${result.message}`, 'Close', { duration: 5000 });
            }
          } catch (createError) {
            console.error('❌ Error creating new user:', createError);
            this.snackBar.open(`Error creating new user: ${createError}`, 'Close', { duration: 5000 });
          }
        }
        
      } else {
        console.log('❌ chinhdvt user not found in Firebase');
        this.snackBar.open('chinhdvt user not found in Firebase', 'Close', { duration: 3000 });
        
        // Try to create the user
        console.log('Creating chinhdvt user...');
        try {
          const newUserData = {
            username: 'chinhdvt',
            email: 'chinh.dvt@thibidi.com',
            fullName: 'ChinhDo',
            phone: '14456',
            department: 'IT',
            position: 'IT',
            isActive: true,
            roles: [PREDEFINED_ROLES.SUPER_ADMIN],
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'fix_chinhdvt_user',
            updatedBy: 'fix_chinhdvt_user'
          };
          
          const result = await this.authService.createUserWithAuth(newUserData, 'TempPassword123!');
          
          if (result.success) {
            console.log('✅ Created chinhdvt user with super_admin role:', result.user);
            this.snackBar.open('Created chinhdvt user with super_admin role!', 'Close', { duration: 3000 });
            await this.refreshUsers();
          } else {
            console.log('❌ Failed to create chinhdvt user:', result.message);
            this.snackBar.open(`Failed to create chinhdvt user: ${result.message}`, 'Close', { duration: 5000 });
          }
        } catch (createError) {
          console.error('❌ Error creating chinhdvt user:', createError);
          this.snackBar.open(`Error creating chinhdvt user: ${createError}`, 'Close', { duration: 5000 });
        }
      }
      
    } catch (error) {
      console.error('❌ Fix chinhdvt user failed:', error);
      this.snackBar.open(`Fix failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async bypassPermissionsAndFix(): Promise<void> {
    try {
      console.log('🚨 BYPASS PERMISSIONS & FIX - Starting emergency recovery...');
      
      // Step 1: Create a temporary super admin user to bypass permissions
      console.log('Step 1: Creating temporary super admin to bypass permissions...');
      
      const tempSuperAdmin = {
        username: 'temp_superadmin_bypass',
        email: 'temp_superadmin_bypass@thibidi.com',
        fullName: 'Temporary Super Admin (Bypass)',
        phone: '0123456789',
        department: 'IT',
        position: 'Emergency Administrator',
        isActive: true,
        roles: [PREDEFINED_ROLES.SUPER_ADMIN],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'bypass_fix',
        updatedBy: 'bypass_fix'
      };
      
      try {
        const result = await this.authService.createUserWithAuth(tempSuperAdmin, 'Bypass123!');
        
        if (result.success) {
          console.log('✅ Temporary super admin created:', result.user);
          this.snackBar.open('Temporary super admin created! Use temp_superadmin_bypass@thibidi.com / Bypass123!', 'Close', { duration: 5000 });
          
          // Step 2: Now try to fix chinhdvt user with super admin permissions
          console.log('Step 2: Attempting to fix chinhdvt user with super admin permissions...');
          
          // Wait a bit for the new user to be available
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Try to load users again
          try {
            await this.userManagementService.loadUsers();
            const users = await this.userManagementService.getUsers().pipe().toPromise();
            console.log('Users loaded successfully:', users?.length || 0);
            
            // Find chinhdvt user
            const chinhdvtUser = users?.find(u => 
              u.username?.toLowerCase() === 'chinhdvt' ||
              u.email?.toLowerCase() === 'chinh.dvt@thibidi.com'
            );
            
            if (chinhdvtUser) {
              console.log('Found chinhdvt user:', chinhdvtUser);
              
              // Update to super_admin
              try {
                const updatedUser = await this.userManagementService.updateUser(chinhdvtUser.id, {
                  roles: [PREDEFINED_ROLES.SUPER_ADMIN],
                  email: 'chinh.dvt@thibidi.com',
                  username: 'chinhdvt',
                  updatedAt: new Date(),
                  updatedBy: 'bypass_fix'
                });
                
                if (updatedUser) {
                  console.log('✅ chinhdvt user updated to super_admin:', updatedUser);
                  this.snackBar.open('chinhdvt user updated to super_admin!', 'Close', { duration: 3000 });
                  
                  // Step 3: Update current user if it's chinhdvt
                  const currentUser = this.authService.getCurrentUser();
                  if (currentUser && (
                    currentUser.email?.toLowerCase() === 'chinh.dvt@thibidi.com' ||
                    currentUser.username?.toLowerCase() === 'chinhdvt'
                  )) {
                    console.log('Step 3: Updating current user with super_admin role...');
                    
                    const updatedCurrentUser: User = {
                      ...currentUser,
                      roles: [PREDEFINED_ROLES.SUPER_ADMIN],
                      updatedAt: new Date(),
                      updatedBy: 'bypass_fix'
                    };
                    
                    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
                    this.authService['currentUserSubject'].next(updatedCurrentUser);
                    this.currentUser = updatedCurrentUser;
                    
                    console.log('✅ Current user updated with super_admin role');
                    this.snackBar.open('Current user updated with super_admin role!', 'Close', { duration: 3000 });
                  }
                  
                  await this.refreshUsers();
                  
                } else {
                  console.log('❌ Failed to update chinhdvt user');
                  this.snackBar.open('Failed to update chinhdvt user', 'Close', { duration: 3000 });
                }
              } catch (updateError) {
                console.error('❌ Error updating chinhdvt user:', updateError);
                this.snackBar.open(`Error updating chinhdvt user: ${updateError}`, 'Close', { duration: 5000 });
              }
            } else {
              console.log('❌ chinhdvt user not found');
              this.snackBar.open('chinhdvt user not found', 'Close', { duration: 3000 });
            }
            
          } catch (loadError) {
            console.error('❌ Still cannot load users:', loadError);
            this.snackBar.open(`Still cannot load users: ${loadError}`, 'Close', { duration: 5000 });
          }
          
        } else {
          console.log('❌ Failed to create temporary super admin:', result.message);
          this.snackBar.open(`Failed to create temporary super admin: ${result.message}`, 'Close', { duration: 5000 });
        }
      } catch (createError) {
        console.error('❌ Error creating temporary super admin:', createError);
        this.snackBar.open(`Error creating temporary super admin: ${createError}`, 'Close', { duration: 5000 });
      }
      
    } catch (error) {
      console.error('❌ Bypass permissions fix failed:', error);
      this.snackBar.open(`Bypass fix failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async testChinhDvtLogin(): Promise<void> {
    try {
      console.log('🔐 TEST CHINHDVT LOGIN - Testing login credentials...');
      
      // Test different login combinations
      const testCredentials = [
        { username: 'chinhdvt', password: 'admin123' },
        { username: 'chinhdvt', password: 'Ab!123456' },
        { username: 'chinhdvt', password: 'TempPassword123!' },
        { username: 'chinhdvt', password: 'Bypass123!' },
        { email: 'chinh.dvt@thibidi.com', password: 'admin123' },
        { email: 'chinh.dvt@thibidi.com', password: 'Ab!123456' },
        { email: 'chinh.dvt@thibidi.com', password: 'TempPassword123!' },
        { email: 'chinh.dvt@thibidi.com', password: 'Bypass123!' }
      ];
      
      for (let i = 0; i < testCredentials.length; i++) {
        const cred = testCredentials[i];
        console.log(`Testing ${i + 1}/${testCredentials.length}: ${cred.username || cred.email} / ${cred.password}`);
        
        try {
          const result = await this.authService.login(
            cred.username || cred.email!, 
            cred.password
          );
          
          if (result.success) {
            console.log(`✅ Login successful with: ${cred.username || cred.email} / ${cred.password}`);
            console.log('User:', result.user);
            console.log('User roles:', result.user?.roles);
            
            this.snackBar.open(`Login successful! Username: ${cred.username || cred.email}, Roles: ${result.user?.roles?.join(', ')}`, 'Close', { duration: 5000 });
            
            // Update component state
            this.currentUser = result.user!;
            await this.refreshUsers();
            
            return; // Stop testing after first successful login
          } else {
            console.log(`❌ Login failed: ${result.message}`);
          }
        } catch (loginError) {
          console.log(`❌ Login error: ${loginError}`);
        }
        
        // Wait a bit between attempts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('❌ All login attempts failed');
      this.snackBar.open('All login attempts failed. Check console for details.', 'Close', { duration: 5000 });
      
    } catch (error) {
      console.error('❌ Test login failed:', error);
      this.snackBar.open(`Test login failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async debugUsernameLogin(): Promise<void> {
    try {
      console.log('🔍 DEBUG USERNAME LOGIN - Debugging chinhdvt username login...');
      
      // Step 1: Test username lookup
      console.log('Step 1: Testing username lookup...');
      try {
        await this.userManagementService.loadUsers();
        const users = await this.userManagementService.getUsers().pipe().toPromise();
        console.log('Users loaded:', users?.length || 0);
        
        // Find chinhdvt user
        const chinhdvtUser = users?.find(u => 
          u.username?.toLowerCase() === 'chinhdvt'
        );
        
        if (chinhdvtUser) {
          console.log('✅ Found chinhdvt user:', chinhdvtUser);
          console.log('Username:', chinhdvtUser.username);
          console.log('Email:', chinhdvtUser.email);
          console.log('Roles:', chinhdvtUser.roles);
          
          // Step 2: Test manual login with username
          console.log('Step 2: Testing manual login with username chinhdvt...');
          
          const testPasswords = ['admin123', 'Ab!123456', 'TempPassword123!', 'Bypass123!'];
          
          for (const password of testPasswords) {
            console.log(`Testing password: ${password}`);
            
            try {
              // Simulate the login process
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              const isEmail = emailRegex.test('chinhdvt');
              console.log('Is email format:', isEmail);
              
              if (!isEmail) {
                console.log('Username detected, looking up email...');
                const actualEmail = chinhdvtUser.email;
                console.log('Actual email for login:', actualEmail);
                
                // Test Firebase authentication
                try {
                  const { signInWithEmailAndPassword } = await import('firebase/auth');
                  const credential = await signInWithEmailAndPassword(
                    this.authService['firebaseService'].getAuth(), 
                    actualEmail, 
                    password
                  );
                  
                  console.log(`✅ Login successful with username chinhdvt / password ${password}`);
                  console.log('Firebase user:', credential.user.email);
                  
                  this.snackBar.open(`Login successful! Username: chinhdvt, Password: ${password}`, 'Close', { duration: 5000 });
                  
                  // Sign out immediately to avoid session change
                  await this.authService['firebaseService'].getAuth().signOut();
                  console.log('Signed out to preserve current session');
                  
                  return; // Stop testing after first successful login
                  
                } catch (authError) {
                  console.log(`❌ Firebase auth failed with password ${password}:`, authError);
                }
              }
            } catch (error) {
              console.log(`❌ Error testing password ${password}:`, error);
            }
          }
          
          console.log('❌ No working password found for username chinhdvt');
          this.snackBar.open('No working password found for username chinhdvt', 'Close', { duration: 3000 });
          
        } else {
          console.log('❌ chinhdvt user not found in users list');
          this.snackBar.open('chinhdvt user not found in users list', 'Close', { duration: 3000 });
        }
        
      } catch (loadError) {
        console.error('❌ Error loading users:', loadError);
        this.snackBar.open(`Error loading users: ${loadError}`, 'Close', { duration: 5000 });
      }
      
      // Step 3: Test direct Firebase user lookup
      console.log('Step 3: Testing direct Firebase user lookup...');
      try {
        const chinhdvtUser = await this.userManagementService.getUserByUsername('chinhdvt').pipe().toPromise();
        if (chinhdvtUser) {
          console.log('✅ Found chinhdvt user via direct lookup:', chinhdvtUser);
          console.log('Email for login:', chinhdvtUser.email);
        } else {
          console.log('❌ chinhdvt user not found via direct lookup');
        }
      } catch (lookupError) {
        console.error('❌ Error in direct user lookup:', lookupError);
      }
      
    } catch (error) {
      console.error('❌ Debug username login failed:', error);
      this.snackBar.open(`Debug failed: ${error}`, 'Close', { duration: 5000 });
    }
  }

  testDashboardAccess(): void {
    console.log('Testing dashboard access...');
    console.log('Current user:', this.currentUser);
    console.log('Is authenticated:', this.isAuthenticated);
    console.log('Is token valid:', this.isTokenValid);
    
    if (!this.currentUser) {
      this.snackBar.open('No current user found', 'Close', { duration: 3000 });
      return;
    }
    
    const userRoles = Array.isArray(this.currentUser.roles) ? this.currentUser.roles : [];
    console.log('User roles:', userRoles);
    
    if (userRoles.length === 0) {
      this.snackBar.open('User has no roles - should be allowed as user role', 'Close', { duration: 3000 });
    } else {
      const roleNames = userRoles.map(role => typeof role === 'string' ? role : (role as any).name);
      this.snackBar.open(`User roles: ${roleNames.join(', ')}`, 'Close', { duration: 3000 });
    }
    
    // Navigate to dashboard to test
    this.router.navigate(['/dashboard']);
  }

  async refreshUserData(): Promise<void> {
    try {
      console.log('Refreshing user data...');
      await this.authService.refreshUserData();
      
      // Update local variables
      this.currentUser = this.authService.getCurrentUser();
      this.isAuthenticated = this.authService.isAuthenticated();
      this.isTokenValid = this.authService.isTokenValid();
      
      console.log('User data refreshed:', this.currentUser);
      this.snackBar.open('User data refreshed successfully!', 'Close', { duration: 3000 });
      
      // Force change detection by navigating to current page
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
      
    } catch (error) {
      console.error('Error refreshing user data:', error);
      this.snackBar.open(`Error refreshing user data: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async createDemoUsersWithAuth(): Promise<void> {
    try {
      console.log('Creating demo users with Firebase Authentication...');
      
      const demoUsers = [
        {
          username: 'admin',
          email: 'admin@thibidi.com',
          fullName: 'Admin User',
          phone: '0123456789',
          department: 'IT',
          position: 'System Administrator',
          roles: ['admin'],
          isActive: true,
          password: 'Ab!123456'
        },
        {
          username: 'manager',
          email: 'manager@thibidi.com',
          fullName: 'Manager User',
          phone: '0123456790',
          department: 'Operations',
          position: 'Manager',
          roles: ['manager'],
          isActive: true,
          password: 'Ab!123456'
        },
        {
          username: 'totruong',
          email: 'totruong@thibidi.com',
          fullName: 'Tổ Trưởng',
          phone: '0123456791',
          department: 'Production',
          position: 'Tổ Trưởng',
          roles: ['totruong'],
          isActive: true,
          password: 'Ab!123456'
        },
        {
          username: 'kcs',
          email: 'kcs@thibidi.com',
          fullName: 'KCS User',
          phone: '0123456792',
          department: 'Quality Control',
          position: 'KCS',
          roles: ['kcs'],
          isActive: true,
          password: 'Ab!123456'
        }
      ];

      let successCount = 0;
      let errorCount = 0;

      for (const userData of demoUsers) {
        try {
          console.log(`Creating user: ${userData.email}`);
          const result = await this.authService.createUserWithAuth(userData, userData.password);
          
          if (result.success) {
            console.log(`✅ User created successfully: ${userData.email}`);
            successCount++;
          } else {
            console.log(`❌ Failed to create user ${userData.email}: ${result.message}`);
            errorCount++;
          }
        } catch (error) {
          console.error(`❌ Error creating user ${userData.email}:`, error);
          errorCount++;
        }
      }

      console.log(`Demo users creation completed: ${successCount} success, ${errorCount} errors`);
      
      // Refresh users list
      await this.refreshUsers();
      
      this.snackBar.open(
        `Demo users created: ${successCount} success, ${errorCount} errors`, 
        'Close', 
        { duration: 5000 }
      );
      
    } catch (error) {
      console.error('Error creating demo users:', error);
      this.snackBar.open(`Error creating demo users: ${error}`, 'Close', { duration: 5000 });
    }
  }

  async debugLogin(): Promise<void> {
    try {
      console.log('🔍 Starting debug login test...');
      
      // Test with manager@thibidi.com
      await this.authService.debugLogin('manager@thibidi.com', 'Ab!123456');
      
      this.snackBar.open('Debug login test completed. Check console for details.', 'Close', { duration: 5000 });
      
    } catch (error) {
      console.error('Debug login test failed:', error);
      this.snackBar.open(`Debug login test failed: ${error}`, 'Close', { duration: 5000 });
    }
  }
}
