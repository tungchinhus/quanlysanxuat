// Simple migration script for Angular environment
// This script can be used within the Angular app

import { FirebaseService } from '../services/firebase.service';
import { User, UserRole } from '../models/user.model';

export class UserMigrationService {
  constructor(private firebaseService: FirebaseService) {}

  // Create demo users for testing
  async createDemoUsers(): Promise<void> {
    console.log('🚀 Creating demo users...');

    const demoUsers: Omit<User, 'id'>[] = [
      {
        email: 'admin@thibidi.com',
        displayName: 'Administrator',
        role: UserRole.ADMIN,
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        uid: 'admin'
      },
      {
        email: 'manager1@thibidi.com',
        displayName: 'Manager 1',
        role: UserRole.TOTRUONG_QUANDAY,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'admin@thibidi.com',
        uid: 'manager1'
      },
      {
        email: 'user1@thibidi.com',
        displayName: 'User 1',
        role: UserRole.QUANDAY_HA,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'user1'
      },
      {
        email: 'quandayha1@thibidi.com',
        displayName: 'Quấn dây hạ 1',
        role: UserRole.QUANDAY_HA,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'quandayha1'
      },
      {
        email: 'quandaycao1@thibidi.com',
        displayName: 'Quấn dây cao 1',
        role: UserRole.QUANDAY_CAO,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'quandaycao1'
      },
      {
        email: 'epboiday1@thibidi.com',
        displayName: 'Ép bối dây 1',
        role: UserRole.EP_BOIDAY,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'epboiday1'
      },
      {
        email: 'kcs1@thibidi.com',
        displayName: 'KCS 1',
        role: UserRole.KCS,
        department: 'Quality Control',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'kcs1'
      }
    ];

    for (const user of demoUsers) {
      try {
        await this.firebaseService.addUser(user).toPromise();
        console.log(`✅ Created user: ${user['displayName']} (${user['email']})`);
      } catch (error) {
        console.log(`⚠️  User ${user['email']} might already exist`);
      }
    }

    console.log('✅ Demo users creation completed!');
  }

  // Clear all users (for testing)
  async clearAllUsers(): Promise<void> {
    console.log('🗑️  Clearing all users...');

    try {
      const users = await this.firebaseService.getAllUsers().toPromise();
      if (users) {
        for (const user of users) {
          if (user.id) {
            await this.firebaseService.deleteUser(user.id).toPromise();
            console.log(`🗑️  Deleted user: ${user.displayName}`);
          }
        }
      }
      console.log('✅ All users cleared!');
    } catch (error) {
      console.error('❌ Error clearing users:', error);
    }
  }

  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await this.firebaseService.getAllUsers().toPromise();
      return users || [];
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }
}
