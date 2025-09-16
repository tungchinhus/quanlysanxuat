import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { User, UserRole } from '../models/user.model';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuIT3ZuNI7gz3eQKPnR1uM6M5j7JggkXs",
  authDomain: "quanlysanxuat-b7346.firebaseapp.com",
  projectId: "quanlysanxuat",
  storageBucket: "quanlysanxuat.firebasestorage.app",
  messagingSenderId: "355582229234",
  appId: "1:355582229234:web:d5f4b8efb8b73243936e6b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample users data
const sampleUsers: Omit<User, 'id'>[] = [
  {
    email: 'admin@thibidi.com',
    displayName: 'Administrator',
    role: UserRole.ADMIN,
    department: 'IT',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'system'
  },
  {
    email: 'manager1@thibidi.com',
    displayName: 'Manager 1',
    role: UserRole.TOTRUONG_QUANDAY,
    department: 'Production',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'admin@thibidi.com'
  },
  {
    email: 'user1@thibidi.com',
    displayName: 'User 1',
    role: UserRole.QUANDAY_HA,
    department: 'Production',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'manager1@thibidi.com'
  },
  {
    email: 'quandayha1@thibidi.com',
    displayName: 'Quấn dây hạ 1',
    role: UserRole.QUANDAY_HA,
    department: 'Production',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'manager1@thibidi.com'
  },
  {
    email: 'quandaycao1@thibidi.com',
    displayName: 'Quấn dây cao 1',
    role: UserRole.QUANDAY_CAO,
    department: 'Production',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'manager1@thibidi.com'
  },
  {
    email: 'epboiday1@thibidi.com',
    displayName: 'Ép bối dây 1',
    role: UserRole.EP_BOIDAY,
    department: 'Production',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'manager1@thibidi.com'
  },
  {
    email: 'kcs1@thibidi.com',
    displayName: 'KCS 1',
    role: UserRole.KCS,
    department: 'Quality Control',
    isActive: true,
    createdAt: new Date(),
    createdBy: 'manager1@thibidi.com'
  }
];

// Demo users for quick login
const demoUsers = [
  { username: 'admin', password: 'admin123', email: 'admin@thibidi.com' },
  { username: 'manager1', password: 'manager123', email: 'manager1@thibidi.com' },
  { username: 'user1', password: 'user123', email: 'user1@thibidi.com' }
];

export async function migrateUsers(): Promise<void> {
  console.log('Starting user migration...');
  
  try {
    // Create Firebase Auth users first
    for (const demoUser of demoUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          demoUser.email, 
          demoUser.password
        );
        console.log(`Created auth user: ${demoUser.email}`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Auth user already exists: ${demoUser.email}`);
        } else {
          console.error(`Error creating auth user ${demoUser.email}:`, error);
        }
      }
    }

    // Create Firestore user profiles
    for (const user of sampleUsers) {
      try {
        // Find the corresponding auth user
        const authUser = demoUsers.find(demo => demo.email === user.email);
        if (authUser) {
          // Use the auth UID as the document ID
          const userRef = doc(db, 'users', authUser.username);
          await setDoc(userRef, {
            ...user,
            uid: authUser.username, // Store username as UID for easy lookup
            lastLoginAt: null
          });
          console.log(`Created Firestore user profile: ${user.email}`);
        } else {
          // Create with auto-generated ID
          await addDoc(collection(db, 'users'), user);
          console.log(`Created Firestore user profile: ${user.email}`);
        }
      } catch (error) {
        console.error(`Error creating user profile ${user.email}:`, error);
      }
    }

    console.log('User migration completed successfully!');
  } catch (error) {
    console.error('Error during user migration:', error);
    throw error;
  }
}

// Function to create a single user
export async function createUser(userData: Omit<User, 'id'>, password: string): Promise<void> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    
    // Create Firestore user profile
    const userRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userRef, {
      ...userData,
      uid: userCredential.user.uid,
      lastLoginAt: null
    });
    
    console.log(`User created successfully: ${userData.email}`);
  } catch (error) {
    console.error(`Error creating user ${userData.email}:`, error);
    throw error;
  }
}

// Function to update user profile
export async function updateUser(uid: string, userData: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
    console.log(`User updated successfully: ${uid}`);
  } catch (error) {
    console.error(`Error updating user ${uid}:`, error);
    throw error;
  }
}

// Function to get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
// Note: This is for Node.js execution, not Angular
// For Angular, use the Firebase Test component instead
