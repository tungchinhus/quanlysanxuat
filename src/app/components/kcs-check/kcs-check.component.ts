import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { KcsCheckService, SearchCriteria, BoiDayHaPendingResponse, BoiDayHaPendingSearchResponse, BoiDayCaoPendingResponse, BoiDayCaoPendingSearchResponse, RejectResponse, ApproveResponse } from './kcs-check.service';
import { ApproveDialogComponent, ApproveDialogData } from './approve-dialog/approve-dialog.component';
import { RejectDialogComponent, RejectDialogData } from './reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-kcs-check',
  templateUrl: './kcs-check.component.html',
  styleUrls: ['./kcs-check.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  standalone: true
})
export class KcsCheckComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Make Math available in template
  Math = Math;

  // Search variables for each tab
  searchBangVe: string = '';
  searchKeyword: string = '';
  searchBangVeCao: string = '';
  searchKeywordCao: string = '';
  searchBangVeEp: string = '';
  searchKeywordEp: string = '';

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Data sources for each tab
  boiDayHaDataSource = new MatTableDataSource<any>([]);
  boiDayCaoDataSource = new MatTableDataSource<any>([]);
  epBoiDayDataSource = new MatTableDataSource<any>([]);

  // Displayed columns for each tab
  boiDayHaDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];
  
  boiDayCaoDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];
  
  epBoiDayDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];

  // Loading states
  isLoading = false;
  currentTab = 'boiDayHa';

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private kcsService: KcsCheckService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kiểm tra quyền KCS trước khi cho phép truy cập
    if (!this.checkKcsPermission()) {
      console.error('Access denied: User is not KCS');
      this.thongbao('Bạn không có quyền truy cập trang này', 'Đóng', 'error');
      // Redirect về trang landing
      this.router.navigate(['/landing']);
      return;
    }
    
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Connect paginators to data sources
    this.boiDayHaDataSource.paginator = this.paginator;
    this.boiDayCaoDataSource.paginator = this.paginator;
    this.epBoiDayDataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.isLoading = true;
    
    switch (this.currentTab) {
      case 'boiDayHa':
        this.loadBoiDayHaData();
        break;
      case 'boiDayCao':
        this.loadBoiDayCaoData();
        break;
      case 'epBoiDay':
        this.loadEpBoiDayData();
        break;
    }
  }

  loadBoiDayHaData(): void {
    this.isLoading = true;
    
    // Use new API method for pending items
    this.kcsService.getBoiDayHaPending().subscribe({
      next: (response: BoiDayHaPendingResponse) => {
        if (response.IsSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertToLegacyFormat(response.Data);
          this.boiDayHaDataSource.data = legacyData;
          this.totalCount = response.TotalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          
          console.log(`Loaded ${legacyData.length} BoiDayHa pending items`);
        } else {
          console.error('Failed to load BoiDayHa data:', response.Message);
          this.thongbao(response.Message || 'Lỗi khi tải dữ liệu', 'Đóng', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BoiDayHa data:', error);
        this.thongbao('Lỗi khi tải dữ liệu', 'Đóng', 'error');
        this.isLoading = false;
      }
    });
  }

  searchBoiDayHaData(): void {
    this.isLoading = true;
    
    const searchCriteria: SearchCriteria = {
      SearchByDrawingName: this.searchBangVe || undefined,
      SearchByWindingSymbolOrTBKT: this.searchKeyword || undefined,
      PageNumber: this.currentPage,
      PageSize: this.pageSize
    };

    this.kcsService.searchBoiDayHaPending(searchCriteria).subscribe({
      next: (response: BoiDayHaPendingSearchResponse) => {
        if (response.IsSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertToLegacyFormat(response.Data);
          this.boiDayHaDataSource.data = legacyData;
          this.totalCount = response.TotalCount;
          this.totalPages = response.TotalPages;
          this.currentPage = response.PageNumber;
          this.pageSize = response.PageSize;
          
          console.log(`Search results: ${legacyData.length} items found`);
        } else {
          console.error('Search failed:', response.Message);
          this.thongbao(response.Message || 'Lỗi khi tìm kiếm', 'Đóng', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching BoiDayHa data:', error);
        this.thongbao('Lỗi khi tìm kiếm', 'Đóng', 'error');
        this.isLoading = false;
      }
    });
  }

  loadBoiDayCaoData(): void {
    this.isLoading = true;
    
    // Use new API method for pending items
    this.kcsService.getBoiDayCaoPending().subscribe({
      next: (response: BoiDayCaoPendingResponse) => {
        if (response.IsSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertBoiDayCaoToLegacyFormat(response.Data);
          this.boiDayCaoDataSource.data = legacyData;
          this.totalCount = response.TotalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          
          console.log(`Loaded ${legacyData.length} BoiDayCao pending items`);
        } else {
          console.error('Failed to load BoiDayCao data:', response.Message);
          this.thongbao(response.Message || 'Lỗi khi tải dữ liệu', 'Đóng', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BoiDayCao data:', error);
        this.thongbao('Lỗi khi tải dữ liệu', 'Đóng', 'error');
        this.isLoading = false;
      }
    });
  }

  loadEpBoiDayData(): void {
    this.isLoading = true;
    this.kcsService.getEpBoiDayData().subscribe({
      next: (data) => {
        this.epBoiDayDataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading EpBoiDay data:', error);
        this.thongbao('Lỗi khi tải dữ liệu', 'Đóng', 'error');
      }
    });
  }

  // Search methods for Bối dây hạ
  onSearchBangVeChange(value: string): void {
    this.searchBangVe = value;
    this.currentPage = 1; // Reset to first page
    this.searchBoiDayHaData();
  }

  onSearchChange(value: string): void {
    this.searchKeyword = value;
    this.currentPage = 1; // Reset to first page
    this.searchBoiDayHaData();
  }

  // Search methods for Bối dây cao
  onSearchBangVeCaoChange(value: string): void {
    this.searchBangVeCao = value;
    this.filterBoiDayCaoData();
  }

  onSearchCaoChange(value: string): void {
    this.searchKeywordCao = value;
    this.filterBoiDayCaoData();
  }

  // Search methods for Ép bối dây
  onSearchBangVeEpChange(value: string): void {
    this.searchBangVeEp = value;
    this.filterEpBoiDayData();
  }

  onSearchEpChange(value: string): void {
    this.searchKeywordEp = value;
    this.filterEpBoiDayData();
  }

  // Filter methods for each tab
  filterBoiDayHaData(): void {
    // For BoiDayHa, use the new search API
    this.searchBoiDayHaData();
  }

  filterBoiDayCaoData(): void {
    // For BoiDayCao, use the new search API
    this.searchBoiDayCaoData();
  }

  searchBoiDayCaoData(): void {
    this.isLoading = true;
    
    const searchCriteria: SearchCriteria = {
      SearchByDrawingName: this.searchBangVeCao || undefined,
      SearchByWindingSymbolOrTBKT: this.searchKeywordCao || undefined,
      PageNumber: this.currentPage,
      PageSize: this.pageSize
    };

    this.kcsService.searchBoiDayCaoPending(searchCriteria).subscribe({
      next: (response: BoiDayCaoPendingSearchResponse) => {
        if (response.IsSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertBoiDayCaoToLegacyFormat(response.Data);
          this.boiDayCaoDataSource.data = legacyData;
          this.totalCount = response.TotalCount;
          this.totalPages = response.TotalPages;
          this.currentPage = response.PageNumber;
          this.pageSize = response.PageSize;
          
          console.log(`Search results: ${legacyData.length} items found`);
        } else {
          console.error('Search failed:', response.Message);
          this.thongbao(response.Message || 'Lỗi khi tìm kiếm', 'Đóng', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching BoiDayCao data:', error);
        this.thongbao('Lỗi khi tìm kiếm', 'Đóng', 'error');
        this.isLoading = false;
      }
    });
  }

  filterEpBoiDayData(): void {
    let filteredData = this.epBoiDayDataSource.data;

    if (this.searchBangVeEp) {
      filteredData = filteredData.filter(item => 
        item.tenbangve?.toLowerCase().includes(this.searchBangVeEp.toLowerCase())
      );
    }

    if (this.searchKeywordEp) {
      filteredData = filteredData.filter(item => 
        item.kyhieuquanday?.toLowerCase().includes(this.searchKeywordEp.toLowerCase()) ||
        item.tbkt?.toLowerCase().includes(this.searchKeywordEp.toLowerCase())
      );
    }

    this.epBoiDayDataSource.data = filteredData;
  }

  onTabChange(event: MatTabChangeEvent): void {
    console.log('Tab changed to:', event.tab.textLabel);
    this.currentTab = this.getTabKey(event.tab.textLabel);
    // Reset search when changing tabs
    this.resetSearch();
    this.loadData();
  }

  getTabKey(tabLabel: string): string {
    switch (tabLabel) {
      case 'Bối dây hạ':
        return 'boiDayHa';
      case 'Bối dây cao':
        return 'boiDayCao';
      case 'Ép bối dây':
        return 'epBoiDay';
      default:
        return 'boiDayHa';
    }
  }

  resetSearch(): void {
    this.searchBangVe = '';
    this.searchKeyword = '';
    this.searchBangVeCao = '';
    this.searchKeywordCao = '';
    this.searchBangVeEp = '';
    this.searchKeywordEp = '';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  // Pagination handler
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    
    if (this.currentTab === 'boiDayHa') {
      this.searchBoiDayHaData();
    } else if (this.currentTab === 'boiDayCao') {
      this.searchBoiDayCaoData();
    }
  }

  // Action methods
  viewBangVeDetails(element: any): void {
    console.log('Viewing details for:', element);
    this.thongbao(`Xem chi tiết bảng vẽ: ${element.kyhieuquanday}`, 'Đóng', 'info');
  }

  approveKcs(element: any): void {
    console.log('Opening approve dialog for:', element);
    
    const dialogData: ApproveDialogData = {
      itemId: Number(element.id),
      itemName: element.kyhieuquanday,
      itemType: this.currentTab
      // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
    };

    const dialogRef = this.dialog.open(ApproveDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.IsSuccess) {
        this.thongbao(result.Message, 'Đóng', 'success');
        // Refresh data after approval
        this.loadData();
      } else if (result && !result.IsSuccess) {
        this.thongbao(result.Message || 'Có lỗi xảy ra', 'Đóng', 'error');
      }
    });
  }

  rejectKcs(element: any): void {
    console.log('Opening reject dialog for:', element);
    
    const dialogData: RejectDialogData = {
      itemId: Number(element.id),
      itemName: element.kyhieuquanday,
      itemType: this.currentTab
      // Không cần thêm thông tin phức tạp nữa, sử dụng endpoint đơn giản
    };

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '700px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.IsSuccess) {
        this.thongbao(result.Message, 'Đóng', 'success');
        // Refresh data after rejection
        this.loadData();
      } else if (result && !result.IsSuccess) {
        this.thongbao(result.Message || 'Có lỗi xảy ra', 'Đóng', 'error');
      }
    });
  }

  // Status helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending':
      default:
        return 'Chờ kiểm tra';
    }
  }

  /**
   * Kiểm tra xem user có quyền KCS không
   */
  private checkKcsPermission(): boolean {
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const khauSx = localStorage.getItem('khau_sx')?.toLowerCase() || '';
    const email = localStorage.getItem('email')?.toLowerCase() || '';

    console.log('KcsCheckComponent checking KCS permissions:', { role, khauSx, email });

    // Kiểm tra role
    if (role.includes('kcs')) {
      return true;
    }

    // Kiểm tra khau_sx
    if (khauSx.includes('kcs')) {
      return true;
    }

    // Kiểm tra email
    if (email.includes('kcs')) {
      return true;
    }

    return false;
  }

  /**
   * Hàm thông báo chung với styling tùy chỉnh
   */
  private thongbao(text: string, action: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top'; // Đặt vị trí dọc là "trên cùng"
    config.horizontalPosition = 'right'; // Đặt vị trí ngang là "bên phải"
    config.duration = 3000; // Tùy chọn: Thời gian hiển thị (ví dụ 3 giây)
    config.panelClass = ['snackbar-custom', `snackbar-${type}`];
    this.snackBar.open(text, action, config);
  }
}
