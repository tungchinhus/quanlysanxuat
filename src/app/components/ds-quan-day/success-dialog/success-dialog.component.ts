import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface SuccessDialogData {
  title?: string;
  message: string;
  details?: string;
  showAction?: boolean;
  actionText?: string;
}

@Component({
  selector: 'app-success-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="success-dialog-container">
      <div class="dialog-header">
        <div class="icon-container">
          <mat-icon>check_circle</mat-icon>
        </div>
        <h2 class="dialog-title">{{ data.title || 'Thành công' }}</h2>
      </div>
      
      <div class="dialog-content">
        <p class="success-message">{{ data.message }}</p>
        
        <div class="success-details" *ngIf="data.details && showDetails">
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
          *ngIf="data.showAction" 
          mat-raised-button 
          color="primary" 
          (click)="onAction()"
          class="action-button">
          <mat-icon>arrow_forward</mat-icon>
          {{ data.actionText || 'Tiếp tục' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-dialog-container {
      padding: 0;
      max-width: 500px;
      width: 100%;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      padding: 24px 24px 16px 24px;
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
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

    .success-message {
      font-size: 16px;
      line-height: 1.5;
      color: #333;
      margin: 0 0 16px 0;
    }

    .success-details {
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

    .action-button {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
      font-weight: 600;
    }

    .action-button:hover {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
    }

    /* Animation */
    .success-dialog-container {
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
export class SuccessDialogComponent {
  showDetails = false;

  constructor(
    public dialogRef: MatDialogRef<SuccessDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SuccessDialogData
  ) {}

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  onClose(): void {
    this.dialogRef.close(false);
  }

  onAction(): void {
    this.dialogRef.close(true);
  }
}
