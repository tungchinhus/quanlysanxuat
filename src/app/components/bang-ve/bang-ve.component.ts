import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BangVeData } from '../ds-bangve/ds-bangve.component';
import { STATUS } from '../../models/common.enum';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-bang-ve',
  templateUrl: './bang-ve.component.html',
  styleUrls: ['./bang-ve.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class BangVeComponent implements OnInit {
  bangVeForm!: FormGroup;
  isViewMode: boolean = false; // Biến để kiểm soát chế độ xem
  isSaving: boolean = false; // Biến để kiểm soát trạng thái đang lưu

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BangVeComponent>, // Inject MatDialogRef để đóng dialog
    @Inject(MAT_DIALOG_DATA) public data: { bangVeData?: BangVeData, mode: 'add' | 'view' | 'edit' }, // Inject dữ liệu từ dialog
    private firebaseBangVeService: FirebaseBangVeService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.bangVeForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      kyhieubangve: ['', Validators.required],
      congsuat: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      tbkt: [''],
      dienap: [''],
      bd_ha_trong: [''],
      bd_ha_ngoai: [''],
      bd_cao: [''],
      bd_ep: [''],
      bung_bd: ['', Validators.pattern(/^[0-9]*$/)],
      user_create: [{ value: 'Current User', disabled: true }],
      trang_thai: [STATUS.NEW],
      created_at: [{ value: new Date().toISOString().slice(0, 16), disabled: true }]
    });

    // Kiểm tra chế độ và điền dữ liệu nếu là xem/sửa
    if (this.data && this.data.bangVeData) {
      this.bangVeForm.patchValue(this.data.bangVeData); // Điền dữ liệu vào form
      if (this.data.mode === 'view') {
        this.bangVeForm.disable(); // Vô hiệu hóa form nếu ở chế độ xem
        this.isViewMode = true;
      }
    } else {
      // Nếu là thêm mới, đảm bảo các trường mặc định được thiết lập
      this.bangVeForm.patchValue({
        user_create: 'Current User',
        created_at: new Date().toISOString().slice(0, 16),
        trang_thai: STATUS.NEW // Đảm bảo trang_thai luôn là STATUS.NEW cho bảng vẽ mới
      });
      
      // Đảm bảo kyhieubangve không bị disabled
      const kyhieuControl = this.bangVeForm.get('kyhieubangve');
      if (kyhieuControl && kyhieuControl.disabled) {
        kyhieuControl.enable();
      }
      
      // Đảm bảo form được enable trong chế độ add
      if (this.data.mode === 'add') {
        this.bangVeForm.enable();
        // Đảm bảo trang_thai được set lại là STATUS.NEW sau khi enable
        this.bangVeForm.patchValue({ trang_thai: STATUS.NEW });
      }
    }
    
    console.log('Form after initialization:', this.bangVeForm.value);
    console.log('kyhieubangve after init:', this.bangVeForm.get('kyhieubangve')?.value);
  }

  /**
   * Xử lý sự kiện khi nhấn nút "Thêm Bảng Vẽ" (trong dialog)
   */
  async themBangVe(): Promise<void> {
    if (this.bangVeForm.valid && !this.isSaving) {
      this.isSaving = true;
      
      try {
        const formData = this.bangVeForm.getRawValue();
        
        // Lấy thông tin user hiện tại
        const userInfo = this.authService.getUserInfo();
        const currentUsername = userInfo?.username || localStorage.getItem('username') || 'unknown';
        
        const newBangVe = { 
          kyhieubangve: formData.kyhieubangve,
          congsuat: formData.congsuat,
          tbkt: formData.tbkt || '',
          dienap: formData.dienap || '',
          soboiday: '', // Giá trị mặc định, sẽ được cập nhật từ popup boidaycao
          bd_ha_trong: formData.bd_ha_trong || '',
          bd_ha_ngoai: formData.bd_ha_ngoai || '',
          bd_cao: formData.bd_cao || '',
          bd_ep: formData.bd_ep || '',
          bung_bd: formData.bung_bd || 0,
          user_create: currentUsername,
          trang_thai: 0, // Đảm bảo trang_thai luôn là 0 cho bảng vẽ mới
          created_at: new Date(),
          username: currentUsername,
          email: userInfo?.email || '',
          role_name: userInfo?.roles?.[0] || 'user',
          IsActive: true
        };
        
        console.log('Saving bang ve to Firebase:', newBangVe);
        
        // Đảm bảo collection tồn tại
        await this.firebaseBangVeService.ensureCollectionExists();
        
        // Lưu vào Firebase
        const docId = await this.firebaseBangVeService.createBangVe(newBangVe);
        
        console.log('Bang ve saved successfully with ID:', docId);
        
        // Đóng dialog và trả về dữ liệu mới với ID từ Firebase
        const savedBangVe: BangVeData = {
          ...newBangVe,
          id: parseInt(docId) || 0,
          username: currentUsername,
          email: userInfo?.email || '',
          role_name: userInfo?.roles?.[0] || 'user'
        };
        
        this.dialogRef.close(savedBangVe);
        this._snackBar.open('Thêm bảng vẽ thành công!', 'Đóng', { duration: 3000 });
        
      } catch (error) {
        console.error('Error saving bang ve to Firebase:', error);
        this._snackBar.open('Lỗi khi lưu bảng vẽ. Vui lòng thử lại!', 'Đóng', { duration: 3000 });
      } finally {
        this.isSaving = false;
      }
    } else if (this.isSaving) {
      this._snackBar.open('Đang lưu bảng vẽ, vui lòng đợi...', 'Đóng', { duration: 2000 });
    } else {
      console.log('Form is invalid. Errors:', this.bangVeForm.errors);
      this.bangVeForm.markAllAsTouched();
      this._snackBar.open('Vui lòng điền đầy đủ và đúng thông tin!', 'Đóng', { duration: 3000 });
    }
  }

  /**
   * Xử lý sự kiện khi nhấn nút "Copy Bảng Vẽ" (trong dialog)
   */
  copyBangVe(): void {
    if (this.bangVeForm.valid) {
      const currentData = this.bangVeForm.getRawValue();
      const copiedData = { 
        ...currentData, 
        id: null, 
        created_at: new Date().toISOString().slice(0, 16),
        trang_thai: 0 // Đảm bảo trang_thai luôn là 0 khi copy
      };
      this.bangVeForm.patchValue(copiedData);
      this._snackBar.open('Đã sao chép bảng vẽ!', 'Đóng', { duration: 3000 });
    } else {
      this._snackBar.open('Vui lòng điền đầy đủ và đúng thông tin để sao chép!', 'Đóng', { duration: 3000 });
      this.bangVeForm.markAllAsTouched();
    }
  }

  /**
   * Đóng dialog mà không lưu thay đổi.
   */
  onCancel(): void {
    this.dialogRef.close(); // Đóng dialog mà không truyền dữ liệu
  }

  /**
   * Test method để kiểm tra form
   */
  testForm(): void {
    console.log('Testing form...');
    this.bangVeForm.patchValue({
      kyhieubangve: 'TEST-BV-001',
      congsuat: 250,
      tbkt: 'TEST-TBKT',
      dienap: '22kV',
      bd_ha_trong: 'OK',
      bd_ha_ngoai: 'OK',
      bd_cao: 'OK',
      bd_ep: 'OK',
      bung_bd: 1,
      trang_thai: 0 // Đảm bảo trang_thai luôn là 0 khi test
    });
    console.log('Form after test patch:', this.bangVeForm.value);
    console.log('Form valid after test:', this.bangVeForm.valid);
  }
}
