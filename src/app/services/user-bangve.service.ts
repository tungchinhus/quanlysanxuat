import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';
import { AuthService } from './auth.service';

export interface UserBangVeData {
  id?: number | string;
  user_id: number; // Foreign Key to users table
  firebase_uid?: string; // Firebase Authentication UID
  bangve_id: string; // Foreign Key to tbl_bangve (Firebase document ID)
  bd_ha_id?: number | null; // Foreign Key to tbl_bd_ha
  bd_cao_id?: number | null; // Foreign Key to tbl_bd_cao
  bd_ep_id?: number | null; // Foreign Key to tbl_ep_boiday
  permission_type?: string; // Type of permission (e.g., 'gia_cong', 'view', 'edit')
  status?: boolean; // Assignment status (true = active, false = inactive)
  trang_thai_bv?: number; // Status of the drawing assignment
  trang_thai_bd_ha?: number | null; // Status for low winding assignment (0 = chưa bắt đầu, 1 = đang thi công, 2 = đã hoàn thành)
  trang_thai_bd_cao?: number | null; // Status for high winding assignment (0 = chưa bắt đầu, 1 = đang thi công, 2 = đã hoàn thành)
  trang_thai_bd_ep?: number | null; // Status for pressing winding assignment (0 = chưa bắt đầu, 1 = đang thi công, 2 = đã hoàn thành)
  assigned_at?: Date; // Assignment timestamp
  assigned_by_user_id?: number; // User who made the assignment
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  updated_by?: number;
  // Legacy fields for backward compatibility
  khau_sx?: string; // 'bd_ha', 'bd_cao', 'bd_ep' - kept for compatibility
  trang_thai?: number; // Legacy status field - kept for compatibility
}

@Injectable({
  providedIn: 'root'
})
export class UserBangVeService {
  private readonly API_BASE_URL = 'https://localhost:7190/api/UserBangVe';

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private authService: AuthService
  ) {}

  /**
   * Thêm dữ liệu vào bảng user_bangve
   * @param data Dữ liệu user_bangve
   * @returns Observable<any>
   */
  addUserBangVe(data: UserBangVeData): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(this.API_BASE_URL, data, { headers });
  }

  /**
   * Thêm nhiều dữ liệu vào bảng user_bangve
   * @param dataList Danh sách dữ liệu user_bangve
   * @returns Observable<any>
   */
  addMultipleUserBangVe(dataList: UserBangVeData[]): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.API_BASE_URL}/multiple`, dataList, { headers });
  }

  /**
   * Lấy danh sách user_bangve theo user_id
   * @param userId ID của user
   * @returns Observable<UserBangVeData[]>
   */
  getUserBangVeByUserId(userId: number): Observable<UserBangVeData[]> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserBangVeData[]>(`${this.API_BASE_URL}/user/${userId}`, { headers });
  }

  /**
   * Lấy danh sách user_bangve theo bangve_id
   * @param bangveId ID của bảng vẽ
   * @returns Observable<UserBangVeData[]>
   */
  getUserBangVeByBangVeId(bangveId: number): Observable<UserBangVeData[]> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<UserBangVeData[]>(`${this.API_BASE_URL}/bangve/${bangveId}`, { headers });
  }

  /**
   * Cập nhật trạng thái user_bangve
   * @param id ID của user_bangve
   * @param trangThai Trạng thái mới
   * @returns Observable<any>
   */
  updateUserBangVeStatus(id: number, trangThai: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(`${this.API_BASE_URL}/${id}/status`, { trang_thai: trangThai }, { headers });
  }

  /**
   * Xóa user_bangve
   * @param id ID của user_bangve
   * @returns Observable<any>
   */
  deleteUserBangVe(id: number): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete<any>(`${this.API_BASE_URL}/${id}`, { headers });
  }

  /**
   * Tạo user mới với quy trình: Authentication trước, sau đó lưu vào Firestore
   * @param userData Dữ liệu user cần tạo
   * @param password Mật khẩu cho Firebase Authentication
   * @returns Observable<{ success: boolean; message: string; user?: any; firebaseUID?: string }>
   */
  createUserWithAuth(userData: any, password: string): Observable<{ success: boolean; message: string; user?: any; firebaseUID?: string }> {
    return new Observable(observer => {
      this.authService.createUserWithAuth(userData, password).then(result => {
        observer.next(result);
        observer.complete();
      }).catch(error => {
        observer.error(error);
      });
    });
  }
}
