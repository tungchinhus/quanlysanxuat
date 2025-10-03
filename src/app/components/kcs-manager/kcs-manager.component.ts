import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FirebaseKcsManagerService, ProcessedDrawingData, ProcessedDrawingSearchCriteria, ProcessedDrawingResponse } from '../../services/firebase-kcs-manager.service';

@Component({
  selector: 'app-kcs-manager',
  templateUrl: './kcs-manager.component.html',
  styleUrls: ['./kcs-manager.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatTabsModule,
    MatChipsModule,
    MatSelectModule,
    DatePipe
  ],
  standalone: true
})
export class KcsManagerComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'kyhieuBangVe',
    'congSuat',
    'tbkt',
    'ngaySanXuat',
    'ngayGiaCong',
    'trangThai',
    'loaiBoiDay',
    'actions'
  ];

  // Expose Math to template
  Math = Math;

  dataSource = new MatTableDataSource<ProcessedDrawingData>([]);
  isLoading = false;
  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;
  
  // Status filtering
  selectedStatus: 'all' | 'pending' | 'approved' | 'rejected' = 'pending';
  statusOptions = [
    { value: 'all', label: 'Tất cả', icon: 'list' },
    { value: 'pending', label: 'Chờ kiểm duyệt', icon: 'schedule' },
    { value: 'approved', label: 'Đã duyệt', icon: 'check_circle' },
    { value: 'rejected', label: 'Từ chối', icon: 'cancel' }
  ];


  private searchSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private firebaseKcsManagerService: FirebaseKcsManagerService
  ) {
    // Setup search with debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadData();
    });
  }

  ngOnInit(): void {
    this.checkKcsPermission();
    
    // Debug database data first
    this.debugDatabaseData();
    
    // Test Firebase and create sample data if needed
    this.createSampleDataIfNeeded();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  private checkKcsPermission(): boolean {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.log('No current user found in localStorage');
        this.router.navigate(['/dang-nhap']);
        return false;
      }

      const currentUser = JSON.parse(currentUserStr);
      console.log('KcsManagerComponent checking KCS permissions for user:', currentUser);

      // Kiểm tra roles array
      if (currentUser.roles && Array.isArray(currentUser.roles)) {
        const hasKcsRole = currentUser.roles.some((role: any) =>
          typeof role === 'string' ? role.toLowerCase().includes('kcs') :
          (role.name || role.role_name || '').toLowerCase().includes('kcs')
        );
        if (hasKcsRole) {
          console.log('User has KCS role');
          return true;
        }
      }

      // Kiểm tra email
      if (currentUser.email && currentUser.email.toLowerCase().includes('kcs')) {
        console.log('User email contains KCS');
        return true;
      }

      // Kiểm tra khau_sx nếu có
      if (currentUser.khau_sx && currentUser.khau_sx.toLowerCase().includes('kcs')) {
        console.log('User khau_sx contains KCS');
        return true;
      }

      console.log('User does not have KCS permissions');
      this.router.navigate(['/dang-nhap']);
      return false;
    } catch (error) {
      console.error('Error checking KCS permissions:', error);
      this.router.navigate(['/dang-nhap']);
      return false;
    }
  }

  loadData(): void {
    this.isLoading = true;
    
    const searchCriteria: ProcessedDrawingSearchCriteria = {
      searchTerm: this.searchTerm.trim() || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      trang_thai: this.selectedStatus === 'all' ? undefined : this.selectedStatus
    };

    console.log('Loading processed drawings with criteria:', searchCriteria);

    this.firebaseKcsManagerService.getRealProcessedDrawings(searchCriteria).subscribe({
      next: (response: ProcessedDrawingResponse) => {
        console.log('✅ Firebase response:', response);
        
        this.dataSource.data = response.data;
        this.totalCount = response.totalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.isLoading = false;


        console.log(`✅ Loaded ${response.data.length} processed drawings from Firebase`);
        
        if (response.data.length === 0) {
          console.log('⚠️ No data found, this might be normal if no processed drawings exist');
          this.thongbao('Không có dữ liệu bảng vẽ đã xử lý', 'Đóng', 'info');
        }
      },
      error: (error) => {
        console.error('❌ Error loading processed drawings from Firebase:', error);
        this.thongbao('Lỗi khi tải dữ liệu từ Firebase: ' + (error.message || 'Unknown error'), 'Đóng', 'error');
        this.isLoading = false;
        
        // Show more detailed error info
        if (error.code) {
          console.error('Firebase error code:', error.code);
        }
        if (error.details) {
          console.error('Firebase error details:', error.details);
        }
      }
    });
  }

  onSearchChange(event: any): void {
    const searchTerm = event.target.value;
    this.searchSubject.next(searchTerm);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onStatusChange(status: 'all' | 'pending' | 'approved' | 'rejected'): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadData();
  }


  onApproveKcs(element: ProcessedDrawingData): void {
    console.log('Approving KCS for element:', element);
    
    // Navigate to kcs-check component with the specific data
    this.router.navigate(['/kcs-check'], {
      queryParams: {
        type: element.loai_boi_day,
        id: element.id,
        kyhieuquanday: element.kyhieuquanday
      }
    });
  }

  onViewDetails(element: ProcessedDrawingData): void {
    console.log('Viewing details for element:', element);
    this.thongbao(`Xem chi tiết: ${element.kyhieuquanday}`, 'Đóng', 'info');
  }

  onDownload(element: ProcessedDrawingData): void {
    console.log('Downloading element:', element);
    this.thongbao(`Tải xuống: ${element.kyhieuquanday}`, 'Đóng', 'info');
  }

  private thongbao(message: string, action: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'CHỜ KIỂM TRA';
      case 'approved':
        return 'ĐÃ DUYỆT';
      case 'rejected':
        return 'TỪ CHỐI';
      default:
        return 'KHÔNG XÁC ĐỊNH';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-unknown';
    }
  }

  getLoaiBoiDayText(loai: string): string {
    switch (loai) {
      case 'ha':
        return 'Bối dây hạ';
      case 'cao':
        return 'Bối dây cao';
      case 'ep':
        return 'Ép bối dây';
      case 'both':
        return 'Cả hai loại';
      default:
        return 'Không xác định';
    }
  }

  getLoaiBoiDayClass(loai: string): string {
    switch (loai) {
      case 'ha':
        return 'chip-ha';
      case 'cao':
        return 'chip-cao';
      case 'ep':
        return 'chip-ep';
      case 'both':
        return 'chip-both';
      default:
        return 'chip-unknown';
    }
  }

  /**
   * Kiểm tra xem có thể hiển thị option "Kiểm duyệt KCS" không
   * Chỉ hiển thị khi cả hai loại bối dây (ha và cao) đã được xử lý
   */
  canShowKcsApproval(element: ProcessedDrawingData): boolean {
    // Chỉ hiển thị khi loai_boi_day = 'both' (cả hai loại đã được xử lý)
    return element.loai_boi_day === 'both';
  }

  private debugDatabaseData(): void {
    this.firebaseKcsManagerService.debugDatabaseData().then(() => {
      console.log('Debug completed');
    }).catch(error => {
      console.error('Error during debug:', error);
    });
  }

  private createSampleDataIfNeeded(): void {
    // Test Firebase connection and create sample data if needed
    this.firebaseKcsManagerService.testAndCreateSampleData().then(() => {
      console.log('✅ Firebase test and sample data creation completed');
      // Reload data after creating sample data
      this.loadData();
    }).catch(error => {
      console.error('❌ Error testing Firebase or creating sample data:', error);
      this.thongbao('Lỗi kết nối Firebase hoặc tạo dữ liệu mẫu: ' + (error.message || 'Unknown error'), 'Đóng', 'error');
      
      // Try to load data anyway in case there's existing data
      this.loadData();
    });
  }

  // Method to manually test Firebase connection
  testFirebaseConnection(): void {
    console.log('🧪 Testing Firebase connection manually...');
    this.firebaseKcsManagerService.testAndCreateSampleData().then(() => {
      this.thongbao('Firebase kết nối thành công!', 'Đóng', 'success');
      this.loadData();
    }).catch(error => {
      console.error('❌ Firebase connection test failed:', error);
      this.thongbao('Firebase kết nối thất bại: ' + (error.message || 'Unknown error'), 'Đóng', 'error');
    });
  }
}
