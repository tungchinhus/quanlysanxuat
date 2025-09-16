import { migrateUsers, createUser } from './migrate-users';
import { User, UserRole } from '../models/user.model';

// Function to run migration
export async function runUserMigration(): Promise<void> {
  console.log('🚀 Starting user migration to Firestore...');
  
  try {
    await migrateUsers();
    console.log('✅ User migration completed successfully!');
    
    // Test creating an additional user
    const testUser: Omit<User, 'id'> = {
      email: 'test@thibidi.com',
      displayName: 'Test User',
      role: UserRole.QUANDAY_HA,
      department: 'Production',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'admin@thibidi.com'
    };
    
    await createUser(testUser, 'test123');
    console.log('✅ Test user created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Function to create demo users for quick login
export async function createDemoUsers(): Promise<void> {
  console.log('🎯 Creating demo users for quick login...');
  
  const demoUsers = [
    {
      user: {
        email: 'admin@thibidi.com',
        displayName: 'Administrator',
        role: UserRole.ADMIN,
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system',
        uid: 'admin'
      } as Omit<User, 'id'>,
      password: 'admin123'
    },
    {
      user: {
        email: 'manager1@thibidi.com',
        displayName: 'Manager 1',
        role: UserRole.TOTRUONG_QUANDAY,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'admin@thibidi.com',
        uid: 'manager1'
      } as Omit<User, 'id'>,
      password: 'manager123'
    },
    {
      user: {
        email: 'user1@thibidi.com',
        displayName: 'User 1',
        role: UserRole.QUANDAY_HA,
        department: 'Production',
        isActive: true,
        createdAt: new Date(),
        createdBy: 'manager1@thibidi.com',
        uid: 'user1'
      } as Omit<User, 'id'>,
      password: 'user123'
    }
  ];

  for (const { user, password } of demoUsers) {
    try {
      await createUser(user, password);
      console.log(`✅ Created demo user: ${user.email}`);
    } catch (error) {
      console.log(`⚠️  Demo user ${user.email} might already exist`);
    }
  }
  
  console.log('✅ Demo users setup completed!');
}

// Run migration if this file is executed directly
if (require.main === module) {
  runUserMigration()
    .then(() => createDemoUsers())
    .then(() => {
      console.log('🎉 All migrations completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}
