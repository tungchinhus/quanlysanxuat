import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { FirebaseService } from '../../services/firebase.service';
import { User, UserRole, USER_ROLES } from '../../models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedColumns: string[] = ['displayName', 'email', 'role', 'department', 'isActive', 'createdAt', 'actions'];
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalUsers = 0;
  
  // Search
  searchForm: FormGroup;
  searchTerm = '';
  
  // Loading states
  isLoading = false;
  isSearching = false;
  
  // User roles
  userRoles = Object.values(UserRole);
  roleConfig = USER_ROLES;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      roleFilter: [''],
      statusFilter: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm = value;
        this.applyFilters();
      });

    this.searchForm.get('roleFilter')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.searchForm.get('statusFilter')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  loadUsers(): void {
    this.isLoading = true;
    this.firebaseService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          this.totalUsers = users.length;
          this.applyFilters();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.snackBar.open('Lỗi khi tải danh sách người dùng', 'Đóng', {
            duration: 3000
          });
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.users];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term)
      );
    }

    // Role filter
    const roleFilter = this.searchForm.get('roleFilter')?.value;
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    const statusFilter = this.searchForm.get('statusFilter')?.value;
    if (statusFilter !== '') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = filtered;
    this.pageIndex = 0; // Reset to first page when filtering
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedUsers(): User[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  getRoleDisplayName(role: UserRole): string {
    return this.roleConfig[role]?.name || role;
  }

  getRoleColor(role: UserRole): string {
    const colors: { [key in UserRole]: string } = {
      [UserRole.ADMIN]: 'warn',
      [UserRole.TOTRUONG_QUANDAY]: 'primary',
      [UserRole.QUANDAY_HA]: 'accent',
      [UserRole.QUANDAY_CAO]: 'accent',
      [UserRole.EP_BOIDAY]: 'primary',
      [UserRole.KCS]: 'warn'
    };
    return colors[role] || 'primary';
  }

  openCreateUserDialog(): void {
    // TODO: Implement create user dialog
    this.snackBar.open('Tính năng tạo người dùng sẽ được triển khai', 'Đóng', {
      duration: 3000
    });
  }

  openEditUserDialog(user: User): void {
    // TODO: Implement edit user dialog
    this.snackBar.open('Tính năng chỉnh sửa người dùng sẽ được triển khai', 'Đóng', {
      duration: 3000
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.isActive;
    this.firebaseService.updateUser(user.id!, { isActive: newStatus })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          user.isActive = newStatus;
          this.snackBar.open(
            `Người dùng đã được ${newStatus ? 'kích hoạt' : 'vô hiệu hóa'}`,
            'Đóng',
            { duration: 3000 }
          );
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          this.snackBar.open('Lỗi khi cập nhật trạng thái người dùng', 'Đóng', {
            duration: 3000
          });
        }
      });
  }

  deleteUser(user: User): void {
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.displayName}"?`)) {
      this.firebaseService.deleteUser(user.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.users = this.users.filter(u => u.id !== user.id);
            this.applyFilters();
            this.snackBar.open('Người dùng đã được xóa', 'Đóng', {
              duration: 3000
            });
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.snackBar.open('Lỗi khi xóa người dùng', 'Đóng', {
              duration: 3000
            });
          }
        });
    }
  }

  clearFilters(): void {
    this.searchForm.patchValue({
      searchTerm: '',
      roleFilter: '',
      statusFilter: ''
    });
  }

  exportUsers(): void {
    // TODO: Implement export functionality
    this.snackBar.open('Tính năng xuất dữ liệu sẽ được triển khai', 'Đóng', {
      duration: 3000
    });
  }
}