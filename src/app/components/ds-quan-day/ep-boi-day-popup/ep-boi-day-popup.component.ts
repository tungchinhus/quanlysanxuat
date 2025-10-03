import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';

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
  selector: 'app-ep-boi-day-popup',
  templateUrl: './ep-boi-day-popup.component.html',
  styleUrls: ['./ep-boi-day-popup.component.scss'],
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
export class EpBoiDayPopupComponent implements OnInit {
  epForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EpBoiDayPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quanDay: any },
    private http: HttpClient,
    private commonService: CommonService,
    private authService: AuthService) {  
      this.epForm = this.fb.group({
        bd_ep: ['', Validators.required],
        bung_bd: [0, Validators.required],
        ghi_chu: [''],
        ngay_hoan_thanh: [new Date(), Validators.required]
      });
    }

    ngOnInit(): void {
      if (this.data.quanDay) {
        this.epForm.patchValue({
          bd_ep: this.data.quanDay.bd_ep || '',
          bung_bd: this.data.quanDay.bung_bd || 0
        });
      }
    }
  
    onSubmit(): void {
      if (this.epForm.valid) {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
  
        const formData = this.epForm.value;
        const currentUser = this.authService.getCurrentUser();
        const userId = currentUser?.id;
        const token = this.authService.getToken();
  
        if (userId && token) {
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          });
  
          const requestBody = {
            user_id: userId,
            bangve_id: this.data.quanDay.id,
            bd_ep: formData.bd_ep,
            bung_bd: formData.bung_bd,
            ghi_chu: formData.ghi_chu,
            ngay_hoan_thanh: formData.ngay_hoan_thanh,
            trang_thai_bd_ep: 2 // Đã hoàn thành
          };
  
          const apiUrl = `${this.commonService.getServerAPIURL()}api/UserBangVe/save-ep-boiday`;
  
          this.http.post(apiUrl, requestBody, { headers }).subscribe({
            next: (response: any) => {
              this.isLoading = false;
              this.successMessage = 'Lưu thông tin bối dây ép thành công!';
              
              setTimeout(() => {
                this.dialogRef.close({
                  success: true,
                  reloadData: true,
                  message: 'Thông tin bối dây ép đã được lưu thành công!',
                  data: response
                });
              }, 1500);
            },
            error: (error) => {
              this.isLoading = false;
              this.errorMessage = 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.';
              console.error('Error saving ep boiday:', error);
            }
          });
        } else {
          this.isLoading = false;
          this.errorMessage = 'Không thể xác thực người dùng. Vui lòng đăng nhập lại.';
        }
      }
    }
  
    onCancel(): void {
      this.dialogRef.close();
    }
  }
