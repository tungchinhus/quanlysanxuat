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
              <input matInput [(ngModel)]="targetUserEmail" placeholder="chinhdvt@gmail.com">
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="updateUserToAdmin()" [disabled]="!targetUserEmail">
              Update to Admin
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
}
