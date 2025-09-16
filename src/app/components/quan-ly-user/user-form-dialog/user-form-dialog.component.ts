import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { AuthService } from '../../../services/auth.service';
import { User, UserRole, USER_ROLES } from '../../../models/user.model';

export interface UserFormData {
  mode: 'add' | 'edit';
  user?: User;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss'
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  userRoles = Object.values(UserRole);
  roleConfigs = USER_ROLES;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.userForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      department: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.populateForm(this.data.user);
    }
  }

  private populateForm(user: User): void {
    this.userForm.patchValue({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      department: user.department,
      isActive: user.isActive
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      const formValue = this.userForm.value;

      if (this.data.mode === 'add') {
        this.createUser(formValue);
      } else {
        this.updateUser(formValue);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUser(userData: any): void {
    const newUser: Omit<User, 'id'> = {
      ...userData,
      createdAt: new Date(),
      createdBy: this.authService.getCurrentUser()?.id || 'system'
    };

    this.authService.createUserProfile(newUser).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Tạo người dùng thành công', 'Đóng', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Lỗi khi tạo người dùng', 'Đóng', {
          duration: 3000
        });
        console.error('Error creating user:', error);
      }
    });
  }

  private updateUser(userData: any): void {
    if (!this.data.user?.id) return;

    this.authService.updateUserProfile(this.data.user.id, userData).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Cập nhật người dùng thành công', 'Đóng', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Lỗi khi cập nhật người dùng', 'Đóng', {
          duration: 3000
        });
        console.error('Error updating user:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} là bắt buộc`;
    }
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} phải có ít nhất 2 ký tự`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      displayName: 'Họ tên',
      email: 'Email',
      role: 'Vai trò',
      department: 'Phòng ban'
    };
    return fieldNames[fieldName] || fieldName;
  }

  getRoleDisplayName(role: UserRole): string {
    return this.roleConfigs[role]?.name || role;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
