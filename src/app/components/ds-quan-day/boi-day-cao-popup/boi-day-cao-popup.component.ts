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
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Constant } from '../../../constant/constant';
import { DialogComponent } from '../../../components/shared/dialogs/dialog/dialog.component';
import { KcsQualityService, KcsQualityCheckFailure } from '../../../services/kcs-quality.service';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { STATUS } from '../../../models/common.enum';


export interface BoiDayCaoData {
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
  nha_san_xuat_name?: string; // Tên hiển thị của nhà sản xuất
  ngay_san_xuat: Date;
  chu_vi_khuon: number;
  nguoi_gia_cong: string;
  ngay_gia_cong: Date;
  ghi_chu?: string;
  trang_thai: number;
  // Thêm các field đặc biệt cho bối dây cao
  chieu_cao_day?: number;
  so_lop_day?: number;
  khoang_cach_day?: number;
  chat_lieu_cach_dien?: string;
  // Bổ sung thêm các field kỹ thuật
  do_day_cach_dien?: number;
  nhiet_do_lam_viec?: number;
  do_am_moi_truong?: number;
  ap_luc_lam_viec?: number;
  toc_do_quay?: number;
  thoi_gian_quay?: number;
  loai_may_quay?: string;
  // Bổ sung thêm các field theo hình
  kt_bung_bd_truoc?: number;
  bung_bd_sau?: number;
  chieu_quan_day?: boolean; // true = trái, false = phải
  may_quan_day?: string;
  xung_quanh_day?: number; // 2, 3, 4, 6
  hai_dau_day?: number; // 2, 3, 4, 6
  kt_bd_ha_trong_bv?: string;
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  kt_bd_ha_ngoai_bv?: string;
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

// Interface cho việc submit data lên API (không bao gồm timestamp fields)
export interface BoiDayCaoSubmitData {
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
  ngay_san_xuat: string; // ISO date string
  chu_vi_khuon: number;
  ghi_chu?: string;
  trang_thai: number;
  chieu_cao_day?: number;
  so_lop_day?: number;
  khoang_cach_day?: number;
  chat_lieu_cach_dien?: string;
  do_day_cach_dien?: number;
  nhiet_do_lam_viec?: number;
  do_am_moi_truong?: number;
  ap_luc_lam_viec?: number;
  toc_do_quay?: number;
  thoi_gian_quay?: number;
  loai_may_quay?: string;
  kt_bung_bd_truoc?: number;
  bung_bd_sau?: number;
  chieu_quan_day?: boolean;
  may_quan_day?: string;
  xung_quanh_day?: number;
  hai_dau_day?: number;
  kt_bd_ha_trong_bv?: string;
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  kt_bd_ha_ngoai_bv?: string;
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  dien_tro_ha_ra?: number;
  dien_tro_ha_rb?: number;
  dien_tro_ha_rc?: number;
  do_lech_dien_tro_giua_cac_pha?: number;
}

// Interface mới cho API save-bd-cao theo specification
export interface BoiDayCaoApiRequest {
  masothe_bd_cao: string;
  kyhieubangve: string;
  ngaygiacong: string; // ISO date string
  nguoigiacong: string;
  quycachday: string;
  sosoiday: number;
  ngaysanxuat: string; // ISO date string
  nhasanxuat: string;
  chuvikhuon: number;
  kt_bung_bd: number;
  chieuquanday: boolean; // Changed from number to boolean
  mayquanday: string;
  xungquanh: number;
  haidau: number;
  kt_boiday_trong: string;
  chuvi_bd_trong: number;
  kt_bd_ngoai: string;
  bd_tt: string; // Changed from number to string - API expects string
  chuvi_bd_tt: string; // Changed from number to string - API expects string
  dientroRa: number;
  dientroRb: number;
  dientroRc: number;
  dolechdientro: number;
  //user_update: string;
  trang_thai: number;
  khau_sx: string;
}

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
    MatRadioModule,
    MatSelectModule
  ]
})
export class BoiDayCaoPopupComponent implements OnInit {
  boiDayCaoForm!: FormGroup;
  manufacturers = [
    { value: 'VAN_THANG', name: 'Văn Thắng' },
    { value: 'OTHER', name: 'Khác' }
  ];
  isLoading = false;
  currentUser: any;
  authToken: string = '';
  currentDate: Date = new Date();
  showKcsFailureForm = false; // Hiển thị form KCS failure
  kcsFailureForm: FormGroup; // Form cho KCS failure

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BoiDayCaoPopupComponent>,
    private dialog: MatDialog,
    private commonService: CommonService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private kcsQualityService: KcsQualityService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boiDayCaoForm = this.fb.group({
      // Chỉ giữ lại các field thực sự cần thiết cho business logic
      quy_cach_day: ['', Validators.required], // Quy cách dây - cần thiết
      so_soi_day: [1, [Validators.required, Validators.min(1)]], // Số sợi dây - cần thiết
      nha_san_xuat: ['VAN_THANG', Validators.required], // Nhà sản xuất - cần thiết
      nha_san_xuat_other: [''], // Tên nhà sản xuất khác (optional)
      ngay_san_xuat: [new Date(), Validators.required], // Ngày sản xuất - cần thiết
      
      // Các field kỹ thuật - có thể để trống hoặc có giá trị mặc định
      chu_vi_khuon: [0, [Validators.min(0)]],
      chieu_cao_day: [0, [Validators.min(0)]],
      so_lop_day: [1, [Validators.min(1)]],
      khoang_cach_day: [0, [Validators.min(0)]],
      chat_lieu_cach_dien: [''],
      do_day_cach_dien: [0, [Validators.min(0)]],
      nhiet_do_lam_viec: [25, [Validators.min(-40), Validators.max(200)]],
      do_am_moi_truong: [60, [Validators.min(0), Validators.max(100)]],
      ap_luc_lam_viec: [1, [Validators.min(0)]],
      toc_do_quay: [0, [Validators.min(0)]],
      thoi_gian_quay: [0, [Validators.min(0)]],
      loai_may_quay: [''],
      
      // Các field theo hình - có thể để trống
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: [true], // Changed from 'trái' to true (true = trái, false = phải)
      may_quan_day: [''],
      xung_quanh_day_2: [2, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_3: [3, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_4: [4, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_6: [6, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_2: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_3: [3, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_4: [4, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_6: [6, [Validators.min(2), Validators.max(6)]],
      kt_bd_ha_trong_bv: [''],
      chu_vi_bd_ha_trong_1p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv: [''],
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.min(0)]],
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
    console.log('BoiDayCaoPopup initialized with data:', this.data);
    
    // Khởi tạo form với giá trị mặc định
    this.boiDayCaoForm = this.fb.group({
      // Chỉ giữ lại các field thực sự cần thiết cho business logic
      quy_cach_day: ['', Validators.required], // Quy cách dây - cần thiết
      so_soi_day: [1, [Validators.required, Validators.min(1)]], // Số sợi dây - cần thiết
      nha_san_xuat: ['VAN_THANG', Validators.required], // Nhà sản xuất - cần thiết
      nha_san_xuat_other: [''], // Tên nhà sản xuất khác (optional)
      ngay_san_xuat: [new Date(), Validators.required], // Ngày sản xuất - cần thiết
      
      // Các field kỹ thuật - có thể để trống hoặc có giá trị mặc định
      chu_vi_khuon: [0, [Validators.min(0)]],
      chieu_cao_day: [0, [Validators.min(0)]],
      so_lop_day: [1, [Validators.min(1)]],
      khoang_cach_day: [0, [Validators.min(0)]],
      chat_lieu_cach_dien: [''],
      do_day_cach_dien: [0, [Validators.min(0)]],
      nhiet_do_lam_viec: [25, [Validators.min(-40), Validators.max(200)]],
      do_am_moi_truong: [60, [Validators.min(0), Validators.max(100)]],
      ap_luc_lam_viec: [1, [Validators.min(0)]],
      toc_do_quay: [0, [Validators.min(0)]],
      thoi_gian_quay: [0, [Validators.min(0)]],
      loai_may_quay: [''],
      
      // Các field theo hình - có thể để trống
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: [true], // Changed from 'trái' to true (true = trái, false = phải)
      may_quan_day: [''],
      xung_quanh_day_2: [2, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_3: [3, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_4: [4, [Validators.min(2), Validators.max(6)]],
      xung_quanh_day_6: [6, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_2: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_3: [3, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_4: [4, [Validators.min(2), Validators.max(6)]],
      hai_dau_day_6: [6, [Validators.min(2), Validators.max(6)]],
      kt_bd_ha_trong_bv: [''],
      chu_vi_bd_ha_trong_1p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv: [''],
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.min(0)]],
      dien_tro_ha_ra: [0, [Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.min(0), Validators.max(2)]],
      ghi_chu: ['']
    });
    
    // Lấy thông tin user hiện tại
    this.currentUser = this.authService.getUserInfo();
    this.authToken = this.authService.getToken() || '';
    
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', this.authToken ? 'Available' : 'Not available');
    
    // Kiểm tra validation ban đầu
    this.onFormValueChange();
  }

  // Debug validation form
  debugFormValidation() {
    console.log('=== DEBUG FORM VALIDATION ===');
    console.log('Form valid:', this.boiDayCaoForm.valid);
    console.log('Form dirty:', this.boiDayCaoForm.dirty);
    console.log('Form touched:', this.boiDayCaoForm.touched);
    
    // Kiểm tra từng field bắt buộc
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat'
    ];
    
    requiredFields.forEach(fieldName => {
      const control = this.boiDayCaoForm.get(fieldName);
      console.log(`${fieldName}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });
    
    // Kiểm tra nhà sản xuất khác nếu cần
    const nhaSanXuat = this.boiDayCaoForm.get('nha_san_xuat')?.value;
    if (nhaSanXuat === 'OTHER') {
      const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
      console.log('nha_san_xuat_other:', {
        value: otherField?.value,
        valid: otherField?.valid,
        errors: otherField?.errors,
        touched: otherField?.touched
      });
    }
    
    console.log('Can submit form:', this.canSubmitForm());
    console.log('=== END DEBUG ===');
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
      const control = this.boiDayCaoForm.get(fieldName);
      if (!control || !control.valid || !control.value) {
        console.log(`Field ${fieldName} không hợp lệ:`, control?.value, control?.errors);
        return false;
      }
    }
    
    // Kiểm tra nhà sản xuất khác nếu chọn "OTHER"
    const nhaSanXuat = this.boiDayCaoForm.get('nha_san_xuat')?.value;
    if (nhaSanXuat === 'OTHER') {
      const nhaSanXuatOther = this.boiDayCaoForm.get('nha_san_xuat_other')?.value;
      if (!nhaSanXuatOther || !nhaSanXuatOther.trim()) {
        console.log('Chưa nhập tên nhà sản xuất khác');
        return false;
      }
    }
    
    console.log('Form có thể submit - tất cả field bắt buộc đã được nhập');
    return true;
  }

  // Trigger validation check khi form thay đổi
  onFormValueChange() {
    // Trigger change detection để cập nhật UI
    this.changeDetectorRef.detectChanges();
    
    // Log trạng thái validation để debug
    console.log('Form validation status:', {
      canSubmit: this.canSubmitForm(),
      formValid: this.boiDayCaoForm.valid,
      requiredFields: {
        quy_cach_day: this.boiDayCaoForm.get('quy_cach_day')?.valid,
        so_soi_day: this.boiDayCaoForm.get('so_soi_day')?.valid,
        nha_san_xuat: this.boiDayCaoForm.get('nha_san_xuat')?.valid,
        ngay_san_xuat: this.boiDayCaoForm.get('ngay_san_xuat')?.valid
      }
    });
  }

  // Xử lý khi thay đổi nhà sản xuất
  onManufacturerChange(event: any) {
    const selectedValue = event.value;
    const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
    
    if (selectedValue === 'OTHER') {
      // Nếu chọn "Khác", thêm validation required cho field nhà sản xuất khác
      otherField?.setValidators([Validators.required]);
      otherField?.markAsUntouched(); // Reset trạng thái touched
    } else {
      // Nếu chọn nhà sản xuất có sẵn, bỏ validation required
      otherField?.clearValidators();
      otherField?.setValue(''); // Xóa giá trị cũ
      otherField?.markAsUntouched();
    }
    
    otherField?.updateValueAndValidity();
    
    // Trigger validation check để cập nhật trạng thái nút submit
    this.onFormValueChange();
  }

  // Validate dữ liệu trước khi gửi API
  private validateSubmitData(data: BoiDayCaoSubmitData | BoiDayCaoApiRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    console.log('validateSubmitData: Validating data:', data);
    
    // Type guard để kiểm tra loại data
    const isSubmitData = (data: any): data is BoiDayCaoSubmitData => {
      return 'quy_cach_day' in data;
    };
    
    const isApiRequest = (data: any): data is BoiDayCaoApiRequest => {
      return 'quycachday' in data;
    };
    
    // Kiểm tra các field bắt buộc
    if (isSubmitData(data)) {
      if (!data.quy_cach_day) {
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
      if (!data.quycachday) {
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
    }
    
    const isValid = errors.length === 0;
    console.log('validateSubmitData: Validation result:', { isValid, errors });
    
    return { isValid, errors };
  }

  // Log chi tiết dữ liệu để debug
  private logSubmitData(data: BoiDayCaoSubmitData | BoiDayCaoApiRequest): void {
    console.log('=== SUBMIT DATA DETAILS ===');
    
    // Type guard để kiểm tra loại data
    const isSubmitData = (data: any): data is BoiDayCaoSubmitData => {
      return 'quy_cach_day' in data;
    };
    
    const isApiRequest = (data: any): data is BoiDayCaoApiRequest => {
      return 'quycachday' in data;
    };
    
    if (isSubmitData(data)) {
      console.log('Data type: BoiDayCaoSubmitData');
      console.log('Key fields:', {
        quy_cach_day: data.quy_cach_day,
        so_soi_day: data.so_soi_day,
        nha_san_xuat: data.nha_san_xuat,
        ngay_san_xuat: data.ngay_san_xuat
      });
    } else if (isApiRequest(data)) {
      console.log('Data type: BoiDayCaoApiRequest');
      console.log('Key fields:', {
        quycachday: data.quycachday,
        sosoiday: data.sosoiday,
        nhasanxuat: data.nhasanxuat,
        ngaysanxuat: data.ngaysanxuat
      });
    } else {
      console.log('Data type: Unknown');
    }
    
    console.log('Full data object:', data);
    console.log('=== END SUBMIT DATA DETAILS ===');
  }

  onSubmit(): void {
    console.log('Bắt đầu submit form...');
    
    // Kiểm tra form có thể submit được không
    if (!this.canSubmitForm()) {
      console.log('Form không thể submit - kiểm tra validation');
      this.debugFormValidation();
      return;
    }

    // Lấy dữ liệu từ form
    const formData = this.boiDayCaoForm.value;
    
    // Map data sang API request format
    const apiRequest = this.mapToApiRequest(formData, this.data.quanDay);
    
    console.log('API Request data:', apiRequest);

    // Log chi tiết dữ liệu để debug
    this.logSubmitData(apiRequest);

    // Validate dữ liệu trước khi gửi API
    const validation = this.validateSubmitData(apiRequest);
    if (!validation.isValid) {
      console.error('Dữ liệu không hợp lệ:', validation.errors);
      this.snackBar.open(`Dữ liệu không hợp lệ: ${validation.errors.join(', ')}`, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    // Gọi API để lưu dữ liệu
    this.http.post<any>(`${this.commonService.getServerAPIURL()}api/ProductionData/save-bd-cao`, apiRequest, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      })
    }).subscribe({
      next: (response) => {
        console.log('Lưu thành công:', response);
        this.isLoading = false;
        
        // Hiển thị thông báo thành công
        this.snackBar.open('Lưu thông tin bối dây cao thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        
        // Hiển thị thông báo thành công
        this.showSuccess('Lưu thông tin bối dây cao thành công!');
        
        // Đóng popup và trả về dữ liệu để reload ds-quan-day
        this.dialogRef.close({
          success: true,
          data: apiRequest,
          reloadData: true,
          message: 'Lưu thông tin bối dây cao thành công!'
        });
      },
      error: (error) => {
        console.error('Lỗi khi lưu:', error);
        this.isLoading = false;
        
        let errorMessage = 'Có lỗi xảy ra khi lưu thông tin';
        
        // Xử lý các loại lỗi cụ thể
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
        
        // Log chi tiết lỗi để debug
        if (error.error) {
          console.error('Error details:', error.error);
          if (error.error.details) {
            console.error('Error details:', error.error.details);
          }
          if (error.error.message) {
            console.error('Error message:', error.error.message);
          }
        }
        
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Method để map data từ form sang API request format
  private mapToApiRequest(formData: any, quanDayData: any): BoiDayCaoApiRequest {
    console.log('mapToApiRequest: Mapping form data to API format');
    
    // Xử lý nhà sản xuất
    let nhaSanXuat = formData.nha_san_xuat;
    if (nhaSanXuat === 'OTHER') {
      nhaSanXuat = formData.nha_san_xuat_other;
    }
    
    // Xử lý ngày giờ
    const currentDate = new Date();
    const ngayGiaCong = currentDate.toISOString();
    const ngaySanXuat = formData.ngay_san_xuat instanceof Date ? 
      formData.ngay_san_xuat.toISOString() : 
      formData.ngay_san_xuat;
    
    // Map sang API format
    const apiRequest: BoiDayCaoApiRequest = {
      masothe_bd_cao: quanDayData.kyhieuquanday || 'BDC_' + Date.now(), // Mã số thẻ bối dây cao
      kyhieubangve: quanDayData.kyhieuquanday || '',
      ngaygiacong: ngayGiaCong,
      nguoigiacong: this.currentUser?.username || this.currentUser?.email || 'Unknown',
      quycachday: formData.quy_cach_day || '',
      sosoiday: formData.so_soi_day || 1,
      ngaysanxuat: ngaySanXuat,
      nhasanxuat: nhaSanXuat || '',
      chuvikhuon: formData.chu_vi_khuon || 0,
      kt_bung_bd: formData.kt_bung_bd_truoc || 0,
      chieuquanday: formData.chieu_quan_day, // true = trái, false = phải
      mayquanday: formData.may_quan_day || '',
      xungquanh: this.getSelectedThickness(formData, 'xung_quanh'),
      haidau: this.getSelectedThickness(formData, 'hai_dau'),
      kt_boiday_trong: formData.kt_bd_ha_trong_bv || '',
      chuvi_bd_trong: formData.chu_vi_bd_ha_trong_1p || 0,
      kt_bd_ngoai: formData.kt_bd_ha_ngoai_bv || '',
      bd_tt: (formData.kt_bung_bd_truoc || 0).toString(), // Kích thước bụng bối dây trước
      chuvi_bd_tt: formData.chu_vi_khuon || '0', // Chu vi bối dây theo thiết kế
      dientroRa: formData.dien_tro_ha_ra || 0,
      dientroRb: formData.dien_tro_ha_rb || 0,
      dientroRc: formData.dien_tro_ha_rc || 0,
      dolechdientro: formData.do_lech_dien_tro_giua_cac_pha || 0,
      //user_update: this.currentUser?.username || this.currentUser?.email || 'Unknown',
      trang_thai: STATUS.PROCESSING, // STATUS.PROCESSING = đang làm, STATUS.COMPLETED = hoàn thành
      khau_sx: 'boidaycao' // Khâu sản xuất: bối dây cao
    };
    
    console.log('mapToApiRequest: Mapped API request:', apiRequest);
    return apiRequest;
  }

  // Lấy tên nhà sản xuất từ value
  getManufacturerName(value: string): string {
    const manufacturer = this.manufacturers.find(m => m.value === value);
    return manufacturer ? manufacturer.name : value;
  }

  // Kiểm tra form có thay đổi gì không
  hasUnsavedChanges(): boolean {
    return this.boiDayCaoForm.dirty || this.boiDayCaoForm.touched;
  }

  // Xử lý khi user muốn hủy
  onCancel() {
    if (this.hasUnsavedChanges()) {
      // Nếu có thay đổi chưa lưu, hỏi user có muốn hủy không
      const confirmDialog = this.dialog.open(DialogComponent, {
        width: '400px',
        data: {
          title: 'Xác nhận hủy',
          message: 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?',
          confirmText: 'Hủy',
          cancelText: 'Tiếp tục'
        }
      });

      confirmDialog.afterClosed().subscribe((result: boolean) => {
        if (result) {
          this.dialogRef.close();
        }
      });
    } else {
      // Nếu không có thay đổi, đóng popup ngay
      this.dialogRef.close();
    }
  }

  // Reset form về trạng thái ban đầu
  resetForm() {
    console.log('Reset form về trạng thái ban đầu');
    
    // Reset form về giá trị mặc định
    this.boiDayCaoForm.reset({
      quy_cach_day: '',
      so_soi_day: 1,
      nha_san_xuat: 'VAN_THANG',
      nha_san_xuat_other: '',
      ngay_san_xuat: new Date(),
      chu_vi_khuon: 0,
      chieu_cao_day: 0,
      so_lop_day: 1,
      khoang_cach_day: 0,
      chat_lieu_cach_dien: '',
      do_day_cach_dien: 0,
      nhiet_do_lam_viec: 25,
      do_am_moi_truong: 60,
      ap_luc_lam_viec: 1,
      toc_do_quay: 0,
      thoi_gian_quay: 0,
      loai_may_quay: '',
      kt_bung_bd_truoc: 0,
      bung_bd_sau: 0,
      chieu_quan_day: true,
      may_quan_day: '',
      xung_quanh_day: 2,
      hai_dau_day: 2,
      kt_bd_ha_trong_bv: '',
      chu_vi_bd_ha_trong_1p: 0,
      chu_vi_bd_ha_trong_2p: 0,
      chu_vi_bd_ha_trong_3p: 0,
      kt_bd_ha_ngoai_bv: '',
      kt_bd_ha_ngoai_bv_1p: 0,
      kt_bd_ha_ngoai_bv_2p: 0,
      kt_bd_ha_ngoai_bv_3p: 0,
      dien_tro_ha_ra: 0,
      dien_tro_ha_rb: 0,
      dien_tro_ha_rc: 0,
      do_lech_dien_tro_giua_cac_pha: 0,
      ghi_chu: ''
    });
    
    // Reset validation state
    this.boiDayCaoForm.markAsUntouched();
    this.boiDayCaoForm.markAsPristine();
    
    // Reset validation cho nhà sản xuất khác
    const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
    otherField?.clearValidators();
    otherField?.updateValueAndValidity();
    
    console.log('Form đã được reset');
    
    // Trigger validation check
    this.onFormValueChange();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.boiDayCaoForm.controls).forEach(key => {
      const control = this.boiDayCaoForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
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

      console.log('Submitting KCS failure for boidaycao:', kcsFailureData);

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
