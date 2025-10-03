import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface ChangePasswordRequest {
  userId: string;
  newPassword: string;
  adminUserId: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPasswordService {
  // Sử dụng Firebase Cloud Functions
  private readonly FUNCTIONS_URL: string;

  constructor(private http: HttpClient, private firebaseService: FirebaseService) {
    // Lấy Project ID từ Firebase config
    const projectId = (this.firebaseService as any).getProjectId?.() || 'your-project-id';
    this.FUNCTIONS_URL = `https://us-central1-${projectId}.cloudfunctions.net`;
    console.log('Cloud Functions URL:', this.FUNCTIONS_URL);
  }

  /**
   * Đổi mật khẩu của user thông qua Firebase Cloud Functions
   * @param userId ID của user cần đổi mật khẩu
   * @param newPassword Mật khẩu mới
   * @param adminUserId ID của admin đang thực hiện
   * @returns Observable<ChangePasswordResponse>
   */
  changeUserPassword(userId: string, newPassword: string, adminUserId: string): Observable<ChangePasswordResponse> {
    const request: ChangePasswordRequest = {
      userId,
      newPassword,
      adminUserId
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ChangePasswordResponse>(
      `${this.FUNCTIONS_URL}/changeUserPassword`,
      request,
      { headers }
    );
  }

  /**
   * Kiểm tra xem admin có quyền đổi mật khẩu không
   * @param adminUserId ID của admin
   * @returns Observable<boolean>
   */
  checkAdminPermission(adminUserId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.FUNCTIONS_URL}/checkAdminPermission/${adminUserId}`);
  }

  /**
   * Fallback method sử dụng Firebase Client SDK (có giới hạn)
   * Chỉ dùng khi Cloud Functions không khả dụng
   */
  async changeUserPasswordFallback(userId: string, newPassword: string): Promise<boolean> {
    try {
      // Import Firebase Auth
      const { getAuth, updatePassword } = await import('firebase/auth');
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.error('No current user found');
        return false;
      }

      // Chỉ có thể đổi mật khẩu của chính mình
      await updatePassword(currentUser, newPassword);
      return true;
      
    } catch (error) {
      console.error('Fallback password change failed:', error);
      return false;
    }
  }
}
