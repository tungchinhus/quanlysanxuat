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
    MatIconModule
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
      boiDayHa: ['', Validators.required],
      boiDayCao: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Kiểm tra quyền admin hoặc manager
    this.hasPermission = this.hasAdminOrManagerRole();
    
    if (!this.hasPermission) {
      this.commonService.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin, manager hoặc tổ trưởng mới được phép.', 'Đóng', 'error');
      this.dialogRef.close();
      return;
    }

    // Load danh sách người gia công
    this.loadWorkers();
    
    // Subscribe to form changes to validate user selection
    this.giaCongForm.valueChanges.subscribe(() => {
      console.log('Form values changed, validating...');
      this.validateUserSelection();
      // Force refresh validation state
      this.forceValidationRefresh();
    });
  }

  // Method để force refresh validation state
  private forceValidationRefresh(): void {
    // Trigger change detection để cập nhật UI
    setTimeout(() => {
      this.giaCongForm.updateValueAndValidity();
      console.log('Validation refreshed');
      console.log('Form valid:', this.giaCongForm.valid);
      console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    }, 100);
  }

  // Kiểm tra quyền admin hoặc manager
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
    
    // Kiểm tra role từ userInfo trước
    if (roles && roles.length > 0) {
      return roles.some((role: string) => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'manager' ||
        role.toLowerCase() === 'administrator' ||
        role.toLowerCase() === 'totruong'
      );
    }
    
    // Fallback: kiểm tra role từ localStorage
    if (userRole) {
      return userRole.toLowerCase() === 'admin' || 
             userRole.toLowerCase() === 'manager' ||
             userRole.toLowerCase() === 'administrator' ||
             userRole.toLowerCase() === 'totruong';
    }
    
    return false;
  }

  loadWorkers(): void {
    this.isLoadingWorkers = true;
    // Lấy users trực tiếp từ Firebase và filter theo khâu sản xuất
    this.getWorkers().then((workers) => {
        // Loại bỏ admin/manager/administrator
        this.nguoiGiaCongOptions = workers.filter(worker => {
          const roles = (worker.roles || (worker.role ? [worker.role] : [])).map(r => r.toLowerCase());
          return !roles.includes('admin') && !roles.includes('manager') && !roles.includes('administrator');
        });
        
        // Phân loại user theo ROLE: QUANDAYHA, QUANDAYCAO
        this.quandayhaUsers = this.nguoiGiaCongOptions.filter(worker => this.workerHasRole(worker, 'quandayha'));
        this.quandaycaoUsers = this.nguoiGiaCongOptions.filter(worker => this.workerHasRole(worker, 'quandaycao'));
        
        console.log('All workers from API:', workers);
        console.log('Filtered workers (role=user):', this.nguoiGiaCongOptions);
        console.log('Quan day ha users:', this.quandayhaUsers);
        console.log('Quan day cao users:', this.quandaycaoUsers);
        
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
      const khau = (u.khau_sx || '').toLowerCase().trim();
      let normalizedKhau = '';
      if (khau.includes('boidayha') || khau.includes('quandayha') || khau.includes('ha')) {
        normalizedKhau = 'quandayha';
      } else if (khau.includes('boidaycao') || khau.includes('quandaycao') || khau.includes('cao')) {
        normalizedKhau = 'quandaycao';
      }
      const roleArray: string[] = Array.isArray(u.roles)
        ? u.roles.map((r: any) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
        : [];
      const roleName = roleArray[0] || 'user';
      return {
        id: Number.isFinite(Number(u.id)) ? Number(u.id) : Date.now(),
        userId: undefined,
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
    console.log('=== POPUP onConfirm called ===');
    console.log('Form valid:', this.giaCongForm.valid);
    console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    console.log('Form values:', this.giaCongForm.value);
    
    if (this.isFormValidForSubmission) {
      const formValue = this.giaCongForm.value;
      console.log('Form is valid, preparing to close with data:', formValue);
      console.log('boiDayHa details:', {
        id: formValue.boiDayHa?.id,
        userId: formValue.boiDayHa?.userId,
        FirstName: formValue.boiDayHa?.FirstName,
        LastName: formValue.boiDayHa?.LastName,
        displayName: this.getWorkerDisplayName(formValue.boiDayHa)
      });
      console.log('boiDayCao details:', {
        id: formValue.boiDayCao?.id,
        userId: formValue.boiDayCao?.userId,
        FirstName: formValue.boiDayCao?.FirstName,
        LastName: formValue.boiDayCao?.LastName,
        displayName: this.getWorkerDisplayName(formValue.boiDayCao)
      });
      
      // Gọi API để thêm dữ liệu vào user_bangve
      this.addUserBangVeRecords(formValue.boiDayHa, formValue.boiDayCao);
    } else {
      console.log('Form validation failed, showing error messages');
      // Kiểm tra từng trường hợp lỗi để hiển thị thông báo phù hợp
      const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
      const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
      
      console.log('Form validation failed:');
      console.log('boiDayHa:', boiDayHa);
      console.log('boiDayCao:', boiDayCao);
      console.log('boiDayHa errors:', this.giaCongForm.get('boiDayHa')?.errors);
      console.log('boiDayCao errors:', this.giaCongForm.get('boiDayCao')?.errors);
      
      if (!boiDayHa) {
        this.commonService.thongbao('Vui lòng chọn người thực hiện bối dây hạ.', 'Đóng', 'warning');
      } else if (!boiDayCao) {
        this.commonService.thongbao('Vui lòng chọn người thực hiện bối dây cao.', 'Đóng', 'warning');
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

  // Kiểm tra form có hợp lệ và 2 user khác nhau
  get isFormValidForSubmission(): boolean {
    console.log('=== Checking isFormValidForSubmission ===');
    console.log('Form valid:', this.giaCongForm.valid);
    
    if (!this.giaCongForm.valid) {
      console.log('Form is not valid, returning false');
      return false;
    }
    
    const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
    const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
    
    console.log('Checking form validity:');
    console.log('boiDayHa:', boiDayHa);
    console.log('boiDayCao:', boiDayCao);
    console.log('boiDayHa type:', typeof boiDayHa);
    console.log('boiDayCao type:', typeof boiDayCao);
    
    // Kiểm tra cả hai trường đã được chọn
    if (!boiDayHa || !boiDayCao) {
      console.log('One or both fields are empty, returning false');
      return false;
    }
    
    // Kiểm tra 2 user phải khác nhau - so sánh nhiều trường
    const areDifferent = this.areUsersDifferent(boiDayHa, boiDayCao);
    console.log('Are users different?', areDifferent);
    console.log('Final result:', areDifferent);
    
    return areDifferent;
  }

  // Method để kiểm tra 2 user có khác nhau không
  private areUsersDifferent(user1: Worker, user2: Worker): boolean {
    console.log('=== Comparing users ===');
    console.log('User1:', user1);
    console.log('User2:', user2);
    console.log('User1 ID:', user1?.id, 'Type:', typeof user1?.id);
    console.log('User2 ID:', user2?.id, 'Type:', typeof user2?.id);
    console.log('User1 userId:', user1?.userId, 'Type:', typeof user1?.userId);
    console.log('User2 userId:', user2?.userId, 'Type:', typeof user2?.userId);
    console.log('User1 khau_sx:', user1?.khau_sx);
    console.log('User2 khau_sx:', user2?.khau_sx);
    console.log('User1 name:', user1?.name);
    console.log('User2 name:', user2?.name);
    console.log('User1 FirstName:', user1?.FirstName);
    console.log('User2 FirstName:', user2?.FirstName);
    console.log('User1 LastName:', user1?.LastName);
    console.log('User2 LastName:', user2?.LastName);
    
    // So sánh ID trước (quan trọng nhất)
    if (user1.id !== user2.id) {
      console.log('Users have different IDs, returning true');
      return true;
    }
    
    // So sánh userId nếu có
    if (user1.userId && user2.userId && user1.userId !== user2.userId) {
      console.log('Users have different userIds, returning true');
      return true;
    }
    
    // So sánh FirstName + LastName nếu có
    if (user1.FirstName && user2.FirstName && user1.FirstName !== user2.FirstName) {
      console.log('Users have different FirstNames, returning true');
      return true;
    }
    
    if (user1.LastName && user2.LastName && user1.LastName !== user2.LastName) {
      console.log('Users have different LastNames, returning true');
      return true;
    }
    
    // So sánh name nếu có
    if (user1.name && user2.name && user1.name !== user2.name) {
      console.log('Users have different names, returning true');
      return true;
    }
    
    // So sánh email
    if (user1.email && user2.email && user1.email !== user2.email) {
      console.log('Users have different emails, returning true');
      return true;
    }
    
    // So sánh username
    if (user1.username && user2.username && user1.username !== user2.username) {
      console.log('Users have different usernames, returning true');
      return true;
    }
    
    // So sánh khau_sx (cuối cùng vì có thể giống nhau)
    if (user1.khau_sx && user2.khau_sx && user1.khau_sx !== user2.khau_sx) {
      console.log('Users have different khau_sx, returning true');
      return true;
    }
    
    console.log('All fields are the same, returning false');
    // Nếu tất cả đều giống nhau, trả về false
    return false;
  }

  // Validate user selection to ensure they are different
  private validateUserSelection(): void {
    const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
    const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
    
    console.log('Validating user selection:');
    console.log('boiDayHa:', boiDayHa);
    console.log('boiDayCao:', boiDayCao);
    
    if (boiDayHa && boiDayCao) {
      const areDifferent = this.areUsersDifferent(boiDayHa, boiDayCao);
      console.log('Users are different?', areDifferent);
      
      if (!areDifferent) {
        // Nếu 2 user giống nhau, hiển thị thông báo
        console.log('Setting sameUser error');
        this.giaCongForm.get('boiDayCao')?.setErrors({ 'sameUser': true });
      } else {
        // Xóa lỗi nếu 2 user khác nhau
        console.log('Clearing sameUser error');
        const currentErrors = this.giaCongForm.get('boiDayCao')?.errors;
        if (currentErrors && currentErrors['sameUser']) {
          delete currentErrors['sameUser'];
          if (Object.keys(currentErrors).length === 0) {
            this.giaCongForm.get('boiDayCao')?.setErrors(null);
          } else {
            this.giaCongForm.get('boiDayCao')?.setErrors(currentErrors);
          }
        }
      }
      
      // Debug: Log form state sau khi validation
      console.log('Form state after validation:');
      console.log('Form valid:', this.giaCongForm.valid);
      console.log('boiDayCao errors:', this.giaCongForm.get('boiDayCao')?.errors);
      console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    }
  }

  // Method to log worker details for debugging
  private logWorkerDetails(): void {
    console.log('=== Logging Worker Details ===');
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
    
    console.log('=== Quan Day Ha Users ===');
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
    
    console.log('=== Quan Day Cao Users ===');
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
    // Làm sạch khau_sx field trước
    this.nguoiGiaCongOptions.forEach(worker => {
      if (worker.khau_sx) {
        // Chuẩn hóa khau_sx field
        const khauSx = worker.khau_sx.toLowerCase().trim();
        if (khauSx.includes('boidayha')) {
          worker.khau_sx = 'quandayha'; // Chuyển boidayha thành quandayha
        } else if (khauSx.includes('boidaycao')) {
          worker.khau_sx = 'quandaycao'; // Chuyển boidaycao thành quandaycao
        }
      }
    });
    
    // Không cần làm sạch field name nữa vì chúng ta sẽ sử dụng FirstName + LastName trực tiếp
    // Chỉ cần đảm bảo FirstName và LastName có giá trị hợp lệ
    
    // Cập nhật lại các danh sách đã filter
    /*this.quandayhaUsers = this.nguoiGiaCongOptions.filter(worker => 
      worker.khau_sx?.toLowerCase() === 'quandayha'
    );
    
    this.quandaycaoUsers = this.nguoiGiaCongOptions.filter(worker => 
      worker.khau_sx?.toLowerCase() === 'quandaycao'
    );*/
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
      console.log('=== Testing Validation ===');
      console.log('Test User 1:', testUser1);
      console.log('Test User 2:', testUser2);
      const areDifferent = this.areUsersDifferent(testUser1, testUser2);
      console.log('Test validation result:', areDifferent);
      console.log('========================');
    }
  }

  /**
   * Thêm dữ liệu vào bảng user_bangve cho cả hai user
   * @param boiDayHa User thực hiện bối dây hạ
   * @param boiDayCao User thực hiện bối dây cao
   */
  private async addUserBangVeRecords(boiDayHa: Worker, boiDayCao: Worker): Promise<void> {
    console.log('=== addUserBangVeRecords called ===');
    console.log('boiDayHa:', boiDayHa);
    console.log('boiDayCao:', boiDayCao);
    console.log('data.drawing:', this.data.drawing);
    console.log('data.drawing.id:', this.data.drawing?.id, 'Type:', typeof this.data.drawing?.id);

    if (!this.data.drawing || !this.data.drawing.id) {
      console.error('No drawing data available');
      this.commonService.thongbao('Không có dữ liệu bảng vẽ', 'Đóng', 'error');
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
    if (!bangveId || bangveId.trim().length === 0) {
      console.error('Invalid bangve ID after conversion:', bangveId, 'Original:', this.data.drawing.id);
      this.commonService.thongbao('ID bảng vẽ không hợp lệ', 'Đóng', 'error');
      return;
    }

    console.log('Valid bangve ID:', bangveId, 'Type:', typeof bangveId);
    const currentUser = this.authService.getUserInfo();
    const currentUserEmail = currentUser?.email;
    
    if (!currentUserEmail) {
      console.error('Cannot get current user email');
      this.commonService.thongbao('Không thể lấy thông tin user', 'Đóng', 'error');
      return;
    }

    try {
      // 1. Lấy user ID từ Firestore users collection dựa vào email
      console.log('Getting user by email from Firestore:', currentUserEmail);
      const currentUserFromFirestore = await this.userManagementService.getUserByEmail(currentUserEmail).pipe(take(1)).toPromise();
      if (!currentUserFromFirestore) {
        console.error('User not found in Firestore users collection');
        this.commonService.thongbao('User không tồn tại trong hệ thống', 'Đóng', 'error');
        return;
      }
      const currentUserId = parseInt(currentUserFromFirestore.id);
      console.log('Current user ID from Firestore:', currentUserId);

      // 2. Cập nhật trang_thai = 1 trong tbl_bangve (đang thi công)
      console.log('Updating bangve status to 1 (in progress)...');
      await this.updateBangVeStatus(bangveId, 1);

      // 3. Tạo dữ liệu cho user bối dây hạ với đầy đủ các trường theo thiết kế database
      const userBangVeHa: UserBangVeData = {
        user_id: boiDayHa.userId || boiDayHa.id,
        firebase_uid: undefined, // Firebase Authentication UID - sẽ được cập nhật sau
        bangve_id: bangveId,
        bd_ha_id: boiDayHa.userId || boiDayHa.id, // Foreign Key to tbl_bd_ha
        bd_cao_id: undefined, // Không có bd_cao_id cho user bối dây hạ
        bd_ep_id: undefined, // Không có bd_ep_id cho user bối dây hạ
        permission_type: 'gia_cong',
        status: true,
        trang_thai_bv: 1, // Bảng vẽ đang thi công
        trang_thai_bd_ha: 0, // 0 = chỉ mới gán chưa thi công
        trang_thai_bd_cao: undefined, // Không áp dụng cho user bối dây hạ
        trang_thai_bd_ep: undefined, // Không áp dụng cho user bối dây hạ
        assigned_at: new Date(),
        assigned_by_user_id: currentUserId,
        created_at: new Date(),
        created_by: currentUserId,
        // Legacy fields for backward compatibility
        khau_sx: 'bd_ha',
        trang_thai: 0 // 0 = chỉ mới gán chưa thi công
      };

      // 4. Tạo dữ liệu cho user bối dây cao với đầy đủ các trường theo thiết kế database
      const userBangVeCao: UserBangVeData = {
        user_id: boiDayCao.userId || boiDayCao.id,
        firebase_uid: undefined, // Firebase Authentication UID - sẽ được cập nhật sau
        bangve_id: bangveId,
        bd_ha_id: undefined, // Không có bd_ha_id cho user bối dây cao
        bd_cao_id: boiDayCao.userId || boiDayCao.id, // Foreign Key to tbl_bd_cao
        bd_ep_id: undefined, // Không có bd_ep_id cho user bối dây cao
        permission_type: 'gia_cong',
        status: true,
        trang_thai_bv: 1, // Bảng vẽ đang thi công
        trang_thai_bd_ha: undefined, // Không áp dụng cho user bối dây cao
        trang_thai_bd_cao: 0, // 0 = chỉ mới gán chưa thi công
        trang_thai_bd_ep: undefined, // Không áp dụng cho user bối dây cao
        assigned_at: new Date(),
        assigned_by_user_id: currentUserId,
        created_at: new Date(),
        created_by: currentUserId,
        // Legacy fields for backward compatibility
        khau_sx: 'bd_cao',
        trang_thai: 0 // 0 = chỉ mới gán chưa thi công
      };

      console.log('userBangVeHa:', userBangVeHa);
      console.log('userBangVeCao:', userBangVeCao);

      // 5. Lưu 2 dòng dữ liệu vào Firebase user_bangve
      const docIds = await this.firebaseUserBangVeService.createMultipleUserBangVe([userBangVeHa, userBangVeCao]);
      console.log('UserBangVe records added successfully to Firebase:', docIds);
      
      this.commonService.thongbao('Đã gán bảng vẽ cho người gia công thành công!', 'Đóng', 'success');
      
      // Đóng popup với dữ liệu
      const closeData = {
        confirmed: true,
        boiDayHa: boiDayHa,
        boiDayCao: boiDayCao,
        userBangVeAdded: true
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
      console.log(`Updating bangve ${bangveId} status to ${trangThai}`);
      
      // Cập nhật trạng thái trong Firebase bangve collection
      await this.firebaseBangVeService.updateBangVeStatus(bangveId, trangThai);
      
      console.log(`Bangve ${bangveId} status updated successfully to ${trangThai}`);
    } catch (error) {
      console.error('Error updating bangve status:', error);
      throw error;
    }
  }
}
