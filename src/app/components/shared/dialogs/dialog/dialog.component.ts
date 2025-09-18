import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title || 'Xác nhận' }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message || 'Bạn có chắc chắn muốn thực hiện hành động này?' }}</p>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Hủy</button>
      <button mat-button color="primary" (click)="onConfirm()">Xác nhận</button>
    </div>
  `
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
