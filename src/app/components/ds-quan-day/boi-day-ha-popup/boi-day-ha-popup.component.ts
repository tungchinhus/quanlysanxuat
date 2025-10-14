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
import { MatNativeDateModule, MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { QuanDayData } from '../ds-quan-day.component';
import { Constant, MANUFACTURER_OPTIONS, Manufacturer, WINDING_MACHINE_HA_OPTIONS } from '../../../constant/constant';
import { DialogComponent } from '../../shared/dialogs/dialog/dialog.component';
import { KcsQualityService, KcsQualityCheckFailure } from '../../../services/kcs-quality.service';
import { FirebaseBdHaService, BdHaData } from '../../../services/firebase-bd-ha.service';
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
  // Xung quanh fields
  xung_quanh_day_2?: number;
  xung_quanh_day_3?: number;
  xung_quanh_day_4?: number;
  xung_quanh_day_6?: number;
  xung_quanh_day_8?: number;
  // Hai đầu fields
  hai_dau_day_2?: number;
  hai_dau_day_3?: number;
  hai_dau_day_4?: number;
  hai_dau_day_6?: number;
  hai_dau_day_8?: number;
  // Một đầu fields
  mot_dau_day_2?: number;
  mot_dau_day_3?: number;
  mot_dau_day_4?: number;
  mot_dau_day_6?: number;
  mot_dau_day_8?: number;
  // QTD a12 fields
  qtda12_2?: number;
  qtda12_3?: number;
  qtda12_4?: number;
  qtda12_6?: number;
  qtda12_8?: number;
  // Chu vi bối dây hạ trong
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  // KT bối dây hạ trong
  kt_bd_ha_trong_1p?: number;
  kt_bd_ha_trong_2p?: number;
  kt_bd_ha_trong_3p?: number;
  // KT bối dây hạ ngoài
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  // Điện trở hạ
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
  // Xung quanh fields
  xung_quanh_day_2?: number;
  xung_quanh_day_3?: number;
  xung_quanh_day_4?: number;
  xung_quanh_day_6?: number;
  xung_quanh_day_8?: number;
  // Hai đầu fields
  hai_dau_day_2?: number;
  hai_dau_day_3?: number;
  hai_dau_day_4?: number;
  hai_dau_day_6?: number;
  hai_dau_day_8?: number;
  // Một đầu fields
  mot_dau_day_2?: number;
  mot_dau_day_3?: number;
  mot_dau_day_4?: number;
  mot_dau_day_6?: number;
  mot_dau_day_8?: number;
  // QTD a12 fields
  qtda12_2?: number;
  qtda12_3?: number;
  qtda12_4?: number;
  qtda12_6?: number;
  qtda12_8?: number;
  // Chu vi bối dây hạ trong
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  // KT bối dây hạ trong
  kt_bd_ha_trong_1p?: number;
  kt_bd_ha_trong_2p?: number;
  kt_bd_ha_trong_3p?: number;
  // KT bối dây hạ ngoài
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  // Điện trở hạ
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
  // Xung quanh fields
  xungquanh_2?: number;
  xungquanh_3?: number;
  xungquanh_4?: number;
  xungquanh_6?: number;
  xungquanh_8?: number;
  // Hai đầu fields
  haidau_2?: number;
  haidau_3?: number;
  haidau_4?: number;
  haidau_6?: number;
  haidau_8?: number;
  // Một đầu fields
  mot_dau_2?: number;
  mot_dau_3?: number;
  mot_dau_4?: number;
  mot_dau_6?: number;
  mot_dau_8?: number;
  // QTD a12 fields
  qtda12_2?: number;
  qtda12_3?: number;
  qtda12_4?: number;
  qtda12_6?: number;
  qtda12_8?: number;
  // Chu vi bối dây hạ trong
  chuvi_bd_trong_1p?: number;
  chuvi_bd_trong_2p?: number;
  chuvi_bd_trong_3p?: number;
  // KT bối dây hạ trong
  kt_boiday_trong_1p?: number;
  kt_boiday_trong_2p?: number;
  kt_boiday_trong_3p?: number;
  // KT bối dây hạ ngoài
  kt_bd_ngoai_1p?: number;
  kt_bd_ngoai_2p?: number;
  kt_bd_ngoai_3p?: number;
  // Điện trở hạ
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
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'vi-VN' },
    { provide: MAT_DATE_FORMATS, useValue: VIETNAMESE_DATE_FORMATS },
    { provide: DateAdapter, useClass: NativeDateAdapter }
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

  // Danh sách nhà sản xuất - sử dụng enum chung
  manufacturers = MANUFACTURER_OPTIONS;
  windingMachines = WINDING_MACHINE_HA_OPTIONS;

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
    private firebaseBdHaService: FirebaseBdHaService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private userManagementService: UserManagementFirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boiDayHaForm = this.fb.group({
      // Các field bắt buộc
      quy_cach_day: ['', Validators.required],
      so_soi_day: [1, [Validators.required, Validators.min(0)]],
      nha_san_xuat: [Manufacturer.bsHN, Validators.required],
      nha_san_xuat_other: [''],
      ngay_san_xuat: [new Date(), Validators.required],
      
      // Các field kỹ thuật
      chu_vi_khuon: [0, [Validators.min(0)]],
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: [true],
      may_quan_day: ['', Validators.required],
      xung_quanh_day_2: [0, [Validators.min(0)]],
      xung_quanh_day_3: [0, [Validators.min(0)]],
      xung_quanh_day_4: [0, [Validators.min(0)]],
      xung_quanh_day_6: [0, [Validators.min(0)]],
      xung_quanh_day_8: [0, [Validators.min(0)]],
      hai_dau_day_2: [0, [Validators.min(0)]],
      hai_dau_day_3: [0, [Validators.min(0)]],
      hai_dau_day_4: [0, [Validators.min(0)]],
      hai_dau_day_6: [0, [Validators.min(0)]],
      hai_dau_day_8: [0, [Validators.min(0)]],
      mot_dau_day_2: [0, [Validators.min(0)]],
      mot_dau_day_3: [0, [Validators.min(0)]],
      mot_dau_day_4: [0, [Validators.min(0)]],
      mot_dau_day_6: [0, [Validators.min(0)]],
      mot_dau_day_8: [0, [Validators.min(0)]],
      qtda12_2: [0, [Validators.min(0)]],
      qtda12_3: [0, [Validators.min(0)]],
      qtda12_4: [0, [Validators.min(0)]],
      qtda12_6: [0, [Validators.min(0)]],
      qtda12_8: [0, [Validators.min(0)]],
      
      // Chu vi bối dây hạ trong
      chu_vi_bd_ha_trong_1p: [0, [Validators.required, Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.required, Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.required, Validators.min(0)]],
      
      // Kích thước bối dây hạ trong
      kt_bd_ha_trong_1p: [0, [Validators.min(0)]],
      kt_bd_ha_trong_2p: [0, [Validators.min(0)]],
      kt_bd_ha_trong_3p: [0, [Validators.min(0)]],

      // Kích thước bối dây hạ ngoài
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.required, Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.required, Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.required, Validators.min(0)]],
      
      // Điện trở hạ
      dien_tro_ha_ra: [0, [Validators.required, Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.required, Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.required, Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.required, Validators.min(0), Validators.max(2)]],
      
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
    console.log('quanDay data:', this.data.quanDay);
    console.log('ky_hieu_bv_boidayha:', this.data.quanDay?.ky_hieu_bv_boidayha);
    console.log('kyhieuquanday:', this.data.quanDay?.kyhieuquanday);
    console.log('soboi day fields:', {
      soboiday: this.data.quanDay?.soboiday,
      so_boi_day: this.data.quanDay?.so_boi_day,
      soboidayha: this.data.quanDay?.soboidayha
    });
    console.log('All quanDay properties:', Object.keys(this.data.quanDay || {}));
    console.log('quanDay object full:', JSON.stringify(this.data.quanDay, null, 2));
    
    // Lấy thông tin user hiện tại
    this.currentUser = this.authService.getCurrentUser();
    this.authToken = this.authService.getToken() || '';
    
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', this.authToken ? 'Available' : 'Not available');
    
    // Populate form with data from quanDay if available
    if (this.data.quanDay) {
      this.populateFormWithQuanDayData();
    }
    
    // Auto-populate from bangve if available
    this.autoPopulateFromBangve();
  }
  
  // Method to populate form with quanDay data
  private populateFormWithQuanDayData(): void {
    console.log('Populating form with quanDay data:', this.data.quanDay);
    
    // Populate basic fields from bangve data
    this.boiDayHaForm.patchValue({
      // Thông tin cơ bản từ bangve
      quy_cach_day: this.data.quanDay.quy_cach_day || '',
      so_soi_day: this.data.quanDay.so_soi_day || 1,
      nha_san_xuat: this.data.quanDay.nha_san_xuat || Manufacturer.bsHN,
      ngay_san_xuat: this.data.quanDay.ngay_san_xuat ? new Date(this.data.quanDay.ngay_san_xuat) : new Date(),
      
      // Thông tin kỹ thuật từ bangve
      chu_vi_khuon: this.data.quanDay.chu_vi_khuon || 0,
      kt_bung_bd_truoc: this.data.quanDay.bung_bd || 0,
      bung_bd_sau: this.data.quanDay.bung_bd_sau || 0,
      chieu_quan_day: this.data.quanDay.chieu_quan_day !== undefined ? this.data.quanDay.chieu_quan_day : true,
      may_quan_day: this.data.quanDay.may_quan_day || '',
      
      // Thông số dây quấn từ bangve - default to 0
      xung_quanh_day_2: this.data.quanDay.xung_quanh_day_2 || 0,
      xung_quanh_day_3: this.data.quanDay.xung_quanh_day_3 || 0,
      xung_quanh_day_4: this.data.quanDay.xung_quanh_day_4 || 0,
      xung_quanh_day_6: this.data.quanDay.xung_quanh_day_6 || 0,
      xung_quanh_day_8: this.data.quanDay.xung_quanh_day_8 || 0,
      hai_dau_day_2: this.data.quanDay.hai_dau_day_2 || 0,
      hai_dau_day_3: this.data.quanDay.hai_dau_day_3 || 0,
      hai_dau_day_4: this.data.quanDay.hai_dau_day_4 || 0,
      hai_dau_day_6: this.data.quanDay.hai_dau_day_6 || 0,
      hai_dau_day_8: this.data.quanDay.hai_dau_day_8 || 0,
      mot_dau_day_2: this.data.quanDay.mot_dau_day_2 || 0,
      mot_dau_day_3: this.data.quanDay.mot_dau_day_3 || 0,
      mot_dau_day_4: this.data.quanDay.mot_dau_day_4 || 0,
      mot_dau_day_6: this.data.quanDay.mot_dau_day_6 || 0,
      mot_dau_day_8: this.data.quanDay.mot_dau_day_8 || 0,
      qtda12_2: this.data.quanDay.qtda12_2 || 0,
      qtda12_3: this.data.quanDay.qtda12_3 || 0,
      qtda12_4: this.data.quanDay.qtda12_4 || 0,
      qtda12_6: this.data.quanDay.qtda12_6 || 0,
      qtda12_8: this.data.quanDay.qtda12_8 || 0,
      
      // Đo lường từ bangve
      chu_vi_bd_ha_trong_1p: this.data.quanDay.chu_vi_bd_ha_trong_1p || 0,
      chu_vi_bd_ha_trong_2p: this.data.quanDay.chu_vi_bd_ha_trong_2p || 0,
      chu_vi_bd_ha_trong_3p: this.data.quanDay.chu_vi_bd_ha_trong_3p || 0,
      kt_bd_ha_trong_1p: 0, // Sẽ được điền từ parseAndFillBdHaTrong
      kt_bd_ha_trong_2p: 0, // Sẽ được điền từ parseAndFillBdHaTrong
      kt_bd_ha_trong_3p: 0, // Sẽ được điền từ parseAndFillBdHaTrong
      kt_bd_ha_ngoai_bv_1p: 0, // Sẽ được điền từ parseAndFillBdHaNgoai
      kt_bd_ha_ngoai_bv_2p: 0, // Sẽ được điền từ parseAndFillBdHaNgoai
      kt_bd_ha_ngoai_bv_3p: 0, // Sẽ được điền từ parseAndFillBdHaNgoai
      dien_tro_ha_ra: this.data.quanDay.dien_tro_ha_ra || 0,
      dien_tro_ha_rb: this.data.quanDay.dien_tro_ha_rb || 0,
      dien_tro_ha_rc: this.data.quanDay.dien_tro_ha_rc || 0,
      do_lech_dien_tro_giua_cac_pha: this.data.quanDay.do_lech_dien_tro_giua_cac_pha || 0,
      
      // Ghi chú
      ghi_chu: this.data.quanDay.ghi_chu || ''
    });
    
    // Disable fields that are read-only from bangve
    if (this.data.quanDay.chu_vi_khuon && this.data.quanDay.chu_vi_khuon > 0) {
      this.boiDayHaForm.get('chu_vi_khuon')?.disable();
    }
    if (this.data.quanDay.bung_bd && this.data.quanDay.bung_bd > 0) {
      this.boiDayHaForm.get('kt_bung_bd_truoc')?.disable();
    }
    
    // Make bung_bd_sau required
    this.boiDayHaForm.get('bung_bd_sau')?.setValidators([Validators.required, Validators.min(0)]);
    this.boiDayHaForm.get('bung_bd_sau')?.updateValueAndValidity();
    
    // Parse và điền dữ liệu từ các trường string format
    this.parseAndFillBdHaTrong(this.data.quanDay.bd_ha_trong);
    this.parseAndFillBdHaNgoai(this.data.quanDay.bd_ha_ngoai);
    
    console.log('Form values after population:', this.boiDayHaForm.value);
    console.log('Available quanDay properties:', Object.keys(this.data.quanDay));
  }

  // Auto-populate form from bangve data
  private autoPopulateFromBangve(): void {
    console.log('Auto-populating from bangve data...');
    
    // Nếu có dữ liệu từ bangve, điền vào các trường tương ứng
    if (this.data.quanDay) {
      const bangveData = this.data.quanDay;
      
      // Điền thông tin từ bangve vào các trường chưa có giá trị
      const currentFormValue = this.boiDayHaForm.value;
      
      // Chỉ điền nếu trường chưa có giá trị hoặc có giá trị mặc định
      if (!currentFormValue.quy_cach_day && bangveData.quy_cach_day) {
        this.boiDayHaForm.patchValue({ quy_cach_day: bangveData.quy_cach_day });
      }
      
      if (currentFormValue.so_soi_day === 1 && bangveData.so_soi_day) {
        this.boiDayHaForm.patchValue({ so_soi_day: bangveData.so_soi_day });
      }
      
      if (!currentFormValue.may_quan_day && bangveData.may_quan_day) {
        this.boiDayHaForm.patchValue({ may_quan_day: bangveData.may_quan_day });
      }
      
      // Parse và điền dữ liệu bd_ha_trong (format: "244/436")
      this.parseAndFillBdHaTrong(bangveData.bd_ha_trong);
      
      // Parse và điền dữ liệu bd_ha_ngoai nếu có
      this.parseAndFillBdHaNgoai(bangveData.bd_ha_ngoai);
      
      // Điền các giá trị đo lường nếu có
      if (bangveData.chu_vi_bd_ha_trong_1p && bangveData.chu_vi_bd_ha_trong_1p > 0) {
        this.boiDayHaForm.patchValue({ chu_vi_bd_ha_trong_1p: bangveData.chu_vi_bd_ha_trong_1p });
      }
      if (bangveData.chu_vi_bd_ha_trong_2p && bangveData.chu_vi_bd_ha_trong_2p > 0) {
        this.boiDayHaForm.patchValue({ chu_vi_bd_ha_trong_2p: bangveData.chu_vi_bd_ha_trong_2p });
      }
      if (bangveData.chu_vi_bd_ha_trong_3p && bangveData.chu_vi_bd_ha_trong_3p > 0) {
        this.boiDayHaForm.patchValue({ chu_vi_bd_ha_trong_3p: bangveData.chu_vi_bd_ha_trong_3p });
      }
      
      // Điền điện trở nếu có
      if (bangveData.dien_tro_ha_ra && bangveData.dien_tro_ha_ra > 0) {
        this.boiDayHaForm.patchValue({ dien_tro_ha_ra: bangveData.dien_tro_ha_ra });
      }
      if (bangveData.dien_tro_ha_rb && bangveData.dien_tro_ha_rb > 0) {
        this.boiDayHaForm.patchValue({ dien_tro_ha_rb: bangveData.dien_tro_ha_rb });
      }
      if (bangveData.dien_tro_ha_rc && bangveData.dien_tro_ha_rc > 0) {
        this.boiDayHaForm.patchValue({ dien_tro_ha_rc: bangveData.dien_tro_ha_rc });
      }
      
      console.log('Auto-population completed. Form values:', this.boiDayHaForm.value);
    }
  }

  // Parse và điền dữ liệu bd_ha_trong (format: "244/436")
  private parseAndFillBdHaTrong(bdHaTrongData: string): void {
    if (!bdHaTrongData) return;
    
    console.log('Parsing bd_ha_trong data:', bdHaTrongData);
    
    // Parse format "244/436" hoặc "244/436/550"
    const values = bdHaTrongData.split('/').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    
    if (values.length >= 2) {
      // Điền vào KT bối dây hạ trong
      this.boiDayHaForm.patchValue({
        kt_bd_ha_trong_1p: values[0],
        kt_bd_ha_trong_2p: values[1],
        kt_bd_ha_trong_3p: values[2] || values[1] // Nếu không có pha 3, dùng giá trị pha 2
      });
      
      console.log('Filled KT bối dây hạ trong:', {
        pha1: values[0],
        pha2: values[1], 
        pha3: values[2] || values[1]
      });
      
      // Trigger change detection để cập nhật UI
      this.changeDetectorRef.detectChanges();
    }
  }

  // Parse và điền dữ liệu bd_ha_ngoai (format: "244/436")
  private parseAndFillBdHaNgoai(bdHaNgoaiData: string): void {
    if (!bdHaNgoaiData) return;
    
    console.log('Parsing bd_ha_ngoai data:', bdHaNgoaiData);
    
    // Parse format "244/436" hoặc "244/436/550"
    const values = bdHaNgoaiData.split('/').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    
    if (values.length >= 2) {
      // Điền vào KT bối dây hạ ngoài
      this.boiDayHaForm.patchValue({
        kt_bd_ha_ngoai_bv_1p: values[0],
        kt_bd_ha_ngoai_bv_2p: values[1],
        kt_bd_ha_ngoai_bv_3p: values[2] || values[1] // Nếu không có pha 3, dùng giá trị pha 2
      });
      
      console.log('Filled KT bối dây hạ ngoài:', {
        pha1: values[0],
        pha2: values[1], 
        pha3: values[2] || values[1]
      });
      
      // Trigger change detection để cập nhật UI
      this.changeDetectorRef.detectChanges();
    }
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
      'may_quan_day',
      'bung_bd_sau',
      'chu_vi_bd_ha_trong_1p',
      'chu_vi_bd_ha_trong_2p', 
      'chu_vi_bd_ha_trong_3p',
      'kt_bd_ha_ngoai_bv_1p',
      'kt_bd_ha_ngoai_bv_2p',
      'kt_bd_ha_ngoai_bv_3p',
      'dien_tro_ha_ra',
      'dien_tro_ha_rb',
      'dien_tro_ha_rc',
      'do_lech_dien_tro_giua_cac_pha'
    ];
    
    // Kiểm tra các field bắt buộc
    for (const fieldName of requiredFields) {
      const control = this.boiDayHaForm.get(fieldName);
      if (!control || !control.valid) {
        console.log(`❌ Field ${fieldName} không hợp lệ:`, control?.value, control?.errors);
        return false;
      }
      
      // Kiểm tra giá trị có tồn tại và hợp lệ không
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        console.log(`❌ Field ${fieldName} chưa được điền:`, value);
        return false;
      }
      
      // Chỉ kiểm tra không được âm (cho phép giá trị 0)
      if (typeof value === 'number' && value < 0) {
        console.log(`❌ Field ${fieldName} không được âm:`, value);
        return false;
      }
      
      console.log(`✅ Field ${fieldName} OK:`, value);
    }
    
    // Kiểm tra nhà sản xuất
    const nhaSanXuat = this.boiDayHaForm.get('nha_san_xuat')?.value;
    if (!nhaSanXuat || !nhaSanXuat.trim()) {
      console.log('Chưa chọn nhà sản xuất');
      return false;
    }
    
    // Kiểm tra ngày sản xuất
    const ngaySanXuat = this.boiDayHaForm.get('ngay_san_xuat')?.value;
    if (!ngaySanXuat) {
      console.log('Chưa chọn ngày sản xuất');
      return false;
    }
    
    console.log('Form có thể submit - tất cả field bắt buộc đã được nhập');
    return true;
  }

  // Get KT bối dây hạ trong từ bangve data
  getKtBdHaTrongLabel(): string {
    if (!this.data.quanDay?.bd_ha_trong) return 'KT bối dây hạ trong (mm)';
    return `KT bối dây hạ trong <span class="dynamic-value">(${this.data.quanDay.bd_ha_trong})</span>`;
  }

  // Get KT bối dây hạ ngoài từ bangve data
  getKtBdHaNgoaiLabel(): string {
    if (!this.data.quanDay?.bd_ha_ngoai) return 'KT bối dây hạ ngoài (mm)';
    return `KT bối dây hạ ngoài <span class="dynamic-value">(${this.data.quanDay.bd_ha_ngoai})</span>`;
  }

  // Get số bối dây from quanDay data
  getSoboiday(): string {
    if (!this.data.quanDay) return 'N/A';
    
    return this.data.quanDay.soboiday || 
           this.data.quanDay.so_boi_day || 
           this.data.quanDay.soboidayha || 
           this.data.quanDay.so_boi_day_ha ||
           'N/A';
  }

  // Debug method để kiểm tra trạng thái form
  debugFormStatus(): void {
    console.log('=== FORM DEBUG STATUS ===');
    console.log('Form valid:', this.boiDayHaForm.valid);
    console.log('Form touched:', this.boiDayHaForm.touched);
    console.log('Form dirty:', this.boiDayHaForm.dirty);
    
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat',
      'may_quan_day',
      'bung_bd_sau',
      'chu_vi_bd_ha_trong_1p',
      'chu_vi_bd_ha_trong_2p', 
      'chu_vi_bd_ha_trong_3p',
      'kt_bd_ha_ngoai_bv_1p',
      'kt_bd_ha_ngoai_bv_2p',
      'kt_bd_ha_ngoai_bv_3p',
      'dien_tro_ha_ra',
      'dien_tro_ha_rb',
      'dien_tro_ha_rc',
      'do_lech_dien_tro_giua_cac_pha'
    ];
    
    requiredFields.forEach(fieldName => {
      const control = this.boiDayHaForm.get(fieldName);
      console.log(`${fieldName}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched
      });
    });
    
    console.log('Can submit:', this.canSubmitForm());
    console.log('=== END FORM DEBUG ===');
  }

  // Xử lý khi thay đổi nhà sản xuất
  onManufacturerChange(event: any) {
    // Không cần xử lý đặc biệt vì không còn option 'OTHER'
    console.log('Manufacturer changed to:', event.value);
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
    const nhaSanXuat = formData.nha_san_xuat;
    const nhaSanXuatName = this.getManufacturerName(formData.nha_san_xuat);
    
    return {
      masothe_bd_ha: this.data.quanDay.ky_hieu_bv_boidayha || `${this.data.quanDay.kyhieuquanday}-065`,
      kyhieubangve: this.data.quanDay.ky_hieu_bv_boidayha || this.data.quanDay.kyhieuquanday,
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
      // Xung quanh fields
      xungquanh_2: formData.xung_quanh_day_2,
      xungquanh_3: formData.xung_quanh_day_3,
      xungquanh_4: formData.xung_quanh_day_4,
      xungquanh_6: formData.xung_quanh_day_6,
      xungquanh_8: formData.xung_quanh_day_8,
      // Hai đầu fields
      haidau_2: formData.hai_dau_day_2,
      haidau_3: formData.hai_dau_day_3,
      haidau_4: formData.hai_dau_day_4,
      haidau_6: formData.hai_dau_day_6,
      haidau_8: formData.hai_dau_day_8,
      // Một đầu fields
      mot_dau_2: formData.mot_dau_day_2,
      mot_dau_3: formData.mot_dau_day_3,
      mot_dau_4: formData.mot_dau_day_4,
      mot_dau_6: formData.mot_dau_day_6,
      mot_dau_8: formData.mot_dau_day_8,
      // QTD a12 fields
      qtda12_2: formData.qtda12_2,
      qtda12_3: formData.qtda12_3,
      qtda12_4: formData.qtda12_4,
      qtda12_6: formData.qtda12_6,
      qtda12_8: formData.qtda12_8,
      // Chu vi bối dây hạ trong
      chuvi_bd_trong_1p: formData.chu_vi_bd_ha_trong_1p,
      chuvi_bd_trong_2p: formData.chu_vi_bd_ha_trong_2p,
      chuvi_bd_trong_3p: formData.chu_vi_bd_ha_trong_3p,
      // KT bối dây hạ trong
      kt_boiday_trong_1p: formData.kt_bd_ha_trong_1p,
      kt_boiday_trong_2p: formData.kt_bd_ha_trong_2p,
      kt_boiday_trong_3p: formData.kt_bd_ha_trong_3p,
      // KT bối dây hạ ngoài
      kt_bd_ngoai_1p: formData.kt_bd_ha_ngoai_bv_1p,
      kt_bd_ngoai_2p: formData.kt_bd_ha_ngoai_bv_2p,
      kt_bd_ngoai_3p: formData.kt_bd_ha_ngoai_bv_3p,
      // Điện trở hạ
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
    // Mark all fields as touched to show validation errors
    this.boiDayHaForm.markAllAsTouched();
    
    if (!this.canSubmitForm()) {
      console.log('Form không hợp lệ, không thể submit');
      return;
    }

    this.isLoading = true;
    
    try {
      const formData = this.boiDayHaForm.value;
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

      // Tạo data cho bd_ha
      const bdHaData: Omit<BdHaData, 'id'> = {
        masothe_bd_ha: this.data.quanDay.ky_hieu_bv_boidayha || `${this.data.quanDay.kyhieuquanday}-065`,
        kyhieubangve: this.data.quanDay.ky_hieu_bv_boidayha || this.data.quanDay.kyhieuquanday,
        ngaygiacong: new Date(),
        nguoigiacong: currentUser.fullName || currentUser.username || currentUser.email || 'Unknown',
        quycachday: formData.quy_cach_day,
        sosoiday: formData.so_soi_day,
        ngaysanxuat: formData.ngay_san_xuat,
        nhasanxuat: formData.nha_san_xuat,
        chuvikhuon: formData.chu_vi_khuon,
        kt_bung_bd: formData.kt_bung_bd_truoc || 0,
        chieuquanday: formData.chieu_quan_day,
        mayquanday: formData.may_quan_day,
        // Xung quanh fields
        xungquanh_2: formData.xung_quanh_day_2,
        xungquanh_3: formData.xung_quanh_day_3,
        xungquanh_4: formData.xung_quanh_day_4,
        xungquanh_6: formData.xung_quanh_day_6,
        xungquanh_8: formData.xung_quanh_day_8,
        // Hai đầu fields
        haidau_2: formData.hai_dau_day_2,
        haidau_3: formData.hai_dau_day_3,
        haidau_4: formData.hai_dau_day_4,
        haidau_6: formData.hai_dau_day_6,
        haidau_8: formData.hai_dau_day_8,
        // Một đầu fields
        mot_dau_2: formData.mot_dau_day_2,
        mot_dau_3: formData.mot_dau_day_3,
        mot_dau_4: formData.mot_dau_day_4,
        mot_dau_6: formData.mot_dau_day_6,
        mot_dau_8: formData.mot_dau_day_8,
        // QTD a12 fields
        qtda12_2: formData.qtda12_2,
        qtda12_3: formData.qtda12_3,
        qtda12_4: formData.qtda12_4,
        qtda12_6: formData.qtda12_6,
        qtda12_8: formData.qtda12_8,
        // Chu vi bối dây hạ trong
        chuvi_bd_trong_1p: formData.chu_vi_bd_ha_trong_1p,
        chuvi_bd_trong_2p: formData.chu_vi_bd_ha_trong_2p,
        chuvi_bd_trong_3p: formData.chu_vi_bd_ha_trong_3p,
        // KT bối dây hạ trong
        kt_boiday_trong_1p: formData.kt_bd_ha_trong_1p,
        kt_boiday_trong_2p: formData.kt_bd_ha_trong_2p,
        kt_boiday_trong_3p: formData.kt_bd_ha_trong_3p,
        // KT bối dây hạ ngoài
        kt_bd_ngoai_1p: formData.kt_bd_ha_ngoai_bv_1p,
        kt_bd_ngoai_2p: formData.kt_bd_ha_ngoai_bv_2p,
        kt_bd_ngoai_3p: formData.kt_bd_ha_ngoai_bv_3p,
        // Điện trở hạ
        dientroRa: formData.dien_tro_ha_ra,
        dientroRb: formData.dien_tro_ha_rb,
        dientroRc: formData.dien_tro_ha_rc,
        dolechdientro: formData.do_lech_dien_tro_giua_cac_pha,
        trang_thai: 1, // Trạng thái hoàn thành
        trang_thai_approve: 'pending', // Trạng thái chờ phê duyệt
        user_update: currentUser.email,
        created_at: new Date(),
        khau_sx: 'bd_ha'
      };

      console.log('BdHa data to save:', bdHaData);

      // 1. Lưu data vào tbl_bd_ha
      const bdHaId = await this.firebaseBdHaService.createBdHa(bdHaData);
      console.log('BdHa created with ID:', bdHaId);

      // 2. Cập nhật trạng thái trong user_bangve với bd_ha_id mới
      await this.updateUserBangVeStatus(userFromFirestore.id, this.data.quanDay.id, bdHaId);
      
      // Hiển thị thông báo thành công
      this.snackBar.open('Lưu thông tin bối dây hạ thành công!', '×', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar', 'compact-snackbar']
      });
      
      // Đóng popup và trả về data
      this.dialogRef.close({
        success: true,
        reloadData: true,
        data: { bdHaId, bdHaData },
        message: 'Lưu thông tin bối dây hạ thành công!'
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

  // Cập nhật trạng thái trong user_bangve
  private async updateUserBangVeStatus(userId: string, bangveId: string, bdHaId: string): Promise<void> {
    try {
      console.log('Updating user_bangve status for user:', userId, 'bangve:', bangveId, 'bdHaId:', bdHaId);
      
      // Lấy tất cả assignments của user
      console.log('Getting assignments for userId (string):', userId);
      console.log('Getting assignments for userId (number):', parseInt(userId));
      const userAssignments = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(userId));
      console.log('All user assignments:', userAssignments);
      console.log('Number of assignments found:', userAssignments.length);
      console.log('Looking for bangveId:', bangveId, 'userId:', userId);
      
      // Tìm assignment có bangve_id tương ứng và có bd_ha_id (nếu đã có) hoặc chưa có bd_ha_id
      let relevantAssignment = userAssignments.find(assignment => 
        assignment.bangve_id === String(bangveId) && 
        assignment.khau_sx === 'bd_ha' &&
        (assignment.bd_ha_id === undefined || assignment.bd_ha_id === null || String(assignment.bd_ha_id) === '' || String(assignment.bd_ha_id) === 'undefined' || String(assignment.bd_ha_id) === 'null')
      );
      
      console.log('Relevant assignment found (without bd_ha_id):', relevantAssignment);
      
      // Nếu không tìm thấy assignment chưa có bd_ha_id, tìm assignment có bd_ha_id tương ứng
      if (!relevantAssignment) {
        relevantAssignment = userAssignments.find(assignment => 
          assignment.bangve_id === String(bangveId) && 
          assignment.khau_sx === 'bd_ha' &&
          String(assignment.bd_ha_id) === bdHaId
        );
        console.log('Relevant assignment found (with matching bd_ha_id):', relevantAssignment);
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
          bd_ha_id: a.bd_ha_id
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
            bd_ha_id: assignment.bd_ha_id
          });
          console.log(`  - bangve_id match: ${assignment.bangve_id} === ${String(bangveId)} = ${assignment.bangve_id === String(bangveId)}`);
          console.log(`  - khau_sx match: ${assignment.khau_sx} === 'bd_ha' = ${assignment.khau_sx === 'bd_ha'}`);
          console.log(`  - bd_ha_id match: ${assignment.bd_ha_id} === ${bdHaId} = ${String(assignment.bd_ha_id) === bdHaId}`);
        });
        
        throw new Error('Không tìm thấy assignment hợp lệ để cập nhật');
      }
      
      console.log('Found relevant assignment:', relevantAssignment);
      
      // Cập nhật bd_ha_id và trạng thái bd_ha thành 2 (đã hoàn thành)
      if (relevantAssignment.id && relevantAssignment.id !== undefined && relevantAssignment.id !== null) {
        console.log('Attempting to update assignment with ID:', relevantAssignment.id);
        
        try {
          // Kiểm tra document có tồn tại không trước khi cập nhật
          const docExists = await this.firebaseUserBangVeService.getUserBangVeById(relevantAssignment.id.toString());
          if (!docExists) {
            console.warn('Document does not exist, trying to find alternative assignment');
            throw new Error('Document không tồn tại');
          }
          
          console.log('Calling updateUserBangVeWithBdHaId with:', {
            id: relevantAssignment.id.toString(),
            bdHaId: bdHaId,
            trang_thai: 2
          });
          
          await this.firebaseUserBangVeService.updateUserBangVeWithBdHaId(
            relevantAssignment.id.toString(), 
            bdHaId,
            2 // trang_thai_bd_ha = 2 (đã hoàn thành)
          );
          
          console.log('Successfully updated user_bangve with bd_ha_id and trang_thai_bd_ha = 2');
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
            console.log('Calling updateUserBangVeWithBdHaId with alternative assignment:', {
              id: alternativeAssignment.id.toString(),
              bdHaId: bdHaId,
              trang_thai: 2
            });
            
            await this.firebaseUserBangVeService.updateUserBangVeWithBdHaId(
              alternativeAssignment.id.toString(), 
              bdHaId,
              2 // trang_thai_bd_ha = 2 (đã hoàn thành)
            );
            
            console.log('Successfully updated alternative assignment with bd_ha_id and trang_thai_bd_ha = 2');
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
  private async updateAssignmentWithAlternative(assignment: any, bdHaId: string): Promise<void> {
    try {
      console.log('Updating alternative assignment:', assignment);
      
      if (assignment.id) {
        // Kiểm tra document có tồn tại không
        const docExists = await this.firebaseUserBangVeService.getUserBangVeById(assignment.id.toString());
        if (docExists) {
          await this.firebaseUserBangVeService.updateUserBangVeWithBdHaId(
            assignment.id.toString(), 
            bdHaId,
            2 // trang_thai_bd_ha = 2 (đã hoàn thành)
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
