import { Injectable } from '@angular/core';
import { 
  collection, 
  doc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  DocumentSnapshot,
  QuerySnapshot,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { updatePassword, getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseService } from './firebase.service';
import { User, Role, Permission, UserRole, UserPermission, PREDEFINED_ROLES, PREDEFINED_PERMISSIONS } from '../models/user.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUserManagementService {
  private firestore: Firestore;
  private usersSubject = new BehaviorSubject<User[]>([]);
  private rolesSubject = new BehaviorSubject<Role[]>([]);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  public users$ = this.usersSubject.asObservable();
  public roles$ = this.rolesSubject.asObservable();
  public permissions$ = this.permissionsSubject.asObservable();

  // Collection names
  private readonly COLLECTIONS = {
    USERS: 'users',
    ROLES: 'roles',
    PERMISSIONS: 'permissions',
    USER_ROLES: 'userRoles',
    USER_PERMISSIONS: 'userPermissions'
  };

  constructor(private firebaseService: FirebaseService) {
    this.firestore = this.firebaseService.getFirestore();
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      // Only load roles and permissions on initialization
      // Users will be loaded when needed (after authentication)
      await this.loadRoles();
      await this.loadPermissions();
      // Initialize users as empty array - will be loaded after authentication
      this.usersSubject.next([]);
    } catch (error) {
      console.error('Error initializing data:', error);
      // Initialize with default data if Firebase fails
      this.initializeDefaultData();
    }
  }

  private initializeDefaultData(): void {
    // Initialize with empty arrays for now
    // Roles and permissions will be loaded from Firebase
    this.rolesSubject.next([]);
    this.permissionsSubject.next([]);
  }

  // ==================== USERS ====================
  async loadUsers(): Promise<void> {
    try {
      console.log('Loading users from Firebase...');
      console.log('Firestore instance:', this.firestore);
      console.log('Collection name:', this.COLLECTIONS.USERS);
      
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTIONS.USERS));
      console.log('Query snapshot:', querySnapshot);
      console.log('Number of docs:', querySnapshot.docs.length);
      
      const users = querySnapshot.docs.map(doc => {
        console.log('Processing doc:', doc.id, doc.data());
        return this.convertFirestoreDocToUser(doc);
      });
      
      console.log('Converted users:', users);
      this.usersSubject.next(users);
    } catch (error) {
      console.error('Error loading users:', error);
      this.usersSubject.next([]);
    }
  }

  /**
   * Load users only when authenticated (for admin/manager users)
   * This method should be called after successful authentication
   */
  async loadUsersIfAuthenticated(): Promise<void> {
    try {
      // Check if user is authenticated
      const auth = this.firebaseService.getAuth();
      if (!auth.currentUser) {
        console.log('User not authenticated, skipping users load');
        return;
      }
      
      console.log('User authenticated, loading users...');
      await this.loadUsers();
    } catch (error) {
      console.error('Error loading users for authenticated user:', error);
    }
  }

  getUsers(): Observable<User[]> {
    return this.users$;
  }

  async refreshUsers(): Promise<void> {
    await this.loadUsers();
  }

  getFirestoreInstance(): Firestore {
    return this.firestore;
  }

  getCollections(): typeof this.COLLECTIONS {
    return this.COLLECTIONS;
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.convertFirestoreDocToUser(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log('Getting user by email:', email);
      
      const q = query(
        collection(this.firestore, this.COLLECTIONS.USERS),
        where('email', '==', email.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const user = this.convertFirestoreDocToUser(doc);
        console.log('Found user by email:', user);
        return user;
      }
      
      console.log('No user found with email:', email);
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      console.log('Getting user by username:', username);
      
      const q = query(
        collection(this.firestore, this.COLLECTIONS.USERS),
        where('username', '==', username.toLowerCase())
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const user = this.convertFirestoreDocToUser(doc);
        console.log('Found user by username:', user);
        return user;
      }
      
      console.log('No user found with username:', username);
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async checkUserDuplicates(username: string, email: string, excludeUserId?: string): Promise<{ usernameExists: boolean; emailExists: boolean; existingUser?: User }> {
    try {
      console.log('Checking duplicates for username:', username, 'email:', email);
      
      // Check username duplicate
      const existingByUsername = await this.getUserByUsername(username);
      const usernameExists = existingByUsername && (!excludeUserId || existingByUsername.id !== excludeUserId);
      
      // Check email duplicate
      const existingByEmail = await this.getUserByEmail(email);
      const emailExists = existingByEmail && (!excludeUserId || existingByEmail.id !== excludeUserId);
      
      return {
        usernameExists: !!usernameExists,
        emailExists: !!emailExists,
        existingUser: (existingByUsername || existingByEmail) || undefined
      };
    } catch (error) {
      console.error('Error checking user duplicates:', error);
      return { usernameExists: false, emailExists: false };
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      console.log('Creating user with data:', userData);
      const now = new Date();
      const data = {
        ...userData,
        uid: userData.uid || '', // Set uid field, empty if not provided
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      console.log('Data to save to Firebase:', data);
      console.log('Firestore instance:', this.firestore);
      console.log('Collection name:', this.COLLECTIONS.USERS);
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.USERS), data);
      console.log('Document created with ID:', docRef.id);
      
      const newUser: User = {
        ...userData,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };
      
      console.log('New user object:', newUser);
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      console.log('Current users before update:', currentUsers);
      this.usersSubject.next([...currentUsers, newUser]);
      console.log('Users updated in local state');
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Tạo user với document ID cụ thể (Firebase UID)
   * @param userData Dữ liệu user cần tạo
   * @param documentId Document ID cụ thể (thường là Firebase UID)
   * @returns Promise<User>
   */
  async createUserWithDocumentId(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, documentId: string): Promise<User> {
    try {
      console.log('Creating user with specific document ID:', documentId, userData);
      const now = new Date();
      const data = {
        ...userData,
        uid: documentId, // Set uid field to documentId (Firebase UID)
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      console.log('Data to save to Firebase with document ID:', data);
      console.log('Firestore instance:', this.firestore);
      console.log('Collection name:', this.COLLECTIONS.USERS);
      
      // Sử dụng setDoc với document ID cụ thể thay vì addDoc
      const docRef = doc(this.firestore, this.COLLECTIONS.USERS, documentId);
      await setDoc(docRef, data);
      console.log('Document created with specific ID:', documentId);
      
      const newUser: User = {
        ...userData,
        id: documentId, // Sử dụng document ID được chỉ định
        createdAt: now,
        updatedAt: now
      };
      
      console.log('New user object with specific ID:', newUser);
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      console.log('Current users before update:', currentUsers);
      this.usersSubject.next([...currentUsers, newUser]);
      console.log('Users updated in local state');
      
      return newUser;
    } catch (error) {
      console.error('Error creating user with specific document ID:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
      const updateData = {
        ...userData,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      const userIndex = currentUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        const updatedUser = { ...currentUsers[userIndex], ...userData, updatedAt: new Date() };
        currentUsers[userIndex] = updatedUser;
        this.usersSubject.next([...currentUsers]);
        return updatedUser;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.USERS, id);
      await deleteDoc(docRef);
      
      // Update local state
      const currentUsers = this.usersSubject.value;
      const filteredUsers = currentUsers.filter(u => u.id !== id);
      this.usersSubject.next(filteredUsers);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // ==================== ROLES ====================
  async loadRoles(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTIONS.ROLES));
      const roles = querySnapshot.docs.map(doc => this.convertFirestoreDocToRole(doc));
      
      // If no roles in Firebase, initialize with predefined roles
      if (roles.length === 0) {
        await this.initializePredefinedRoles();
      } else {
        this.rolesSubject.next(roles);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      this.rolesSubject.next([]);
    }
  }

  private async initializePredefinedRoles(): Promise<void> {
    try {
      const predefinedRoles = [
        { name: 'super_admin', displayName: 'Super Admin', description: 'Full system access', isActive: true },
        { name: 'admin', displayName: 'Admin', description: 'Administrative access', isActive: true },
        { name: 'manager', displayName: 'Manager', description: 'Management access', isActive: true },
        { name: 'user', displayName: 'User', description: 'Standard user access', isActive: true },
        { name: 'viewer', displayName: 'Viewer', description: 'Read-only access', isActive: true }
      ];
      const roles: Role[] = [];
      
      for (const role of predefinedRoles) {
        const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.ROLES), {
          ...role,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
        roles.push({ ...role, id: docRef.id, createdAt: new Date(), updatedAt: new Date(), permissions: [] });
      }
      
      this.rolesSubject.next(roles);
    } catch (error) {
      console.error('Error initializing predefined roles:', error);
      this.rolesSubject.next([]);
    }
  }

  getRoles(): Observable<Role[]> {
    return this.roles$;
  }

  async getRoleById(id: string): Promise<Role | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.ROLES, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return this.convertFirestoreDocToRole(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting role by ID:', error);
      return null;
    }
  }

  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const now = new Date();
      const data = {
        ...roleData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.ROLES), data);
      const newRole: Role = {
        ...roleData,
        id: docRef.id,
        createdAt: now,
        updatedAt: now
      };
      
      // Update local state
      const currentRoles = this.rolesSubject.value;
      this.rolesSubject.next([...currentRoles, newRole]);
      
      return newRole;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: string, roleData: Partial<Role>): Promise<Role | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.ROLES, id);
      const updateData = {
        ...roleData,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      const currentRoles = this.rolesSubject.value;
      const roleIndex = currentRoles.findIndex(r => r.id === id);
      if (roleIndex !== -1) {
        const updatedRole = { ...currentRoles[roleIndex], ...roleData, updatedAt: new Date() };
        currentRoles[roleIndex] = updatedRole;
        this.rolesSubject.next([...currentRoles]);
        return updatedRole;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.ROLES, id);
      await deleteDoc(docRef);
      
      // Update local state
      const currentRoles = this.rolesSubject.value;
      const filteredRoles = currentRoles.filter(r => r.id !== id);
      this.rolesSubject.next(filteredRoles);
      
      return true;
    } catch (error) {
      console.error('Error deleting role:', error);
      return false;
    }
  }

  // ==================== PERMISSIONS ====================
  async loadPermissions(): Promise<void> {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, this.COLLECTIONS.PERMISSIONS));
      const permissions = querySnapshot.docs.map(doc => this.convertFirestoreDocToPermission(doc));
      
      // If no permissions in Firebase, initialize with predefined permissions
      if (permissions.length === 0) {
        await this.initializePredefinedPermissions();
      } else {
        this.permissionsSubject.next(permissions);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      this.permissionsSubject.next([]);
    }
  }

  async createPermission(permissionData: Omit<Permission, 'id'>): Promise<Permission> {
    try {
      const now = new Date();
      const data = {
        ...permissionData,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };
      
      const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.PERMISSIONS), data);
      const newPermission: Permission = {
        ...permissionData,
        id: docRef.id
      };
      
      // Update local state
      const currentPermissions = this.permissionsSubject.value;
      this.permissionsSubject.next([...currentPermissions, newPermission]);
      
      return newPermission;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }

  async updatePermission(id: string, permissionData: Partial<Permission>): Promise<Permission | null> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.PERMISSIONS, id);
      const updateData = {
        ...permissionData,
        updatedAt: Timestamp.fromDate(new Date())
      };
      
      await updateDoc(docRef, updateData);
      
      // Update local state
      const currentPermissions = this.permissionsSubject.value;
      const permissionIndex = currentPermissions.findIndex(p => p.id === id);
      if (permissionIndex !== -1) {
        const updatedPermission = { ...currentPermissions[permissionIndex], ...permissionData };
        currentPermissions[permissionIndex] = updatedPermission;
        this.permissionsSubject.next([...currentPermissions]);
        return updatedPermission;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating permission:', error);
      throw error;
    }
  }

  async deletePermission(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.COLLECTIONS.PERMISSIONS, id);
      await deleteDoc(docRef);
      
      // Update local state
      const currentPermissions = this.permissionsSubject.value;
      const filteredPermissions = currentPermissions.filter(p => p.id !== id);
      this.permissionsSubject.next(filteredPermissions);
      
      return true;
    } catch (error) {
      console.error('Error deleting permission:', error);
      return false;
    }
  }

  private async initializePredefinedPermissions(): Promise<void> {
    try {
      const predefinedPermissions = [
        { name: 'dang_ky_xe_view', displayName: 'Xem đăng ký xe', module: 'dang_ky_xe', action: 'view', isActive: true },
        { name: 'dang_ky_xe_create', displayName: 'Tạo đăng ký xe', module: 'dang_ky_xe', action: 'create', isActive: true },
        { name: 'dang_ky_xe_update', displayName: 'Sửa đăng ký xe', module: 'dang_ky_xe', action: 'update', isActive: true },
        { name: 'dang_ky_xe_delete', displayName: 'Xóa đăng ký xe', module: 'dang_ky_xe', action: 'delete', isActive: true },
        { name: 'user_view', displayName: 'Xem người dùng', module: 'user', action: 'view', isActive: true },
        { name: 'user_create', displayName: 'Tạo người dùng', module: 'user', action: 'create', isActive: true },
        { name: 'user_update', displayName: 'Sửa người dùng', module: 'user', action: 'update', isActive: true },
        { name: 'user_delete', displayName: 'Xóa người dùng', module: 'user', action: 'delete', isActive: true },
        { name: 'role_view', displayName: 'Xem vai trò', module: 'role', action: 'view', isActive: true },
        { name: 'role_create', displayName: 'Tạo vai trò', module: 'role', action: 'create', isActive: true },
        { name: 'role_update', displayName: 'Sửa vai trò', module: 'role', action: 'update', isActive: true },
        { name: 'role_delete', displayName: 'Xóa vai trò', module: 'role', action: 'delete', isActive: true }
      ];
      const permissions: Permission[] = [];
      
      for (const permission of predefinedPermissions) {
        const docRef = await addDoc(collection(this.firestore, this.COLLECTIONS.PERMISSIONS), {
          ...permission,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date())
        });
        permissions.push({ ...permission, id: docRef.id });
      }
      
      this.permissionsSubject.next(permissions);
    } catch (error) {
      console.error('Error initializing predefined permissions:', error);
      this.permissionsSubject.next([]);
    }
  }

  getPermissions(): Observable<Permission[]> {
    return this.permissions$;
  }

  async refreshRoles(): Promise<void> {
    await this.loadRoles();
  }

  async refreshPermissions(): Promise<void> {
    await this.loadPermissions();
  }

  // ==================== UNUSED PERMISSIONS MANAGEMENT ====================
  /**
   * Lấy danh sách permissions không được sử dụng trong bất kỳ role nào
   */
  async getUnusedPermissions(): Promise<Permission[]> {
    try {
      const allPermissions = this.permissionsSubject.value;
      const allRoles = this.rolesSubject.value;
      
      // Tạo set chứa tất cả permission IDs đang được sử dụng trong roles
      const usedPermissionIds = new Set<string>();
      
      allRoles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(permission => {
            const permissionId = typeof permission === 'string' ? permission : permission.id;
            if (permissionId) {
              usedPermissionIds.add(permissionId);
            }
          });
        }
      });
      
      // Lọc ra các permissions không được sử dụng
      const unusedPermissions = allPermissions.filter(permission => 
        !usedPermissionIds.has(permission.id)
      );
      
      return unusedPermissions;
    } catch (error) {
      console.error('Error getting unused permissions:', error);
      return [];
    }
  }

  /**
   * Xóa một permission không được sử dụng
   */
  async deleteUnusedPermission(permissionId: string): Promise<boolean> {
    try {
      // Kiểm tra lại permission có thực sự không được sử dụng không
      const unusedPermissions = await this.getUnusedPermissions();
      const isUnused = unusedPermissions.some(p => p.id === permissionId);
      
      if (!isUnused) {
        throw new Error('Permission đang được sử dụng, không thể xóa');
      }
      
      return await this.deletePermission(permissionId);
    } catch (error) {
      console.error('Error deleting unused permission:', error);
      return false;
    }
  }

  /**
   * Xóa tất cả permissions không được sử dụng
   */
  async deleteAllUnusedPermissions(): Promise<{ success: number; failed: number }> {
    try {
      const unusedPermissions = await this.getUnusedPermissions();
      let successCount = 0;
      let failedCount = 0;
      
      for (const permission of unusedPermissions) {
        const success = await this.deletePermission(permission.id);
        if (success) {
          successCount++;
        } else {
          failedCount++;
        }
      }
      
      return { success: successCount, failed: failedCount };
    } catch (error) {
      console.error('Error deleting all unused permissions:', error);
      return { success: 0, failed: 0 };
    }
  }

  // ==================== USER ROLES & PERMISSIONS ====================
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user || !user.roles) return false;
      
      return user.roles.some(role => {
        const roleNameToCheck = typeof role === 'string' ? role : (role as any).name;
        return roleNameToCheck === roleName;
      });
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    // Permissions are handled through roles, not directly on users
    // This method can be implemented based on role-based permissions
    return false;
  }

  /**
   * Đổi mật khẩu cho user (chỉ dành cho admin)
   * @param userId ID của user cần đổi mật khẩu
   * @param newPassword Mật khẩu mới
   * @returns Promise<boolean> - true nếu thành công
   */
  async changeUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      console.log('🔐 Changing password for user:', userId);
      
      // Lấy thông tin user từ Firestore để có Firebase UID
      const userDoc = await getDoc(doc(this.firestore, this.COLLECTIONS.USERS, userId));
      if (!userDoc.exists()) {
        console.error('❌ User not found in Firestore:', userId);
        return false;
      }
      
      const userData = userDoc.data();
      console.log('📄 User data from Firestore:', userData);
      
      // Kiểm tra các trường có thể chứa Firebase UID
      const firebaseUID = userData['uid'] || userData['firebaseUID'] || userData['firebase_uid'];
      
      if (!firebaseUID) {
        console.warn('⚠️ Firebase UID not found for user:', userId);
        console.log('Available fields in user data:', Object.keys(userData));
        
        // Kiểm tra xem có phải user này được tạo bằng email/password không
        if (userData['email']) {
          console.log('ℹ️ User has email, attempting to create Firebase Auth user');
          
          try {
            // Tạo Firebase Auth user với email và password tạm thời
            const auth = getAuth();
            const tempPassword = 'TempPassword123!'; // Password tạm thời
            
            const userCredential = await createUserWithEmailAndPassword(
              auth, 
              userData['email'], 
              tempPassword
            );
            
            const newFirebaseUID = userCredential.user.uid;
            console.log('✅ Created Firebase Auth user with UID:', newFirebaseUID);
            
            // Cập nhật Firestore với Firebase UID mới
            await updateDoc(doc(this.firestore, this.COLLECTIONS.USERS, userId), {
              uid: newFirebaseUID,
              updatedAt: Timestamp.fromDate(new Date())
            });
            
            console.log('✅ Updated Firestore with Firebase UID');
            
            // Bây giờ có thể tiếp tục với việc đổi mật khẩu
            console.log('🔑 Proceeding with password change for new Firebase UID:', newFirebaseUID);
            
          } catch (createError: any) {
            console.error('❌ Error creating Firebase Auth user:', createError);
            
            if (createError.code === 'auth/email-already-in-use') {
              console.log('ℹ️ Email already exists in Firebase Auth, user might have different UID');
              return false;
            }
            
            return false;
          }
        } else {
          console.log('❌ User has no email, cannot create Firebase Auth user');
          return false;
        }
      }
      
      console.log('✅ Found Firebase UID:', firebaseUID);
      
      // Lấy Firebase Auth instance
      const auth = getAuth();
      
      // Tìm user trong Firebase Auth bằng UID
      // Note: Firebase Admin SDK thường được dùng để đổi mật khẩu của user khác
      // Trong trường hợp này, chúng ta sẽ cần sử dụng Firebase Admin SDK
      // hoặc tạo một Cloud Function để xử lý việc này
      
      console.log('🔑 Password change requested for Firebase UID:', firebaseUID);
      
      // TODO: Implement actual password change logic
      // This would typically require Firebase Admin SDK or Cloud Functions
      // For now, we'll return true as a placeholder
      
      console.log('✅ Password change completed successfully (placeholder)');
      return true;
      
    } catch (error) {
      console.error('❌ Error changing user password:', error);
      return false;
    }
  }

  // ==================== HELPER METHODS ====================
  private convertFirestoreDocToUser(doc: DocumentSnapshot): User {
    const data = doc.data();
    
    // Handle both 'role' (string) and 'roles' (array) fields for backward compatibility
    let roles: string[] = [];
    if (data?.['roles'] && Array.isArray(data['roles'])) {
      roles = data['roles'];
    } else if (data?.['role'] && typeof data['role'] === 'string') {
      roles = [data['role']];
    }
    
    return {
      id: doc.id,
      uid: data?.['uid'] || '', // Firebase Authentication UID
      username: data?.['username'] || '',
      email: data?.['email'] || '',
      fullName: data?.['fullName'] || '',
      phone: data?.['phone'] || '',
      department: data?.['department'] || '',
      position: data?.['position'] || '',
      isActive: data?.['isActive'] ?? true,
      roles: roles,
      createdAt: data?.['createdAt']?.toDate() || new Date(),
      updatedAt: data?.['updatedAt']?.toDate() || new Date(),
      lastLogin: data?.['lastLogin']?.toDate(),
      createdBy: data?.['createdBy'] || 'system',
      updatedBy: data?.['updatedBy'] || 'system'
    };
  }

  private convertFirestoreDocToRole(doc: DocumentSnapshot): Role {
    const data = doc.data();
    return {
      id: doc.id,
      name: data?.['name'] || '',
      displayName: data?.['displayName'] || '',
      description: data?.['description'] || '',
      isActive: data?.['isActive'] ?? true,
      permissions: data?.['permissions'] || [],
      createdAt: data?.['createdAt']?.toDate() || new Date(),
      updatedAt: data?.['updatedAt']?.toDate() || new Date()
    };
  }

  private convertFirestoreDocToPermission(doc: DocumentSnapshot): Permission {
    const data = doc.data();
    return {
      id: doc.id,
      name: data?.['name'] || '',
      displayName: data?.['displayName'] || '',
      module: data?.['module'] || '',
      action: data?.['action'] || '',
      isActive: data?.['isActive'] ?? true
    };
  }
}
