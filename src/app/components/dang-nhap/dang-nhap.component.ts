import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dang-nhap',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  templateUrl: './dang-nhap.component.html',
  styleUrl: './dang-nhap.component.css'
})
export class DangNhapComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;
  rememberMe = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, this.usernameOrEmailValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated()) {
      console.log('User is already authenticated, redirecting to dashboard');
      this.router.navigate(['/dashboard']);
    } else {
      console.log('User is not authenticated, showing login form');
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password, rememberMe } = this.loginForm.value;
      
      this.authService.login(username, password).then(result => {
        this.isLoading = false;
        
        if (result.success) {
          this.snackBar.open(result.message, 'Đóng', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          // Store remember me preference
          if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberMe');
          }
          
          // Redirect based on user role
          this.redirectBasedOnRole(result.user);
        } else {
          this.snackBar.open(result.message, 'Đóng', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      }).catch(error => {
        this.isLoading = false;
        console.error('Login error:', error);
        this.snackBar.open('Có lỗi xảy ra khi đăng nhập', 'Đóng', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength'].requiredLength;
      return `Tối thiểu ${requiredLength} ký tự`;
    }
    if (field?.hasError('invalidFormat')) {
      return 'Vui lòng nhập tên đăng nhập hoặc email hợp lệ';
    }
    return '';
  }

  // Custom validator for username or email
  private usernameOrEmailValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const value = control.value.trim();
    
    // Check if it's a valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return null; // Valid email
    }
    
    // Check if it's a valid username (at least 3 characters, alphanumeric and some special chars)
    const usernameRegex = /^[a-zA-Z0-9._-]{3,}$/;
    if (usernameRegex.test(value)) {
      return null; // Valid username
    }
    
    return { invalidFormat: true };
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Redirect user based on their role
  private redirectBasedOnRole(user: any): void {
    // Show loading state to prevent flashing
    this.isLoading = true;
    
    if (!user || !user.roles) {
      // Wait longer to ensure auth data is fully set
      setTimeout(() => {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
      }, 1000); // Increased timeout
      return;
    }

    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const roleNames = roles.map((role: any) => typeof role === 'string' ? role : role.name || role.role_name);

    console.log('User roles for redirect:', roleNames);

    // Wait longer to ensure auth data is fully set, then redirect
    setTimeout(() => {
      // Check for super_admin role - highest priority
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('super_admin') || 
        role?.toLowerCase().includes('superadmin')
      )) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }

      // Check for admin role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('admin')
      )) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }

      // Check for manager role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('manager')
      )) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }

      // Check for totruong role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('totruong')
      )) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }

      // Check for bối dây cao role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('quandaycao') || 
        role?.toLowerCase().includes('boidaycao') ||
        role?.toLowerCase().includes('cao')
      )) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }

      // Check for bối dây hạ role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('quandayha') || 
        role?.toLowerCase().includes('boidayha') ||
        role?.toLowerCase().includes('ha')
      )) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }

      // Check for ép bối dây role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('epboiday') || 
        role?.toLowerCase().includes('boidayep') ||
        role?.toLowerCase().includes('ep')
      )) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }

      // Check for KCS role
      if (roleNames.some((role: any) => 
        role?.toLowerCase().includes('kcs')
      )) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }

      // Default redirect to dashboard
      this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
    }, 500);
  }

  // Demo accounts for testing
  fillDemoAccount(accountType: 'admin' | 'manager' | 'user' | 'email' | 'totruong' | 'quandayha' | 'quandaycao' | 'epboiday' | 'kcs'): void {
    const accounts = {
      admin: { username: 'admin', password: 'admin123' },
      manager: { username: 'manager1', password: 'manager123' },
      user: { username: 'user1', password: 'user123' },
      email: { username: 'user@example.com', password: 'user123' },
      totruong: { username: 'manager@thibidi.com', password: 'Ab!123456' },
      quandayha: { username: 'boidayha1@thibidi.com', password: 'Ab!123456' },
      quandaycao: { username: 'boidaycao1@thibidi.com', password: 'Ab!123456' },
      epboiday: { username: 'epboiday1@thibidi.com', password: 'Ab!123456' },
      kcs: { username: 'kcs1@thibidi.com', password: 'Ab!123456' }
    };
    
    const account = accounts[accountType];
    this.loginForm.patchValue(account);
  }
}
