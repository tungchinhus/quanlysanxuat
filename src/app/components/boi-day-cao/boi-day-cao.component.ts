import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BangVeData } from '../ds-bangve/ds-bangve.component';
import { CommonService } from '../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

interface Worker {
  id: number;
  name: string;
  username?: string;
  email?: string;
  role?: string;
  code?: string;
  department?: string;
}

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  users: Worker[];
  totalCount: number;
  roleName: string;
}

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
    MatCardModule,
    MatRadioModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    MatNativeDateModule
  ],
  standalone: true
})
export class BoiDayCaoComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Input() windingData?: any;
  @Input() bangVeData?: any;
  @Input() mode: 'view' | 'edit' = 'edit';
  @Output() isValid = new EventEmitter<boolean>();

  title = 'Bối dây cao';
  windingForm!: FormGroup;
  bangve: BangVeData[] = [];

  nguoiGiaCongOptions: Worker[] = [];
  isLoadingWorkers: boolean = false;

  boiDayHaControl = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    this.windingForm = this.fb.group({
      boiDayCao: this.boiDayHaControl
    });
    const navigation = this.router.getCurrentNavigation();
    // Lấy data drawing từ navigation state
    const drawing = navigation?.extras?.state?.['drawing'];
    if (drawing) {
      this.bangve = [drawing]; // Convert single drawing to array
    }
    console.log('Bảng vẽ:', this.bangve);
  }

  ngOnInit() {
    console.log('Form:', this.windingForm);
    console.log('Winding Data:', this.windingData);
    console.log('Bang Ve Data:', this.bangVeData);
    console.log('Mode:', this.mode);
    
    // Lấy thông tin user đang đăng nhập
    const currentUser = this.getCurrentUser();
    const today = new Date();
    
    console.log('Current User:', currentUser);
    console.log('Today Date:', today);
    
    // Load danh sách người gia công từ API
    this.loadWorkers();
    
    // Sử dụng data từ input nếu có, nếu không thì dùng data từ navigation
    const bangVeData = this.bangVeData || this.bangve[0];
    const isViewMode = this.mode === 'view';
    
    this.windingForm = this.fb.group({
      congSuat: [{ value: bangVeData?.congsuat, disabled: true }],
      TBKT: [{ value: bangVeData?.tbkt, disabled: true }],
      dienAp: [{ value: bangVeData?.dienap, disabled: true }],
      soBoiDay: [{ value: bangVeData?.soboiday, disabled: true }],

      ngayGiaCong: [{ value: today.toLocaleDateString('vi-VN'), disabled: true }],
      nguoiGiaCong: [{ value: currentUser.name, disabled: true }],
      kyHieuBV: [{ value: bangVeData?.kyhieubangve + '-065', disabled: true }],
      quyCachDay: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      soSoiDay: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required, Validators.min(1)]],
      ngaySanXuat: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      nhaSanXuat: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      chuViKhuon: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required, Validators.min(0)]],
      ktBungBdTruoc: [{ value: null, disabled: isViewMode }],
      bungBdSau: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      chieuQuanDay: [{ value: 'trai', disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      mayQuanDay: [{ value: null, disabled: isViewMode }, isViewMode ? [] : [Validators.required]],
      // QTD Hạ - Xung quanh
      xqDay2: [{ value: null, disabled: isViewMode }],
      xqDay3: [{ value: null, disabled: isViewMode }],
      xqDay4: [{ value: null, disabled: isViewMode }],
      xqDay6: [{ value: null, disabled: isViewMode }],
      // QTD Hạ - Hai đầu
      hdDay2: [{ value: null, disabled: isViewMode }],
      hdDay3: [{ value: null, disabled: isViewMode }],
      hdDay4: [{ value: null, disabled: isViewMode }],
      hdDay6: [{ value: null, disabled: isViewMode }],
      // Các thông số kỹ thuật bổ sung
      ktBdHaTrongBv1: [{ value: '', disabled: isViewMode }],
      ktBdHaTrongBv2: [{ value: '', disabled: isViewMode }],
      ktBdHaTrongBv3: [{ value: '', disabled: isViewMode }],
      cvBdHa1p: [{ value: '', disabled: isViewMode }],
      cvBdHa2p: [{ value: '', disabled: isViewMode }],
      cvBdHa3p: [{ value: '', disabled: isViewMode }],
      ktBdHaNgoaiBv1: [{ value: '', disabled: isViewMode }],
      ktBdHaNgoaiBv2: [{ value: '', disabled: isViewMode }],
      ktBdHaNgoaiBv3: [{ value: '', disabled: isViewMode }],
      ktBdHaNgoaiBv4: [{ value: '', disabled: isViewMode }],
      dienTroRa: [{ value: null, disabled: isViewMode }],
      dienTroRb: [{ value: null, disabled: isViewMode }],
      dienTroRc: [{ value: null, disabled: isViewMode }],
      doLechDienTro: [{ value: null, disabled: isViewMode }]
    });
    
    // Debug: Kiểm tra giá trị sau khi set
    console.log('Form after setup - ngayGiaCong:', this.windingForm.get('ngayGiaCong')?.value);
    console.log('Form after setup - nguoiGiaCong:', this.windingForm.get('nguoiGiaCong')?.value);
    console.log('Form after setup - soBoiDay:', this.windingForm.get('soBoiDay')?.value);
    console.log('Bangve data:', this.bangve);
    console.log('Bangve[0]?.soboiday:', this.bangve[0]?.soboiday);
    
    this.windingForm.get('chuViKhuon')?.valueChanges.subscribe(value => {
      const ktBungBdTruocControl = this.windingForm.get('ktBungBdTruoc');
      if (value !== null && value !== '' && value !== undefined) {
        ktBungBdTruocControl?.disable();
      } else {
        ktBungBdTruocControl?.disable();
        ktBungBdTruocControl?.setValue(null);
      }
    });

    // Emit form validity changes
    this.windingForm.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Emit initial validity
    this.isValid.emit(this.windingForm.valid);
  }

  loadWorkers(): void {
    this.isLoadingWorkers = true;
    
    // Debug: Kiểm tra token
    const token = localStorage.getItem('accessToken');
    console.log('Access Token:', token ? 'Present' : 'Missing');
    
    // Gọi API để lấy danh sách người gia công
    this.getWorkers().subscribe({
      next: (workers) => {
        this.nguoiGiaCongOptions = workers;
        this.isLoadingWorkers = false;
        console.log('Danh sách người gia công:', workers);
        
        // Debug: Kiểm tra cấu trúc dữ liệu của từng worker
        workers.forEach((worker, index) => {
          console.log(`Worker ${index}:`, {
            id: worker.id,
            name: worker.name,
            username: worker.username,
            email: worker.email,
            displayName: this.getWorkerDisplayName(worker)
          });
        });
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách người gia công:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        this.isLoadingWorkers = false;
        // Fallback to default list if API fails
        this.nguoiGiaCongOptions = [
          { id: 1, name: 'Nguyễn Văn A' },
          { id: 2, name: 'Trần Thị B' },
          { id: 3, name: 'Lê Văn C' }
        ];
      }
    });
  }

  getWorkers(): Observable<Worker[]> {
    // Thay đổi URL API theo endpoint thực tế của bạn
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Account/users-by-role?roleName=User`;
    
    // Thêm headers authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    };
    
    return this.http.get<ApiResponse>(apiUrl, { headers }).pipe(
      map(response => {
        console.log('API response for workers:', response);
        
        const workers = response.users || [];
        workers.forEach(worker => {
          // Đảm bảo field name không bị undefined
          if (!worker.name || worker.name.trim() === '') {
            // Nếu không có name, sử dụng username hoặc email làm name
            if (worker.username && worker.username.trim() !== '') {
              worker.name = worker.username;
            } else if (worker.email && worker.email.trim() !== '') {
              worker.name = worker.email;
            } else {
              worker.name = `User ${worker.id}`;
            }
          }
        });
        
        return workers;
      })
    );
  }

  // Helper method để hiển thị tên người gia công trong select
  getWorkerDisplayName(worker: Worker | null | undefined): string {
    if (!worker) {
      return 'Chưa chọn người gia công';
    }
    
    let displayName = '';
    
    // Ưu tiên hiển thị name, sau đó username, email, cuối cùng là User ID
    if (worker.name && worker.name.trim() !== '') {
      displayName = worker.name;
    } else if (worker.username && worker.username.trim() !== '') {
      displayName = worker.username;
    } else if (worker.email && worker.email.trim() !== '') {
      displayName = worker.email;
    } else {
      displayName = `User ID: ${worker.id}`;
    }
    
    // Thêm thông tin role nếu có
    if (worker.role && worker.role.trim() !== '') {
      displayName += ` (${worker.role})`;
    }
    
    return displayName;
  }

  getCurrentUser(): Worker {
    // Lấy thông tin user đang đăng nhập từ localStorage
    const username = localStorage.getItem('rememberedUsername') || '';
    const userId = localStorage.getItem('userID') || '0';
    
    return {
      id: parseInt(userId),
      name: username,
      username: username,
      email: localStorage.getItem('email') || '',
      role: localStorage.getItem('userRole') || 'User'
    };
  }
  onSubmit(): void {
    if (this.windingForm.valid) {
      console.log('Form Submitted!', this.windingForm.value);
      // Here you would typically send the data to a backend service
      alert('Thông tin đã được lưu thành công!'); // Using alert for demo purposes
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to display validation errors
      this.windingForm.markAllAsTouched();
    }
  }

  giacongboidaycao(){
    this.isActive = false;
    this.isValid.emit(true);
    this.commonService.thongbao('Giao công bối dây cao thành công!', 'Đóng', 'success');
    this.router.navigate(['ds-bang-ve']);
  }
}