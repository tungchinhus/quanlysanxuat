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
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { QuanDayData } from '../ds-quan-day.component';
import { Constant } from '../../../constant/constant';
import { DialogComponent } from '../../shared/dialogs/dialog/dialog.component';
import { KcsQualityService, KcsQualityCheckFailure } from '../../../services/kcs-quality.service';

export interface BoiDayHaData {
  id?: number;
  quan_day_id: number;
  ky_hieu_bv: string;
  cong_suat: number;
  tbkt: string;
  dien_ap: string;
  so_boi_day: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  nha_san_xuat_name?: string;
  ngay_san_xuat: Date;
  chu_vi_khuon: number;
  nguoi_gia_cong: string;
  ngay_gia_cong: Date;
  ghi_chu?: string;
  trang_thai: number;
  // Các field kỹ thuật cần thiết
  kt_bung_bd_truoc?: number;
  bung_bd_sau?: number;
  chieu_quan_day?: boolean;
  may_quan_day?: string;
  xung_quanh_day?: number;
  hai_dau_day?: number;
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  dien_tro_ha_ra?: number;
  dien_tro_ha_rb?: number;
  dien_tro_ha_rc?: number;
  do_lech_dien_tro_giua_cac_pha?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface cho việc submit data lên API
export interface BoiDayHaSubmitData {
  quan_day_id: number;
  ky_hieu_bv: string;
  cong_suat: number;
  tbkt: string;
  dien_ap: string;
  so_boi_day: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  nha_san_xuat_name?: string;
  ngay_san_xuat: string;
  chu_vi_khuon: number;
  ghi_chu?: string;
  trang_thai: number;
  kt_bung_bd_truoc?: number;
  bung_bd_sau?: number;
  chieu_quan_day?: boolean;
  may_quan_day?: string;
  xung_quanh_day?: number;
  hai_dau_day?: number;
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  dien_tro_ha_ra?: number;
  dien_tro_ha_rb?: number;
  dien_tro_ha_rc?: number;
  do_lech_dien_tro_giua_cac_pha?: number;
}

// Interface cho API request
export interface BoiDayHaApiRequest {
  masothe_bd_ha: string;
  kyhieubangve: string;
  ngaygiacong: string;
  nguoigiacong: string;
  quycachday: string;
  sosoiday: number;
  ngaysanxuat: string;
  nhasanxuat: string;
  chuvikhuon: number;
  kt_bung_bd: number;
  chieuquanday: boolean;
  mayquanday: string;
  xungquanh: number;
  haidau: number;
  kt_boiday_trong: string;
  chuvi_bd_trong: number;
  kt_bd_ngoai: string;
  dientroRa: number;
  dientroRb: number;
  dientroRc: number;
  dolechdientro: number;
  trang_thai: number;
  khau_sx: string;
}

@Component({
  selector: 'app-boi-day-ha-popup',
  templateUrl: './boi-day-ha-popup.component.html',
  styleUrls: ['./boi-day-ha-popup.component.scss'],
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
  ]
})
export class BoiDayHaPopupComponent implements OnInit {
  boiDayHaForm: FormGroup;
  isLoading = false;
  currentUser: any;
  authToken: string = '';
  currentDate = new Date();
  showKcsFailureForm = false; // Hiển thị form KCS failure
  kcsFailureForm: FormGroup; // Form cho KCS failure

