import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserBangVeService } from '../../services/user-bangve.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-creation-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-creation-demo">
      <h2>Demo tạo User mới với Authentication</h2>
      
      <form (ngSubmit)="createUser()" #userForm="ngForm">
        <div class="form-group">
          <label for="username">Username:</label>
          <input 
            type="text" 
            id="username" 
            name="username" 
            [(ngModel)]="userData.username" 
            required 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            [(ngModel)]="userData.email" 
            required 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="fullName">Full Name:</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            [(ngModel)]="userData.fullName" 
            required 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="phone">Phone:</label>
          <input 
            type="tel" 
            id="phone" 
            name="phone" 
            [(ngModel)]="userData.phone" 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="department">Department:</label>
          <input 
            type="text" 
            id="department" 
            name="department" 
            [(ngModel)]="userData.department" 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="position">Position:</label>
          <input 
            type="text" 
            id="position" 
            name="position" 
            [(ngModel)]="userData.position" 
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="roles">Roles (comma separated):</label>
          <input 
            type="text" 
            id="roles" 
            name="roles" 
            [(ngModel)]="rolesInput" 
            placeholder="user,admin,manager"
            class="form-control"
          >
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            [(ngModel)]="password" 
            required 
            class="form-control"
          >
        </div>

        <button 
          type="submit" 
          [disabled]="!userForm.valid || isLoading"
          class="btn btn-primary"
        >
          {{ isLoading ? 'Creating...' : 'Create User' }}
        </button>
      </form>

      <div *ngIf="result" class="result-section">
        <h3>Kết quả:</h3>
        <div [class]="result.success ? 'alert alert-success' : 'alert alert-danger'">
          <strong>{{ result.success ? 'Thành công' : 'Thất bại' }}:</strong> {{ result.message }}
        </div>
        
        <div *ngIf="result.success && result.user" class="user-info">
          <h4>Thông tin User đã tạo:</h4>
          <p><strong>ID:</strong> {{ result.user.id }}</p>
          <p><strong>UID:</strong> {{ result.user.uid || 'Chưa có' }}</p>
          <p><strong>Username:</strong> {{ result.user.username }}</p>
          <p><strong>Email:</strong> {{ result.user.email }}</p>
          <p><strong>Full Name:</strong> {{ result.user.fullName }}</p>
          <p><strong>Firebase UID:</strong> {{ result.firebaseUID }}</p>
          <p><strong>Roles:</strong> {{ result.user.roles?.join(', ') }}</p>
          <p><strong>Created At:</strong> {{ result.user.createdAt | date:'medium' }}</p>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        <strong>Lỗi:</strong> {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .user-creation-demo {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .result-section {
      margin-top: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .alert {
      padding: 10px;
      margin-bottom: 15px;
      border-radius: 4px;
    }

    .alert-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .alert-danger {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .user-info {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .user-info p {
      margin: 5px 0;
    }
  `]
})
export class UserCreationDemoComponent {
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    username: '',
    email: '',
    fullName: '',
    phone: '',
    department: '',
    position: '',
    isActive: true,
    roles: []
  };

  rolesInput: string = 'user';
  password: string = '';
  isLoading: boolean = false;
  result: any = null;
  error: string = '';

  constructor(private userBangVeService: UserBangVeService) {}

  createUser() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.result = null;
    this.error = '';

    // Parse roles from input
    this.userData.roles = this.rolesInput
      .split(',')
      .map(role => role.trim())
      .filter(role => role.length > 0);

    this.userBangVeService.createUserWithAuth(this.userData, this.password).subscribe({
      next: (result) => {
        this.isLoading = false;
        this.result = result;
        
        if (result.success) {
          console.log('User created successfully:', result.user);
          console.log('Firebase UID:', result.firebaseUID);
        } else {
          console.error('Failed to create user:', result.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = error.message || 'Có lỗi xảy ra khi tạo user';
        console.error('Error creating user:', error);
      }
    });
  }

  private validateForm(): boolean {
    if (!this.userData.username || !this.userData.email || !this.userData.fullName || !this.password) {
      this.error = 'Vui lòng điền đầy đủ thông tin bắt buộc';
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.error = 'Email không hợp lệ';
      return false;
    }

    // Password validation
    if (this.password.length < 6) {
      this.error = 'Mật khẩu phải có ít nhất 6 ký tự';
      return false;
    }

    return true;
  }

  resetForm() {
    this.userData = {
      username: '',
      email: '',
      fullName: '',
      phone: '',
      department: '',
      position: '',
      isActive: true,
      roles: []
    };
    this.rolesInput = 'user';
    this.password = '';
    this.result = null;
    this.error = '';
  }
}
