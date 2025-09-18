import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserManagementFirebaseService } from './user-management-firebase.service';
import { FirebaseService } from './firebase.service';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private userManagementService: UserManagementFirebaseService,
    private router: Router,
    private firebaseService: FirebaseService
  ) {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    // Subscribe Firebase auth state
    onAuthStateChanged(this.firebaseService.getAuth(), async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          this.tokenSubject.next(token);
          this.isAuthenticatedSubject.next(true);

          // Try to map Firebase user to app user by email
          const users = await this.userManagementService.getUsers().pipe(take(1)).toPromise();
          const matchedUser = (users || []).find(u => u.email?.toLowerCase() === (fbUser.email || '').toLowerCase() || u.username?.toLowerCase() === (fbUser.email || '').toLowerCase());

          if (matchedUser) {
            // Refresh user data to ensure roles are properly loaded
            try {
              const refreshedUser = await this.userManagementService.getUserById(matchedUser.id).toPromise();
              if (refreshedUser) {
                this.currentUserSubject.next(refreshedUser);
                localStorage.setItem('currentUser', JSON.stringify(refreshedUser));
                localStorage.setItem('authToken', token);
              } else {
                this.currentUserSubject.next(matchedUser);
                localStorage.setItem('currentUser', JSON.stringify(matchedUser));
                localStorage.setItem('authToken', token);
              }
            } catch (refreshError) {
              console.warn('Could not refresh user data, using original user:', refreshError);
              this.currentUserSubject.next(matchedUser);
              localStorage.setItem('currentUser', JSON.stringify(matchedUser));
              localStorage.setItem('authToken', token);
            }
          } else {
            // Minimal fallback mapping if no profile found
            const minimalUser: User = {
              id: fbUser.uid,
              username: fbUser.email || fbUser.uid,
              email: fbUser.email || '',
              fullName: fbUser.displayName || (fbUser.email || ''),
              isActive: true,
              roles: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            this.currentUserSubject.next(minimalUser);
            localStorage.setItem('currentUser', JSON.stringify(minimalUser));
            localStorage.setItem('authToken', token);
          }
        } catch (err) {
          console.error('Error handling auth state change:', err);
          this.clearAuthData();
        }
      } else {
        this.clearAuthData();
      }
    });

    // Load from storage for initial paint (will be reconciled by onAuthStateChanged)
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        this.tokenSubject.next(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  async login(usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Use Firebase Auth (treat username field as email)
      const credential = await signInWithEmailAndPassword(this.firebaseService.getAuth(), usernameOrEmail, password);
      const fbUser = credential.user;
      const token = await fbUser.getIdToken();

      // Map Firebase user to app user by email/username
      const users = await this.userManagementService.getUsers().pipe(take(1)).toPromise() || [];
      const appUser = users.find(u => u.email?.toLowerCase() === (fbUser.email || '').toLowerCase() || u.username?.toLowerCase() === (fbUser.email || '').toLowerCase());

      if (!appUser) {
        // Allow login but with minimal user; optional: restrict if no profile
        const minimalUser: User = {
          id: fbUser.uid,
          username: fbUser.email || fbUser.uid,
          email: fbUser.email || '',
          fullName: fbUser.displayName || (fbUser.email || ''),
          isActive: true,
          roles: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        this.setAuthData(minimalUser, token);
        this.router.navigate(['/dashboard']);
        return { success: true, message: 'Đăng nhập thành công', user: minimalUser };
      }

      // Update last login (best-effort)
      try {
        await this.userManagementService.updateUser(appUser.id, { lastLogin: new Date() }).pipe(take(1)).toPromise();
      } catch (updateError) {
        console.warn('Could not update last login:', updateError);
      }

      // Refresh user data to ensure roles are properly loaded
      try {
        const refreshedUser = await this.userManagementService.getUserById(appUser.id).toPromise();
        if (refreshedUser) {
          this.setAuthData(refreshedUser, token);
          this.router.navigate(['/dashboard']);
          return { success: true, message: 'Đăng nhập thành công', user: refreshedUser };
        }
      } catch (refreshError) {
        console.warn('Could not refresh user data, using original user:', refreshError);
      }
      
      this.setAuthData(appUser, token);
      this.router.navigate(['/dashboard']);
      return { success: true, message: 'Đăng nhập thành công', user: appUser };
    } catch (error: any) {
      console.error('Firebase login error:', error);
      const message = this.translateFirebaseError(error?.code) || 'Tên đăng nhập hoặc mật khẩu không đúng';
      return { success: false, message };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const auth = this.firebaseService.getAuth();
      const fbUser = auth.currentUser;
      if (!fbUser || !fbUser.email) {
        return { success: false, message: 'Không xác định được người dùng hiện tại' };
      }

      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPassword);

      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error: any) {
      console.error('Change password error:', error);
      let message = 'Không thể đổi mật khẩu';
      switch (error?.code) {
        case 'auth/weak-password':
          message = 'Mật khẩu mới quá yếu';
          break;
        case 'auth/wrong-password':
          message = 'Mật khẩu hiện tại không đúng';
          break;
        case 'auth/too-many-requests':
          message = 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau';
          break;
        default:
          break;
      }
      return { success: false, message };
    }
  }

  logout(): void {
    signOut(this.firebaseService.getAuth()).finally(() => {
      this.clearAuthData();
      this.router.navigate(['/dang-nhap']);
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  hasPermission(permission: string): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }
    return this.userManagementService.hasPermission(currentUser.id, permission);
  }

  hasRole(roleName: string): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return of(false);
    }
    return this.userManagementService.hasRole(currentUser.id, roleName);
  }

  hasAnyRole(roleNames: string[]): Observable<boolean> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.roles) {
      return of(false);
    }
    const hasAnyRole = currentUser.roles.some(userRole => {
      const roleName = typeof userRole === 'string' ? userRole : (userRole as any).name;
      return roleNames.includes(roleName);
    });
    return of(hasAnyRole);
  }

  // Token validity handled by Firebase; keep 24h fallback for stored token
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1] || ''));
      const nowSeconds = Math.floor(Date.now() / 1000);
      return tokenData && tokenData.exp && nowSeconds < tokenData.exp;
    } catch (error) {
      return false;
    }
  }

  async refreshUserData(): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return;
    try {
      const user = await this.userManagementService.getUserById(currentUser.id).toPromise();
      if (user) {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }

  private setAuthData(user: User, token: string): void {
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
    this.tokenSubject.next(token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('authToken', token);
  }

  private clearAuthData(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tokenSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  }

  private translateFirebaseError(code?: string): string | null {
    switch (code) {
      case 'auth/invalid-email':
        return 'Email không hợp lệ';
      case 'auth/user-disabled':
        return 'Tài khoản đã bị vô hiệu hóa';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Tên đăng nhập hoặc mật khẩu không đúng';
      case 'auth/too-many-requests':
        return 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau';
      default:
        return null;
    }
  }

  // Additional methods for compatibility
  getUserInfo(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
