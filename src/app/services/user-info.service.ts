import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {

  constructor(private authService: AuthService) { }

  /**
   * Lấy thông tin họ tên của user đang đăng nhập
   * @returns string - Họ tên đầy đủ của user
   */
  getCurrentUserFullName(): string {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return 'Người dùng';
    }

    // Ưu tiên fullName, sau đó là username, cuối cùng là email
    if (currentUser.fullName && currentUser.fullName.trim()) {
      return currentUser.fullName.trim();
    }
    
    if (currentUser.username && currentUser.username.trim()) {
      return currentUser.username.trim();
    }
    
    if (currentUser.email && currentUser.email.trim()) {
      return currentUser.email.split('@')[0]; // Lấy phần trước @ của email
    }
    
    return 'Người dùng';
  }

  /**
   * Lấy thông tin đầy đủ của user đang đăng nhập
   * @returns User | null - Thông tin user hoặc null nếu chưa đăng nhập
   */
  getCurrentUser(): User | null {
    return this.authService.getCurrentUser();
  }

  /**
   * Kiểm tra user có đang đăng nhập không
   * @returns boolean
   */
  isUserLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Lấy email của user đang đăng nhập
   * @returns string
   */
  getCurrentUserEmail(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.email || '';
  }

  /**
   * Lấy username của user đang đăng nhập
   * @returns string
   */
  getCurrentUsername(): string {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.username || '';
  }

  /**
   * Lấy roles của user đang đăng nhập
   * @returns string[]
   */
  getCurrentUserRoles(): string[] {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.roles || [];
  }

  /**
   * Kiểm tra user có role cụ thể không
   * @param roleName - Tên role cần kiểm tra
   * @returns boolean
   */
  hasRole(roleName: string): boolean {
    const roles = this.getCurrentUserRoles();
    return roles.includes(roleName);
  }

  /**
   * Lấy initials (chữ cái đầu) của user
   * @returns string
   */
  getCurrentUserInitials(): string {
    const fullName = this.getCurrentUserFullName();
    const words = fullName.split(' ');
    
    if (words.length >= 2) {
      // Lấy chữ cái đầu của từ đầu tiên và từ cuối cùng
      return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
    } else if (words.length === 1) {
      // Nếu chỉ có một từ, lấy 2 chữ cái đầu
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return 'U'; // Default
  }
}

