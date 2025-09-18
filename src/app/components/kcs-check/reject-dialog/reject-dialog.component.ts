import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KcsCheckService } from '../kcs-check.service';

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
    private kcsService: KcsCheckService
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
        itemType: this.data.itemType
        // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
      };

      // Call service to reject item
      this.kcsService.rejectItem(this.data.itemType, this.data.itemId, formData.ghiChu)
        .subscribe({
          next: (response) => {
            if (response.IsSuccess) {
              this.dialogRef.close({
                IsSuccess: true,
                Message: response.Message || 'Đã từ chối thành công',
                data: rejectionData
              });
            } else {
              this.dialogRef.close({
                IsSuccess: false,
                Message: response.Message || 'Lỗi khi từ chối'
              });
            }
          },
          error: (error) => {
            console.error('Error rejecting item:', error);
            this.dialogRef.close({
              IsSuccess: false,
              Message: 'Lỗi khi từ chối. Vui lòng thử lại.'
            });
          },
          complete: () => {
            this.isLoading = false;
          }
        });
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
