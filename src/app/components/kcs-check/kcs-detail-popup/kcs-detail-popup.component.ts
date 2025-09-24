import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';

export interface KcsDetailData {
  item: any;
  itemType: 'boiDayHa' | 'boiDayCao' | 'epBoiDay';
}

@Component({
  selector: 'app-kcs-detail-popup',
  templateUrl: './kcs-detail-popup.component.html',
  styleUrls: ['./kcs-detail-popup.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    DatePipe
  ]
})
export class KcsDetailPopupComponent implements OnInit {
  itemTypeText: string = '';
  statusText: string = '';
  statusClass: string = '';

  constructor(
    public dialogRef: MatDialogRef<KcsDetailPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KcsDetailData
  ) {}

  ngOnInit(): void {
    this.setItemTypeText();
    this.setStatusInfo();
  }

  private setItemTypeText(): void {
    switch (this.data.itemType) {
      case 'boiDayHa':
        this.itemTypeText = 'Bối dây hạ';
        break;
      case 'boiDayCao':
        this.itemTypeText = 'Bối dây cao';
        break;
      case 'epBoiDay':
        this.itemTypeText = 'Ép bối dây';
        break;
      default:
        this.itemTypeText = 'Bối dây';
    }
  }

  private setStatusInfo(): void {
    const status = this.data.item.trang_thai_approve || this.data.item.trang_thai;
    switch (status) {
      case 'pending':
        this.statusText = 'CHỜ KIỂM TRA';
        this.statusClass = 'status-pending';
        break;
      case 'approved':
        this.statusText = 'ĐÃ DUYỆT';
        this.statusClass = 'status-approved';
        break;
      case 'rejected':
        this.statusText = 'TỪ CHỐI';
        this.statusClass = 'status-rejected';
        break;
      default:
        this.statusText = 'CHỜ KIỂM TRA';
        this.statusClass = 'status-pending';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onApprove(): void {
    this.dialogRef.close({ action: 'approve', item: this.data.item });
  }

  onReject(): void {
    this.dialogRef.close({ action: 'reject', item: this.data.item });
  }
}
