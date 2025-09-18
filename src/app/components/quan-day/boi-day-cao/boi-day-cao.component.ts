import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Inject } from '@angular/core';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-boi-day-cao',
  templateUrl: './boi-day-cao.component.html',
  styleUrls: ['./boi-day-cao.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  standalone: true
})
export class BoiDayCaoComponent implements OnInit {
  @Input() isActive: boolean = false; // <-- PHẢI CÓ @Input() này
  @Output() isValid = new EventEmitter<boolean>();

  isPopup = false;
  mode: 'view' | 'edit' = 'edit';
  windingData: any;
  bangVeData: any;

  boiDayCaoControl = new FormControl('', [Validators.required]); // <-- PHẢI CÓ FormControl này

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BoiDayCaoComponent>
  ) {}

  ngOnInit() {
    // Check if component is used as popup
    if (this.data) {
      this.isPopup = this.data.isPopup || false;
      this.mode = this.data.mode || 'edit';
      this.windingData = this.data.winding;
      this.bangVeData = this.data.bangVe;
    }
    this.boiDayCaoControl.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Phát sự kiện isValid ban đầu
    this.isValid.emit(this.boiDayCaoControl.valid);
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  selectedIndex: number = 0;
  tabValidity: boolean[] = [false, false, false];

  onTabValidityChange(index: number, isValid: boolean) {
    this.tabValidity[index] = isValid;
  }

  onTabChange(event: any) {
    const newIndex = event.index;
    const previousIndex = this.selectedIndex;

    if (newIndex > previousIndex && !this.tabValidity[previousIndex]) {
      this.tabGroup.selectedIndex = previousIndex;
    } else {
      this.selectedIndex = newIndex;
    }
  }

  goToNextTab() {
    if (this.selectedIndex < this.tabValidity.length - 1 && this.tabValidity[this.selectedIndex]) {
      this.selectedIndex++;
    } else {
      console.log('Cannot go to next tab: either last tab or current tab invalid.');
    }
  }

  goToPreviousTab() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      console.log('Cannot go to previous tab: already on first tab.')
    }
  }

  canComplete(): boolean {
    return this.tabValidity.every(isValid => isValid);
  }

  onComplete() {
    if (this.canComplete()) {
      if (this.isPopup) {
        // Close dialog with success result
        this.dialogRef.close({ success: true, data: this.tabValidity });
      } else {
        alert('Tất cả dữ liệu đã được nhập đầy đủ! Đã hoàn thành.');
        console.log('Form completed:', this.tabValidity);
      }
    } else {
      alert('Vui lòng nhập đầy đủ dữ liệu ở tất cả các tab trước khi hoàn thành!');
    }
  }

  // Close dialog
  onCancel(): void {
    if (this.isPopup) {
      this.dialogRef.close({ success: false });
    }
  }
}
