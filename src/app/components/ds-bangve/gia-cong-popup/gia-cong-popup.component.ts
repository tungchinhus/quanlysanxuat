import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service';
import { UserBangVeService, UserBangVeData } from '../../../services/user-bangve.service';
import { FirebaseUserBangVeService } from '../../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../../services/firebase-bangve.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { UserManagementFirebaseService } from '../../../services/user-management-firebase.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UserRole, KhauSx, RoleHelper } from '../../../models/user-roles.enum';

interface Worker {
  id: number;
  userId?: number; // Thêm field userId
  name: string;
  username?: string;
  email?: string;
  role?: string;
  roles?: string[]; // Danh sách role thực từ Firebase
  code?: string;
  department?: string;
  khau_sx?: string; // Thêm field khau_sx để phân loại
  LastName?: string;
  FirstName?: string;
}

interface ApiResponse {
  users: Worker[];
}

@Component({
  selector: 'app-gia-cong-popup',
  templateUrl: './gia-cong-popup.component.html',
  styleUrls: ['./gia-cong-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class GiaCongPopupComponent implements OnInit {
  giaCongForm!: FormGroup;
  nguoiGiaCongOptions: Worker[] = [];
  quandayhaUsers: Worker[] = []; // Danh sách user cho bối dây hạ
  quandaycaoUsers: Worker[] = []; // Danh sách user cho bối dây cao
  isLoadingWorkers: boolean = false;
  hasPermission: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GiaCongPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private commonService: CommonService,
    private userManagementService: UserManagementFirebaseService,
    private userBangVeService: UserBangVeService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBangVeService: FirebaseBangVeService
  ) {
    this.giaCongForm = this.fb.group({
      boiDayHa: [[], Validators.required], // Array để hỗ trợ multiple selection
      boiDayCao: [[], Validators.required] // Array để hỗ trợ multiple selection
    });
  }

  ngOnInit() {
    console.log('GiaCongPopupComponent ngOnInit called');
    console.log('Data received:', this.data);
    
    // Kiểm tra quyền admin hoặc manager
    this.hasPermission = this.hasAdminOrManagerRole();
    console.log('hasPermission:', this.hasPermission);
    
    if (!this.hasPermission) {
      console.log('No permission, closing dialog');
      this.commonService.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin, manager hoặc tổ trưởng mới được phép.', 'Đóng', 'error');
      this.dialogRef.close();
      return;
    }

    // Kiểm tra data có hợp lệ không
    if (!this.data || !this.data.drawing) {
      console.log('Invalid data, closing dialog');
      this.commonService.thongbao('Dữ liệu bảng vẽ không hợp lệ', 'Đóng', 'error');
      this.dialogRef.close();
      return;
    }

    console.log('Data is valid, loading workers');
    // Load danh sách người gia công
    this.loadWorkers();
    
    // Subscribe to form changes for validation state refresh
    this.giaCongForm.valueChanges.subscribe(() => {
      // Force refresh validation state
      this.forceValidationRefresh();
    });
  }

  // Method để force refresh validation state
  private forceValidationRefresh(): void {
    // Trigger change detection để cập nhật UI
    setTimeout(() => {
      this.giaCongForm.updateValueAndValidity();
    }, 100);
  }

  // Kiểm tra quyền admin hoặc manager
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
    
    console.log('Checking permissions:');
    console.log('userInfo:', userInfo);
    console.log('userRole from localStorage:', userRole);
    console.log('roles from userInfo:', roles);
    
    // Ưu tiên kiểm tra roles array trước
    if (roles && roles.length > 0) {
      const hasRole = RoleHelper.isAdminOrManager(roles);
      console.log('Has role from userInfo:', hasRole);
      return hasRole;
    }
    
    // Fallback: kiểm tra role từ localStorage
    if (userRole) {
      const hasRole = userRole.toLowerCase() === UserRole.ADMIN || 
             userRole.toLowerCase() === UserRole.MANAGER ||
             userRole.toLowerCase() === UserRole.ADMINISTRATOR ||
             userRole.toLowerCase() === UserRole.TOTRUONG;
      console.log('Has role from localStorage:', hasRole);
      return hasRole;
    }
    
    console.log('No role found, returning false');
    return false;
  }

  loadWorkers(): void {
    this.isLoadingWorkers = true;
    // Lấy users trực tiếp từ Firebase và filter theo khâu sản xuất
    this.getWorkers().then((workers) => {
        // Filter workers dựa vào khau_sx và loại bỏ admin/manager/administrator
        this.nguoiGiaCongOptions = workers.filter(worker => {
          // Loại bỏ admin/manager/administrator
          const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
          const isNotAdmin = !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
          
          // Chỉ lấy workers có khau_sx phù hợp
          const hasValidKhauSx = worker.khau_sx === 'quandayha' || 
                                 worker.khau_sx === 'quandaycao' || 
                                 worker.khau_sx === 'epboiday';
          
          return isNotAdmin && hasValidKhauSx;
        });
        
        // Load tất cả users có role boidayha hoặc boidaycao vào cả 2 danh sách
        // Không phân biệt role như trước, cho phép user có thể được gán vào cả 2 khâu
        const windingUsers = workers.filter(worker => {
          const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
          const isNotAdmin = !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
          
          // Lấy tất cả users có role boidayha hoặc boidaycao
          const hasWindingRole = worker.khau_sx === 'quandayha' || worker.khau_sx === 'quandaycao';
          
          return isNotAdmin && hasWindingRole;
        });
        
        // Gán cùng danh sách cho cả 2 loại gia công
        this.quandayhaUsers = windingUsers;
        this.quandaycaoUsers = windingUsers;
        
        // Làm sạch và validate worker data
        this.cleanAndValidateWorkerData();
        
        // Log thông tin chi tiết về workers được lọc
        this.logWorkerDetails();
        
        // Kiểm tra xem có worker nào được load không
        this.checkWorkersAvailability();
        
        this.isLoadingWorkers = false;
      }).catch((error) => {
        console.error('Lỗi khi tải danh sách người gia công:', error);
        this.isLoadingWorkers = false;
      });
  }

  async getWorkers(): Promise<Worker[]> {
    // Lấy tất cả users từ Firebase
    const users = await this.userManagementService.getUsers().pipe(take(1)).toPromise();
    const list = users || [];
    
    // Map sang định dạng Worker và chỉ lấy user thường
    const workers: Worker[] = list.map((u: any) => {
      // Dựa vào roles để xác định khau_sx thay vì khau_sx field
      const roleArray: string[] = Array.isArray(u.roles)
        ? u.roles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
        : [];
      
      // Sử dụng RoleHelper để xác định khau_sx từ roles
      const normalizedKhau = RoleHelper.rolesToKhauSx(roleArray);
      
      const roleName = roleArray[0] || 'user';
      return {
        id: Number.isFinite(Number(u.id)) ? Number(u.id) : Date.now(),
        userId: Number.isFinite(Number(u.id)) ? Number(u.id) : Date.now(), // Set userId same as id
        name: u.fullName || u.username || u.email || '',
        username: u.username,
        email: u.email,
        role: (roleName || 'user').toLowerCase(),
        roles: roleArray.map(r => (r || '').toLowerCase()),
        code: undefined,
        department: u.department,
        khau_sx: normalizedKhau,
        LastName: '',
        FirstName: u.fullName || ''
      } as Worker;
    }).filter((w: Worker) => (w.roles || [w.role || '']).every(r => r !== 'admin' && r !== 'manager' && r !== 'administrator'));
    
    return workers;
  }

  // Helper: kiểm tra worker có role cụ thể không (so sánh lowercase)
  private workerHasRole(worker: Worker, roleName: string): boolean {
    const target = roleName.toLowerCase();
    const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
    return roles.includes(target);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.isFormValidForSubmission) {
      const formValue = this.giaCongForm.value;
      
      const boiDayHaUsers = formValue.boiDayHa || [];
      const boiDayCaoUsers = formValue.boiDayCao || [];
      
      // Gọi API để thêm dữ liệu vào user_bangve cho tất cả users
      this.addUserBangVeRecords(boiDayHaUsers, boiDayCaoUsers);
    } else {
      // Kiểm tra từng trường hợp lỗi để hiển thị thông báo phù hợp
      const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
      const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
      
      if (!boiDayHa || boiDayHa.length === 0) {
        this.commonService.thongbao('Vui lòng chọn ít nhất một người cho khâu bối dây hạ', 'Đóng', 'error');
      } else if (!boiDayCao || boiDayCao.length === 0) {
        this.commonService.thongbao('Vui lòng chọn ít nhất một người cho khâu bối dây cao', 'Đóng', 'error');
      } else if (this.giaCongForm.get('boiDayCao')?.hasError('sameUser')) {
        this.commonService.thongbao('Không thể chọn cùng một người cho cả hai khâu. Vui lòng chọn người khác nhau.', 'Đóng', 'warning');
      } else {
        this.commonService.thongbao('Vui lòng kiểm tra lại thông tin đã nhập.', 'Đóng', 'warning');
      }
    }
  }

  // Helper method để hiển thị tên người gia công trong select
  getWorkerDisplayName(worker: Worker): string {
    let displayName = '';
    
    // Ưu tiên sử dụng FirstName + LastName để hiển thị tên đầy đủ
    if (worker.FirstName && worker.LastName) {
      displayName = `${worker.FirstName} ${worker.LastName}`;
    } else if (worker.FirstName && worker.FirstName.trim() !== '') {
      displayName = worker.FirstName;
    } else if (worker.LastName && worker.LastName.trim() !== '') {
      displayName = worker.LastName;
    } else if (worker.username && worker.username.trim() !== '') {
      displayName = worker.username;
    } else if (worker.email && worker.email.trim() !== '') {
      displayName = worker.email;
    } else {
      displayName = `User ID: ${worker.id}`;
    }
    
    // Thêm thông tin role nếu có
    if (worker.role && worker.role.trim() !== '') {
      displayName += ` (${worker.role})`;
    }
    
    return displayName;
  }

  // Kiểm tra form có hợp lệ
  get isFormValidForSubmission(): boolean {
    if (!this.giaCongForm.valid) {
      return false;
    }
    
    const boiDayHaUsers = this.giaCongForm.get('boiDayHa')?.value || [];
    const boiDayCaoUsers = this.giaCongForm.get('boiDayCao')?.value || [];
    
    // Kiểm tra cả hai trường đã được chọn ít nhất 1 user
    if (boiDayHaUsers.length === 0 || boiDayCaoUsers.length === 0) {
      return false;
    }
    
    // Cho phép cùng một người được gán vào cả hai khâu
    return true;
  }

  // Method để kiểm tra 2 user có khác nhau không
  private areUsersDifferent(user1: Worker, user2: Worker): boolean {















    
    // So sánh ID trước (quan trọng nhất)
    if (user1.id !== user2.id) {

      return true;
    }
    
    // So sánh userId nếu có
    if (user1.userId && user2.userId && user1.userId !== user2.userId) {

      return true;
    }
    
    // So sánh FirstName + LastName nếu có
    if (user1.FirstName && user2.FirstName && user1.FirstName !== user2.FirstName) {

      return true;
    }
    
    if (user1.LastName && user2.LastName && user1.LastName !== user2.LastName) {

      return true;
    }
    
    // So sánh name nếu có
    if (user1.name && user2.name && user1.name !== user2.name) {

      return true;
    }
    
    // So sánh email
    if (user1.email && user2.email && user1.email !== user2.email) {

      return true;
    }
    
    // So sánh username
    if (user1.username && user2.username && user1.username !== user2.username) {

      return true;
    }
    
    // So sánh khau_sx (cuối cùng vì có thể giống nhau)
    if (user1.khau_sx && user2.khau_sx && user1.khau_sx !== user2.khau_sx) {

      return true;
    }
    

    // Nếu tất cả đều giống nhau, trả về false
    return false;
  }

  // Method to log worker details for debugging
  private logWorkerDetails(): void {

    this.nguoiGiaCongOptions.forEach(worker => {
      console.log('Worker:', {
        id: worker.id,
        userId: worker.userId,
        username: worker.username,
        email: worker.email,
        role: worker.role,
        department: worker.department,
        khau_sx: worker.khau_sx,
        FirstName: worker.FirstName,
        LastName: worker.LastName,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
    

    this.quandayhaUsers.forEach(worker => {
      console.log('Quan Day Ha:', {
        id: worker.id,
        FirstName: worker.FirstName,
        LastName: worker.LastName,
        email: worker.email,
        khau_sx: worker.khau_sx,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
    

    this.quandaycaoUsers.forEach(worker => {
      console.log('Quan Day Cao:', {
        id: worker.id,
        FirstName: worker.FirstName,
        LastName: worker.LastName,
        email: worker.email,
        khau_sx: worker.khau_sx,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
  }

  // Method to clean and validate worker data
  private cleanAndValidateWorkerData(): void {
    // Khau_sx đã được set từ roles trong getWorkers(), không cần cập nhật thêm
    console.log('Workers khau_sx already set from roles:', this.nguoiGiaCongOptions.map(w => ({
      name: w.name,
      roles: w.roles,
      khau_sx: w.khau_sx
    })));
  }

  // Method to check if workers are available
  private checkWorkersAvailability(): void {
    if (this.nguoiGiaCongOptions.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công. Vui lòng thử lại sau.', 'Đóng', 'warning');
      this.dialogRef.close(); // Close the dialog if no workers are available
      return;
    }
    
    // Kiểm tra từng danh sách cụ thể
    if (this.quandayhaUsers.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công cho bối dây hạ (quandayha). Vui lòng kiểm tra lại.', 'Đóng', 'warning');
    }
    
    if (this.quandaycaoUsers.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công cho bối dây cao (quandaycao). Vui lòng kiểm tra lại.', 'Đóng', 'warning');
    }
    
    // Nếu cả hai danh sách đều trống, đóng dialog
    if (this.quandayhaUsers.length === 0 && this.quandaycaoUsers.length === 0) {
      this.commonService.thongbao('Không có người gia công nào phù hợp. Vui lòng thử lại sau.', 'Đóng', 'error');
      this.dialogRef.close();
    }
    
    // Debug: Test validation với 2 user khác nhau
    if (this.quandayhaUsers.length > 0 && this.quandaycaoUsers.length > 0) {
      const testUser1 = this.quandayhaUsers[0];
      const testUser2 = this.quandaycaoUsers[0];



      const areDifferent = this.areUsersDifferent(testUser1, testUser2);


    }
  }

  /**
   * Thêm dữ liệu vào bảng user_bangve cho tất cả users được chọn
   * @param boiDayHaUsers Danh sách users thực hiện bối dây hạ
   * @param boiDayCaoUsers Danh sách users thực hiện bối dây cao
   */
  private async addUserBangVeRecords(boiDayHaUsers: Worker[], boiDayCaoUsers: Worker[]): Promise<void> {






    if (!this.data.drawing || !this.data.drawing.id) {
      console.error('No drawing data available');
      console.error('data:', this.data);
      console.error('data.drawing:', this.data?.drawing);
      this.commonService.thongbao('Không có dữ liệu bảng vẽ. Vui lòng thử lại sau khi tạo bảng vẽ thành công.', 'Đóng', 'error');
      return;
    }

    // Kiểm tra và xử lý bangveId một cách an toàn (Firebase sử dụng string ID)
    let bangveId: string;
    if (typeof this.data.drawing.id === 'string') {
      bangveId = this.data.drawing.id;
    } else if (typeof this.data.drawing.id === 'number') {
      bangveId = this.data.drawing.id.toString();
    } else {
      console.error('Invalid bangve ID:', this.data.drawing.id);
      this.commonService.thongbao('ID bảng vẽ không hợp lệ', 'Đóng', 'error');
      return;
    }

    // Kiểm tra bangveId có hợp lệ không (không rỗng và có độ dài hợp lý)
    if (!bangveId || bangveId.trim().length === 0 || bangveId === '0') {
      console.error('Invalid bangve ID after conversion:', bangveId, 'Original:', this.data.drawing.id);
      this.commonService.thongbao('ID bảng vẽ không hợp lệ hoặc chưa được lưu vào database', 'Đóng', 'error');
      return;
    }


    const currentUser = this.authService.getUserInfo();
    const currentUserEmail = currentUser?.email;
    
    if (!currentUserEmail) {
      console.error('Cannot get current user email');
      this.commonService.thongbao('Không thể lấy thông tin user', 'Đóng', 'error');
      return;
    }

    try {
      // 1. Lấy Firebase Authentication UID từ current user
      const currentUserUID = currentUser?.uid || currentUser?.id;
      if (!currentUserUID) {
        console.error('Cannot get Firebase Authentication UID');
        this.commonService.thongbao('Không thể lấy Firebase UID', 'Đóng', 'error');
        return;
      }


      // 2. Lấy user ID từ Firestore users collection dựa vào email (cho created_by)

      const currentUserFromFirestore = await this.userManagementService.getUserByEmail(currentUserEmail).pipe(take(1)).toPromise();
      if (!currentUserFromFirestore) {
        console.error('User not found in Firestore users collection');
        this.commonService.thongbao('User không tồn tại trong hệ thống', 'Đóng', 'error');
        return;
      }
      const currentUserId = currentUserFromFirestore.id
      
      // assigned_by_user_id phải là Firebase UID của user hiện tại (người thực hiện gán)
      const assignedByUserId = currentUserUID;


      // 3. Cập nhật trang_thai = 1 trong tbl_bangve (đang thi công)

      await this.updateBangVeStatus(bangveId, 1);

      // 4. Lấy Firebase UID của workers từ Firestore users collection

      
      // Arrays để chứa thông tin users cho từng khâu
      const boiDayHaUserIds: number[] = [];
      const boiDayHaFirebaseUids: string[] = [];
      const boiDayCaoUserIds: number[] = [];
      const boiDayCaoFirebaseUids: string[] = [];
      
      // Xử lý tất cả users bối dây hạ
      for (const boiDayHa of boiDayHaUsers) {
        if (!boiDayHa.email) {
          console.error('Worker email is missing for:', boiDayHa);
          this.commonService.thongbao(`Thông tin email của ${boiDayHa.username || 'người gia công'} không đầy đủ`, 'Đóng', 'error');
          return;
        }
        
        const boiDayHaUser = await this.userManagementService.getUserByEmail(boiDayHa.email).pipe(take(1)).toPromise();
        if (!boiDayHaUser) {
          console.error('Cannot find worker in Firestore users collection:', boiDayHa.email);
          this.commonService.thongbao(`Không tìm thấy thông tin ${boiDayHa.username || 'người gia công'} trong hệ thống`, 'Đóng', 'error');
          return;
        }
        

        boiDayHaUserIds.push(parseInt(boiDayHaUser.id));
        boiDayHaFirebaseUids.push(boiDayHaUser.uid || boiDayHaUser.id);
      }
      
      // Xử lý tất cả users bối dây cao
      for (const boiDayCao of boiDayCaoUsers) {
        if (!boiDayCao.email) {
          console.error('Worker email is missing for:', boiDayCao);
          this.commonService.thongbao(`Thông tin email của ${boiDayCao.username || 'người gia công'} không đầy đủ`, 'Đóng', 'error');
          return;
        }
        
        const boiDayCaoUser = await this.userManagementService.getUserByEmail(boiDayCao.email).pipe(take(1)).toPromise();
        if (!boiDayCaoUser) {
          console.error('Cannot find worker in Firestore users collection:', boiDayCao.email);
          this.commonService.thongbao(`Không tìm thấy thông tin ${boiDayCao.username || 'người gia công'} trong hệ thống`, 'Đóng', 'error');
          return;
        }
        

        boiDayCaoUserIds.push(parseInt(boiDayCaoUser.id));
        boiDayCaoFirebaseUids.push(boiDayCaoUser.uid || boiDayCaoUser.id);
      }
      
      // Tạo chỉ 2 documents: 1 cho boidayha, 1 cho boidaycao
      const userBangVeRecords: UserBangVeData[] = [];
      
      // Document cho bối dây hạ (nếu có users)
      if (boiDayHaUserIds.length > 0) {
        const userBangVeHa: UserBangVeData = {
          user_id: boiDayHaUserIds[0], // Sử dụng user đầu tiên làm primary
          firebase_uid: boiDayHaFirebaseUids, // Array của tất cả Firebase UIDs
          bangve_id: bangveId,
          bd_ha_id: '',
          bd_cao_id: '',
          bd_ep_id: '',
          permission_type: 'gia_cong',
          status: true,
          trang_thai_bv: 1,
          trang_thai_bd_ha: 0,
          trang_thai_bd_cao: 0,
          trang_thai_bd_ep: 0,
          assigned_at: new Date(),
          assigned_by_user_id: boiDayHaFirebaseUids, // Array của tất cả Firebase UIDs
          created_at: new Date(),
          created_by: parseInt(currentUserId),
          khau_sx: 'bd_ha',
          trang_thai: 0
        };
        userBangVeRecords.push(userBangVeHa);
      }
      
      // Document cho bối dây cao (nếu có users)
      if (boiDayCaoUserIds.length > 0) {
        const userBangVeCao: UserBangVeData = {
          user_id: boiDayCaoUserIds[0], // Sử dụng user đầu tiên làm primary
          firebase_uid: boiDayCaoFirebaseUids, // Array của tất cả Firebase UIDs
          bangve_id: bangveId,
          bd_ha_id: '',
          bd_cao_id: '',
          bd_ep_id: '',
          permission_type: 'gia_cong',
          status: true,
          trang_thai_bv: 1,
          trang_thai_bd_ha: 0,
          trang_thai_bd_cao: 0,
          trang_thai_bd_ep: 0,
          assigned_at: new Date(),
          assigned_by_user_id: boiDayCaoFirebaseUids, // Array của tất cả Firebase UIDs
          created_at: new Date(),
          created_by: parseInt(currentUserId),
          khau_sx: 'bd_cao',
          trang_thai: 0
        };
        userBangVeRecords.push(userBangVeCao);
      }
      

      
      // 5. Lưu records vào Firebase user_bangve
      const docIds = await this.firebaseUserBangVeService.createMultipleUserBangVe(userBangVeRecords);

      
      const totalUsers = boiDayHaUserIds.length + boiDayCaoUserIds.length;
      this.commonService.thongbao(`Đã gán bảng vẽ cho ${totalUsers} người gia công thành công! (${boiDayHaUserIds.length} bối dây hạ, ${boiDayCaoUserIds.length} bối dây cao)`, 'Đóng', 'success');
      
      // Đóng popup với dữ liệu
      const closeData = {
        confirmed: true,
        message: `Đã gán bảng vẽ cho ${totalUsers} người gia công`,
        userBangVeRecords: userBangVeRecords,
        boiDayHaCount: boiDayHaUserIds.length,
        boiDayCaoCount: boiDayCaoUserIds.length
      };
      
      this.dialogRef.close(closeData);
    } catch (error) {
      console.error('Error in addUserBangVeRecords:', error);
      this.commonService.thongbao('Có lỗi xảy ra khi gán bảng vẽ cho người gia công', 'Đóng', 'error');
    }
  }

  /**
   * Cập nhật trạng thái bảng vẽ trong Firebase
   * @param bangveId ID của bảng vẽ (string)
   * @param trangThai Trạng thái mới
   */
  private async updateBangVeStatus(bangveId: string, trangThai: number): Promise<void> {
    try {

      
      // Cập nhật trạng thái trong Firebase bangve collection
      await this.firebaseBangVeService.updateBangVeStatus(bangveId, trangThai);
      

    } catch (error) {
      console.error('Error updating bangve status:', error);
      throw error;
    }
  }
}
