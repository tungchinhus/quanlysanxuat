import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

import { FirebaseService } from '../../services/firebase.service';
import { User } from '../../models/user.model';
import { UserMigrationService } from '../../scripts/simple-migration';

@Component({
  selector: 'app-firebase-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './firebase-test.component.html',
  styleUrl: './firebase-test.component.scss'
})
export class FirebaseTestComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  displayedColumns: string[] = ['displayName', 'email', 'role', 'department', 'isActive'];
  private migrationService: UserMigrationService;

  constructor(
    private firebaseService: FirebaseService,
    private snackBar: MatSnackBar
  ) {
    this.migrationService = new UserMigrationService(this.firebaseService);
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.firebaseService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        this.snackBar.open(`Đã tải ${users.length} người dùng`, 'Đóng', {
          duration: 3000
        });
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
        this.snackBar.open('Lỗi khi tải danh sách người dùng', 'Đóng', {
          duration: 3000
        });
      }
    });
  }

  testConnection(): void {
    this.snackBar.open('Đang kiểm tra kết nối Firebase...', 'Đóng', {
      duration: 2000
    });
    
    this.firebaseService.getAllUsers().subscribe({
      next: (users) => {
        this.snackBar.open(`✅ Kết nối thành công! Tìm thấy ${users.length} người dùng`, 'Đóng', {
          duration: 5000
        });
      },
      error: (error) => {
        console.error('Firebase connection error:', error);
        this.snackBar.open('❌ Lỗi kết nối Firebase', 'Đóng', {
          duration: 5000
        });
      }
    });
  }

  createTestUser(): void {
    this.isLoading = true;
    const testUser: Omit<User, 'id'> = {
      email: `test${Date.now()}@thibidi.com`,
      displayName: `Test User ${Date.now()}`,
      role: 'quanday_ha' as any,
      department: 'Production',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'test'
    };

    this.firebaseService.addUser(testUser).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.snackBar.open('✅ Tạo người dùng test thành công!', 'Đóng', {
          duration: 3000
        });
        this.loadUsers(); // Reload the list
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating test user:', error);
        this.snackBar.open('❌ Lỗi khi tạo người dùng test', 'Đóng', {
          duration: 3000
        });
      }
    });
  }

  createDemoUsers(): void {
    this.isLoading = true;
    this.migrationService.createDemoUsers().then(() => {
      this.isLoading = false;
      this.snackBar.open('✅ Tạo demo users thành công!', 'Đóng', {
        duration: 3000
      });
      this.loadUsers();
    }).catch((error: any) => {
      this.isLoading = false;
      console.error('Error creating demo users:', error);
      this.snackBar.open('❌ Lỗi khi tạo demo users', 'Đóng', {
        duration: 3000
      });
    });
  }

  clearAllUsers(): void {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả người dùng? Hành động này không thể hoàn tác!')) {
      this.isLoading = true;
      this.migrationService.clearAllUsers().then(() => {
        this.isLoading = false;
        this.users = [];
        this.snackBar.open('✅ Đã xóa tất cả người dùng', 'Đóng', {
          duration: 3000
        });
      }).catch((error: any) => {
        this.isLoading = false;
        console.error('Error deleting users:', error);
        this.snackBar.open('❌ Lỗi khi xóa người dùng', 'Đóng', {
          duration: 3000
        });
      });
    }
  }
}