  // Danh sách nhà sản xuất
  manufacturers = [
    { value: 'nha_sx1', name: 'Nha sx 1' },
    { value: 'nha_sx2', name: 'Nha sx 2' },
    { value: 'nha_sx3', name: 'Nha sx 3' },
    { value: 'OTHER', name: 'Khác' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BoiDayHaPopupComponent>,
    private dialog: MatDialog,
    private commonService: CommonService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private kcsQualityService: KcsQualityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boiDayHaForm = this.fb.group({
      // Các field bắt buộc
      quy_cach_day: ['', Validators.required],
      so_soi_day: [1, [Validators.required, Validators.min(1)]],
      nha_san_xuat: ['nha_sx1', Validators.required],
      nha_san_xuat_other: [''],
      ngay_san_xuat: [new Date(), Validators.required],
      
      // Các field kỹ thuật
      chu_vi_khuon: [0, [Validators.min(0)]],
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: [true],
      may_quan_day: [''],
      xung_quanh_day_2: [2, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_3: [3, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_4: [4, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_6: [6, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_2: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_3: [3, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_4: [4, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_6: [6, [Validators.min(2), Validators.max(6)]],
      
      // Chu vi bối dây hạ trong
      chu_vi_bd_ha_trong_1p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.min(0)]],
      
      // Kích thước bối dây hạ ngoài
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.min(0)]],
      
      // Điện trở hạ
      dien_tro_ha_ra: [0, [Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.min(0)]],
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
    console.log('BoiDayHaPopup initialized with data:', this.data);
    
    // Lấy thông tin user hiện tại
    this.currentUser = this.authService.getCurrentUser();
    this.authToken = this.authService.getToken() || '';
    
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', this.authToken ? 'Available' : 'Not available');
  }

  // Kiểm tra form có thể submit được không
  canSubmitForm(): boolean {
    if (this.isLoading) return false;
    
    // Chỉ kiểm tra các field thực sự cần thiết cho business logic
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat'
    ];
    
    // Kiểm tra các field bắt buộc
    for (const fieldName of requiredFields) {
      const control = this.boiDayHaForm.get(fieldName);
      if (!control || !control.valid || !control.value) {
        console.log(`Field ${fieldName} không hợp lệ:`, control?.value, control?.errors);
        return false;
      }
    }
    
    // Kiểm tra nhà sản xuất khác nếu chọn "OTHER"
    const nhaSanXuat = this.boiDayHaForm.get('nha_san_xuat')?.value;
    if (nhaSanXuat === 'OTHER') {
      const nhaSanXuatOther = this.boiDayHaForm.get('nha_san_xuat_other')?.value;
      if (!nhaSanXuatOther || !nhaSanXuatOther.trim()) {
        console.log('Chưa nhập tên nhà sản xuất khác');
        return false;
      }
    }
    
    console.log('Form có thể submit - tất cả field bắt buộc đã được nhập');
    return true;
  }

  // Xử lý khi thay đổi nhà sản xuất
  onManufacturerChange(event: any) {
    const selectedValue = event.value;
    const otherField = this.boiDayHaForm.get('nha_san_xuat_other');
    
    if (selectedValue === 'OTHER') {
      // Nếu chọn "Khác", thêm validation required cho field nhà sản xuất khác
      otherField?.setValidators([Validators.required]);
      otherField?.markAsUntouched();
    } else {
      // Nếu chọn nhà sản xuất có sẵn, bỏ validation required
      otherField?.clearValidators();
      otherField?.setValue('');
      otherField?.markAsUntouched();
    }
    
    otherField?.updateValueAndValidity();
  }

  // Validate dữ liệu trước khi gửi API
  private validateSubmitData(data: BoiDayHaSubmitData | BoiDayHaApiRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    console.log('validateSubmitData: Validating data:', data);
    
    // Type guard để kiểm tra loại data
    const isSubmitData = (data: any): data is BoiDayHaSubmitData => {
      return 'quy_cach_day' in data;
    };
    
    const isApiRequest = (data: any): data is BoiDayHaApiRequest => {
      return 'quycachday' in data;
    };
    
         // Kiểm tra các field bắt buộc
     if (isSubmitData(data)) {
       if (!data.quy_cach_day?.trim()) {
         errors.push('Quy cách dây là bắt buộc');
       }
       if (!data.so_soi_day || data.so_soi_day <= 0) {
         errors.push('Số sợi dây phải lớn hơn 0');
       }
       if (!data.nha_san_xuat) {
         errors.push('Nhà sản xuất là bắt buộc');
       }
       if (!data.ngay_san_xuat) {
         errors.push('Ngày sản xuất là bắt buộc');
       }
     } else if (isApiRequest(data)) {
       if (!data.quycachday?.trim()) {
         errors.push('Quy cách dây là bắt buộc');
       }
       if (!data.sosoiday || data.sosoiday <= 0) {
         errors.push('Số sợi dây phải lớn hơn 0');
       }
       if (!data.nhasanxuat) {
         errors.push('Nhà sản xuất là bắt buộc');
       }
       if (!data.ngaysanxuat) {
         errors.push('Ngày sản xuất là bắt buộc');
       }
       if (!data.kyhieubangve?.trim()) {
         errors.push('Ký hiệu bảng vẽ là bắt buộc');
       }
       if (!data.nguoigiacong?.trim()) {
         errors.push('Người gia công là bắt buộc');
       }
     }
    
    console.log('Validation errors:', errors);
    return { isValid: errors.length === 0, errors };
  }

  // Chuyển đổi từ form data sang API request format
  private convertToApiRequest(formData: any): BoiDayHaApiRequest {
    const nhaSanXuat = formData.nha_san_xuat === 'OTHER' ? formData.nha_san_xuat_other : formData.nha_san_xuat;
    const nhaSanXuatName = formData.nha_san_xuat === 'OTHER' ? formData.nha_san_xuat_other : this.getManufacturerName(formData.nha_san_xuat);
    
    return {
      masothe_bd_ha: `${this.data.quanDay.kyhieuquanday}-065`,
      kyhieubangve: this.data.quanDay.kyhieuquanday,
      ngaygiacong: new Date().toISOString().split('T')[0],
      nguoigiacong: this.currentUser?.hoten || this.currentUser?.username || this.currentUser?.email || 'Unknown',
      quycachday: formData.quy_cach_day,
      sosoiday: formData.so_soi_day,
      ngaysanxuat: formData.ngay_san_xuat.toISOString().split('T')[0],
      nhasanxuat: nhaSanXuat,
      chuvikhuon: formData.chu_vi_khuon,
      kt_bung_bd: formData.kt_bung_bd_truoc || 0,
      chieuquanday: formData.chieu_quan_day,
      mayquanday: formData.may_quan_day,
      xungquanh: formData.xung_quanh_day_2,
      haidau: formData.hai_dau_day_2,
      kt_boiday_trong: formData.kt_boiday_trong,
      chuvi_bd_trong: formData.chu_vi_bd_ha_trong_1p,
      kt_bd_ngoai: formData.kt_bd_ngoai,
      dientroRa: formData.dien_tro_ha_ra,
      dientroRb: formData.dien_tro_ha_rb,
      dientroRc: formData.dien_tro_ha_rc,
      dolechdientro: formData.do_lech_dien_tro_giua_cac_pha,
      trang_thai: 1,
      khau_sx: this.currentUser?.khau_sx
    };
  }

  // Lấy tên nhà sản xuất từ value
  private getManufacturerName(value: string): string {
    const manufacturer = this.manufacturers.find(m => m.value === value);
    return manufacturer ? manufacturer.name : value;
  }

  // Submit form
  async onSubmit() {
    if (!this.canSubmitForm()) {
      console.log('Form không hợp lệ, không thể submit');
      return;
    }

    this.isLoading = true;
    
    try {
      const formData = this.boiDayHaForm.value;
      console.log('Form data to submit:', formData);
      
      // Chuyển đổi sang API request format
      const apiRequest = this.convertToApiRequest(formData);
      console.log('API request:', apiRequest);
      
      // Validate dữ liệu
      const validation = this.validateSubmitData(apiRequest);
      if (!validation.isValid) {
        throw new Error(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`);
      }
      
      // Gọi API save-bd-ha
      const response = await this.submitToApi(apiRequest);
      console.log('save-bd-ha API response:', response);
      
      // Hiển thị thông báo thành công
      this.snackBar.open('Lưu thông tin bối dây hạ thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      // Đóng popup và trả về data
      this.dialogRef.close({
        success: true,
        data: response,
        message: 'Lưu thông tin bối dây hạ thành công!'
      });
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Hiển thị thông báo lỗi
      const errorMessage = error.error?.message || error.message || 'Có lỗi xảy ra khi lưu thông tin';
      this.snackBar.open(errorMessage, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      
      // Hiển thị dialog lỗi chi tiết
      this.showErrorDialog(errorMessage, error);
      
    } finally {
      this.isLoading = false;
    }
  }

  // Gọi API save-bd-ha để lưu thông tin bối dây hạ
  private async submitToApi(data: BoiDayHaApiRequest): Promise<any> {
    const url = `${this.commonService.getServerAPIURL()}api/ProductionData/save-bd-ha`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json'
    });
    
    console.log('Submitting to save-bd-ha API:', url);
    console.log('Request data:', data);
    console.log('Headers:', headers);
    
    return new Promise((resolve, reject) => {
      this.http.post(url, data, { headers }).subscribe({
        next: (response: any) => {
          console.log('save-bd-ha API response success:', response);
          resolve(response);
        },
        error: (error: any) => {
          console.error('save-bd-ha API error:', error);
          reject(error);
        }
      });
    });
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
        check_type: 'boidayha',
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

  // Helper to get selected thickness from form data
  private getSelectedThickness(formData: any, fieldName: string): number {
    if (fieldName === 'xung_quanh') {
      // Check which xung quanh field has a value
      if (formData.xung_quanh_day_2 && formData.xung_quanh_day_2 > 0) return 2;
      if (formData.xung_quanh_day_3 && formData.xung_quanh_day_3 > 0) return 3;
      if (formData.xung_quanh_day_4 && formData.xung_quanh_day_4 > 0) return 4;
      if (formData.xung_quanh_day_6 && formData.xung_quanh_day_6 > 0) return 6;
    } else if (fieldName === 'hai_dau') {
      // Check which hai dau field has a value
      if (formData.hai_dau_day_2 && formData.hai_dau_day_2 > 0) return 2;
      if (formData.hai_dau_day_3 && formData.hai_dau_day_3 > 0) return 3;
      if (formData.hai_dau_day_4 && formData.hai_dau_day_4 > 0) return 4;
      if (formData.hai_dau_day_6 && formData.hai_dau_day_6 > 0) return 6;
    }
    return 2; // Default value
  }
}
