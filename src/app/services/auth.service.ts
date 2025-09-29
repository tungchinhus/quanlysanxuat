import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserManagementFirebaseService } from './user-management-firebase.service';
import { FirebaseService } from './firebase.service';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser, createUserWithEmailAndPassword } from 'firebase/auth';
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
            // Check if this is a special demo user and assign appropriate role
            let assignedRoles: string[] = [];
            if (fbUser.email?.toLowerCase().includes('totruong')) {
              assignedRoles = ['totruong'];
            } else if (fbUser.email?.toLowerCase().includes('quandaycao') || fbUser.email?.toLowerCase().includes('boidaycao')) {
              assignedRoles = ['quandaycao'];
            } else if (fbUser.email?.toLowerCase().includes('quandayha') || fbUser.email?.toLowerCase().includes('boidayha')) {
              assignedRoles = ['quandayha'];
            } else if (fbUser.email?.toLowerCase().includes('epboiday') || fbUser.email?.toLowerCase().includes('boidayep')) {
              assignedRoles = ['epboiday'];
            } else if (fbUser.email?.toLowerCase().includes('kcs')) {
              assignedRoles = ['kcs'];
            } else if (fbUser.email?.toLowerCase().includes('admin')) {
              assignedRoles = ['admin'];
            } else if (fbUser.email?.toLowerCase().includes('manager')) {
              assignedRoles = ['manager'];
            } else {
              assignedRoles = ['user']; // Default role
            }

            // Minimal fallback mapping if no profile found
            const minimalUser: User = {
              id: fbUser.uid,
              uid: fbUser.uid, // Set uid field to Firebase UID
              username: fbUser.email || fbUser.uid,
              email: fbUser.email || '',
              fullName: fbUser.displayName || (fbUser.email || ''),
              isActive: true,
              roles: assignedRoles,
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
      // First, get all users to find the correct email for username
      const users = await this.userManagementService.getUsers().pipe(take(1)).toPromise() || [];
      
      // Check if input is email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailRegex.test(usernameOrEmail);
      
      let actualEmail = usernameOrEmail;
      let appUser: User | undefined;
      
      if (isEmail) {
        // Input is email, find user by email
        appUser = users.find(u => u.email?.toLowerCase() === usernameOrEmail.toLowerCase());
        actualEmail = usernameOrEmail;
      } else {
        // Input is username, find user by username and get their email
        appUser = users.find(u => u.username?.toLowerCase() === usernameOrEmail.toLowerCase());
        if (appUser && appUser.email) {
          actualEmail = appUser.email;
        } else {
          return { success: false, message: 'Tên đăng nhập không tồn tại' };
        }
      }
      
      if (!appUser) {
        // Check if this is a demo user that should be allowed to login
        if (actualEmail.toLowerCase().includes('totruong') || 
            actualEmail.toLowerCase().includes('admin') || 
            actualEmail.toLowerCase().includes('manager') ||
            actualEmail.toLowerCase().includes('user') ||
            actualEmail.toLowerCase().includes('quandaycao') ||
            actualEmail.toLowerCase().includes('boidaycao') ||
            actualEmail.toLowerCase().includes('quandayha') ||
            actualEmail.toLowerCase().includes('boidayha') ||
            actualEmail.toLowerCase().includes('epboiday') ||
            actualEmail.toLowerCase().includes('boidayep') ||
            actualEmail.toLowerCase().includes('kcs')) {
          // Allow login for demo users even if not in database
          console.log('Demo user login allowed:', actualEmail);
        } else {
          return { success: false, message: 'Tài khoản không tồn tại' };
        }
      }
      
      // Use the actual email for Firebase authentication
      const credential = await signInWithEmailAndPassword(this.firebaseService.getAuth(), actualEmail, password);
      const fbUser = credential.user;
      const token = await fbUser.getIdToken();

      // Update last login (best-effort) - only if appUser exists
      if (appUser) {
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
            // Don't redirect here - let the login component handle redirect based on role
            return { success: true, message: 'Đăng nhập thành công', user: refreshedUser };
          }
        } catch (refreshError) {
          console.warn('Could not refresh user data, using original user:', refreshError);
        }
      }
      
      // If appUser exists, use it; otherwise create a minimal user with appropriate role
      if (appUser) {
        this.setAuthData(appUser, token);
        // Don't redirect here - let the login component handle redirect based on role
        return { success: true, message: 'Đăng nhập thành công', user: appUser };
      } else {
        // Create minimal user for demo accounts
        let assignedRoles: string[] = [];
        if (actualEmail.toLowerCase().includes('totruong')) {
          assignedRoles = ['totruong'];
        } else if (actualEmail.toLowerCase().includes('admin')) {
          assignedRoles = ['admin'];
        } else if (actualEmail.toLowerCase().includes('manager')) {
          assignedRoles = ['manager'];
        } else {
          assignedRoles = ['user'];
        }

        const minimalUser: User = {
          id: fbUser.uid,
          uid: fbUser.uid, // Set uid field to Firebase UID
          username: actualEmail.split('@')[0],
          email: actualEmail,
          fullName: actualEmail.split('@')[0],
          isActive: true,
          roles: assignedRoles,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        this.setAuthData(minimalUser, token);
        // Don't redirect here - let the login component handle redirect based on role
        return { success: true, message: 'Đăng nhập thành công', user: minimalUser };
      }
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

  /**
   * Tạo user mới với quy trình: Authentication trước, sau đó lưu vào Firestore
   * @param userData Dữ liệu user cần tạo
   * @param password Mật khẩu cho Firebase Authentication
   * @returns Promise<{ success: boolean; message: string; user?: User; firebaseUID?: string }>
   */
  async createUserWithAuth(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string): Promise<{ success: boolean; message: string; user?: User; firebaseUID?: string }> {
    try {
      console.log('Creating user with authentication:', userData.email);
      
      // Bước 1: Tạo user trong Firebase Authentication
      const credential = await createUserWithEmailAndPassword(
        this.firebaseService.getAuth(), 
        userData.email, 
        password
      );
      const firebaseUser = credential.user;
      const firebaseUID = firebaseUser.uid;
      
      console.log('Firebase Authentication user created with UID:', firebaseUID);
      
      // Bước 2: Tạo user data với Firebase UID làm ID
      const newUser: User = {
        ...userData,
        id: firebaseUID, // Sử dụng Firebase UID làm document ID
        uid: firebaseUID, // Set uid field to Firebase UID
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Bước 3: Lưu user data vào Firestore với documentID là Firebase UID
      try {
        // Sử dụng method mới để tạo user với document ID cụ thể
        const createdUser = await this.userManagementService.createUserWithDocumentId(
          userData, 
          firebaseUID
        ).pipe(take(1)).toPromise();
        console.log('User data saved to Firestore:', createdUser);
        
        return { 
          success: true, 
          message: 'Tạo user thành công', 
          user: createdUser, 
          firebaseUID: firebaseUID 
        };
      } catch (firestoreError) {
        console.error('Error saving user to Firestore:', firestoreError);
        // Nếu lưu Firestore thất bại, xóa user khỏi Authentication
        try {
          await firebaseUser.delete();
          console.log('Firebase Authentication user deleted due to Firestore error');
        } catch (deleteError) {
          console.error('Error deleting Firebase Authentication user:', deleteError);
        }
        
        return { 
          success: false, 
          message: 'Tạo user thất bại: Không thể lưu dữ liệu user' 
        };
      }
    } catch (error: any) {
      console.error('Error creating user with authentication:', error);
      let message = 'Không thể tạo user';
      
      switch (error?.code) {
        case 'auth/email-already-in-use':
          message = 'Email đã được sử dụng';
          break;
        case 'auth/invalid-email':
          message = 'Email không hợp lệ';
          break;
        case 'auth/weak-password':
          message = 'Mật khẩu quá yếu';
          break;
        case 'auth/operation-not-allowed':
          message = 'Tạo tài khoản không được phép';
          break;
        default:
          message = error?.message || 'Lỗi không xác định';
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
    // First try to get from subject
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      return currentUser;
    }
    
    // Fallback to localStorage if subject is null (e.g., after page reload)
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Update subject with stored user
        this.currentUserSubject.next(parsedUser);
        return parsedUser;
      }
    } catch (error) {
      console.error('Error parsing stored user from localStorage:', error);
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    // First try to get from subject
    const isAuth = this.isAuthenticatedSubject.value;
    if (isAuth) {
      return isAuth;
    }
    
    // Fallback to localStorage if subject is false (e.g., after page reload)
    try {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('currentUser');
      if (token && user) {
        // Update subject with stored state
        this.isAuthenticatedSubject.next(true);
        return true;
      }
    } catch (error) {
      console.error('Error checking authentication from localStorage:', error);
    }
    
    return false;
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

  // Redirect user based on their role
  private redirectBasedOnRole(user: User): void {
    if (!user || !user.roles) {
      this.router.navigate(['/dashboard']);
      return;
    }

    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const roleNames = roles.map((role: any) => typeof role === 'string' ? role : role.name || role.role_name);

    // Check for bối dây cao role
    if (roleNames.some((role: any) => 
      role?.toLowerCase().includes('quandaycao') || 
      role?.toLowerCase().includes('boidaycao') ||
      role?.toLowerCase().includes('cao')
    )) {
      this.router.navigate(['/ds-quan-day']);
      return;
    }

    // Check for bối dây hạ role
    if (roleNames.some((role: any) => 
      role?.toLowerCase().includes('quandayha') || 
      role?.toLowerCase().includes('boidayha') ||
      role?.toLowerCase().includes('ha')
    )) {
      this.router.navigate(['/ds-quan-day']);
      return;
    }

    // Check for ép bối dây role
    if (roleNames.some((role: any) => 
      role?.toLowerCase().includes('epboiday') || 
      role?.toLowerCase().includes('boidayep') ||
      role?.toLowerCase().includes('ep')
    )) {
      this.router.navigate(['/ds-quan-day']);
      return;
    }

    // Check for KCS role
    if (roleNames.some((role: any) => 
      role?.toLowerCase().includes('kcs')
    )) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Default redirect to dashboard
    this.router.navigate(['/dashboard']);
  }

  // Additional methods for compatibility
  getUserInfo(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
