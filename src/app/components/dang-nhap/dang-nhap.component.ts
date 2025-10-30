import { Component, OnInit, Inject } from '@angular/core';
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
import { firstValueFrom, of } from 'rxjs';
import { catchError, filter, take, timeout } from 'rxjs/operators';

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
    @Inject(FormBuilder) private fb: FormBuilder,
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

  // Redirect user based on their role (no arbitrary timeouts)
  private async redirectBasedOnRole(user: any): Promise<void> {
    this.isLoading = true;

    const navigateByRoles = (roleNames: string[]) => {
      const lower = roleNames.map(r => (r || '').toLowerCase());
      if (lower.some(r => r.includes('super_admin') || r.includes('superadmin'))) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('admin'))) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('manager'))) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('totruong'))) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('quandaycao') || r.includes('boidaycao') || r.includes('cao'))) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('quandayha') || r.includes('boidayha') || r.includes('ha'))) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('epboiday') || r.includes('boidayep') || r.includes('ep'))) {
        this.router.navigateByUrl('/ds-quan-day', { skipLocationChange: false });
        return;
      }
      if (lower.some(r => r.includes('kcs'))) {
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
        return;
      }
      this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
    };

    try {
      // If roles are already available, navigate immediately
      if (user && user.roles && (Array.isArray(user.roles) ? user.roles.length : 1) > 0) {
        const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
        const roleNames = roles.map((role: any) => typeof role === 'string' ? role : role.name || role.role_name);
        navigateByRoles(roleNames);
        return;
      }

      // Otherwise, wait for currentUser$ to emit with roles, with a safety timeout
      const awaitedUser = await firstValueFrom(
        this.authService.currentUser$.pipe(
          filter(u => !!u && Array.isArray((u as any).roles) && (u as any).roles.length > 0),
          take(1),
          timeout(4000),
          catchError(() => of(null))
        )
      );

      if (awaitedUser && (awaitedUser as any).roles) {
        const roles = (awaitedUser as any).roles;
        const roleNames = Array.isArray(roles) ? roles.map((r: any) => typeof r === 'string' ? r : r?.name || r?.role_name) : [roles];
        navigateByRoles(roleNames as string[]);
      } else {
        // Fallback if roles still unavailable
        this.router.navigateByUrl('/dashboard', { skipLocationChange: false });
      }
    } finally {
      this.isLoading = false;
    }
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
