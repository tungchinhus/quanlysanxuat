import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonService } from '../../services/common.service';
import { AuthService } from '../../services/auth.service';
import { FirebaseKcsApproveService } from '../../services/firebase-kcs-approve.service';
import { FirebaseBdCaoService } from '../../services/firebase-bd-cao.service';
import { KcsApproveCreateData } from '../../models/kcs-approve.model';
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
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatToolbarModule
  ],
  standalone: true
})
export class KcsCheckComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Make Math available in template
  Math = Math;


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

  // Selected item (from query params)
  selectedItemId: number | null = null;
  selectedType: 'ha' | 'cao' | 'ep' | null = null;

  constructor(
    private commonService: CommonService,
    private authService: AuthService,
    private firebaseKcsApproveService: FirebaseKcsApproveService,
    private firebaseBdCaoService: FirebaseBdCaoService,
    private kcsService: KcsCheckService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
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
    
    // Debug: Check Firebase data first
    this.debugFirebaseData();
    
    // Check for query parameters to determine which tab to show and selected id
    this.route.queryParams.subscribe(params => {
      const typeParam = (params['type'] || '').toString();
      const idParam = params['id'];

      if (typeParam) {
        this.selectedType = (typeParam === 'ha' || typeParam === 'cao' || typeParam === 'ep') ? typeParam : 'ha';
        this.currentTab = this.selectedType === 'ha' ? 'boiDayHa' :
                          this.selectedType === 'cao' ? 'boiDayCao' :
                          'epBoiDay';
      }

      if (idParam !== undefined && idParam !== null) {
        const parsed = Number(idParam);
        this.selectedItemId = isNaN(parsed) ? null : parsed;
      }
    });
    
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
          let legacyData = this.kcsService.convertToLegacyFormat(response.Data);
          // If a specific id is requested for this tab, filter to only that item
          if (this.selectedItemId && this.currentTab === 'boiDayHa') {
            legacyData = legacyData.filter(item => Number(item.id) === this.selectedItemId);
          }
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
      SearchByDrawingName: undefined,
      SearchByWindingSymbolOrTBKT: undefined,
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
    console.log('Loading BoiDayCao data from Firebase...');
    
    // Use Firebase service to get data directly from tbl_bd_cao
    this.firebaseBdCaoService.getAllBdCao().then((bdCaoData) => {
      console.log('Firebase BoiDayCao raw data:', bdCaoData);
      console.log('Total bd_cao records found:', bdCaoData.length);
      
      // Convert to legacy format for display
      const legacyData = bdCaoData.map(item => {
        const mappedItem = {
          id: parseInt(item.id || '0'),
          kyhieuquanday: item.masothe_bd_cao || 'N/A',
          congsuat: item.kyhieubangve || 'N/A',
          tbkt: item.quycachday || 'N/A',
          dienap: item.sosoiday?.toString() || 'N/A',
          quy_cach_day: item.quycachday || 'N/A',
          so_soi_day: item.sosoiday || 0,
          nha_san_xuat: item.nhasanxuat || 'N/A',
          ngay_san_xuat: item.ngaysanxuat || new Date(),
          trang_thai: this.mapTrangThaiFromNumber(item.trang_thai),
          nguoigiacong: item.nguoigiacong || 'N/A',
          ngaygiacong: item.ngaygiacong || new Date()
        };
        console.log('Mapped item:', mappedItem, 'Original trang_thai:', item.trang_thai);
        return mappedItem;
      });
      
      console.log('All legacy data:', legacyData);
      
      // For KCS Check, we want to show items that are ready for inspection
      // This means items with trang_thai = 1 (processed/completed) that need KCS approval
      const readyForInspection = legacyData.filter(item => {
        const isReady = item.trang_thai === 'approved' || item.trang_thai === 'pending';
        console.log(`Item ${item.id} trang_thai: ${item.trang_thai}, isReady: ${isReady}`);
        return isReady;
      });
      
      console.log('Items ready for inspection:', readyForInspection);
      
      // If a specific id is requested for this tab, filter to only that item
      if (this.selectedItemId && this.currentTab === 'boiDayCao') {
        const filteredData = readyForInspection.filter(item => Number(item.id) === this.selectedItemId);
        this.boiDayCaoDataSource.data = filteredData;
        this.totalCount = filteredData.length;
      } else {
        this.boiDayCaoDataSource.data = readyForInspection;
        this.totalCount = readyForInspection.length;
      }
      
      this.totalPages = Math.ceil(this.totalCount / this.pageSize);
      
      console.log(`Loaded ${this.boiDayCaoDataSource.data.length} BoiDayCao items ready for inspection from Firebase`);
      this.isLoading = false;
    }).catch((error) => {
      console.error('Error loading BoiDayCao data from Firebase:', error);
      this.thongbao('Lỗi khi tải dữ liệu từ Firebase: ' + error.message, 'Đóng', 'error');
      this.isLoading = false;
    });
  }

  loadEpBoiDayData(): void {
    this.isLoading = true;
    console.log('Loading EpBoiDay data...');
    this.kcsService.getEpBoiDayData().subscribe({
      next: (data) => {
        console.log('EpBoiDay data loaded:', data);
        let result = data;
        if (this.selectedItemId && this.currentTab === 'epBoiDay') {
          result = (data || []).filter((item: any) => Number(item.id) === this.selectedItemId);
        }
        this.epBoiDayDataSource.data = result;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading EpBoiDay data:', error);
        this.thongbao('Lỗi khi tải dữ liệu', 'Đóng', 'error');
        this.isLoading = false;
      }
    });
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
      SearchByDrawingName: undefined,
      SearchByWindingSymbolOrTBKT: undefined,
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
    // Show all data without filtering
    this.epBoiDayDataSource.data = this.epBoiDayDataSource.data;
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
    this.thongbao(`Xem chi tiết: ${element.kyhieuquanday}`, 'Đóng', 'info');
  }

  approveKcs(element: any): void {
    console.log('Opening approve dialog for:', element);
    
    const dialogData: ApproveDialogData = {
      itemId: Number(element.id),
      itemName: element.kyhieuquanday,
      itemType: this.currentTab
    };

    const dialogRef = this.dialog.open(ApproveDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.IsSuccess) {
        // Save approval data to Firebase
        this.saveApprovalToFirebase(element, result.data);
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
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.log('No current user found in localStorage');
        return false;
      }

      const currentUser = JSON.parse(currentUserStr);
      console.log('KcsCheckComponent checking KCS permissions for user:', currentUser);

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
      return false;
    } catch (error) {
      console.error('Error checking KCS permissions:', error);
      return false;
    }
  }

  /**
   * Save approval data to Firebase
   */
  private saveApprovalToFirebase(element: any, approvalData: any): void {
    try {
      const currentUser = this.authService.getCurrentUser();
      const userEmail = currentUser?.email || currentUser?.username || 'unknown';
      
      const kcsApproveData: KcsApproveCreateData = {
        kyhieubangve: element.kyhieuquanday || element.tenbangve || 'N/A',
        id_boiday: element.id?.toString() || 'N/A',
        masothe_bd: element.masothe_bd || element.id?.toString() || 'N/A',
        user_kcs_approve: userEmail,
        kcs_approve_status: 'approved',
        ghi_chu: approvalData?.notes || 'Đạt tiêu chuẩn chất lượng KCS',
        ngay_approve: new Date()
      };

      console.log('Saving KCS approval to Firebase:', kcsApproveData);

      this.firebaseKcsApproveService.createKcsApprove(kcsApproveData)
        .then(docId => {
          console.log('KCS approval saved successfully with ID:', docId);
          this.thongbao('Dữ liệu KCS đã được lưu vào Firebase', 'Đóng', 'success');
        })
        .catch(error => {
          console.error('Error saving KCS approval to Firebase:', error);
          this.thongbao('Lỗi khi lưu dữ liệu KCS vào Firebase', 'Đóng', 'error');
        });
    } catch (error) {
      console.error('Error preparing KCS approval data:', error);
      this.thongbao('Lỗi khi chuẩn bị dữ liệu KCS', 'Đóng', 'error');
    }
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

  private mapTrangThaiFromNumber(trangThai: number): 'pending' | 'approved' | 'rejected' {
    switch (trangThai) {
      case 0: return 'pending';
      case 1: return 'approved';
      case 2: return 'rejected';
      default: return 'pending';
    }
  }

  private async debugFirebaseData(): Promise<void> {
    try {
      console.log('=== DEBUG: Checking Firebase data ===');
      
      // Check tbl_bd_cao collection
      const bdCaoData = await this.firebaseBdCaoService.getAllBdCao();
      console.log('tbl_bd_cao collection:', bdCaoData);
      console.log('tbl_bd_cao count:', bdCaoData.length);
      
      if (bdCaoData.length === 0) {
        console.log('⚠️ tbl_bd_cao collection is empty');
        this.thongbao('Không có dữ liệu bối dây cao trong Firebase. Vui lòng tạo dữ liệu mẫu.', 'Đóng', 'warning');
        // Create sample data
        await this.createSampleBdCaoData();
      } else {
        console.log('✅ Found data in tbl_bd_cao:', bdCaoData);
      }
      
    } catch (error) {
      console.error('❌ Error debugging Firebase data:', error);
      this.thongbao('Lỗi khi kiểm tra dữ liệu Firebase: ' + (error instanceof Error ? error.message : String(error)), 'Đóng', 'error');
    }
  }

  private async createSampleBdCaoData(): Promise<void> {
    try {
      console.log('Creating sample bd_cao data...');
      
      const sampleData = {
        masothe_bd_cao: '1000-39N-25086T-437',
        kyhieubangve: '1000-39N-25086T',
        ngaygiacong: new Date(),
        nguoigiacong: 'quandaycao1@thibidi.com',
        quycachday: '2.5mm²',
        sosoiday: 1,
        ngaysanxuat: new Date('2025-01-19'),
        nhasanxuat: 'nha_sx1',
        chieuquanday: true,
        mayquanday: '2',
        xungquanh: 2,
        haidau: 2,
        trang_thai: 1, // Processed, ready for KCS check
        user_update: 'system',
        created_at: new Date(),
        khau_sx: 'bd_cao'
      };

      const docId = await this.firebaseBdCaoService.createBdCao(sampleData);
      console.log('✅ Created sample bd_cao with ID:', docId);
      this.thongbao('Đã tạo dữ liệu mẫu bối dây cao', 'Đóng', 'success');
      
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
      this.thongbao('Lỗi khi tạo dữ liệu mẫu: ' + (error instanceof Error ? error.message : String(error)), 'Đóng', 'error');
    }
  }
}
