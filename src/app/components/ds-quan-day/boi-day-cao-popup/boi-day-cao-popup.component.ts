import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { FirebaseService } from '../../../services/firebase.service';
import { QuanDayData } from '../ds-quan-day.component';
import { Constant, MANUFACTURER_OPTIONS, Manufacturer } from '../../../constant/constant';
import { DialogComponent } from '../../shared/dialogs/dialog/dialog.component';
import { KcsQualityService, KcsQualityCheckFailure } from '../../../services/kcs-quality.service';
import { FirebaseBdCaoService, BdCaoData } from '../../../services/firebase-bd-cao.service';
import { FirebaseUserBangVeService } from '../../../services/firebase-user-bangve.service';
import { UserManagementFirebaseService } from '../../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

// Vietnamese date format
export const VIETNAMESE_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-boi-day-cao-popup',
  templateUrl: './boi-day-cao-popup.component.html',
  styleUrls: ['./boi-day-cao-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatRadioModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    { provide: MAT_DATE_FORMATS, useValue: VIETNAMESE_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter }
  ]
})
export class BoiDayCaoPopupComponent implements OnInit {
  boiDayCaoForm: FormGroup;
  isLoading = false;
  currentUser: any;
  authToken: string = '';
  currentDate = new Date();
  showKcsFailureForm = false;
  kcsFailureForm: FormGroup;

