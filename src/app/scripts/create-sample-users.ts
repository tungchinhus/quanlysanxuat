import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { User, UserRole } from '../models/user.model';

// Initialize Firebase
const app = initializeApp(environment.firebase);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Sample users data
const sampleUsers = [
  {
    email: 'admin@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Quản trị hệ thống',
    role: UserRole.ADMIN,
    department: 'IT'
  },
  {
    email: 'totruongquanday@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Tổ trưởng quấn dây',
    role: UserRole.TOTRUONG_QUANDAY,
    department: 'Sản xuất'
  },
  {
    email: 'quandayha1@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Công nhân quấn dây hạ',
    role: UserRole.QUANDAY_HA,
    department: 'Sản xuất'
  },
  {
    email: 'quandaycao1@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Công nhân quấn dây cao',
    role: UserRole.QUANDAY_CAO,
    department: 'Sản xuất'
  },
  {
    email: 'epboiday1@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Công nhân ép bối dây',
    role: UserRole.EP_BOIDAY,
    department: 'Sản xuất'
  },
  {
    email: 'kcs1@thibidi.com',
    password: 'Ab!123456',
    displayName: 'Kiểm tra chất lượng',
    role: UserRole.KCS,
    department: 'KCS'
  }
];

async function createSampleUsers() {
  console.log('Bắt đầu tạo dữ liệu mẫu cho người dùng...');

  for (const userData of sampleUsers) {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Create user profile in Firestore
      const userProfile: Omit<User, 'id'> = {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        department: userData.department,
        isActive: true,
        createdAt: new Date(),
        createdBy: 'system'
      };

      await addDoc(collection(firestore, 'users'), userProfile);

      console.log(`✅ Tạo thành công: ${userData.displayName} (${userData.email})`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Tài khoản đã tồn tại: ${userData.email}`);
      } else {
        console.error(`❌ Lỗi khi tạo ${userData.email}:`, error.message);
      }
    }
  }

  console.log('Hoàn thành tạo dữ liệu mẫu!');
}

// Export function for use in components
export { createSampleUsers };

// Run if this file is executed directly
if (typeof window !== 'undefined') {
  createSampleUsers();
}
