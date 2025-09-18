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
import { AuthService } from '../../../services/auth.service';

export interface ApproveDialogData {
  itemId: number;
  itemName: string;
  itemType: string;
  // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
}

@Component({
  selector: 'app-approve-dialog',
  templateUrl: './approve-dialog.component.html',
  styleUrls: ['./approve-dialog.component.scss'],
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
export class ApproveDialogComponent implements OnInit {
  approveForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveDialogData,
    private kcsService: KcsCheckService,
    private authService: AuthService
  ) {
    // Lấy thông tin người dùng hiện tại
    const currentUser = this.authService.getCurrentUser();
    const inspectorName = currentUser?.username || 
                         currentUser?.email || 
                         localStorage.getItem('email') || 
                         'Unknown';
    
    this.approveForm = this.fb.group({
      notes: ['Đạt tiêu chuẩn chất lượng KCS', [Validators.required]],
      qualityScore: [5, [Validators.required, Validators.min(1), Validators.max(10)]],
      inspectorName: [inspectorName, [Validators.required]],
      inspectionDate: [new Date(), [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
    console.log('ApproveDialog initialized with data:', this.data);
    console.log('Form value:', this.approveForm.value);
    console.log('Form valid:', this.approveForm.valid);
  }

  onSubmit(): void {
    if (!this.approveForm.valid) {
      console.error('Form is invalid:', this.approveForm.errors);
      console.error('Form validation errors:', {
        notes: this.approveForm.get('notes')?.errors,
        qualityScore: this.approveForm.get('qualityScore')?.errors,
        inspectorName: this.approveForm.get('inspectorName')?.errors,
        inspectionDate: this.approveForm.get('inspectionDate')?.errors
      });
      return;
    }
    
    this.isLoading = true;
    
    const formData = this.approveForm.value;
    const approvalData = {
      itemId: this.data.itemId,
      notes: formData.notes,
      qualityScore: formData.qualityScore,
      inspectorName: formData.inspectorName,
      inspectionDate: formData.inspectionDate instanceof Date ? formData.inspectionDate.toISOString() : formData.inspectionDate,
      approvedAt: new Date().toISOString(),
      itemType: this.data.itemType
      // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
    };

    console.log('Submitting approval with data:', approvalData);
    
    // Call service to approve item
    this.kcsService.approveItem(this.data.itemType, this.data.itemId, approvalData)
      .subscribe({
        next: (response) => {
          console.log('Approve response received:', response);
          if (response.IsSuccess) {
            this.dialogRef.close({
              IsSuccess: true,
              Message: response.Message || 'Đã duyệt KCS thành công',
              data: approvalData
            });
          } else {
            this.dialogRef.close({
              IsSuccess: false,
              Message: response.Message || 'Lỗi khi duyệt'
            });
          }
        },
        error: (error) => {
          console.error('Error approving item:', error);
          this.dialogRef.close({
            IsSuccess: false,
            Message: 'Lỗi khi duyệt. Vui lòng thử lại.'
          });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
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
}
