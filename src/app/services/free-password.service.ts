import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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
export class FreePasswordService {
  constructor(private http: HttpClient) {}

  /**
   * Giải pháp miễn phí: Sử dụng Firebase Client SDK
   * Tạo Firebase Auth account mới hoặc cập nhật mật khẩu cho user
   */
  async changeUserPasswordFree(userId: string, newPassword: string): Promise<ChangePasswordResponse> {
    try {
      // Import Firebase Auth
      const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, signOut } = await import('firebase/auth');
      
      const auth = getAuth();
      
      // Lấy thông tin user từ Firestore
      const userInfo = await this.getUserInfo(userId);
      if (!userInfo || !userInfo.email) {
        return {
          success: false,
          message: 'Không tìm thấy thông tin user hoặc email'
        };
      }

      // Kiểm tra xem user đã có Firebase Auth account chưa
      const hasAuthAccount = await this.checkUserAuthStatus(userId);
      
      if (!hasAuthAccount) {
        // User chưa có Firebase Auth account - tạo mới với mật khẩu mới
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, userInfo.email, newPassword);
          
          // Cập nhật Firestore với Firebase UID
          await this.updateUserFirebaseUID(userId, userCredential.user.uid);
          
          // Đăng xuất
          await signOut(auth);
          
          return {
            success: true,
            message: 'Đã tạo Firebase Auth account và đặt mật khẩu thành công'
          };
          
        } catch (createError: any) {
          if (createError.code === 'auth/email-already-in-use') {
            // Email đã tồn tại nhưng không có trong Firestore - thử đăng nhập với mật khẩu mới
            return await this.tryLoginWithNewPassword(userInfo.email, newPassword, userId);
          }
          
          return {
            success: false,
            message: `Lỗi tạo Firebase Auth account: ${createError.message}`
          };
        }
      } else {
        // User đã có Firebase Auth account - cần mật khẩu hiện tại để đổi
        return {
          success: false,
          message: 'User đã có Firebase Auth account. Cần mật khẩu hiện tại để đổi mật khẩu. Vui lòng sử dụng Cloud Functions.'
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  /**
   * Thử đăng nhập với mật khẩu mới (khi email đã tồn tại)
   */
  private async tryLoginWithNewPassword(email: string, newPassword: string, userId: string): Promise<ChangePasswordResponse> {
    try {
      const { getAuth, signInWithEmailAndPassword, updatePassword, signOut } = await import('firebase/auth');
      const auth = getAuth();
      
      // Thử đăng nhập với mật khẩu mới (có thể user đã đổi mật khẩu trước đó)
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, newPassword);
        
        // Cập nhật Firestore với Firebase UID
        await this.updateUserFirebaseUID(userId, userCredential.user.uid);
        
        // Đăng xuất
        await signOut(auth);
        
        return {
          success: true,
          message: 'Đã cập nhật mật khẩu thành công'
        };
        
      } catch (loginError: any) {
        return {
          success: false,
          message: `Không thể đăng nhập với mật khẩu mới. Lỗi: ${loginError.message}`
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  /**
   * Thiết lập mật khẩu tạm thời cho user (chỉ làm một lần)
   */
  async setupTempPassword(userId: string, email: string): Promise<ChangePasswordResponse> {
    try {
      // Import Firebase Auth
      const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
      
      const auth = getAuth();
      const tempPassword = 'TempPassword123!';
      
      try {
        // Tạo user với mật khẩu tạm thời
        const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
        
        // Cập nhật Firestore với Firebase UID
        await this.updateUserFirebaseUID(userId, userCredential.user.uid);
        
        return {
          success: true,
          message: 'Đã thiết lập mật khẩu tạm thời thành công'
        };
        
      } catch (createError: any) {
        if (createError.code === 'auth/email-already-in-use') {
          return {
            success: true,
            message: 'User đã tồn tại trong Firebase Auth'
          };
        }
        
        return {
          success: false,
          message: `Lỗi tạo user: ${createError.message}`
        };
      }
      
    } catch (error: any) {
      return {
        success: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  /**
   * Lấy thông tin user từ Firestore
   */
  private async getUserInfo(userId: string): Promise<any> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const firestore = getFirestore();
      
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Cập nhật Firebase UID trong Firestore
   */
  private async updateUserFirebaseUID(userId: string, firebaseUID: string): Promise<void> {
    try {
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
      const firestore = getFirestore();
      
      await updateDoc(doc(firestore, 'users', userId), {
        uid: firebaseUID,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating Firebase UID:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem user đã có Firebase Auth account chưa
   */
  async checkUserAuthStatus(userId: string): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo(userId);
      if (!userInfo || !userInfo.email) {
        return false;
      }
      
      // Kiểm tra xem có Firebase UID trong Firestore không
      const hasFirebaseUID = !!(userInfo.uid || userInfo.firebaseUID || userInfo.firebase_uid);
      
      if (hasFirebaseUID) {
        console.log(`User ${userId} has Firebase UID: ${userInfo.uid || userInfo.firebaseUID || userInfo.firebase_uid}`);
        return true;
      }
      
      // Nếu không có Firebase UID, kiểm tra xem email có tồn tại trong Firebase Auth không
      try {
        const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
        const auth = getAuth();
        
        // Thử đăng nhập với mật khẩu tạm thời để kiểm tra
        const tempPassword = 'TempPassword123!';
        await signInWithEmailAndPassword(auth, userInfo.email, tempPassword);
        
        // Nếu đăng nhập thành công, có nghĩa là user đã có Firebase Auth account
        console.log(`User ${userId} has Firebase Auth account (login successful)`);
        return true;
        
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          // Email tồn tại nhưng mật khẩu sai - có nghĩa là user đã có Firebase Auth account
          console.log(`User ${userId} has Firebase Auth account (wrong password)`);
          return true;
        } else if (error.code === 'auth/user-not-found') {
          // User không tồn tại trong Firebase Auth
          console.log(`User ${userId} does not have Firebase Auth account (user not found)`);
          return false;
        } else {
          // Lỗi khác - giả sử là không có Firebase Auth account
          console.log(`User ${userId} does not have Firebase Auth account (other error: ${error.code})`);
          return false;
        }
      }
      
    } catch (error) {
      console.error('Error checking user auth status:', error);
      return false;
    }
  }
}
