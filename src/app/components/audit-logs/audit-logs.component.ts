import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AuditLogService, AuditLog, AuditLogFilter } from '../../services/audit-log.service';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.css'
})
export class AuditLogsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isCollapsed = false;
  isLoading = false;
  dataSource = new MatTableDataSource<AuditLog>([]);
  displayedColumns: string[] = [
    'timestamp',
    'userName',
    'action',
    'resource',
    'details',
    'success',
    'actions'
  ];

  // Filter options
  filter: AuditLogFilter = {
    limit: 100
  };

  // Filter form
  filterForm = {
    userId: '',
    action: '',
    resource: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    success: null as boolean | null
  };

  // Action options
  actionOptions = [
    { value: 'LOGIN', label: 'Đăng nhập' },
    { value: 'LOGOUT', label: 'Đăng xuất' },
    { value: 'CREATE', label: 'Tạo mới' },
    { value: 'UPDATE', label: 'Cập nhật' },
    { value: 'DELETE', label: 'Xóa' },
    { value: 'EXPORT', label: 'Xuất dữ liệu' },
    { value: 'IMPORT', label: 'Nhập dữ liệu' },
    { value: 'VIEW', label: 'Xem' }
  ];

  // Resource options
  resourceOptions = [
    { value: 'USER', label: 'Người dùng' },
    { value: 'ROLE', label: 'Vai trò' },
    { value: 'PERMISSION', label: 'Quyền hạn' },
    { value: 'DATA', label: 'Dữ liệu' },
    { value: 'SYSTEM', label: 'Hệ thống' }
  ];

  constructor(
    private sidenavService: SidenavService,
    private auditLogService: AuditLogService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  toggleSidenav(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidenavService.toggle();
  }

  async loadAuditLogs(): Promise<void> {
    this.isLoading = true;
    
    try {
      const logs = await this.auditLogService.getAuditLogs(this.filter);
      this.dataSource.data = logs;
    } catch (error) {
      console.error('Error loading audit logs:', error);
      this.snackBar.open('Lỗi khi tải audit logs', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  applyFilter(): void {
    this.filter = {
      userId: this.filterForm.userId || undefined,
      action: this.filterForm.action || undefined,
      resource: this.filterForm.resource || undefined,
      startDate: this.filterForm.startDate || undefined,
      endDate: this.filterForm.endDate || undefined,
      success: this.filterForm.success !== null ? this.filterForm.success : undefined,
      limit: 100
    };
    
    this.loadAuditLogs();
  }

  clearFilter(): void {
    this.filterForm = {
      userId: '',
      action: '',
      resource: '',
      startDate: null,
      endDate: null,
      success: null
    };
    
    this.filter = { limit: 100 };
    this.loadAuditLogs();
  }

  viewLogDetails(log: AuditLog): void {
    const dialogRef = this.dialog.open(AuditLogDetailsDialogComponent, {
      width: '600px',
      data: log
    });
  }

  exportLogs(): void {
    // TODO: Implement export functionality
    this.snackBar.open('Chức năng xuất logs sẽ được thêm trong phiên bản sau', 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  refreshLogs(): void {
    this.loadAuditLogs();
  }

  // Helper methods
  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'LOGIN': 'login',
      'LOGOUT': 'logout',
      'CREATE': 'add',
      'UPDATE': 'edit',
      'DELETE': 'delete',
      'EXPORT': 'download',
      'IMPORT': 'upload',
      'VIEW': 'visibility'
    };
    return iconMap[action] || 'info';
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'LOGIN': 'primary',
      'LOGOUT': 'basic',
      'CREATE': 'accent',
      'UPDATE': 'primary',
      'DELETE': 'warn',
      'EXPORT': 'accent',
      'IMPORT': 'primary',
      'VIEW': 'basic'
    };
    return colorMap[action] || 'basic';
  }

  getResourceIcon(resource: string): string {
    const iconMap: { [key: string]: string } = {
      'USER': 'people',
      'ROLE': 'admin_panel_settings',
      'PERMISSION': 'security',
      'DATA': 'storage',
      'SYSTEM': 'settings'
    };
    return iconMap[resource] || 'info';
  }

  getSuccessColor(success: boolean): string {
    return success ? 'primary' : 'warn';
  }

  getSuccessText(success: boolean): string {
    return success ? 'Thành công' : 'Thất bại';
  }

  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('vi-VN');
  }

  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return this.formatTimestamp(timestamp);
  }
}

