import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FirebaseUserBangVeService } from '../../../services/firebase-user-bangve.service';
import { FirebaseBdHaService } from '../../../services/firebase-bd-ha.service';
import { FirebaseBdCaoService } from '../../../services/firebase-bd-cao.service';
import { FirebaseBangVeService } from '../../../services/firebase-bangve.service';
import { BangVeData } from '../ds-bangve.component';

export interface StatusDetailData {
  drawing: BangVeData;
  bdHaStatus?: any;
  bdCaoStatus?: any;
  userAssignments?: any[];
}

@Component({
  selector: 'app-status-detail-popup',
  templateUrl: './status-detail-popup.component.html',
  styleUrls: ['./status-detail-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule
  ]
})
export class StatusDetailPopupComponent implements OnInit {
  isLoading = false;
  
  // Expansion states
  isBdHaExpanded = false;
  isBdCaoExpanded = false;
  statusData: StatusDetailData;

  constructor(
    private dialogRef: MatDialogRef<StatusDetailPopupComponent>,
    private snackBar: MatSnackBar,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBdHaService: FirebaseBdHaService,
    private firebaseBdCaoService: FirebaseBdCaoService,
    private firebaseBangVeService: FirebaseBangVeService,
    @Inject(MAT_DIALOG_DATA) public data: { drawing: BangVeData }
  ) {
    this.statusData = {
      drawing: this.data.drawing
    };
  }

  ngOnInit() {
    this.loadStatusDetails();
  }

  async loadStatusDetails() {
    this.isLoading = true;
    
    try {
      // Lấy thông tin assignments cho bảng vẽ này
      const assignments = await this.firebaseUserBangVeService.getUserBangVeByBangVeId(this.data.drawing.id.toString());
      this.statusData.userAssignments = assignments;

      // Lấy thông tin bối dây hạ nếu có
      try {
        const bdHaList = await this.firebaseBdHaService.getBdHaByKyHieuBangVe(this.data.drawing.kyhieubangve);
        if (bdHaList && bdHaList.length > 0) {
          this.statusData.bdHaStatus = bdHaList[0]; // Lấy record đầu tiên
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin bối dây hạ:', error);
      }

      // Lấy thông tin bối dây cao nếu có
      try {
        const bdCaoList = await this.firebaseBdCaoService.getBdCaoByKyHieuBangVe(this.data.drawing.kyhieubangve);
        if (bdCaoList && bdCaoList.length > 0) {
          this.statusData.bdCaoStatus = bdCaoList[0]; // Lấy record đầu tiên
        }
      } catch (error) {
        console.warn('Không thể lấy thông tin bối dây cao:', error);
      }

    } catch (error) {
      console.error('Lỗi khi tải chi tiết trạng thái:', error);
      this.snackBar.open('Có lỗi xảy ra khi tải thông tin trạng thái', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  getStatusText(status: number | null | undefined): string {
    if (status === null || status === undefined) return 'Chưa bắt đầu';
    switch (status) {
      case 0: return 'Chưa bắt đầu';
      case 1: return 'Đã thi công';
      case 2: return 'KCS đã approve';
      default: return 'Không xác định';
    }
  }

  getStatusColor(status: number | null | undefined): string {
    if (status === null || status === undefined) return 'warn';
    switch (status) {
      case 0: return 'warn';
      case 1: return 'accent';
      case 2: return 'primary';
      default: return 'warn';
    }
  }

  getStatusIcon(status: number | null | undefined): string {
    if (status === null || status === undefined) return 'schedule';
    switch (status) {
      case 0: return 'schedule';
      case 1: return 'build';
      case 2: return 'verified';
      default: return 'help';
    }
  }

  getApprovalStatusText(status: string | undefined): string {
    if (!status) return 'Chưa có';
    switch (status) {
      case 'pending': return 'Chờ phê duyệt';
      case 'approved': return 'Đã phê duyệt';
      case 'rejected': return 'Bị từ chối';
      default: return 'Không xác định';
    }
  }

  getApprovalStatusColor(status: string | undefined): string {
    if (!status) return 'warn';
    switch (status) {
      case 'pending': return 'accent';
      case 'approved': return 'primary';
      case 'rejected': return 'warn';
      default: return 'warn';
    }
  }

  getApprovalStatusIcon(status: string | undefined): string {
    if (!status) return 'schedule';
    switch (status) {
      case 'pending': return 'schedule';
      case 'approved': return 'check_circle';
      case 'rejected': return 'cancel';
      default: return 'help';
    }
  }

  formatDate(date: any): string {
    if (!date) return 'Chưa có';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  }

  formatDateTime(date: any): string {
    if (!date) return 'Chưa có';
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
  }

  onClose() {
    this.dialogRef.close();
  }

  // Toggle expansion methods
  toggleBdHaExpansion(): void {
    this.isBdHaExpanded = !this.isBdHaExpanded;
  }

  toggleBdCaoExpansion(): void {
    this.isBdCaoExpanded = !this.isBdCaoExpanded;
  }

  // Kiểm tra xem có thể hiển thị nút "Hoàn thành" không
  canShowCompleteButton(): boolean {
    // Kiểm tra cả bối dây hạ và cao đã được KCS approved (trang_thai_approve = 'approved')
    const bdHaApproved = this.statusData.bdHaStatus?.trang_thai_approve === 'approved';
    const bdCaoApproved = this.statusData.bdCaoStatus?.trang_thai_approve === 'approved';
    
    // Chỉ hiển thị nút khi cả hai đều đã được approved
    return bdHaApproved && bdCaoApproved;
  }

  // Xử lý khi bấm nút "Hoàn thành"
  async onComplete(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Xử lý ID để đảm bảo đúng format
      const docId = typeof this.statusData.drawing.id === 'string' 
        ? this.statusData.drawing.id 
        : this.statusData.drawing.id.toString();
      
      console.log('Attempting to update bangve with ID:', docId);
      console.log('Drawing data:', this.statusData.drawing);
      
      // Cập nhật trang_thai từ 1 thành 2 trong collection bangve bằng kyhieubangve
      await this.firebaseBangVeService.updateBangVeStatusByKyHieu(this.statusData.drawing.kyhieubangve, 2);
      
      this.snackBar.open('Đã hoàn thành thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
      // Đóng popup và trả về kết quả để parent component có thể refresh
      this.dialogRef.close({ completed: true });
      
    } catch (error) {
      console.error('Lỗi khi hoàn thành:', error);
      this.snackBar.open('Có lỗi xảy ra khi hoàn thành', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }
}
