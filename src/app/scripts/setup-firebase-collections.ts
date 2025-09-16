import { Injectable, inject } from '@angular/core';
import { FirebaseService } from '../services/firebase.service';
import { User, UserRole } from '../models/user.model';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCollectionSetupService {
  private auth: Auth = inject(Auth);
  
  constructor(private firebaseService: FirebaseService) {}

  async setupCollections(): Promise<void> {
    console.log('Setting up Firebase collections...');
    
    try {
      // Create sample users
      console.log('Creating users...');
      await this.createSampleUsers();
      
      // Create roles collection
      console.log('Creating roles...');
      await this.createRolesCollection();
      
      console.log('✅ Firebase collections setup completed!');
    } catch (error) {
      console.error('❌ Error setting up collections:', error);
      throw error;
    }
  }

  private async createSampleUsers(): Promise<void> {
    const sampleUsers = [
      {
        email: 'admin@thibidi.com',
        password: 'admin123',
        uid: 'admin',
        displayName: 'Administrator',
        role: UserRole.ADMIN,
        department: 'IT',
        isActive: true,
        createdAt: new Date()
      },
      {
        email: 'totruong@thibidi.com',
        password: 'totruong123',
        uid: 'totruong', 
        displayName: 'Tổ trưởng quấn dây',
        role: UserRole.TOTRUONG_QUANDAY,
        department: 'Sản xuất',
        isActive: true,
        createdAt: new Date()
      },
      {
        email: 'kcs@thibidi.com',
        password: 'kcs123',
        uid: 'kcs',
        displayName: 'Kiểm tra chất lượng', 
        role: UserRole.KCS,
        department: 'KCS',
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const userData of sampleUsers) {
      try {
        console.log('Creating Firebase Auth user:', userData.email);
        
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          this.auth, 
          userData.email, 
          userData.password
        );
        
        console.log('✅ Created Firebase Auth user:', userData.email, 'UID:', userCredential.user.uid);
        
        // Create user document in Firestore
        const { password, ...userDoc } = userData;
        const result = await this.firebaseService.addUser(userDoc as User);
        console.log('✅ Created Firestore user:', userData.displayName, 'Result:', result);
        
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️ User ${userData.email} already exists in Firebase Auth`);
          // Still try to create Firestore document
          try {
            const { password, ...userDoc } = userData;
            await this.firebaseService.addUser(userDoc as User);
            console.log('✅ Created Firestore user:', userData.displayName);
          } catch (firestoreError) {
            console.error(`❌ Error creating Firestore user ${userData.displayName}:`, firestoreError);
          }
        } else {
          console.error(`❌ Error creating user ${userData.displayName}:`, error);
        }
      }
    }
  }

  private async createRolesCollection(): Promise<void> {
    const roles = [
      {
        id: 'admin',
        name: 'ADMIN',
        displayName: 'Quản trị hệ thống',
        permissions: ['all'],
        description: 'Toàn quyền quản lý hệ thống'
      },
      {
        id: 'totruong_quanday', 
        name: 'TOTRUONG_QUANDAY',
        displayName: 'Tổ trưởng quấn dây',
        permissions: ['bangve_create', 'bangve_edit', 'bangve_view', 'bangve_delete'],
        description: 'Tạo và quản lý bảng vẽ'
      },
      {
        id: 'kcs',
        name: 'KCS', 
        displayName: 'Kiểm tra chất lượng',
        permissions: ['kcs_approve', 'kcs_view', 'quality_control'],
        description: 'Kiểm tra chất lượng khâu sản xuất'
      }
    ];

    for (const role of roles) {
      try {
        console.log('Creating role:', role);
        const result = await this.firebaseService.addDocument('roles', role.id, role);
        console.log('✅ Created role:', role.displayName, 'Result:', result);
      } catch (error) {
        console.error(`❌ Error creating role ${role.name}:`, error);
      }
    }
  }

  async clearAllCollections(): Promise<void> {
    console.log('Clearing all collections...');
    
    try {
      // Clear users
      const users = await this.firebaseService.getAllUsers().toPromise();
      for (const user of users || []) {
        if (user.id) {
          await this.firebaseService.deleteUser(user.id);
        }
      }
      
      // Clear roles
      const roles = await this.firebaseService.getCollection('roles').toPromise();
      for (const role of roles || []) {
        if (role.id) {
          await this.firebaseService.deleteDocument('roles', role.id);
        }
      }
      
      console.log('✅ All collections cleared!');
    } catch (error) {
      console.error('❌ Error clearing collections:', error);
      throw error;
    }
  }
}