// Dialog component for audit log details
@Component({
  selector: 'app-audit-log-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <h2 mat-dialog-title>Chi tiết Audit Log</h2>
    <mat-dialog-content>
      <div class="audit-log-details">
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar [color]="getSuccessColor(data.success)">info</mat-icon>
            <mat-card-title>{{ data.action }}</mat-card-title>
            <mat-card-subtitle>{{ data.resource }} - {{ data.userName }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="details-grid">
              <div class="detail-item">
                <strong>Thời gian:</strong>
                <span>{{ formatTimestamp(data.timestamp) }}</span>
              </div>
              <div class="detail-item">
                <strong>Người thực hiện:</strong>
                <span>{{ data.userName }} ({{ data.userId }})</span>
              </div>
              <div class="detail-item">
                <strong>Hành động:</strong>
                <mat-chip [color]="getActionColor(data.action)">{{ data.action }}</mat-chip>
              </div>
              <div class="detail-item">
                <strong>Tài nguyên:</strong>
                <span>{{ data.resource }}</span>
              </div>
              <div class="detail-item">
                <strong>Trạng thái:</strong>
                <mat-chip [color]="getSuccessColor(data.success)">{{ getSuccessText(data.success) }}</mat-chip>
              </div>
              <div class="detail-item" *ngIf="data.resourceId">
                <strong>ID tài nguyên:</strong>
                <span>{{ data.resourceId }}</span>
              </div>
              <div class="detail-item" *ngIf="data.ipAddress">
                <strong>IP Address:</strong>
                <span>{{ data.ipAddress }}</span>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <div class="details-section">
              <h4>Chi tiết:</h4>
              <p>{{ data.details }}</p>
            </div>
            
            <div class="details-section" *ngIf="data.errorMessage">
              <h4>Lỗi:</h4>
              <p class="error-message">{{ data.errorMessage }}</p>
            </div>
            
            <div class="details-section" *ngIf="data.oldValues || data.newValues">
              <h4>Thay đổi dữ liệu:</h4>
              <mat-expansion-panel *ngIf="data.oldValues">
                <mat-expansion-panel-header>
                  <mat-panel-title>Giá trị cũ</mat-panel-title>
                </mat-expansion-panel-header>
                <pre>{{ data.oldValues | json }}</pre>
              </mat-expansion-panel>
              <mat-expansion-panel *ngIf="data.newValues">
                <mat-expansion-panel-header>
                  <mat-panel-title>Giá trị mới</mat-panel-title>
                </mat-expansion-panel-header>
                <pre>{{ data.newValues | json }}</pre>
              </mat-expansion-panel>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true">Đóng</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .audit-log-details {
      padding: 16px 0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .detail-item strong {
      color: #333;
      font-size: 0.875rem;
    }
    .detail-item span {
      color: #666;
      font-size: 0.875rem;
    }
    .details-section {
      margin-top: 16px;
    }
    .details-section h4 {
      margin-bottom: 8px;
      color: #333;
    }
    .details-section p {
      margin: 0;
      color: #666;
      line-height: 1.5;
    }
    .error-message {
      color: #f44336 !important;
      background-color: #ffebee;
      padding: 8px;
      border-radius: 4px;
    }
    pre {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      overflow-x: auto;
    }
    @media (max-width: 768px) {
      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AuditLogDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: AuditLog) {}

  getSuccessColor(success: boolean): string {
    return success ? 'primary' : 'warn';
  }

  getActionColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'LOGIN': 'primary',
      'LOGOUT': 'basic',
      'CREATE': 'accent',
      'UPDATE': 'primary',
      'DELETE': 'warn',
      'EXPORT': 'accent',
      'IMPORT': 'primary',
      'VIEW': 'basic'
    };
    return colorMap[action] || 'basic';
  }

  getSuccessText(success: boolean): string {
    return success ? 'Thành công' : 'Thất bại';
  }

  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('vi-VN');
  }
}
