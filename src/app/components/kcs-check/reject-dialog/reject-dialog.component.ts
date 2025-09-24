import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';

export interface RejectDialogData {
  itemId: number;
  itemName: string;
  itemType: string;
  // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
}

@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.component.html',
  styleUrls: ['./reject-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  standalone: true
})
export class RejectDialogComponent implements OnInit {
  rejectForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectDialogData,
    private authService: AuthService
  ) {
    this.rejectForm = this.fb.group({
      ghiChu: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }

  onSubmit(): void {
    if (this.rejectForm.valid) {
      this.isLoading = true;
      
      const formData = this.rejectForm.value;
      const rejectionData = {
        itemId: this.data.itemId,
        ghiChu: formData.ghiChu,
        rejectedAt: new Date().toISOString(),
        itemType: this.data.itemType,
        rejectedBy: this.authService.getCurrentUser()?.username || 
                   this.authService.getCurrentUser()?.email || 'Unknown'
      };

      console.log('Preparing rejection data for Firebase:', rejectionData);
      
      // Simulate loading time for better UX, then return data for Firebase save
      setTimeout(() => {
        this.dialogRef.close({
          IsSuccess: true,
          Message: 'Đã chuẩn bị dữ liệu từ chối KCS',
          data: rejectionData
        });
        this.isLoading = false;
      }, 500);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getItemTypeDisplayName(itemType: string): string {
    switch (itemType) {
      case 'boiDayHa':
        return 'Bối dây hạ';
      case 'boiDayCao':
        return 'Bối dây cao';
      case 'epBoiDay':
        return 'Ép bối dây';
      default:
        return itemType;
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.rejectForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    return '';
  }
}
