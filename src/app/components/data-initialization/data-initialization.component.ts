import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { DataInitializationService } from '../../services/data-initialization.service';
import { FirebaseUserManagementService } from '../../services/firebase-user-management.service';
import { User, Role, Permission } from '../../models/user.model';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-data-initialization',
  standalone: true,
  imports: [
    CommonModule,
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
    MatTooltipModule
  ],
  templateUrl: './data-initialization.component.html',
  styleUrl: './data-initialization.component.css'
})
export class DataInitializationComponent implements OnInit {
  isCollapsed = false;
  isLoading = false;
  systemStats = {
    users: 0,
    roles: 0,
    permissions: 0
  };

  constructor(
    private sidenavService: SidenavService,
    private dataInitService: DataInitializationService,
    private userManagementService: FirebaseUserManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSystemStats();
  }

  toggleSidenav(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidenavService.toggle();
  }

  private loadSystemStats(): void {
    this.userManagementService.getUsers().subscribe(users => {
      this.systemStats.users = users.length;
    });

    this.userManagementService.getRoles().subscribe(roles => {
      this.systemStats.roles = roles.length;
    });

    this.userManagementService.getPermissions().subscribe(permissions => {
      this.systemStats.permissions = permissions.length;
    });
  }

  async initializeSystemData(): Promise<void> {
    this.isLoading = true;
    
    try {
      const result = await this.dataInitService.initializeSystemData();
      
      if (result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        
        // Reload stats
        this.loadSystemStats();
      } else {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    } catch (error) {
      console.error('Error initializing system data:', error);
      this.snackBar.open('Có lỗi xảy ra khi khởi tạo dữ liệu', 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  async resetSystemData(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận Reset Dữ liệu',
        message: 'Bạn có chắc chắn muốn reset toàn bộ dữ liệu hệ thống? Hành động này không thể hoàn tác!',
        confirmText: 'Reset',
        cancelText: 'Hủy',
        isDestructive: true
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        this.isLoading = true;
        
        try {
          const result = await this.dataInitService.resetSystemData();
          
          if (result.success) {
            this.snackBar.open(result.message, 'Đóng', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            
            // Reload stats
            this.loadSystemStats();
          } else {
            this.snackBar.open(result.message, 'Đóng', {
              duration: 5000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        } catch (error) {
          console.error('Error resetting system data:', error);
          this.snackBar.open('Có lỗi xảy ra khi reset dữ liệu', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        } finally {
          this.isLoading = false;
        }
      }
    });
  }

  async refreshData(): Promise<void> {
    this.isLoading = true;
    
    try {
      await this.userManagementService.refreshUsers();
      await this.userManagementService.refreshRoles();
      await this.userManagementService.refreshPermissions();
      
      this.loadSystemStats();
      
      this.snackBar.open('Dữ liệu đã được làm mới', 'Đóng', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.snackBar.open('Có lỗi xảy ra khi làm mới dữ liệu', 'Đóng', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }
}

// Dialog component for confirmation
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText }}
      </button>
      <button 
        mat-button 
        [mat-dialog-close]="true" 
        [color]="data.isDestructive ? 'warn' : 'primary'"
        cdkFocusInitial>
        {{ data.confirmText }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
