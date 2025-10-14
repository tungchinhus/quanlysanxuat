import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2 mat-dialog-title class="dialog-title">{{ data.title || 'Xác nhận' }}</h2>
      </div>
      
      <div mat-dialog-content class="dialog-content">
        <div class="message-container">
          <p class="main-message">{{ data.message || 'Bạn có chắc chắn muốn thực hiện hành động này?' }}</p>
        </div>
      </div>
      
      <div mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-button">
          <mat-icon>close</mat-icon>
          {{ data.cancelText || 'Hủy' }}
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" class="confirm-button">
          <mat-icon>delete</mat-icon>
          {{ data.confirmText || 'Xác nhận' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      min-width: 400px;
      max-width: 500px;
      min-height: 200px;
      padding: 0;
      border-radius: 12px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px 16px 24px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
    }

    .warning-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .dialog-title {
      margin: 0;
      font-size: 1.4em;
      font-weight: 600;
      color: white;
    }

    .dialog-content {
      padding: 20px 24px;
      background: white;
      min-height: 80px;
      max-height: 300px;
      overflow-y: auto;
    }

    .message-container {
      line-height: 1.6;
    }

    .main-message {
      margin: 0;
      font-size: 1em;
      color: #333;
      white-space: pre-line;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
    }

    .cancel-button {
      color: #6c757d;
      border: 1px solid #dee2e6;
      padding: 8px 16px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
    }

    .cancel-button:hover {
      background-color: #f8f9fa;
      border-color: #adb5bd;
    }

    .confirm-button {
      background-color: #dc3545;
      color: white;
      padding: 8px 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
    }

    .confirm-button:hover {
      background-color: #c82333;
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.4);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .dialog-container {
        min-width: 320px;
        max-width: 95vw;
        margin: 8px;
      }

      .dialog-header {
        padding: 16px 20px 12px 20px;
      }

      .dialog-title {
        font-size: 1.2em;
      }

      .warning-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .dialog-content {
        padding: 16px 20px;
      }

      .dialog-actions {
        padding: 12px 20px 16px 20px;
        flex-direction: column;
        gap: 8px;
      }

      .cancel-button,
      .confirm-button {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-height: 600px) {
      .dialog-container {
        min-height: 150px;
      }

      .dialog-content {
        min-height: 60px;
        max-height: 200px;
      }

      .dialog-header {
        padding: 12px 20px 8px 20px;
      }

      .dialog-content {
        padding: 12px 20px;
      }

      .dialog-actions {
        padding: 8px 20px 12px 20px;
      }
    }
  `]
})
export class DialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
