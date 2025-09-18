import { Component, EventEmitter, Output, Input, OnInit, Inject } from '@angular/core'; // <-- Đảm bảo Input và OnInit
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // <-- Đảm bảo FormControl, Validators
import { ActivatedRoute, Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-boi-day-ha',
  templateUrl: './boi-day-ha.component.html',
  styleUrls: ['./boi-day-ha.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule
  ],
  standalone: true
})
export class BoiDayHaComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Output() isValid = new EventEmitter<boolean>();

  title = 'Bối dây hạ';
  windingForm!: FormGroup;
  isPopup = false;
  mode: 'view' | 'edit' = 'edit';
  windingData: any;
  bangVeData: any;

  nguoiGiaCongOptions: string[] = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];

  boiDayHaControl = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BoiDayHaComponent>
  ) {
    this.windingForm = this.fb.group({
      boiDayHa: this.boiDayHaControl
    });
  }

  ngOnInit() {
    // Check if component is used as popup
    if (this.data) {
      this.isPopup = this.data.isPopup || false;
      this.mode = this.data.mode || 'edit';
      this.windingData = this.data.winding;
      this.bangVeData = this.data.bangVe;
      
      if (this.isPopup && this.windingData) {
        this.populateFormWithData();
      }
    }

    const navigation = this.router.getCurrentNavigation();
    let go_bangve = navigation?.extras?.state?.['drawings'];

    console.log('go_bangve:', go_bangve);
    this.windingForm = this.fb.group({
      ngayGiaCong: [null, Validators.required],
      nguoiGiaCong: ['', Validators.required],
      kyHieuBV: ['', Validators.required],
      quyCachDay: ['', Validators.required],
      soSoiDay: [null, [Validators.required, Validators.min(1)]],
      ngaySanXuat: [null, Validators.required],
      nhaSanXuat: ['', Validators.required],
      chuViKhuon: [null, [Validators.required, Validators.min(0)]],
      ktBungBdTruoc: [{ value: null, disabled: true }], // Disabled by default
      bungBdSau: [null, Validators.required],
      chieuQuanDay: ['trai', Validators.required], // Default to 'trai'
      mayQuanDay: ['', Validators.required],
      // QTD Hạ - Xung quanh
      xqDay2: [null],
      xqDay3: [null],
      xqDay4: [null],
      xqDay6: [null],
      // QTD Hạ - Hai đầu
      hdDay2: [null],
      hdDay3: [null],
      hdDay4: [null],
      hdDay6: [null],
      // Các thông số kỹ thuật bổ sung
      ktBdHaTrongBv1: [''],
      ktBdHaTrongBv2: [''],
      ktBdHaTrongBv3: [''],
      cvBdHa1p: [''],
      cvBdHa2p: [''],
      cvBdHa3p: [''],
      ktBdHaNgoaiBv1: [''],
      ktBdHaNgoaiBv2: [''],
      ktBdHaNgoaiBv3: [''],
      ktBdHaNgoaiBv4: [''],
      dienTroRa: [null],
      dienTroRb: [null],
      dienTroRc: [null],
      doLechDienTro: [null]
    });

    // Subscribe to changes in 'chuViKhuon' to enable/disable 'ktBungBdTruoc'
    this.windingForm.get('chuViKhuon')?.valueChanges.subscribe(value => {
      const ktBungBdTruocControl = this.windingForm.get('ktBungBdTruoc');
      if (value !== null && value !== '' && value !== undefined) {
        ktBungBdTruocControl?.enable();
      } else {
        ktBungBdTruocControl?.disable();
        ktBungBdTruocControl?.setValue(null); // Clear value when disabled
      }
    });
  }
  onSubmit(): void {
    if (this.windingForm.valid) {
      console.log('Form Submitted!', this.windingForm.value);
      // Here you would typically send the data to a backend service
      
      if (this.isPopup) {
        // Close dialog with success result
        this.dialogRef.close({ success: true, data: this.windingForm.value });
      } else {
        alert('Thông tin đã được lưu thành công!'); // Using alert for demo purposes
      }
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to display validation errors
      this.windingForm.markAllAsTouched();
    }
  }

  // Populate form with existing data when used as popup
  private populateFormWithData(): void {
    if (this.windingData) {
      this.windingForm.patchValue({
        ngayGiaCong: this.windingData.ngaygiacong,
        nguoiGiaCong: this.windingData.nguoigiacong,
        kyHieuBV: this.windingData.kyhieubangve,
        quyCachDay: this.windingData.quycachday,
        soSoiDay: this.windingData.sosoiday,
        ngaySanXuat: this.windingData.ngaysanxuat,
        nhaSanXuat: this.windingData.nhasanxuat,
        chieuQuanDay: this.windingData.chieuquanday,
        mayQuanDay: this.windingData.mayquanday,
        // Add other fields as needed
      });
    }

    // Set form to read-only if in view mode
    if (this.mode === 'view') {
      this.windingForm.disable();
    }
  }

  // Close dialog
  onCancel(): void {
    if (this.isPopup) {
      this.dialogRef.close({ success: false });
    }
  }
}