  // Danh sách nhà sản xuất - sử dụng enum chung
  manufacturers = MANUFACTURER_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BoiDayCaoPopupComponent>,
    private dialog: MatDialog,
    private commonService: CommonService,
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private changeDetectorRef: ChangeDetectorRef,
    private kcsQualityService: KcsQualityService,
    private firebaseBdCaoService: FirebaseBdCaoService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private userManagementService: UserManagementFirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boiDayCaoForm = this.fb.group({
      // Các field bắt buộc
      quy_cach_day: ['', Validators.required],
      so_soi_day: [1, [Validators.required, Validators.min(1)]],
      nha_san_xuat: [Manufacturer.bsHN, Validators.required],
      nha_san_xuat_other: [''],
      ngay_san_xuat: [new Date(), Validators.required],
      soboiday: ['', Validators.required], // Bỏ Validators.pattern để cho phép nhập text
      
      // Các field kỹ thuật
      chu_vi_khuon: [0, [Validators.min(0)]],
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: [true],
      may_quan_day: ['', Validators.required],
      xung_quanh_day_2: [2, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_3: [3, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_4: [4, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_6: [6, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_2: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_3: [3, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_4: [4, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_6: [6, [Validators.min(2), Validators.max(6)]],
      
      // Chu vi bối dây cao
      chu_vi_bd_cao_1p: [0, [Validators.min(0)]],
      chu_vi_bd_cao_2p: [0, [Validators.min(0)]],
      chu_vi_bd_cao_3p: [0, [Validators.min(0)]],
      
      // Điện trở cao
      dien_tro_cao_ra: [0, [Validators.min(0)]],
      dien_tro_cao_rb: [0, [Validators.min(0)]],
      dien_tro_cao_rc: [0, [Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.min(0), Validators.max(2)]],
      
      ghi_chu: ['']
    });

    // Form cho KCS failure
    this.kcsFailureForm = this.fb.group({
      id_khau_sanxuat: ['', Validators.required],
      ghi_chu: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('BoiDayCaoPopup initialized with data:', this.data);
    
    // Lấy thông tin user hiện tại
    this.currentUser = this.authService.getCurrentUser();
    this.authToken = this.authService.getToken() || '';
    
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', this.authToken ? 'Available' : 'Not available');
  }

  // Kiểm tra form có thể submit được không
  canSubmitForm(): boolean {
    if (this.isLoading) return false;
    
    // Kiểm tra tất cả các field bắt buộc
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat',
      'soboiday',
      'may_quan_day'
    ];
    
    // Kiểm tra các field bắt buộc
    for (const fieldName of requiredFields) {
      const control = this.boiDayCaoForm.get(fieldName);
      if (!control || !control.valid || !control.value) {
        console.log(`Field ${fieldName} không hợp lệ:`, control?.value, control?.errors);
        return false;
      }
    }
    
    // Kiểm tra nhà sản xuất
    const nhaSanXuat = this.boiDayCaoForm.get('nha_san_xuat')?.value;
    if (!nhaSanXuat || !nhaSanXuat.trim()) {
      console.log('Chưa chọn nhà sản xuất');
      return false;
    }
    
    console.log('Form có thể submit - tất cả field bắt buộc đã được nhập');
    return true;
  }

  // Xử lý khi thay đổi nhà sản xuất
  onManufacturerChange(event: any) {
    // Không cần xử lý đặc biệt vì không còn option 'OTHER'
    console.log('Manufacturer changed to:', event.value);
  }

  // Submit form
  async onSubmit() {
    // Mark all fields as touched to show validation errors
    this.boiDayCaoForm.markAllAsTouched();
    
    if (!this.canSubmitForm()) {
      console.log('Form không hợp lệ, không thể submit');
      return;
    }

    this.isLoading = true;
    
    try {
      const formData = this.boiDayCaoForm.value;
      console.log('Form data to submit:', formData);
      
      // Lấy thông tin user hiện tại từ Firebase
      const currentUser = this.authService.getUserInfo();
      if (!currentUser?.email) {
        throw new Error('Không thể lấy thông tin user hiện tại');
      }

      // Lấy user từ Firestore để có user ID
      const userFromFirestore = await this.userManagementService.getUserByEmail(currentUser.email).pipe(take(1)).toPromise();
      if (!userFromFirestore) {
        throw new Error('Không tìm thấy user trong hệ thống');
      }

      // Tạo data cho bd_cao
      const bdCaoData: Omit<BdCaoData, 'id'> = {
        masothe_bd_cao: `${this.data.quanDay.kyhieuquanday}-066`,
        kyhieubangve: this.data.quanDay.kyhieuquanday,
        ngaygiacong: new Date(),
        nguoigiacong: currentUser.fullName || currentUser.username || currentUser.email || 'Unknown',
        quycachday: formData.quy_cach_day,
        sosoiday: formData.so_soi_day,
        ngaysanxuat: formData.ngay_san_xuat,
        nhasanxuat: formData.nha_san_xuat,
        chieuquanday: formData.chieu_quan_day,
        mayquanday: formData.may_quan_day,
        xungquanh: this.getSelectedThickness(formData, 'xung_quanh'),
        haidau: this.getSelectedThickness(formData, 'hai_dau'),
        bd_tt: `${formData.chu_vi_bd_cao_1p},${formData.chu_vi_bd_cao_2p},${formData.chu_vi_bd_cao_3p}`,
        chuvi_bd_tt: formData.chu_vi_bd_cao_1p,
        dientroRa: formData.dien_tro_cao_ra,
        dientroRb: formData.dien_tro_cao_rb,
        dientroRc: formData.dien_tro_cao_rc,
        trang_thai: 1, // Trạng thái hoàn thành
        trang_thai_approve: 'pending', // Trạng thái chờ phê duyệt
        user_update: currentUser.email,
        created_at: new Date(),
        khau_sx: 'bd_cao'
      };

      console.log('BdCao data to save:', bdCaoData);

      // 1. Lưu data vào tbl_bd_cao
      const bdCaoId = await this.firebaseBdCaoService.createBdCao(bdCaoData);
      console.log('BdCao created with ID:', bdCaoId);

      // 2. Cập nhật số bối dây vào bangve
      await this.updateBangVeSoboiday(this.data.quanDay.id, formData.soboiday);

      // 3. Cập nhật trạng thái trong user_bangve với bd_cao_id mới
      await this.updateUserBangVeStatus(userFromFirestore.id, this.data.quanDay.id, bdCaoId);
      
      // Hiển thị thông báo thành công
      this.snackBar.open('Lưu thông tin bối dây cao thành công!', '×', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar', 'compact-snackbar']
      });
      
      // Đóng popup và trả về data
      this.dialogRef.close({
        success: true,
        reloadData: true,
        data: { bdCaoId, bdCaoData },
        message: 'Lưu thông tin bối dây cao thành công!'
      });
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Hiển thị thông báo lỗi
      const errorMessage = error.message || 'Có lỗi xảy ra khi lưu thông tin';
      this.snackBar.open(errorMessage, '×', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar', 'compact-snackbar']
      });
      
      // Hiển thị dialog lỗi chi tiết
      this.showErrorDialog(errorMessage, error);
      
    } finally {
      this.isLoading = false;
    }
  }

  // Cập nhật trạng thái trong user_bangve
  private async updateUserBangVeStatus(userId: string, bangveId: string, bdCaoId: string): Promise<void> {
    try {
      console.log('Updating user_bangve status for user:', userId, 'bangve:', bangveId, 'bdCaoId:', bdCaoId);
      
      // Lấy tất cả assignments của user
      console.log('Getting assignments for userId (string):', userId);
      console.log('Getting assignments for userId (number):', parseInt(userId));
      const userAssignments = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(userId));
      console.log('All user assignments:', userAssignments);
      console.log('Number of assignments found:', userAssignments.length);
      console.log('Looking for bangveId:', bangveId, 'userId:', userId);
      
      // Tìm assignment có bangve_id tương ứng và có bd_cao_id (nếu đã có) hoặc chưa có bd_cao_id
      let relevantAssignment = userAssignments.find(assignment => 
        assignment.bangve_id === String(bangveId) && 
        assignment.khau_sx === 'bd_cao' &&
        (assignment.bd_cao_id === undefined || assignment.bd_cao_id === null || String(assignment.bd_cao_id) === '' || String(assignment.bd_cao_id) === 'undefined' || String(assignment.bd_cao_id) === 'null')
      );
      
      console.log('Relevant assignment found (without bd_cao_id):', relevantAssignment);
      
      // Nếu không tìm thấy assignment chưa có bd_cao_id, tìm assignment có bd_cao_id tương ứng
      if (!relevantAssignment) {
        relevantAssignment = userAssignments.find(assignment => 
          assignment.bangve_id === String(bangveId) && 
          assignment.khau_sx === 'bd_cao' &&
          String(assignment.bd_cao_id) === bdCaoId
        );
        console.log('Relevant assignment found (with matching bd_cao_id):', relevantAssignment);
      }
      
      // Nếu vẫn không tìm thấy, tìm assignment có bangve_id và permission_type = 'gia_cong'
      if (!relevantAssignment) {
        relevantAssignment = userAssignments.find(assignment => 
          assignment.bangve_id === String(bangveId) && 
          assignment.permission_type === 'gia_cong' &&
          assignment.status === true
        );
        console.log('Relevant assignment found (by permission_type):', relevantAssignment);
      }
      
      if (!relevantAssignment) {
        console.warn('No relevant assignment found for user and bangve');
        console.log('Available assignments:', userAssignments.map(a => ({
          id: a.id,
          bangve_id: a.bangve_id,
          khau_sx: a.khau_sx,
          permission_type: a.permission_type,
          status: a.status,
          bd_cao_id: a.bd_cao_id
        })));
        
        // Debug: Log each assignment individually
        console.log('Debugging each assignment:');
        userAssignments.forEach((assignment, index) => {
          console.log(`Assignment ${index}:`, {
            id: assignment.id,
            bangve_id: assignment.bangve_id,
            khau_sx: assignment.khau_sx,
            permission_type: assignment.permission_type,
            status: assignment.status,
            user_id: assignment.user_id,
            bd_cao_id: assignment.bd_cao_id
          });
          console.log(`  - bangve_id match: ${assignment.bangve_id} === ${String(bangveId)} = ${assignment.bangve_id === String(bangveId)}`);
          console.log(`  - khau_sx match: ${assignment.khau_sx} === 'bd_cao' = ${assignment.khau_sx === 'bd_cao'}`);
          console.log(`  - bd_cao_id match: ${assignment.bd_cao_id} === ${bdCaoId} = ${String(assignment.bd_cao_id) === bdCaoId}`);
        });
        
        throw new Error('Không tìm thấy assignment hợp lệ để cập nhật');
      }
      
      console.log('Found relevant assignment:', relevantAssignment);
      
      // Cập nhật bd_cao_id và trạng thái bd_cao thành 2 (đã hoàn thành)
      if (relevantAssignment.id && relevantAssignment.id !== undefined && relevantAssignment.id !== null) {
        console.log('Attempting to update assignment with ID:', relevantAssignment.id);
        
        try {
          // Kiểm tra document có tồn tại không trước khi cập nhật
          const docExists = await this.firebaseUserBangVeService.getUserBangVeById(relevantAssignment.id.toString());
          if (!docExists) {
            console.warn('Document does not exist, trying to find alternative assignment');
            throw new Error('Document không tồn tại');
          }
          
          console.log('Calling updateUserBangVeWithBdCaoId with:', {
            id: relevantAssignment.id.toString(),
            bdCaoId: bdCaoId,
            trang_thai: 2
          });
          
          await this.firebaseUserBangVeService.updateUserBangVeWithBdCaoId(
            relevantAssignment.id.toString(), 
            bdCaoId,
            2 // trang_thai_bd_cao = 2 (đã hoàn thành)
          );
          
          console.log('Successfully updated user_bangve with bd_cao_id and trang_thai_bd_cao = 2');
        } catch (updateError) {
          console.warn('Failed to update with current assignment, trying alternative approach:', updateError);
          
          // Thử tìm assignment khác với logic khác
          const alternativeAssignment = userAssignments.find(assignment => 
            assignment.bangve_id === String(bangveId) && 
            assignment.permission_type === 'gia_cong' &&
            assignment.status === true
          );
          
          if (alternativeAssignment && alternativeAssignment.id) {
            console.log('Found alternative assignment:', alternativeAssignment);
            console.log('Calling updateUserBangVeWithBdCaoId with alternative assignment:', {
              id: alternativeAssignment.id.toString(),
              bdCaoId: bdCaoId,
              trang_thai: 2
            });
            
            await this.firebaseUserBangVeService.updateUserBangVeWithBdCaoId(
              alternativeAssignment.id.toString(), 
              bdCaoId,
              2 // trang_thai_bd_cao = 2 (đã hoàn thành)
            );
            
            console.log('Successfully updated alternative assignment with bd_cao_id and trang_thai_bd_cao = 2');
          } else {
            throw new Error('Không tìm thấy assignment hợp lệ để cập nhật');
          }
        }
      } else {
        console.warn('Assignment ID is undefined or null:', relevantAssignment);
        throw new Error('Không tìm thấy assignment hợp lệ để cập nhật');
      }
      
      console.log('User bangve status updated successfully');
      
    } catch (error) {
      console.error('Error updating user bangve status:', error);
      throw error;
    }
  }

  // Cập nhật assignment thay thế
  private async updateAssignmentWithAlternative(assignment: any, bdCaoId: string): Promise<void> {
    try {
      console.log('Updating alternative assignment:', assignment);
      
      if (assignment.id) {
        // Kiểm tra document có tồn tại không
        const docExists = await this.firebaseUserBangVeService.getUserBangVeById(assignment.id.toString());
        if (docExists) {
          await this.firebaseUserBangVeService.updateUserBangVeWithBdCaoId(
            assignment.id.toString(), 
            bdCaoId,
            2 // trang_thai_bd_cao = 2 (đã hoàn thành)
          );
          console.log('Alternative assignment updated successfully');
        } else {
          throw new Error('Alternative assignment document không tồn tại');
        }
      } else {
        throw new Error('Alternative assignment không có ID');
      }
    } catch (error) {
      console.error('Error updating alternative assignment:', error);
      throw error;
    }
  }

  // Helper to get selected thickness from form data
  private getSelectedThickness(formData: any, fieldName: string): number {
    if (fieldName === 'xung_quanh') {
      if (formData.xung_quanh_day_2 && formData.xung_quanh_day_2 > 0) return 2;
      if (formData.xung_quanh_day_3 && formData.xung_quanh_day_3 > 0) return 3;
      if (formData.xung_quanh_day_4 && formData.xung_quanh_day_4 > 0) return 4;
      if (formData.xung_quanh_day_6 && formData.xung_quanh_day_6 > 0) return 6;
    } else if (fieldName === 'hai_dau') {
      if (formData.hai_dau_day_2 && formData.hai_dau_day_2 > 0) return 2;
      if (formData.hai_dau_day_3 && formData.hai_dau_day_3 > 0) return 3;
      if (formData.hai_dau_day_4 && formData.hai_dau_day_4 > 0) return 4;
      if (formData.hai_dau_day_6 && formData.hai_dau_day_6 > 0) return 6;
    }
    return 2; // Default value
  }

  // Hiển thị dialog lỗi chi tiết
  private showErrorDialog(message: string, error: any) {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '500px',
      data: {
        title: 'Lỗi',
        message: message,
        type: 'error',
        details: error.error?.details || error.stack || 'Không có thông tin chi tiết'
      }
    });
    
    dialogRef.afterClosed().subscribe(() => {
      console.log('Error dialog closed');
    });
  }

  // Hủy bỏ
  onCancel() {
    this.dialogRef.close({
      success: false,
      message: 'Đã hủy bỏ'
    });
  }

  // Hiển thị form KCS failure
  showKcsFailureFormDialog() {
    this.showKcsFailureForm = true;
    this.changeDetectorRef.detectChanges();
  }

  // Ẩn form KCS failure
  hideKcsFailureForm() {
    this.showKcsFailureForm = false;
    this.kcsFailureForm.reset();
    this.changeDetectorRef.detectChanges();
  }

  // Submit KCS failure
  async submitKcsFailure() {
    if (!this.kcsFailureForm.valid) {
      this.snackBar.open('Vui lòng nhập đầy đủ thông tin', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    try {
      const kcsFailureData: KcsQualityCheckFailure = {
        kyhieubangve: this.data.quanDay.kyhieuquanday,
        user_kcs_approve: this.currentUser?.username || this.currentUser?.email || 'Unknown',
        id_khau_sanxuat: this.kcsFailureForm.get('id_khau_sanxuat')?.value,
        ghi_chu: this.kcsFailureForm.get('ghi_chu')?.value,
        check_type: 'boidaycao',
        bd_id: this.data.quanDay.id || 0
      };

      console.log('Submitting KCS failure:', kcsFailureData);

      // Gọi API KCS quality check failure
      const response = await this.kcsQualityService.submitQualityCheckFailure(kcsFailureData).toPromise();
      console.log('KCS failure API response:', response);

      // Hiển thị thông báo thành công
      this.snackBar.open('Đã gửi thông báo KCS failure thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });

      // Ẩn form và đóng popup
      this.hideKcsFailureForm();
      this.dialogRef.close({
        success: true,
        data: response,
        message: 'Đã gửi thông báo KCS failure thành công!',
        kcsFailure: true
      });

    } catch (error: any) {
      console.error('Error submitting KCS failure:', error);
      
      const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra khi gửi thông báo KCS failure';
      this.snackBar.open(errorMessage, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  // Cập nhật số bối dây vào bangve
  private async updateBangVeSoboiday(bangveId: string, soboiday: string): Promise<void> {
    try {
      console.log('Updating soboiday in bangve:', bangveId, 'soboiday:', soboiday);
      
      // Validate input - chỉ kiểm tra không được để trống
      if (!soboiday || soboiday.trim() === '') {
        throw new Error('Số bối dây không được để trống');
      }
      
      // Import FirebaseBangVeService để cập nhật bangve
      const { FirebaseBangVeService } = await import('../../../services/firebase-bangve.service');
      const firebaseBangVeService = new FirebaseBangVeService(this.firebaseService);
      
      // Cập nhật số bối dây trong bangve
      await firebaseBangVeService.updateBangVe(bangveId, { soboiday: soboiday.trim() });
      
      console.log('Successfully updated soboiday in bangve:', soboiday);
    } catch (error: any) {
      console.error('Error updating soboiday in bangve:', error);
      throw new Error(`Không thể cập nhật số bối dây: ${error.message}`);
    }
  }

  // Test method để kiểm tra chức năng lưu số bối dây
  testSoboidaySave(): void {
    console.log('Testing soboiday save functionality...');
    
    // Test với dữ liệu hợp lệ
    this.boiDayCaoForm.patchValue({
      quy_cach_day: '2.5mm²',
      so_soi_day: 1,
      nha_san_xuat: Manufacturer.bsHN,
      ngay_san_xuat: new Date(),
      soboiday: '3',
      chu_vi_khuon: 100,
      kt_bung_bd_truoc: 50,
      bung_bd_sau: 60,
      chieu_quan_day: true,
      may_quan_day: 'Máy 1',
      chu_vi_bd_cao_1p: 200,
      chu_vi_bd_cao_2p: 200,
      chu_vi_bd_cao_3p: 200,
      dien_tro_cao_ra: 1.5,
      dien_tro_cao_rb: 1.5,
      dien_tro_cao_rc: 1.5
    });
    
    console.log('Form patched with test data');
    console.log('Form valid:', this.boiDayCaoForm.valid);
    console.log('Soboiday value:', this.boiDayCaoForm.get('soboiday')?.value);
  }
}