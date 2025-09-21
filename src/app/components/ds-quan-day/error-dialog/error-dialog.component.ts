import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ErrorDialogData {
  title?: string;
  message: string;
  details?: string;
  type?: 'error' | 'warning' | 'info';
  showRetry?: boolean;
  retryText?: string;
}

@Component({
  selector: 'app-error-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="error-dialog-container">
      <div class="dialog-header">
        <div class="icon-container" [ngClass]="getIconClass()">
          <mat-icon>{{ getIcon() }}</mat-icon>
        </div>
        <h2 class="dialog-title">{{ data.title || 'Có lỗi xảy ra' }}</h2>
      </div>
      
      <div class="dialog-content">
        <p class="error-message">{{ data.message }}</p>
        
        <div class="error-details" *ngIf="data.details && showDetails">
          <button mat-button (click)="toggleDetails()" class="details-toggle">
            <mat-icon>{{ showDetails ? 'expand_less' : 'expand_more' }}</mat-icon>
            {{ showDetails ? 'Ẩn chi tiết' : 'Xem chi tiết' }}
          </button>
          
          <div class="details-content" *ngIf="showDetails">
            <pre>{{ data.details }}</pre>
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button mat-button (click)="onClose()" class="close-button">
          <mat-icon>close</mat-icon>
          Đóng
        </button>
        
        <button 
          *ngIf="data.showRetry" 
          mat-raised-button 
          color="primary" 
          (click)="onRetry()"
          class="retry-button">
          <mat-icon>refresh</mat-icon>
          {{ data.retryText || 'Thử lại' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-dialog-container {
      padding: 0;
      max-width: 500px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 16px 24px;
      background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
    }

    .icon-container.error {
      background: rgba(255, 255, 255, 0.2);
    }

    .icon-container.warning {
      background: rgba(255, 193, 7, 0.2);
    }

    .icon-container.info {
      background: rgba(33, 150, 243, 0.2);
    }

    .icon-container mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      flex: 1;
    }

    .dialog-content {
      padding: 24px;
    }

    .error-message {
      font-size: 16px;
      line-height: 1.5;
      color: #333;
      margin: 0 0 16px 0;
    }

    .error-details {
      margin-top: 16px;
    }

    .details-toggle {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .details-content {
      background: #f5f5f5;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      padding: 12px;
      margin-top: 8px;
    }

    .details-content pre {
      margin: 0;
      font-size: 12px;
      color: #666;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px 24px;
      background: #fafafa;
      border-radius: 0 0 8px 8px;
    }

    .close-button {
      color: #666;
    }

    .retry-button {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      font-weight: 600;
    }

    .retry-button:hover {
      background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
    }

    /* Animation */
    .error-dialog-container {
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive */
    @media (max-width: 600px) {
      .dialog-header {
        padding: 20px 16px 12px 16px;
      }

      .dialog-content {
        padding: 20px 16px;
      }

      .dialog-actions {
        padding: 12px 16px 20px 16px;
        flex-direction: column;
      }

      .dialog-actions button {
        width: 100%;
        margin: 4px 0;
      }
    }
  `]
})
export class ErrorDialogComponent {
  showDetails = false;

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {}

  getIcon(): string {
    switch (this.data.type) {
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'error';
    }
  }

  getIconClass(): string {
    return this.data.type || 'error';
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onRetry(): void {
    this.dialogRef.close(true);
  }
}
