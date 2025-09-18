import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserImportExportService, ExportData, ImportResult } from '../../services/user-import-export.service';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-user-import-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTabsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule
  ],
  templateUrl: './user-import-export.component.html',
  styleUrl: './user-import-export.component.css'
})
export class UserImportExportComponent implements OnInit {
  isCollapsed = false;
  isLoading = false;
  selectedFile: File | null = null;
  importProgress = 0;
  exportFormat = 'json';
  importFormat = 'json';
  includeUsers = true;
  includeRoles = true;
  includePermissions = true;

  constructor(
    private sidenavService: SidenavService,
    private importExportService: UserImportExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  toggleSidenav(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidenavService.toggle();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.validateFile(file);
    }
  }

  validateFile(file: File): void {
    const maxSize = 10; // MB
    const allowedTypes = ['.json', '.csv'];
    
    if (this.importExportService.getFileSizeMB(file) > maxSize) {
      this.snackBar.open(`File quá lớn. Kích thước tối đa: ${maxSize}MB`, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      return;
    }

    if (!this.importExportService.validateFileType(file, allowedTypes)) {
      this.snackBar.open('Định dạng file không được hỗ trợ. Chỉ chấp nhận .json và .csv', 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.selectedFile = null;
      return;
    }

    this.snackBar.open(`File đã được chọn: ${file.name}`, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  async exportAllData(): Promise<void> {
    this.isLoading = true;
    
    try {
      const data = await this.importExportService.exportAllData();
      const filename = `user_data_export_${new Date().toISOString().split('T')[0]}`;
      
      if (this.exportFormat === 'json') {
        this.importExportService.downloadAsJSON(data, filename);
      } else {
        // Export as separate CSV files
        if (this.includeUsers) {
          this.importExportService.downloadAsCSV(data.users, `${filename}_users`, 'users');
        }
        if (this.includeRoles) {
          this.importExportService.downloadAsCSV(data.roles, `${filename}_roles`, 'roles');
        }
        if (this.includePermissions) {
          this.importExportService.downloadAsCSV(data.permissions, `${filename}_permissions`, 'permissions');
        }
      }

      this.snackBar.open('Xuất dữ liệu thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      this.snackBar.open('Lỗi khi xuất dữ liệu: ' + error.message, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async exportUsers(): Promise<void> {
    this.isLoading = true;
    
    try {
      const users = await this.importExportService.exportUsers();
      const filename = `users_export_${new Date().toISOString().split('T')[0]}`;
      
      if (this.exportFormat === 'json') {
        this.importExportService.downloadAsJSON(users, filename);
      } else {
        this.importExportService.downloadAsCSV(users, filename, 'users');
      }

      this.snackBar.open('Xuất danh sách người dùng thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('Error exporting users:', error);
      this.snackBar.open('Lỗi khi xuất danh sách người dùng: ' + error.message, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async exportRoles(): Promise<void> {
    this.isLoading = true;
    
    try {
      const roles = await this.importExportService.exportRoles();
      const filename = `roles_export_${new Date().toISOString().split('T')[0]}`;
      
      if (this.exportFormat === 'json') {
        this.importExportService.downloadAsJSON(roles, filename);
      } else {
        this.importExportService.downloadAsCSV(roles, filename, 'roles');
      }

      this.snackBar.open('Xuất danh sách vai trò thành công!', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('Error exporting roles:', error);
      this.snackBar.open('Lỗi khi xuất danh sách vai trò: ' + error.message, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async importData(): Promise<void> {
    if (!this.selectedFile) {
      this.snackBar.open('Vui lòng chọn file để import', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;
    this.importProgress = 0;
    
    try {
      let result: ImportResult;
      
      if (this.importFormat === 'json') {
        result = await this.importExportService.importFromJSON(this.selectedFile);
      } else {
        result = await this.importExportService.importUsersFromCSV(this.selectedFile);
      }

      this.importProgress = 100;

      if (result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      } else {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }

      // Show detailed results
      this.showImportResults(result);
      
    } catch (error: any) {
      console.error('Error importing data:', error);
      this.snackBar.open('Lỗi khi import dữ liệu: ' + error.message, 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
      this.importProgress = 0;
    }
  }

  private showImportResults(result: ImportResult): void {
    const dialogRef = this.dialog.open(ImportResultsDialogComponent, {
      width: '600px',
      data: result
    });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.importProgress = 0;
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    return `${this.importExportService.getFileSizeMB(this.selectedFile).toFixed(2)} MB`;
  }
}

// Dialog component for import results
@Component({
  selector: 'app-import-results-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>Kết quả Import</h2>
    <mat-dialog-content>
      <div class="import-results">
        <div class="summary">
          <mat-chip-set>
            <mat-chip color="primary">{{ data.importedUsers }} Users</mat-chip>
            <mat-chip color="accent">{{ data.importedRoles }} Roles</mat-chip>
            <mat-chip color="warn">{{ data.importedPermissions }} Permissions</mat-chip>
          </mat-chip-set>
        </div>
        
        <div *ngIf="data.errors.length > 0" class="errors">
          <h3>Lỗi:</h3>
          <mat-list>
            <mat-list-item *ngFor="let error of data.errors">
              <mat-icon mat-list-icon color="warn">error</mat-icon>
              <div mat-line>{{ error }}</div>
            </mat-list-item>
          </mat-list>
        </div>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true">Đóng</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .import-results {
      padding: 16px 0;
    }
    .summary {
      margin-bottom: 16px;
    }
    .errors {
      margin-top: 16px;
    }
    .errors h3 {
      color: #f44336;
      margin-bottom: 8px;
    }
  `]
})
export class ImportResultsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ImportResult) {}
}
