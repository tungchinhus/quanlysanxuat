// Ví dụ đơn giản để lấy thông tin user và định dạng ngày tháng
// Copy code này vào component của bạn

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfoService } from '../services/user-info.service';
import { DateFormatService } from '../services/date-format.service';

@Component({
  selector: 'app-simple-example',
  imports: [CommonModule],
  template: `
    <div class="simple-user-info">
      <!-- Hiển thị thông tin user -->
      <div *ngIf="isLoggedIn" class="user-section">
        <h3>Thông tin người dùng</h3>
        <p><strong>Họ tên:</strong> {{ userFullName }}</p>
        <p><strong>Email:</strong> {{ userEmail }}</p>
        <p><strong>Username:</strong> {{ userUsername }}</p>
        <p><strong>Roles:</strong> {{ userRoles }}</p>
      </div>

      <!-- Hiển thị ngày tháng -->
      <div class="date-section">
        <h3>Thông tin ngày tháng</h3>
        <p><strong>Ngày hiện tại:</strong> {{ currentDate }}</p>
        <p><strong>Ngày giờ hiện tại:</strong> {{ currentDateTime }}</p>
        <p><strong>Ngày tạo tài khoản:</strong> {{ accountCreatedDate }}</p>
        <p><strong>Lần đăng nhập cuối:</strong> {{ lastLoginDate }}</p>
      </div>

      <!-- Thông báo nếu chưa đăng nhập -->
      <div *ngIf="!isLoggedIn" class="warning">
        <p>Bạn chưa đăng nhập!</p>
      </div>
    </div>
  `,
  styles: [`
    .simple-user-info {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    
    .user-section, .date-section {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    
    .user-section h3, .date-section h3 {
      margin-top: 0;
      color: #333;
    }
    
    .warning {
      background-color: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
    }
    
    p {
      margin: 8px 0;
    }
  `]
})
export class SimpleUserInfoExample implements OnInit {
  // Biến để lưu thông tin user
  userFullName: string = '';
  userEmail: string = '';
  userUsername: string = '';
  userRoles: string = '';
  isLoggedIn: boolean = false;

  // Biến để lưu thông tin ngày tháng
  currentDate: string = '';
  currentDateTime: string = '';
  accountCreatedDate: string = '';
  lastLoginDate: string = '';

  constructor(
    private userInfoService: UserInfoService,
    private dateFormatService: DateFormatService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDateInfo();
  }

  /**
   * Load thông tin user đang đăng nhập
   */
  private loadUserInfo(): void {
    // Kiểm tra user có đăng nhập không
    this.isLoggedIn = this.userInfoService.isUserLoggedIn();
    
    if (this.isLoggedIn) {
      // Lấy thông tin user
      this.userFullName = this.userInfoService.getCurrentUserFullName();
      this.userEmail = this.userInfoService.getCurrentUserEmail();
      this.userUsername = this.userInfoService.getCurrentUsername();
      this.userRoles = this.userInfoService.getCurrentUserRoles().join(', ');

      // Lấy thông tin ngày từ user
      const currentUser = this.userInfoService.getCurrentUser();
      if (currentUser) {
        // Định dạng ngày tạo tài khoản
        this.accountCreatedDate = this.dateFormatService.formatVietnameseDate(currentUser.createdAt);
        
        // Định dạng lần đăng nhập cuối
        if (currentUser.lastLogin) {
          this.lastLoginDate = this.dateFormatService.formatVietnameseDate(currentUser.lastLogin);
        } else {
          this.lastLoginDate = 'Chưa có thông tin';
        }
      }
    }
  }

  /**
   * Load thông tin ngày tháng hiện tại
   */
  private loadDateInfo(): void {
    // Lấy ngày hiện tại theo múi giờ Việt Nam
    this.currentDate = this.dateFormatService.getCurrentVietnameseDate();
    this.currentDateTime = this.dateFormatService.getCurrentVietnameseDateTime();
  }

  /**
   * Ví dụ các phương thức khác bạn có thể sử dụng
   */
  
  // Kiểm tra user có role cụ thể không
  checkUserRole(roleName: string): boolean {
    return this.userInfoService.hasRole(roleName);
  }

  // Lấy initials của user
  getUserInitials(): string {
    return this.userInfoService.getCurrentUserInitials();
  }

  // Định dạng một ngày bất kỳ
  formatAnyDate(date: Date | string): string {
    return this.dateFormatService.formatVietnameseDate(date);
  }

  // Định dạng ngày giờ
  formatAnyDateTime(date: Date | string): string {
    return this.dateFormatService.formatVietnameseDateTime(date);
  }

  // Chuyển đổi string ngày Việt Nam thành Date object
  parseVietnameseDateString(dateString: string): Date | null {
    return this.dateFormatService.parseVietnameseDate(dateString);
  }
}

// ========================================
// CÁCH SỬ DỤNG TRONG COMPONENT KHÁC:
// ========================================

/*
1. Import các service vào component của bạn:

import { UserInfoService } from '../services/user-info.service';
import { DateFormatService } from '../services/date-format.service';

2. Inject vào constructor:

constructor(
  private userInfoService: UserInfoService,
  private dateFormatService: DateFormatService
) {}

3. Sử dụng trong component:

// Lấy họ tên user
const fullName = this.userInfoService.getCurrentUserFullName();

// Lấy ngày hiện tại
const currentDate = this.dateFormatService.getCurrentVietnameseDate();

// Định dạng ngày bất kỳ
const formattedDate = this.dateFormatService.formatVietnameseDate(someDate);

4. Sử dụng trong template:

<p>Xin chào {{ userInfoService.getCurrentUserFullName() }}!</p>
<p>Hôm nay là {{ dateFormatService.getCurrentVietnameseDate() }}</p>
<p>Ngày tạo: {{ user?.createdAt | date:'dd/MM/yyyy' }}</p>
*/

