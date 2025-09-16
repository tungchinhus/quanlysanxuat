import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, docData, collection, addDoc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { User as AppUser, UserRole } from '../models/user.model';
import { LoginRequest, AuthState } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);

  // BehaviorSubjects for reactive state management
  private authState = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null
  });

  // Public readonly observables
  public readonly isAuthenticated = this.authState.asObservable().pipe(
    map(state => state.isAuthenticated)
  );
  public readonly currentUser = this.authState.asObservable().pipe(
    map(state => state.user)
  );
  public readonly loading = this.authState.asObservable().pipe(
    map(state => state.loading)
  );
  public readonly error = this.authState.asObservable().pipe(
    map(state => state.error)
  );

  constructor() {
    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.getUserProfile(user.uid).subscribe({
          next: (appUser) => {
            if (appUser) {
              this.authState.next({
                isAuthenticated: true,
                user: appUser,
                loading: false,
                error: null
              });
            } else {
              // User not found in Firestore, create a basic user profile
              const basicUser: AppUser = {
                id: user.uid,
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                role: UserRole.ADMIN, // Default role
                department: 'Unknown',
                isActive: true,
                createdAt: new Date()
              };
              
              this.authState.next({
                isAuthenticated: true,
                user: basicUser,
                loading: false,
                error: null
              });
            }
          },
          error: (error) => {
            console.error('Error loading user profile:', error);
            this.authState.next({
              isAuthenticated: false,
              user: null,
              loading: false,
              error: 'Failed to load user profile'
            });
          }
        });
      } else {
        this.authState.next({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      }
    });
  }

  // Login method
  login(credentials: LoginRequest): Observable<any> {
    this.authState.next({ ...this.authState.value, loading: true, error: null });
    
    // Check if it's a username login (for demo accounts)
    if (!credentials.email.includes('@')) {
      return this.loginWithUsername(credentials.email, credentials.password);
    }
    
    return from(signInWithEmailAndPassword(this.auth, credentials.email, credentials.password)).pipe(
      switchMap((userCredential) => {
        return this.getUserProfile(userCredential.user.uid).pipe(
          map(appUser => {
            this.authState.next({
              isAuthenticated: true,
              user: appUser,
              loading: false,
              error: null
            });
            return appUser;
          })
        );
      }),
      catchError(error => {
        console.error('Firebase Auth login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        this.authState.next({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: this.getErrorMessage(error.code)
        });
        throw error;
      })
    );
  }

  // Login with username (for demo accounts)
  private loginWithUsername(username: string, password: string): Observable<any> {
    return this.getUserProfileByUsername(username).pipe(
      switchMap(appUser => {
        if (!appUser) {
          throw new Error('Tài khoản không tồn tại');
        }
        
        // For demo purposes, we'll simulate login without Firebase Auth
        // In production, you should create Firebase Auth users for demo accounts
        this.authState.next({
          isAuthenticated: true,
          user: appUser,
          loading: false,
          error: null
        });
        
        return of(appUser);
      }),
      catchError(error => {
        this.authState.next({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error.message || 'Đăng nhập thất bại'
        });
        throw error;
      })
    );
  }

  // Logout method
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.authState.next({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null
        });
      })
    );
  }

  // Get user profile from Firestore
  private getUserProfile(uid: string): Observable<AppUser | null> {
    const userRef = doc(this.firestore, 'users', uid);
    return docData(userRef, { idField: 'id' }) as Observable<AppUser | null>;
  }

  // Get user profile by username (for demo login)
  getUserProfileByUsername(username: string): Observable<AppUser | null> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('uid', '==', username));
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as AppUser;
      })
    );
  }

  // Create user profile in Firestore
  createUserProfile(user: AppUser): Observable<any> {
    const usersRef = collection(this.firestore, 'users');
    return from(addDoc(usersRef, user));
  }

  // Update user profile
  updateUserProfile(uid: string, userData: Partial<AppUser>): Observable<void> {
    const userRef = doc(this.firestore, 'users', uid);
    return from(updateDoc(userRef, userData));
  }

  // Get all users
  getAllUsers(): Observable<AppUser[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser)))
    );
  }

  // Get users by role
  getUsersByRole(role: UserRole): Observable<AppUser[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('role', '==', role));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser)))
    );
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const currentUser = this.authState.value.user;
    if (!currentUser) return false;
    
    const rolePermissions = this.getRolePermissions(currentUser.role);
    return rolePermissions.includes('all') || rolePermissions.includes(permission);
  }

  // Get role permissions
  private getRolePermissions(role: UserRole): string[] {
    const roleConfig = {
      [UserRole.ADMIN]: ['all'],
      [UserRole.TOTRUONG_QUANDAY]: ['bangve_create', 'bangve_edit', 'bangve_view', 'bangve_delete'],
      [UserRole.QUANDAY_HA]: ['bd_ha_create', 'bd_ha_edit', 'bd_ha_view'],
      [UserRole.QUANDAY_CAO]: ['bd_cao_create', 'bd_cao_edit', 'bd_cao_view'],
      [UserRole.EP_BOIDAY]: ['ep_boiday_create', 'ep_boiday_edit', 'ep_boiday_view'],
      [UserRole.KCS]: ['kcs_approve', 'kcs_view', 'quality_control']
    };
    
    return roleConfig[role] || [];
  }

  // Get current user
  getCurrentUser(): AppUser | null {
    return this.authState.value.user;
  }

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return this.authState.value.isAuthenticated;
  }

  // Error message mapping
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
      'auth/wrong-password': 'Mật khẩu không chính xác',
      'auth/invalid-email': 'Email không hợp lệ',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
      'auth/too-many-requests': 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng',
      'auth/invalid-credential': 'Thông tin đăng nhập không chính xác'
    };
    
    return errorMessages[errorCode] || 'Đã xảy ra lỗi không xác định';
  }
}
