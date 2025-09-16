import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-dang-nhap',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './dang-nhap.component.html',
  styleUrl: './dang-nhap.component.scss'
})
export class DangNhapComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in and redirect to dashboard
    if (this.authService.isUserAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const formValue = this.loginForm.value;
      
      // Convert username to email format for authentication
      const credentials: LoginRequest = {
        email: formValue.username.includes('@') ? formValue.username : `${formValue.username}@thibidi.com`,
        password: formValue.password
      };

      this.authService.login(credentials).subscribe({
        next: (user) => {
          this.isLoading = false;
          
          // Handle remember me functionality
          if (formValue.rememberMe) {
            localStorage.setItem('rememberedUser', formValue.username);
          } else {
            localStorage.removeItem('rememberedUser');
          }
          
          this.snackBar.open(`Chào mừng ${user.displayName}!`, 'Đóng', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open(error.message || 'Đăng nhập thất bại', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(fieldName)} là bắt buộc`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldDisplayName(fieldName)} phải có ít nhất 6 ký tự`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      username: 'Tên đăng nhập',
      password: 'Mật khẩu'
    };
    return fieldNames[fieldName] || fieldName;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  quickLogin(role: string): void {
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      manager: { username: 'manager1', password: 'manager123' },
      user: { username: 'user1', password: 'user123' }
    };

    const credentials = demoCredentials[role as keyof typeof demoCredentials];
    if (credentials) {
      this.loginForm.patchValue({
        username: credentials.username,
        password: credentials.password,
        rememberMe: false
      });
      
      // Auto submit the form
      this.onSubmit();
    }
  }
}
