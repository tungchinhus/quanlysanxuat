import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DialogComponent } from '../shared/dialogs/dialog/dialog.component';
import { BangVeComponent } from '../bang-ve/bang-ve.component';
import { GiaCongPopupComponent } from './gia-cong-popup/gia-cong-popup.component';
import { StatusDetailPopupComponent } from './status-detail-popup/status-detail-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { STATUS } from '../../models/common.enum';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

export interface BangVeData {
  id: number | string;
  kyhieubangve: string;
  congsuat: number;
  tbkt: string;
  dienap: string;
  soboiday: string;
  bd_ha_trong: string;
  bd_ha_ngoai: string;
  bd_cao: string;
  bd_ep: string;
  bung_bd: number;
  user_create: string;
  trang_thai: number | null; // Thay đổi từ boolean thành number | null
  trang_thai_approve?: string; // KCS approval status: 'pending', 'approved', 'rejected'
  trang_thai_bd_cao?: number | null; // Trạng thái bối dây cao: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ha?: number | null; // Trạng thái bối dây hạ: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ep?: number | null; // Trạng thái bối dây ép: 1=đang làm, 2=đã hoàn thành
  bd_cao_id?: string | null; // ID của bối dây cao từ tbl_bd_cao
  bd_ha_id?: string | null; // ID của bối dây hạ từ tbl_bd_ha
  bd_ep_id?: string | null; // ID của bối dây ép từ tbl_bd_ep
  assigned_by_user_id?: string | null; // Firebase UID của user thực hiện gán
  // Thêm thông tin user_update để debug
  bd_ha_user_update?: string | null; // User update từ tbl_bd_ha
  bd_cao_user_update?: string | null; // User update từ tbl_bd_cao
  created_at: Date;
  username: string;
  email: string;
  role_name: string;
  IsActive?: boolean; // Add optional IsActive property
}

export interface ProcessedBangVeData extends BangVeData {
  user_process: string;
  process_date: Date;
  process_status: string;
}

@Component({
  selector: 'app-ds-bangve',
  templateUrl: './ds-bangve.component.html',
  styleUrls: ['./ds-bangve.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTabsModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSortModule,
    MatToolbarModule,
    MatCardModule
]
})
export class DsBangveComponent implements OnInit {
  drawings: BangVeData[] = [];
  processedDrawings: ProcessedBangVeData[] = [];
  inProgressDrawings: BangVeData[] = []; // Thêm danh sách bảng vẽ đang gia công
  
  // Authentication status
  isAuthenticated: boolean = false;

  displayedColumns: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions'];
  displayedColumnsInProgress: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions']; // Cột cho tab đang gia công
  displayedColumnsProcessed: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'process_date','actions'];
  
  // New drawings properties
  searchTerm: string = '';
  filteredDrawings: BangVeData[] = [];
  pagedNewDrawings: BangVeData[] = [];
  
  // Processed drawings properties
  searchTermProcessed: string = '';
  filteredProcessedDrawings: ProcessedBangVeData[] = [];
  pagedProcessedDrawings: ProcessedBangVeData[] = [];

  // In Progress drawings properties
  searchTermInProgress: string = ''; // Tìm kiếm cho tab đang gia công
  filteredInProgressDrawings: BangVeData[] = [];
  pagedInProgressDrawings: BangVeData[] = [];

  pageSize = 5;
  pageIndex = 0;
  pageIndexInProgress = 0; // Page index cho tab đang gia công
  currentTabIndex = 0;
  
  // Autocomplete properties
  filteredOptions: string[] = [];
  filteredDrawingsForAutocomplete: BangVeData[] = [];
  filteredProcessedDrawingsForAutocomplete: ProcessedBangVeData[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: BangVeData[] = [];

  // Danh sách người dùng giả lập
  availableUsers: string[] = ['user_quanday_1', 'user_quanday_2', 'user_quanday_3', 'user_quanday_4', 'user_quanday_5'];
  userRole: string | null = null;
  username: string | null = null;
  khau_sx: string | null = null;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router:Router,
    private commonService: CommonService,
    private http: HttpClient,
    private authService: AuthService,
    private firebaseBangVeService: FirebaseBangVeService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    // Lấy thông tin user từ getUserInfo() trước, sau đó fallback về localStorage
    const userInfo = this.authService.getUserInfo();
    this.userRole = userInfo?.roles?.[0] || localStorage.getItem('userRole') || localStorage.getItem('role');
    this.username = userInfo?.username || localStorage.getItem('username');
    this.khau_sx = userInfo?.khau_sx || localStorage.getItem('khau_sx');
    
    // Debug khau_sx functionality
    this.debugKhauSxFunctionality();
    
    // Debug user permissions
    this.debugUserPermissions();
    
    // Debug authentication
    this.debugAuthentication();
    
    // Đảm bảo collection Firebase tồn tại và có dữ liệu mẫu
    await this.ensureFirebaseCollection();
    
    // Kiểm tra authentication trước khi load data
    this.checkAuthentication();
    
    // Test API endpoint existence (safe method)
    this.testApiEndpointExistence();
    
    // Test actual API call
    this.testActualApiCall();
    
    // Kiểm tra user authentication và role
    this.checkUserAuthAndRole();
    
    // Kiểm tra quyền của user
    this.checkUserPermissions();
  }

  // Method để mở popup đăng nhập
  goToLogin(): void {
    // Gửi event để mở popup đăng nhập thay vì redirect
    this.commonService.pushEvent({ action: 'openLoginForm' });
  }

  // Method để debug khau_sx functionality
  private debugKhauSxFunctionality(): void {
    console.log('=== DEBUG khau_sx FUNCTIONALITY ===');
    console.log('Current khau_sx:', this.khau_sx);
    console.log('Is admin/manager?', this.hasAdminOrManagerRole());
    
    if (this.khau_sx) {
      console.log('khau_sx is defined, will redirect based on value');
      switch (this.khau_sx.toLowerCase()) {
        case 'boidayha':
          console.log('User will be redirected to boi-day-ha page');
          break;
        case 'boidaycao':
          console.log('User will be redirected to boi-day-cao page');
          break;
        case 'boidayep':
          console.log('User will see boidayep message');
          break;
        case 'admin':
          console.log('User is admin/manager, no redirection needed');
          break;
        default:
          console.log('Unknown khau_sx value, user will see warning');
      }
    } else {
      console.log('khau_sx is undefined, user will see error message');
    }
    console.log('=== END DEBUG ===');
  }

  // Method để kiểm tra authentication
  checkAuthentication(): void {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    
    console.log('=== Authentication Check ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    console.log('IsLoggedIn:', isLoggedIn);
    console.log('UserRole:', this.userRole);
    console.log('Username:', this.username);
    console.log('Khau_sx:', this.khau_sx);
    console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('localStorage idToken:', localStorage.getItem('idToken'));
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    if (!token || !isLoggedIn) {
      console.log('User not authenticated, showing warning');
      this.isAuthenticated = false;
      
      // Khởi tạo với dữ liệu rỗng
      this.initializeEmptyData();
      return;
    }
    
    console.log('User authenticated, loading real data from API (ONCE)');
    this.isAuthenticated = true;
    // Load data từ API - chỉ gọi loadDrawings vì nó đã xử lý tất cả
    this.loadDrawings();
  }

  // Method để kiểm tra quyền admin, manager hoặc totruong
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    
    console.log('=== hasAdminOrManagerRole check ===');
    console.log('UserInfo:', userInfo);
    console.log('UserInfo.roles:', userInfo?.roles);
    console.log('Current userRole:', this.userRole);
    console.log('Current khau_sx:', this.khau_sx);
    
    // Kiểm tra từ userInfo trước
    if (userInfo?.roles) {
      const hasAdminRole = userInfo.roles.some((role: string) => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'manager' ||
        role.toLowerCase() === 'administrator' ||
        role.toLowerCase() === 'totruong'
      );
      if (hasAdminRole) {
        console.log('Admin/Manager/Totruong role found in userInfo.roles:', hasAdminRole);
        return true;
      }
    }
    
    // Kiểm tra từ localStorage với case-insensitive
    const role = localStorage.getItem('role');
    const userRole = localStorage.getItem('userRole');
    console.log('Role from localStorage:', role);
    console.log('UserRole from localStorage:', userRole);
    
    const hasAdminRole = !!(role && (role.toLowerCase() === 'admin' || role.toLowerCase() === 'manager' || role.toLowerCase() === 'totruong')) ||
                        !!(userRole && (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'manager' || userRole.toLowerCase() === 'totruong'));
    
    // Kiểm tra thêm từ khau_sx
    const hasAdminKhauSx = !!(this.khau_sx && this.khau_sx.toLowerCase() === 'admin');
    
    const finalResult = hasAdminRole || hasAdminKhauSx;
    console.log('Final hasAdminOrManagerRole result:', finalResult);
    console.log('hasAdminRole:', hasAdminRole);
    console.log('hasAdminKhauSx:', hasAdminKhauSx);
    
    return finalResult;
  }

  // Method để hiển thị thông báo không có quyền
  showPermissionDeniedMessage(): void {
    this.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin, manager hoặc tổ trưởng mới có quyền thêm bảng vẽ mới.', 'Đóng', 'error');
  }

  // Method để debug quyền truy cập của user
  private debugUserPermissions(): void {
    console.log('=== DEBUG USER PERMISSIONS ===');
    console.log('=== localStorage ===');
    console.log('localStorage.getItem("userRole"):', localStorage.getItem('userRole'));
    console.log('localStorage.getItem("role"):', localStorage.getItem('role'));
    console.log('localStorage.getItem("username"):', localStorage.getItem('username'));
    console.log('localStorage.getItem("khau_sx"):', localStorage.getItem('khau_sx'));
    console.log('localStorage.getItem("accessToken"):', localStorage.getItem('accessToken'));
    console.log('localStorage.getItem("idToken"):', localStorage.getItem('idToken'));
    console.log('localStorage.getItem("userId"):', localStorage.getItem('userId'));
    
    console.log('=== sessionStorage ===');
    console.log('sessionStorage.getItem("userRole"):', sessionStorage.getItem('userRole'));
    console.log('sessionStorage.getItem("role"):', sessionStorage.getItem('role'));
    console.log('sessionStorage.getItem("username"):', sessionStorage.getItem('username'));
    console.log('sessionStorage.getItem("khau_sx"):', sessionStorage.getItem('khau_sx'));
    console.log('sessionStorage.getItem("accessToken"):', sessionStorage.getItem('accessToken'));
    console.log('sessionStorage.getItem("idToken"):', sessionStorage.getItem('idToken'));
    console.log('sessionStorage.getItem("userId"):', sessionStorage.getItem('userId'));
    
    console.log('=== authService ===');
    const userInfo = this.authService.getUserInfo();
    const token = this.authService.getToken();
    console.log('authService.getUserInfo():', userInfo);
    console.log('authService.getToken():', token);
    console.log('authService.isLoggedIn():', this.authService.isLoggedIn());
    
    console.log('=== Current component state ===');
    console.log('this.userRole:', this.userRole);
    console.log('this.username:', this.username);
    console.log('this.khau_sx:', this.khau_sx);
    console.log('this.hasAdminOrManagerRole():', this.hasAdminOrManagerRole());
    
    console.log('=== All localStorage keys ===');
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('=== All sessionStorage keys ===');
    console.log('sessionStorage keys:', Object.keys(sessionStorage));
    console.log('=== END DEBUG USER PERMISSIONS ===');
  }

  // Method để kiểm tra quyền của user
  private checkUserPermissions(): void {
    console.log('=== Checking User Permissions ===');
    this.debugUserPermissions();
    
    // Kiểm tra xem user có quyền admin/manager không
    const hasAdminRole = this.hasAdminOrManagerRole();
    console.log('User has admin/manager role:', hasAdminRole);
    
    if (hasAdminRole) {
      console.log('User is admin/manager - should see ALL data');
    } else {
      console.log('User is regular user - will see filtered data based on khau_sx:', this.khau_sx);
    }
  }

  // Test API connectivity - DISABLED, using Firebase only
  testApiConnectivity(): void {
    console.log('=== API connectivity test disabled - using Firebase only ===');
  }

  // Method để kiểm tra kết nối server - DISABLED, using Firebase only
  private checkServerConnectivity(): Observable<boolean> {
    console.log('=== Server connectivity check disabled - using Firebase only ===');
    return of(true);
  }

  // Method để kiểm tra kết nối server trước khi gọi API chính - DISABLED, using Firebase only
  private ensureServerConnection(): Observable<boolean> {
    console.log('=== Server connection check disabled - using Firebase only ===');
    return of(true);
  }

  // Method để đảm bảo collection Firebase tồn tại và có dữ liệu mẫu
  private async ensureFirebaseCollection(): Promise<void> {
    try {
      console.log('🔄 [ensureFirebaseCollection] Ensuring Firebase collection exists...');
      
      // Đảm bảo collection tồn tại
      await this.firebaseBangVeService.ensureCollectionExists();
      
      // Kiểm tra xem có dữ liệu không
      const existingData = await this.firebaseBangVeService.getAllBangVe();
      
      if (existingData.length === 0) {
        console.log('📭 [ensureFirebaseCollection] No data found, creating sample data...');
      } else {
        console.log(`✅ [ensureFirebaseCollection] Found ${existingData.length} existing documents`);
      }
      
    } catch (error) {
      console.error('❌ [ensureFirebaseCollection] Error ensuring collection:', error);
    }
  }

  // Firebase methods (Primary data source)
  loadDrawings(): void {
    console.log('=== loadDrawings called (Firebase Primary) ===');
    console.log('🔄 [loadDrawings] Starting data reload from Firebase...');
    
    // Kiểm tra authentication trước
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token, trying to load from Firebase');
      this.loadDrawingsFromFirebase();
      return;
    }
    
    // Load directly from Firebase as primary source
    this.loadDrawingsFromFirebase();
  }

  // Load drawings from Firebase as fallback
  async loadDrawingsFromFirebase(): Promise<void> {
    try {
      console.log('🔄 [loadDrawingsFromFirebase] Loading data from Firebase...');
      
      // Ensure collection exists
      await this.firebaseBangVeService.ensureCollectionExists();
      
      // Load all drawings from Firebase
      const firebaseDrawings = await this.firebaseBangVeService.getAllBangVe();
      
      console.log('📊 [loadDrawingsFromFirebase] Loaded', firebaseDrawings.length, 'drawings from Firebase');
      
      if (firebaseDrawings && firebaseDrawings.length > 0) {
        // Load user_bangve data to get boiday status information
        const userBangVeData = await this.loadUserBangVeData();
        console.log('📊 [loadDrawingsFromFirebase] Loaded', userBangVeData.length, 'user_bangve records');
        
        // Merge bangve data with user_bangve data to get complete status information
        const enrichedDrawings = this.enrichDrawingsWithBoidayStatus(firebaseDrawings, userBangVeData);
        console.log('📊 [loadDrawingsFromFirebase] Enriched drawings with boiday status from user_bangve');
        
        // Process the enriched data
        this.categorizeDrawingsByTrangThai(enrichedDrawings);
        
        // Update filtered lists
        this.filterNewDrawings();
        this.updatePagedNewDrawings();
        this.filterInProgressDrawings();
        this.updatePagedInProgressDrawings();
        this.filterProcessedDrawings();
        this.updatePagedProcessedDrawings();
        
        console.log('✅ [loadDrawingsFromFirebase] Data loaded successfully from Firebase');
        console.log('  - Total drawings:', this.drawings.length);
        console.log('  - New drawings:', this.drawings.filter(d => d.trang_thai === 0).length);
        console.log('  - In progress drawings:', this.inProgressDrawings.length);
        console.log('  - Processed drawings:', this.processedDrawings.length);
      } else {
        console.log('📭 [loadDrawingsFromFirebase] No data found in Firebase, initializing empty data');
        this.initializeEmptyData();
      }
    } catch (error) {
      console.error('❌ [loadDrawingsFromFirebase] Error loading from Firebase:', error);
      this.initializeEmptyData();
    }
  }

  categorizeDrawingsByTrangThai(drawings: BangVeData[]) {
    console.log('🔍 [categorizeDrawingsByTrangThai] Starting categorization for', drawings.length, 'drawings');
    
    // Reset arrays
    this.drawings = [];
    this.inProgressDrawings = [];
    this.processedDrawings = [];
    
    drawings.forEach((drawing, index) => {
      console.log(`🔍 [categorizeDrawingsByTrangThai] Processing item ${index + 1}:`);
      console.log(`  - Drawing ID: ${drawing.id}`);
      console.log(`  - Ký hiệu: ${drawing.kyhieubangve}`);
      console.log(`  - Original trang_thai: ${drawing.trang_thai}`);
      console.log(`  - Original trang_thai type: ${typeof drawing.trang_thai}`);
      
      // Log thông tin boiday nếu có
      if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {
        console.log(`  - Boiday info: HA_trong=${drawing.bd_ha_trong}, HA_ngoai=${drawing.bd_ha_ngoai}, CAO=${drawing.bd_cao}, EP=${drawing.bd_ep}`);
      }
      
      // Convert to number for comparison
      const trangThai = Number(drawing.trang_thai);
      console.log(`  - Converted trang_thai: ${trangThai}`);
      console.log(`  - Converted trang_thai type: ${typeof trangThai}`);
      console.log(`  - Is NaN: ${isNaN(trangThai)}`);
      
      // Kiểm tra xem có phải bảng vẽ đã hoàn thành bôi dây cao hoặc bôi dây hạ không
      const isBoidayCaoCompleted = this.checkBoidayCaoCompletion(drawing);
      const isBoidayHaCompleted = this.checkBoidayHaCompletion(drawing);
      console.log(`  - Is boiday cao completed: ${isBoidayCaoCompleted}`);
      console.log(`  - Is boiday ha completed: ${isBoidayHaCompleted}`);
      
      // Kiểm tra user đang login có phải là user được gán hay không
      const currentUser = this.authService.getUserInfo();
      const currentUserUID = currentUser?.uid || currentUser?.id;
      const isAssignedToCurrentUser = drawing.assigned_by_user_id && currentUserUID && drawing.assigned_by_user_id === currentUserUID;
      console.log(`  - Current user UID: ${currentUserUID}`);
      console.log(`  - Assigned by user ID: ${drawing.assigned_by_user_id}`);
      console.log(`  - Is assigned to current user: ${isAssignedToCurrentUser}`);
      
      // Kiểm tra KCS approval status
      const trangThaiApprove = drawing.trang_thai_approve;
      console.log(`  - trang_thai_approve: ${trangThaiApprove}`);
      
      // Phân loại dựa vào KCS approval status TRƯỚC, sau đó mới đến trang_thai và trạng thái bôi dây
      if (trangThaiApprove === 'approved' || trangThaiApprove === 'rejected') {
        // KCS đã approve/reject → Tab "Đã xử lý" (ưu tiên cao nhất)
        console.log(`  → Adding to PROCESSED drawings (KCS ${trangThaiApprove})`);
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: drawing.user_create || 'Unknown',
          process_date: drawing.created_at || new Date(),
          process_status: trangThaiApprove === 'approved' ? 'KCS Approved' : 'KCS Rejected'
        };
        this.processedDrawings.push(processedDrawing);
      } else if (trangThai === 2 || (isBoidayCaoCompleted && isAssignedToCurrentUser) || (isBoidayHaCompleted && isAssignedToCurrentUser)) {
        // Hoàn thành theo cách cũ → Tab "Đã xử lý"
        console.log(`  → Adding to PROCESSED drawings (trang_thai = ${trangThai} or boiday completed for current user)`);
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: drawing.user_create || 'Unknown',
          process_date: drawing.created_at || new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings.push(processedDrawing);
      } else if (trangThai === 1 || (isAssignedToCurrentUser && (drawing.trang_thai_bd_ha === 1 || drawing.trang_thai_bd_cao === 1))) {
        // Đang gia công → Tab "Đang gia công"
        console.log(`  → Adding to IN PROGRESS drawings (trang_thai = ${trangThai} or boiday in progress for current user)`);
        this.inProgressDrawings.push(drawing);
      } else if (trangThai === 0 || drawing.trang_thai === null || drawing.trang_thai === undefined || isNaN(trangThai)) {
        // Mới → Tab "Bảng vẽ mới"
        console.log(`  → Adding to NEW drawings (trang_thai = ${drawing.trang_thai})`);
        this.drawings.push(drawing);
      } else {
        // Khác → Default to "Bảng vẽ mới" tab
        console.log(`  → Adding to NEW drawings (unknown trang_thai = ${drawing.trang_thai})`);
        this.drawings.push(drawing);
      }
    });
    
    console.log('🔍 [categorizeDrawingsByTrangThai] Categorization completed:');
    console.log('  - New drawings count:', this.drawings.length);
    console.log('  - In progress drawings count:', this.inProgressDrawings.length);
    console.log('  - Processed drawings count:', this.processedDrawings.length);
    
    // Debug: Show sample items from each category
    if (this.drawings.length > 0) {
      console.log('🔍 [categorizeDrawingsByTrangThai] Sample new drawing:', this.drawings[0]);
    }
    if (this.inProgressDrawings.length > 0) {
      console.log('🔍 [categorizeDrawingsByTrangThai] Sample in-progress drawing:', this.inProgressDrawings[0]);
    }
    if (this.processedDrawings.length > 0) {
      console.log('🔍 [categorizeDrawingsByTrangThai] Sample processed drawing:', this.processedDrawings[0]);
    }
    
    // Log thông tin chi tiết về bảng vẽ có boiday
    // this.logBoidayCategorization();
  }

  // Method để load dữ liệu user_bangve từ Firebase
  private async loadUserBangVeData(): Promise<any[]> {
    try {
      console.log('🔄 [loadUserBangVeData] Loading user_bangve data from Firebase...');
      const userBangVeData = await this.firebaseUserBangVeService.getAllUserBangVe();
      console.log('📊 [loadUserBangVeData] Loaded', userBangVeData.length, 'user_bangve records');
      return userBangVeData;
    } catch (error) {
      console.error('❌ [loadUserBangVeData] Error loading user_bangve data:', error);
      return [];
    }
  }

  // Method để merge dữ liệu bangve với user_bangve để có thông tin trạng thái bôi dây
  private enrichDrawingsWithBoidayStatus(drawings: BangVeData[], userBangVeData: any[]): BangVeData[] {
    console.log('🔄 [enrichDrawingsWithBoidayStatus] Enriching drawings with boiday status from user_bangve...');
    console.log('📊 [enrichDrawingsWithBoidayStatus] userBangVeData sample:', userBangVeData.slice(0, 2));
    
    return drawings.map(drawing => {
      // Tìm user_bangve record tương ứng với bangve_id
      const userBangVeRecord = userBangVeData.find(ubv => ubv.bangve_id === drawing.id);
      
      console.log(`🔍 [enrichDrawingsWithBoidayStatus] Drawing ${drawing.kyhieubangve} (ID: ${drawing.id}):`);
      console.log(`  - user_bangve record:`, userBangVeRecord);
      console.log(`  - user_bangve_record.trang_thai_bd_ha:`, userBangVeRecord?.trang_thai_bd_ha);
      console.log(`  - user_bangve_record.trang_thai_bd_cao:`, userBangVeRecord?.trang_thai_bd_cao);
      
      // Merge thông tin trạng thái bôi dây từ user_bangve
      return {
        ...drawing,
        trang_thai_bd_ha: userBangVeRecord?.trang_thai_bd_ha || null,
        trang_thai_bd_cao: userBangVeRecord?.trang_thai_bd_cao || null,
        bd_ha_id: userBangVeRecord?.bd_ha_id || null,
        bd_cao_id: userBangVeRecord?.bd_cao_id || null,
        assigned_by_user_id: userBangVeRecord?.assigned_by_user_id || null,
        // Thêm thông tin user_update để debug
        bd_ha_user_update: userBangVeRecord?.user_update || null,
        bd_cao_user_update: userBangVeRecord?.user_update || null
      };
    });
  }

  // Method để kiểm tra xem bôi dây cao đã hoàn thành chưa
  private checkBoidayCaoCompletion(drawing: BangVeData): boolean {
    console.log(`🔍 [checkBoidayCaoCompletion] Checking boiday cao completion for drawing ${drawing.kyhieubangve}`);
    
    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserUID = currentUser?.uid || currentUser?.id;
    console.log(`  - Current user UID: ${currentUserUID}`);
    
    // Kiểm tra trạng thái bôi dây cao từ user_bangve
    const trangThaiBdCao = drawing.trang_thai_bd_cao;
    const bdCaoId = drawing.bd_cao_id;
    const assignedByUserId = drawing.assigned_by_user_id;
    
    console.log(`  - trang_thai_bd_cao: ${trangThaiBdCao}`);
    console.log(`  - bd_cao_id: ${bdCaoId}`);
    console.log(`  - assigned_by_user_id: ${assignedByUserId}`);
    
    // Bôi dây cao được coi là hoàn thành nếu:
    // 1. trang_thai_bd_cao = 2 (đã hoàn thành) VÀ
    // 2. có bd_cao_id (không rỗng) VÀ
    // 3. user đang login là user được gán (assigned_by_user_id)
    const hasValidTrangThai = trangThaiBdCao === 2;
    const hasValidBdCaoId = !!(bdCaoId && bdCaoId.trim() !== '');
    const isAssignedToCurrentUser = !!(assignedByUserId && currentUserUID && assignedByUserId === currentUserUID);
    
    const isCompleted = hasValidTrangThai && hasValidBdCaoId && isAssignedToCurrentUser;
    
    console.log(`  - hasValidTrangThai (trang_thai_bd_cao = 2): ${hasValidTrangThai}`);
    console.log(`  - hasValidBdCaoId (bd_cao_id not empty): ${hasValidBdCaoId}`);
    console.log(`  - isAssignedToCurrentUser (assigned_by_user_id === currentUserUID): ${isAssignedToCurrentUser}`);
    console.log(`  - Is boiday cao completed: ${isCompleted}`);
    
    return isCompleted;
  }

  // Method để kiểm tra xem bôi dây hạ đã hoàn thành chưa
  private checkBoidayHaCompletion(drawing: BangVeData): boolean {
    console.log(`🔍 [checkBoidayHaCompletion] Checking boiday ha completion for drawing ${drawing.kyhieubangve}`);
    
    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserUID = currentUser?.uid || currentUser?.id;
    console.log(`  - Current user UID: ${currentUserUID}`);
    
    // Kiểm tra trạng thái bôi dây hạ từ user_bangve
    const trangThaiBdHa = drawing.trang_thai_bd_ha;
    const bdHaId = drawing.bd_ha_id;
    const assignedByUserId = drawing.assigned_by_user_id;
    
    console.log(`  - trang_thai_bd_ha: ${trangThaiBdHa}`);
    console.log(`  - bd_ha_id: ${bdHaId}`);
    console.log(`  - assigned_by_user_id: ${assignedByUserId}`);
    
    // Bôi dây hạ được coi là hoàn thành nếu:
    // 1. trang_thai_bd_ha = 2 (đã hoàn thành) VÀ
    // 2. có bd_ha_id (không rỗng) VÀ
    // 3. user đang login là user được gán (assigned_by_user_id)
    const hasValidTrangThai = trangThaiBdHa === 2;
    const hasValidBdHaId = !!(bdHaId && bdHaId.trim() !== '');
    const isAssignedToCurrentUser = !!(assignedByUserId && currentUserUID && assignedByUserId === currentUserUID);
    
    const isCompleted = hasValidTrangThai && hasValidBdHaId && isAssignedToCurrentUser;
    
    console.log(`  - hasValidTrangThai (trang_thai_bd_ha = 2): ${hasValidTrangThai}`);
    console.log(`  - hasValidBdHaId (bd_ha_id not empty): ${hasValidBdHaId}`);
    console.log(`  - isAssignedToCurrentUser (assigned_by_user_id === currentUserUID): ${isAssignedToCurrentUser}`);
    console.log(`  - Is boiday ha completed: ${isCompleted}`);
    
    return isCompleted;
  }

  // Method để force UI update
  private forceUIUpdate(): void {
    console.log('🔄 [forceUIUpdate] Forcing UI refresh...');
    
    // Trigger change detection manually
    this.cdr.detectChanges();
    
    // Update all paged lists
    this.updatePagedNewDrawings();
    this.updatePagedInProgressDrawings();
    this.updatePagedProcessedDrawings();
    
    // Force refresh của tất cả các tab
    this.refreshAllTabs();
    
    console.log('🔄 [forceUIUpdate] UI refresh completed');
  }

  // Method mới: Refresh tất cả các tab
  private refreshAllTabs(): void {
    console.log('🔄 [refreshAllTabs] Refreshing all tabs...');
    
    // Refresh tab bảng vẽ mới
    if (this.currentTabIndex === 0) {
      console.log('🔄 [refreshAllTabs] Refreshing new drawings tab...');
      this.updatePagedNewDrawings();
    }
    
    // Refresh tab đang gia công
    if (this.currentTabIndex === 1) {
      console.log('🔄 [refreshAllTabs] Refreshing in-progress drawings tab...');
      this.updatePagedInProgressDrawings();
    }
    
    // Refresh tab hoàn thành
    if (this.currentTabIndex === 2) {
      console.log('🔄 [refreshAllTabs] Refreshing processed drawings tab...');
      this.updatePagedProcessedDrawings();
    }
    
    // Force change detection cho tất cả các tab
    this.cdr.detectChanges();
    
    console.log('🔄 [refreshAllTabs] All tabs refreshed');
  }

  // Method để khởi tạo dữ liệu rỗng
  private initializeEmptyData(): void {
    console.log('=== Initializing empty data ===');
    
    // Reset all arrays to empty
    this.drawings = [];
    this.inProgressDrawings = [];
    this.processedDrawings = [];
    
    this.filteredDrawings = [];
    this.filteredInProgressDrawings = [];
    this.filteredProcessedDrawings = [];
    
    this.pagedNewDrawings = [];
    this.pagedInProgressDrawings = [];
    this.pagedProcessedDrawings = [];
    
    this.filteredDrawingsForAutocomplete = [];
    this.filteredProcessedDrawingsForAutocomplete = [];
    
    console.log('=== Empty data initialized ===');
  }

  // Method mới: Filter bảng vẽ mới
  filterNewDrawings(): void {
    console.log('=== Filtering NEW drawings ===');
    console.log('Total new drawings before filter:', this.drawings.length);
    console.log('Search term:', this.searchTerm);
    
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredDrawings = [...this.drawings];
      console.log('No search term, showing all new drawings:', this.filteredDrawings.length);
    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredDrawings = this.drawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );
      console.log('Filtered new drawings by search term:', this.filteredDrawings.length);
    }
    
    // Cập nhật autocomplete
    this.filteredDrawingsForAutocomplete = [...this.filteredDrawings];
    
    // Reset pagination về trang đầu tiên
    this.pageIndex = 0;
    
    // Cập nhật paged data
    this.updatePagedNewDrawings();
  }

  // Method để filter bảng vẽ đang gia công
  filterInProgressDrawings(): void {
    console.log('=== Filtering IN PROGRESS drawings ===');
    console.log('Total in-progress drawings before filter:', this.inProgressDrawings.length);
    console.log('Search term:', this.searchTermInProgress);
    
    if (!this.searchTermInProgress || this.searchTermInProgress.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredInProgressDrawings = [...this.inProgressDrawings];
      console.log('No search term, showing all in-progress drawings:', this.filteredInProgressDrawings.length);
    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTermInProgress.toLowerCase().trim();
      this.filteredInProgressDrawings = this.inProgressDrawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );
      console.log('Filtered in-progress drawings by search term:', this.filteredInProgressDrawings.length);
    }
    
    // Reset pagination về trang đầu tiên
    this.pageIndexInProgress = 0;
    
    // Cập nhật paged data
    this.updatePagedInProgressDrawings();
  }

  // Method để filter bảng vẽ đã xử lý
  filterProcessedDrawings(): void {
    console.log('=== Filtering PROCESSED drawings ===');
    console.log('Total processed drawings before filter:', this.processedDrawings.length);
    console.log('Search term:', this.searchTermProcessed);
    
    if (!this.searchTermProcessed || this.searchTermProcessed.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredProcessedDrawings = [...this.processedDrawings];
      console.log('No search term, showing all processed drawings:', this.filteredProcessedDrawings.length);
    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTermProcessed.toLowerCase().trim();
      this.filteredProcessedDrawings = this.processedDrawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );
      console.log('Filtered processed drawings by search term:', this.filteredProcessedDrawings.length);
    }
    
    // Cập nhật autocomplete
    this.filteredProcessedDrawingsForAutocomplete = [...this.filteredProcessedDrawings];
    
    // Cập nhật paged data
    this.updatePagedProcessedDrawings();
  }

  // Method mới: Cập nhật paged list cho bảng vẽ đang gia công
  private updatePagedInProgressDrawings(): void {
    // Đảm bảo filteredInProgressDrawings là array
    if (!Array.isArray(this.filteredInProgressDrawings)) {
      console.warn('updatePagedInProgressDrawings: filteredInProgressDrawings is not an array, using empty array');
      this.filteredInProgressDrawings = [];
    }
    
    const startIndex = this.pageIndexInProgress * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedInProgressDrawings = this.filteredInProgressDrawings.slice(startIndex, endIndex);
  }



  getDrawings(): Observable<BangVeData[]> {
    // DISABLED - using Firebase only
    console.log('=== getDrawings API call disabled - using Firebase only ===');
    return of([]);
  }

  // Method để lấy processed drawings - KHÔNG CÒN CẦN THIẾT vì đã load tất cả data 1 lần
  // getProcessedDrawings(): Observable<ProcessedBangVeData[]> {
  //   // Kiểm tra authentication trước khi gọi API
  //   const token = this.authService.getToken();
  //   const userId = this.authService.getUserInfo()?.id || localStorage.getItem('userId');
  //   
  //   if (!token || !userId) {
  //     console.error('No authentication token or user ID found for processed drawings');
  //     return of([]);
  //   }
  //   
  //   // Replace with your actual API endpoint
  //   const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetProcessedDrawings`;
  //   const headers = new HttpHeaders()
  //     .set('Authorization', `Bearer ${token}`)
  //     .set('Content-Type', 'application/json');
  //   
  //   // Add user-specific query parameters để filter theo user đăng nhập
  //   const params = {
  //     page: '1',
  //     pageSize: '100', // Tăng page size để lấy tất cả dữ liệu
  //     sortBy: 'process_date',
  //     sortOrder: 'desc',
  //     userId: userId, // Thêm userId để filter theo user
  //     userRole: this.userRole || '', // Thêm role để filter
  //     khau_sx: this.khau_sx || '' // Thêm khau_sx để filter
  //   };
  //   
  //   console.log('Calling GetProcessedDrawings API with user context:');
  //   console.log('User ID:', userId);
  //   console.log('User Role:', this.userRole);
  //   console.log('Khau SX:', this.khau_sx);
  //   console.log('API URL:', apiUrl);
  //   console.log('Params:', params);
  //   
  //   // First try with parameters
  //   return this.http.get<any[]>(apiUrl, { headers, params }).pipe(
  //     map((response: any[]) => {
  //       console.log('API Response with params:', response);
  //       // Filter dữ liệu theo user đăng nhập
  //       const userSpecificData = this.filterDataByUser(response, userId);
  //       console.log('Filtered processed data for user:', userSpecificData);
  //       // Safe type casting and data transformation
  //       return userSpecificData.map(item => this.transformProcessedDrawingData(item));
  //     }),
  //     catchError((error) => {
  //       console.log('First attempt failed, trying without parameters...');
  //       // If first attempt fails, try without parameters
  //       return this.http.get<any[]>(apiUrl, { headers }).pipe(
  //       map((response: any[]) => {
  //       console.log('API Response without params:', response);
  //       // Filter dữ liệu theo user context:');
  //       console.log('User ID:', userId);
  //       console.log('User Role:', this.userRole);
  //       console.log('Khau SX:', this.khau_sx);
  //       console.log('API URL:', apiUrl);
  //       console.log('Params:', params);
  //       
  //       // First try with parameters
  //       return this.http.get<any[]>(apiUrl, { headers, params }).pipe(
  //         map((response: any[]) => {
  //           console.log('API Response with params:', response);
  //           // Filter dữ liệu theo user đăng nhập
  //           const userSpecificData = this.filterDataByUser(response, userId);
  //           console.log('Filtered processed data for user:', userSpecificData);
  //           // Safe type casting and data transformation
  //           return userSpecificData.map(item => this.transformProcessedDrawingData(item));
  //         }),
  //         catchError((error) => {
  //           console.log('First attempt failed, trying without parameters...');
  //           // If first attempt fails, try without parameters
  //           return this.http.get<any[]>(apiUrl, { headers }).pipe(
  //             map((response: any[]) => {
  //               console.log('API Response without params:', response);
  //               // Filter dữ liệu theo user đăng nhập
  //               const userSpecificData = this.filterDataByUser(response, userId);
  //               console.log('Filtered processed data for user:', userSpecificData);
  //               // Safe type casting and data transformation
  //               return userSpecificData.map(item => this.transformProcessedDrawingData(item));
  //             })
  //           );
  //         })
  //       );
  //     }
  //   );
  // }



  // Firebase method để thêm mới bảng vẽ
  async addNewDrawing(drawingData: BangVeData): Promise<BangVeData> {
    try {
      console.log('Creating new drawing in Firebase with data:', drawingData);
      
      // Lấy thông tin user hiện tại
      const userInfo = this.authService.getUserInfo();
      const currentUsername = userInfo?.username || localStorage.getItem('username') || 'unknown';
      
      // Chuẩn bị dữ liệu để lưu vào Firebase
      const firebaseData = {
        kyhieubangve: drawingData.kyhieubangve,
        congsuat: drawingData.congsuat,
        tbkt: drawingData.tbkt,
        dienap: drawingData.dienap,
        soboiday: drawingData.soboiday,
        bd_ha_trong: drawingData.bd_ha_trong,
        bd_ha_ngoai: drawingData.bd_ha_ngoai,
        bd_cao: drawingData.bd_cao,
        bd_ep: drawingData.bd_ep,
        bung_bd: drawingData.bung_bd,
        user_create: currentUsername,
        trang_thai: STATUS.NEW, // Bảng vẽ mới có trang_thai = 0
        created_at: new Date(),
        username: currentUsername,
        email: userInfo?.email || '',
        role_name: userInfo?.roles?.[0] || 'user',
        isActive: true
      };
      
      console.log('Firebase data to save:', firebaseData);
      
      // Tạo document mới trong Firebase
      const docId = await this.firebaseBangVeService.createBangVe(firebaseData);
      
      // Tạo object trả về với ID mới
      const newDrawing: BangVeData = {
        ...firebaseData,
        id: docId, // Sử dụng docId trực tiếp (string)
        created_at: firebaseData.created_at
      };
      
      console.log('✅ New drawing created in Firebase with ID:', docId);
      return newDrawing;
      
    } catch (error) {
      console.error('❌ Error adding new drawing to Firebase:', error);
      throw error;
    }
  }

  // Firebase method để cập nhật bảng vẽ
  async updateDrawing(drawingData: BangVeData): Promise<BangVeData> {
    try {
      console.log('Updating drawing in Firebase with data:', drawingData);
      
      // Chuẩn bị dữ liệu để cập nhật trong Firebase
      const updateData = {
        kyhieubangve: drawingData.kyhieubangve,
        congsuat: drawingData.congsuat,
        tbkt: drawingData.tbkt,
        dienap: drawingData.dienap,
        soboiday: drawingData.soboiday,
        bd_ha_trong: drawingData.bd_ha_trong,
        bd_ha_ngoai: drawingData.bd_ha_ngoai,
        bd_cao: drawingData.bd_cao,
        bd_ep: drawingData.bd_ep,
        bung_bd: drawingData.bung_bd,
        user_create: drawingData.user_create,
        trang_thai: drawingData.trang_thai,
        created_at: drawingData.created_at,
        username: drawingData.username,
        email: drawingData.email,
        role_name: drawingData.role_name,
        isActive: drawingData.IsActive !== false // Default to true if not specified
      };
      
      console.log('Firebase update data:', updateData);
      
      // Cập nhật document trong Firebase
      const docId = typeof drawingData.id === 'string' ? drawingData.id : drawingData.id.toString();
      await this.firebaseBangVeService.updateBangVe(docId, updateData);
      
      console.log('✅ Drawing updated in Firebase with ID:', drawingData.id);
      return drawingData;
      
    } catch (error) {
      console.error('❌ Error updating drawing in Firebase:', error);
      throw error;
    }
  }

  // Firebase method để xóa bảng vẽ
  async deleteDrawing(drawingId: number | string): Promise<void> {
    try {
      console.log('Deleting drawing in Firebase with ID:', drawingId);
      
      // Xóa document trong Firebase (soft delete)
      await this.firebaseBangVeService.deleteBangVe(drawingId.toString());
      
      console.log('✅ Drawing deleted in Firebase with ID:', drawingId);
      
    } catch (error) {
      console.error('❌ Error deleting drawing in Firebase:', error);
      throw error;
    }
  }

  // API method để gia công bảng vẽ - DISABLED, using Firebase only
  processDrawingApi(drawingId: number | string, userQuanday1: string, userQuanday2: string): Observable<any> {
    console.log('=== processDrawingApi disabled - using Firebase only ===');
    return of({ success: true, message: 'Using Firebase' });
  }

  // Fallback method removed: mock data no longer used
  initializeMockDrawings(): void {
    this.drawings = [];
    this.filteredDrawings = [];
    this.updatePagedNewDrawings();
    this.filteredDrawingsForAutocomplete = [];
  }

  initializeMockProcessedDrawings(): void {
    this.processedDrawings = [];
    this.filteredProcessedDrawings = [];
    this.updatePagedProcessedDrawings();
    this.filteredProcessedDrawingsForAutocomplete = [];
  }

  // Tab management
  onTabChange(event: MatTabChangeEvent): void {
    console.log('=== Tab change event ===');
    console.log('Previous tab index:', this.currentTabIndex);
    console.log('New tab index:', event.index);
    console.log('New tab label:', event.tab.textLabel);
    
    // Cập nhật current tab index
    this.currentTabIndex = event.index;
    
    // Reset pagination về trang đầu tiên khi chuyển tab
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      this.pageIndex = 0;
      console.log('Reset pageIndex to 0 for NEW drawings tab');
      this.updatePagedNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndexInProgress = 0;
      console.log('Reset pageIndexInProgress to 0 for IN PROGRESS drawings tab');
      this.updatePagedInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      this.pageIndex = 0;
      console.log('Reset pageIndex to 0 for PROCESSED drawings tab');
      this.updatePagedProcessedDrawings();
    }
    
    console.log('=== Tab change completed ===');
    console.log('Current tab index:', this.currentTabIndex);
  }

  // New drawings methods
  filterAutoComplete() {
    if (this.searchTerm) {
      this.filteredDrawingsForAutocomplete = this.drawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredDrawingsForAutocomplete = [...this.drawings];
    }
  }

  displayFn = (drawing: BangVeData): string => {
    return drawing ? drawing.kyhieubangve : '';
  }

  onAutoCompleteSelected(event: any) {
    this.searchTerm = event.option.value.kyhieubangve;
    this.searchNewDrawings();
  }

  searchNewDrawings() {
    if (this.searchTerm) {
      this.filteredDrawings = this.drawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredDrawings = [...this.drawings];
    }
    this.updatePagedNewDrawings();
  }

  updatePagedNewDrawings() {
    console.log('=== Updating paged NEW drawings ===');
    console.log('Filtered drawings length:', this.filteredDrawings.length);
    console.log('Page size:', this.pageSize);
    console.log('Page index:', this.pageIndex);
    
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.pagedNewDrawings = this.filteredDrawings.slice(startIndex, endIndex);
    
    console.log('Paged new drawings:', this.pagedNewDrawings.length);
    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);
  }

  onNewDrawingsPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedNewDrawings();
  }

  // Processed drawings methods
  filterAutoCompleteProcessed() {
    if (this.searchTermProcessed) {
      this.filteredProcessedDrawingsForAutocomplete = this.processedDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermProcessed.toLowerCase())
      );
    } else {
      this.filteredProcessedDrawingsForAutocomplete = [...this.processedDrawings];
    }
  }

  displayFnProcessed = (drawing: ProcessedBangVeData): string => {
    return drawing ? drawing.kyhieubangve : '';
  }

  onAutoCompleteSelectedProcessed(event: any) {
    this.searchTermProcessed = event.option.value.kyhieubangve;
    this.searchProcessedDrawings();
  }

  searchProcessedDrawings() {
    if (this.searchTermProcessed) {
      this.filteredProcessedDrawings = this.processedDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermProcessed.toLowerCase())
      );
    } else {
      this.filteredProcessedDrawings = [...this.processedDrawings];
    }
    this.updatePagedProcessedDrawings();
  }

  updatePagedProcessedDrawings() {
    console.log('=== Updating paged PROCESSED drawings ===');
    console.log('Filtered processed drawings length:', this.filteredProcessedDrawings.length);
    console.log('Page size:', this.pageSize);
    console.log('Page index:', this.pageIndex);
    
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.pagedProcessedDrawings = this.filteredProcessedDrawings.slice(startIndex, endIndex);
    
    console.log('Paged processed drawings:', this.pagedProcessedDrawings.length);
    console.log('Start index:', startIndex);
    console.log('End index:', endIndex);
  }

  onProcessedDrawingsPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedProcessedDrawings();
  }

  // View processed details
  onViewProcessedDetails(drawing: ProcessedBangVeData): void {
    // Implement view processed details logic
    console.log('View processed details:', drawing);
  }

  addDrawing() {
    console.log('Drawing added');
  }
  editDrawing(d: BangVeData) {
    console.log('Drawing edited', d);
  }

  async onGiaCong(drawing: BangVeData): Promise<void> {
    console.log('=== onGiaCong called ===');
    console.log('Drawing:', drawing);
    console.log('Dialog service available:', !!this.dialog);
    console.log('GiaCongPopupComponent available:', !!GiaCongPopupComponent);
    
    // Kiểm tra quyền admin hoặc manager
    const hasPermission = this.hasAdminOrManagerRole();
    console.log('Has permission:', hasPermission);
    
    if (!hasPermission) {
      console.log('No permission, redirecting based on khau_sx');
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    console.log('Opening GiaCongPopupComponent...');
    let dialogRef;
    try {
      // Mở popup để user chọn workers
      dialogRef = this.dialog.open(GiaCongPopupComponent, {
        width: '500px',
        data: { drawing }
      });
      console.log('Dialog opened successfully');
    } catch (error) {
      console.error('Error opening dialog:', error);
      console.error('Error details:', (error as Error).message);
      console.error('Error stack:', (error as Error).stack);
      return;
    }

    dialogRef.afterClosed().subscribe(result => {
      console.log('Popup closed with result:', result);
      console.log('Result type:', typeof result);
      console.log('Result confirmed:', result?.confirmed);
      console.log('Result boiDayHa:', result?.boiDayHa);
      console.log('Result boiDayCao:', result?.boiDayCao);
      console.log('Result userBangVeAdded:', result?.userBangVeAdded);
      
      if (result && result.confirmed) {
        console.log('Processing confirmed result...');
        
        // Cập nhật trạng thái bảng vẽ thành 1 (đang xử lý) trong Firebase
        this.updateDrawingStatusToInProgressInBackend(drawing.id, () => {
          console.log('✅ Bangve status updated to in-progress successfully');
          
          // Cập nhật frontend
          this.updateDrawingStatusToInProgress(drawing.id);
          
          // Reload data để cập nhật UI
          this.loadDrawings();
          
          // Hiển thị thông báo thành công
          this.thongbao('Bảng vẽ đã được chuyển sang trạng thái đang xử lý!', 'Đóng', 'success');
        });
      } else {
        console.log('Popup closed without confirmation or invalid result');
      }
    });
  }

  // Method mới: Gán bảng vẽ cho users sử dụng Firebase
  private async assignDrawingToUsers(drawing: BangVeData, boiDayHa: any, boiDayCao: any): Promise<void> {
    // Kiểm tra xem có chọn đủ 2 workers không
    if (!boiDayHa || !boiDayCao) {
      this.thongbao('Vui lòng chọn đủ 2 người gia công.', 'Đóng', 'warning');
      return;
    }

    // Validation về trùng lặp đã được xử lý trong popup, không cần kiểm tra lại ở đây
    // Chỉ cần kiểm tra cơ bản để đảm bảo an toàn

    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserId = currentUser?.userId || localStorage.getItem('userId') || 'unknown';
    
    console.log('Current user info:', currentUser);
    console.log('Current user ID from auth service:', currentUser?.userId);
    console.log('Current user ID from localStorage:', localStorage.getItem('userId'));
    console.log('Final currentUserId:', currentUserId);
    
    // Tạo request body theo format API yêu cầu
    const requestBody = {
      userId_boidayha: boiDayHa.UserId,
      userId_boidaycao: boiDayCao.UserId,
      bangVeId: drawing.id,
      permissionType: "gia_cong", // Loại quyền
      status: true, // Trạng thái active
      assignedAt: new Date().toISOString(),
      assignedByUserId: currentUserId
    };

    console.log('Assigning drawing to users with request:', requestBody);
    console.log('Selected workers:', { 
      boidayha: { 
        id: boiDayHa.id, 
        userId: boiDayHa.userId,
        name: boiDayHa.name, 
        email: boiDayHa.email 
      },
      boidaycao: { 
        id: boiDayCao.id, 
        userId: boiDayCao.userId,
        name: boiDayCao.name, 
        email: boiDayCao.email 
      }
    });

    // Gọi API assign-drawing-to-user
    this.callAssignDrawingAPI(requestBody, drawing).subscribe({
      next: (response) => {
        console.log('Drawing assigned successfully:', response);
        this.thongbao('Gia công bảng vẽ thành công!', 'Đóng', 'success');
        
        // Cập nhật trạng thái bảng vẽ trong danh sách
        this.updateDrawingStatus(drawing.id, true);
        
        // Cập nhật trạng thái thành "đang gia công" (1) trong Firebase
        // Và chỉ reload data sau khi Firebase update thành công
        this.updateDrawingStatusToInProgressInBackend(drawing.id, () => {
          console.log('🔄 [assignDrawingToUsers] Backend update successful, updating frontend...');
          
          // Cập nhật trạng thái thành "đang gia công" (1) trong frontend
          this.updateDrawingStatusToInProgress(drawing.id);
          
          // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
          setTimeout(() => {
            console.log('🔄 [assignDrawingToUsers] Reloading data after delay...');
            
            // Refresh danh sách bảng vẽ sau khi backend đã được cập nhật
            // Đảm bảo load lại cả 3 tab: mới, đang gia công, và hoàn thành
            this.loadDrawings();
            
            // Force UI refresh để đảm bảo thay đổi được hiển thị
            this.forceUIUpdate();
            
            // Thêm delay thêm để đảm bảo data được load hoàn toàn
            setTimeout(() => {
              console.log('🔄 [assignDrawingToUsers] Final UI refresh after data load...');
              
              // Kiểm tra xem bảng vẽ đã được chuyển đúng tab chưa
              this.verifyDrawingStatusUpdate(drawing.id);
              
              // Force UI update lần nữa để đảm bảo mọi thay đổi được hiển thị
              this.forceUIUpdate();
              
              console.log('✅ [assignDrawingToUsers] Complete UI refresh completed');
            }, 300);
          }, 500);
        });
      },
      error: (error) => {
        if(error.error && error.error.errors && error.error.errors.length > 0) {
          this.thongbao('Bảng vẽ đã được chuyển qua khâu sản xuất trước đó.', 'Đóng','info');
        } else {
          this.handleApiError(error, 'gia công bảng vẽ');
        }        
      }
    });
  }

  // Method để gọi API assign-drawing-to-user - DISABLED, using Firebase only
  private callAssignDrawingAPI(requestBody: any, drawing: BangVeData): Observable<any> {
    console.log('=== callAssignDrawingAPI disabled - using Firebase only ===');
    return of({ success: true, message: 'Using Firebase' });
  }

  // Method để cập nhật trạng thái bảng vẽ
  private updateDrawingStatus(drawingId: number | string, isProcessed: boolean): void {
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      this.drawings[drawingIndex].trang_thai = isProcessed ? STATUS.PROCESSING : null;
      
      // Cập nhật filtered lists
      const filteredIndex = this.filteredDrawings.findIndex(d => d.id === drawingId);
      if (filteredIndex !== -1) {
        this.filteredDrawings[filteredIndex].trang_thai = isProcessed ? STATUS.PROCESSING : null;
      }
    }
  }

  // Method mới: Cập nhật trạng thái bảng vẽ thành "đang gia công" (1)
  private updateDrawingStatusToInProgress(drawingId: number | string): void {
    console.log(`🔄 [updateDrawingStatusToInProgress] Updating drawing ${drawingId} to trang_thai = ${STATUS.PROCESSING} in frontend`);
    
    // Tìm bảng vẽ trong danh sách mới
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      const drawing = this.drawings[drawingIndex];
      console.log(`🔄 [updateDrawingStatusToInProgress] Found drawing in new drawings list:`, drawing);
      
      drawing.trang_thai = STATUS.PROCESSING; // 1 = đang xử lý
      
      // Cập nhật filtered lists
      const filteredIndex = this.filteredDrawings.findIndex(d => d.id === drawingId);
      if (filteredIndex !== -1) {
        this.filteredDrawings[filteredIndex].trang_thai = STATUS.PROCESSING;
      }
      
      // Chuyển bảng vẽ từ danh sách mới sang danh sách đang gia công
      this.drawings.splice(drawingIndex, 1);
      this.inProgressDrawings.push(drawing);
      
      // Cập nhật filtered lists
      this.filteredDrawings = this.filteredDrawings.filter(d => d.id !== drawingId);
      this.filteredInProgressDrawings.push(drawing);
      
      // Cập nhật paged lists
      this.updatePagedNewDrawings();
      this.updatePagedInProgressDrawings();
      
      // Cập nhật trạng thái trong Firebase
      this.updateDrawingStatusToInProgressInBackend(drawingId);
      
      console.log(`✅ [updateDrawingStatusToInProgress] Successfully moved drawing ${drawingId} from new to in-progress`);
      console.log(`  - New drawings count: ${this.drawings.length}`);
      console.log(`  - In progress drawings count: ${this.inProgressDrawings.length}`);
    } else {
      console.warn(`⚠️ [updateDrawingStatusToInProgress] Drawing ${drawingId} not found in new drawings list`);
    }
  }

  // Method mới: Cập nhật trạng thái bảng vẽ thành "đang gia công" (1) trong backend
  private async updateDrawingStatusToInProgressInBackend(drawingId: number | string, onSuccess?: () => void): Promise<void> {
    // Tìm bảng vẽ trong danh sách để lấy thông tin hiện tại
    const drawing = this.drawings.find(d => d.id === drawingId) || 
                   this.inProgressDrawings.find(d => d.id === drawingId) || 
                   this.processedDrawings.find(d => d.id === drawingId);
    
    if (drawing) {
      // Tạo bản sao của drawing với trang_thai = ${STATUS.PROCESSING}
      const updatedDrawing: BangVeData = {
        ...drawing,
        trang_thai: STATUS.PROCESSING
      };
      
      console.log(`🔄 [updateDrawingStatusToInProgressInBackend] Updating drawing ${drawingId} to trang_thai = ${STATUS.PROCESSING}`);
      console.log('Updated drawing data:', updatedDrawing);
      
      try {
        // Gọi Firebase UpdateDrawing để cập nhật
        const response = await this.updateDrawing(updatedDrawing);
        console.log(`✅ [updateDrawingStatusToInProgressInBackend] Successfully updated drawing ${drawingId} in Firebase:`, response);
        
        // Gọi callback nếu có sau khi Firebase update thành công
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error(`❌ [updateDrawingStatusToInProgressInBackend] Failed to update drawing ${drawingId} in Firebase:`, error);
        this.thongbao('Cập nhật trạng thái bảng vẽ trong Firebase thất bại!', 'Đóng', 'error');
        
        // Fallback: vẫn cập nhật frontend và reload data để đảm bảo UI được cập nhật
        console.log('🔄 [updateDrawingStatusToInProgressInBackend] Fallback: updating frontend despite Firebase failure');
        if (onSuccess) {
          onSuccess();
        }
      }
    } else {
      console.warn(`⚠️ [updateDrawingStatusToInProgressInBackend] Drawing ${drawingId} not found in any list`);
    }
  }

  /**
   * Cập nhật trạng thái KCS approval cho bảng vẽ
   */
  public async updateDrawingKcsApprovalStatus(drawingId: number | string, approvalStatus: 'approved' | 'rejected'): Promise<void> {
    try {
      console.log(`🔄 [updateDrawingKcsApprovalStatus] Updating drawing ${drawingId} KCS approval status to: ${approvalStatus}`);
      
      // Tìm drawing trong danh sách
      const drawing = this.drawings.find(d => d.id === drawingId) || 
                     this.inProgressDrawings.find(d => d.id === drawingId) || 
                     this.processedDrawings.find(d => d.id === drawingId);
      
      if (!drawing) {
        console.warn(`⚠️ [updateDrawingKcsApprovalStatus] Drawing ${drawingId} not found in any list`);
        return;
      }

      // Tạo bản sao của drawing với trang_thai_approve được cập nhật
      const updatedDrawing: BangVeData = {
        ...drawing,
        trang_thai_approve: approvalStatus
      };

      // Cập nhật trong Firebase
      const response = await this.updateDrawing(updatedDrawing);
      
      if (response) {
        console.log(`✅ [updateDrawingKcsApprovalStatus] Successfully updated drawing ${drawingId} KCS approval status in Firebase:`, response);
        
        // Force refresh toàn bộ data để đảm bảo categorization đúng
        this.refreshData();
        
        console.log(`✅ [updateDrawingKcsApprovalStatus] Successfully moved drawing ${drawingId} to processed tab`);
      } else {
        console.error(`❌ [updateDrawingKcsApprovalStatus] Failed to update drawing ${drawingId} KCS approval status in Firebase:`, response);
      }
    } catch (error) {
      console.error(`❌ [updateDrawingKcsApprovalStatus] Error updating drawing ${drawingId} KCS approval status in Firebase:`, error);
    }
  }

  // Method mới: Kiểm tra xem bảng vẽ đã được cập nhật trạng thái đúng chưa
  private verifyDrawingStatusUpdate(drawingId: number | string): void {
    console.log(`🔍 [verifyDrawingStatusUpdate] Verifying drawing ${drawingId} status update...`);
    
    // Kiểm tra trong từng danh sách
    const inNewList = this.drawings.find(d => d.id === drawingId);
    const inProgressList = this.inProgressDrawings.find(d => d.id === drawingId);
    const inProcessedList = this.processedDrawings.find(d => d.id === drawingId);
    
    console.log(`🔍 [verifyDrawingStatusUpdate] Drawing ${drawingId} status check:`);
    console.log(`  - In new drawings list: ${!!inNewList}`);
    console.log(`  - In in-progress drawings list: ${!!inProgressList}`);
    console.log(`  - In processed drawings list: ${!!inProcessedList}`);
    
    if (inNewList) {
      console.warn(`⚠️ [verifyDrawingStatusUpdate] Drawing ${drawingId} still in new drawings list!`);
      console.warn(`  - Current trang_thai: ${inNewList.trang_thai}`);
      
      // Nếu vẫn ở tab mới, thử chuyển sang tab đang gia công
      if (inNewList.trang_thai === STATUS.PROCESSING) {
        console.log(`🔄 [verifyDrawingStatusUpdate] Moving drawing ${drawingId} from new to in-progress...`);
        this.moveDrawingToInProgress(drawingId);
      }
    } else if (inProgressList) {
      console.log(`✅ [verifyDrawingStatusUpdate] Drawing ${drawingId} correctly moved to in-progress list`);
      console.log(`  - Current trang_thai: ${inProgressList.trang_thai}`);
    } else if (inProcessedList) {
      console.log(`✅ [verifyDrawingStatusUpdate] Drawing ${drawingId} correctly moved to processed list`);
      console.log(`  - Current trang_thai: ${inProcessedList.trang_thai}`);
    } else {
      console.warn(`⚠️ [verifyDrawingStatusUpdate] Drawing ${drawingId} not found in any list!`);
    }
  }

  // Method mới: Di chuyển bảng vẽ từ tab mới sang tab đang gia công
  private moveDrawingToInProgress(drawingId: number | string): void {
    console.log(`🔄 [moveDrawingToInProgress] Moving drawing ${drawingId} to in-progress...`);
    
    // Tìm bảng vẽ trong danh sách mới
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      const drawing = this.drawings[drawingIndex];
      
      // Cập nhật trạng thái
      drawing.trang_thai = STATUS.PROCESSING;
      
      // Chuyển từ danh sách mới sang danh sách đang gia công
      this.drawings.splice(drawingIndex, 1);
      this.inProgressDrawings.push(drawing);
      
      // Cập nhật filtered lists
      const filteredIndex = this.filteredDrawings.findIndex(d => d.id === drawingId);
      if (filteredIndex !== -1) {
        this.filteredDrawings.splice(filteredIndex, 1);
        this.filteredInProgressDrawings.push(drawing);
      }
      
      // Cập nhật paged lists
      this.updatePagedNewDrawings();
      this.updatePagedInProgressDrawings();
      
      console.log(`✅ [moveDrawingToInProgress] Successfully moved drawing ${drawingId} to in-progress`);
      console.log('  - New drawings count:', this.drawings.length);
      console.log('  - In progress drawings count:', this.inProgressDrawings.length);
    } else {
      console.warn(`⚠️ [moveDrawingToInProgress] Drawing ${drawingId} not found in new drawings list`);
    }
  }

  // Method mới: Log thông tin về bảng vẽ đã có thi công boidayha hoặc boidaycao
  private logBoidayInfo(): void {
    console.log('🔍 [logBoidayInfo] Checking boiday information for all drawings...');
    
    // Kiểm tra bảng vẽ mới
    if (this.drawings.length > 0) {
      console.log('🔍 [logBoidayInfo] New drawings (trang_thai = null/0):');
      this.drawings.forEach((drawing, index) => {
        console.log(`  ${index + 1}. ID: ${drawing.id}, Ký hiệu: ${drawing.kyhieubangve}, Trạng thái: ${drawing.trang_thai}`);
      });
    }
    
    // Kiểm tra bảng vẽ đang gia công
    if (this.inProgressDrawings.length > 0) {
      console.log(`🔍 [logBoidayInfo] In-progress drawings (trang_thai = ${STATUS.PROCESSING}):`);
      this.inProgressDrawings.forEach((drawing, index) => {
        console.log(`  ${index + 1}. ID: ${drawing.id}, Ký hiệu: ${drawing.kyhieubangve}, Trạng thái: ${drawing.trang_thai}`);
        // Log thông tin về boiday nếu có
        if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {
          console.log(`     - Boiday info: HA_trong=${drawing.bd_ha_trong}, HA_ngoai=${drawing.bd_ha_ngoai}, CAO=${drawing.bd_cao}, EP=${drawing.bd_ep}`);
        }
      });
    }
    
    // Kiểm tra bảng vẽ hoàn thành
    if (this.processedDrawings.length > 0) {
      console.log(`🔍 [logBoidayInfo] Processed drawings (trang_thai = ${STATUS.COMPLETED}):`);
      this.processedDrawings.forEach((drawing, index) => {
        console.log(`  ${index + 1}. ID: ${drawing.id}, Ký hiệu: ${drawing.kyhieubangve}, Trạng thái: ${drawing.trang_thai}`);
        // Log thông tin về boiday nếu có
        if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {
          console.log(`     - Boiday info: HA_trong=${drawing.bd_ha_trong}, HA_ngoai=${drawing.bd_ha_ngoai}, CAO=${drawing.bd_cao}, EP=${drawing.bd_ep}`);
        }
      });
    }
    
    // Tổng kết
    const totalDrawings = this.drawings.length + this.inProgressDrawings.length + this.processedDrawings.length;
    console.log(`🔍 [logBoidayInfo] Total drawings: ${totalDrawings}`);
    console.log(`  - New: ${this.drawings.length}`);
    console.log(`  - In Progress: ${this.inProgressDrawings.length}`);
    console.log(`  - Processed: ${this.processedDrawings.length}`);
  }

  // Phương thức mới: Tự động chuyển trang dựa trên khau_sx của user
  private redirectBasedOnKhauSx(drawing: BangVeData): void {
    if (!this.khau_sx || this.khau_sx === 'unknown') {
      this.thongbao('Không thể xác định khâu sản xuất của bạn. Vui lòng liên hệ quản trị viên.', 'Đóng', 'warning');
      return;
    }

    // Nếu user là admin/manager, không cần chuyển hướng
    if (this.khau_sx === 'admin') {
      this.thongbao('Bạn có quyền admin/manager. Vui lòng sử dụng chức năng gia công thông thường.', 'Đóng', 'info');
      return;
    }

    console.log(`User khau_sx: ${this.khau_sx}, redirecting to appropriate page...`);

    switch (this.khau_sx.toLowerCase()) {
      case 'boidayha':
        console.log('Redirecting to boi-day-ha page');
        this.goBoidayHa(drawing);
        break;
      case 'boidaycao':
        console.log('Redirecting to boi-day-cao page');
        this.goBoidayCao();
        break;
      case 'boidayep':
        console.log('Redirecting to boi-day-ep page (if exists)');
        // Nếu có trang boi-day-ep, có thể thêm navigation ở đây
        this.thongbao('Chức năng bối dây ép đang được phát triển.', 'Đóng', 'info');
        break;
      default:
        console.log(`Unknown khau_sx: ${this.khau_sx}`);
        this.thongbao(`Khâu sản xuất "${this.khau_sx}" không được hỗ trợ. Vui lòng liên hệ quản trị viên.`, 'Đóng', 'warning');
        break;
    }
  }

  goBoidayHa(drawing: BangVeData){
    // Không dùng localStorage để truyền dữ liệu, chỉ dùng state khi navigate
    this.router.navigate(['boi-day-ha'], { state: { drawing: drawing } });
  }

  goBoidayCao(){
    this.router.navigate(['boi-day-cao']);
  }

  confirmGiaCong(drawing: BangVeData): void {
    // Simulate processing
    const processedDrawing: ProcessedBangVeData = {
      ...drawing,
      user_process: this.username || 'unknown',
      process_date: new Date(),
      process_status: 'completed'
    };
    
    // Move from new drawings to processed drawings
    this.drawings = this.drawings.filter(d => d.id !== drawing.id);
    this.processedDrawings.push(processedDrawing);
    
    // Update filtered lists
    this.filteredDrawings = this.filteredDrawings.filter(d => d.id !== drawing.id);
    this.filteredProcessedDrawings.push(processedDrawing);
    
    // Update paged lists
    this.updatePagedNewDrawings();
    this.updatePagedProcessedDrawings();
    
    this.thongbao('Gia công thành công!', 'Đóng', 'success');
  }

  giacongboidayha(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    const dialogRef = this.dialog.open(GiaCongPopupComponent, {
      width: '500px',
      data: { drawing }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.processDrawing(drawing, result.boiDayHa, result.boiDayCao);
      }
    });
  }

  giacongboidayep(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    this.commonService.thongbao('Giao công bối dây ép thành công!', 'Đóng', 'success');
  }

  giacongboidaycao(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    this.commonService.thongbao('Giao công bối dây cao thành công!', 'Đóng', 'success');
    this.router.navigate(['boi-day-cao']);
  }

  // Logic gia công bảng vẽ, nhận thêm tham số người dùng thực hiện cho từng khâu
  processDrawing(drawing: BangVeData, userQuanday1: any, userQuanday2: any): void {
    // Lấy tên người dùng từ object Worker
    const userName1 = typeof userQuanday1 === 'string' ? userQuanday1 : userQuanday1?.name || 'Không xác định';
    const userName2 = typeof userQuanday2 === 'string' ? userQuanday2 : userQuanday2?.name || 'Không xác định';
    
    console.log(`Bảng vẽ "${drawing.kyhieubangve}" đang được gia công.`);
    console.log(`Người quấn dây hạ: ${userName1}`);
    console.log(`Người quấn dây cao: ${userName2}`);
    
    // Kiểm tra authentication trước khi gọi API
    const token = this.authService.getToken();
    if (!token) {
      this.thongbao('Vui lòng đăng nhập để gia công bảng vẽ', 'Đóng', 'error');
      return;
    }

    // Gọi API để gia công bảng vẽ
    this.processDrawingApi(drawing.id, userQuanday1, userQuanday2).subscribe({
      next: (response) => {
        console.log('API response for processed drawing:', response);
        
        // Xóa bảng vẽ khỏi danh sách mới và thêm vào danh sách đã xử lý
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        // Thêm vào danh sách đã xử lý
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: `${userName1}, ${userName2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}!`, 'Đóng', 'success');
      },
      error: (error) => {
        console.error('Error processing drawing:', error);
        this.handleApiError(error, 'gia công bảng vẽ');
        
        // Fallback: xử lý local nếu API thất bại
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: `${userName1}, ${userName2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}!`, 'Đóng', 'success');
      }
    });
  }

  viewDrawing(d: BangVeData) {
    alert(JSON.stringify(d, null, 2));
  }

  thongbao(text: string,action: string,type: 'success' | 'error' | 'warning' | 'info'): void {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top'; // Đặt vị trí dọc là "trên cùng"
    config.horizontalPosition = 'right'; // Đặt vị trí ngang là "bên phải"
    config.duration = 3000; // Tùy chọn: Thời gian hiển thị (ví dụ 3 giây)
    config.panelClass = ['snackbar-custom', `snackbar-${type}`];
    this._snackBar.open(text, action, config);
  }

  openAddBangVeDialog(): void {
    // Kiểm tra quyền admin hoặc manager trước khi mở dialog
    if (!this.hasAdminOrManagerRole()) {
      this.showPermissionDeniedMessage();
      return;
    }

    const dialogRef = this.dialog.open(BangVeComponent, {
      width: '850px',
      disableClose: true,
      data: {
        mode: 'add'
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog thêm mới đã đóng với kết quả:', result);
      if (result) {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để thêm bảng vẽ mới', 'Đóng', 'error');
          return;
        }

        // Kiểm tra lại quyền trước khi gọi API (double-check)
        if (!this.hasAdminOrManagerRole()) {
          this.showPermissionDeniedMessage();
          return;
        }

        // Validate required fields
        if (!result.kyhieubangve || result.kyhieubangve.trim() === '') {
          this.thongbao('Ký hiệu bảng vẽ là bắt buộc', 'Đóng', 'error');
          return;
        }
        
        if (!result.congsuat) {
          this.thongbao('Công suất là bắt buộc', 'Đóng', 'error');
          return;
        }

        // Thêm bảng vẽ mới vào danh sách local (đã được lưu vào Firebase trong dialog)
        const newDrawingData: BangVeData = {
          ...result,
          trang_thai: 0, // Đảm bảo trang_thai = 0 cho bảng vẽ mới
          IsActive: true
        };
        
        // Thêm vào danh sách local
        this.drawings = [...this.drawings, newDrawingData];
        
        // Cập nhật filtered lists và paged lists
        this.filterNewDrawings();
        this.updatePagedNewDrawings();
        
        // Reset search và pagination về trạng thái ban đầu
        this.searchTerm = '';
        this.pageIndex = 0;
        
        // Chuyển về tab "Bảng vẽ mới" để user thấy bảng vẽ mới được thêm
        this.currentTabIndex = 0;
        
        this.thongbao('Thêm bảng vẽ mới thành công!', 'Đóng', 'success');
      }
    });
  }
  
  openBangVeDetailDialog(bangVe: BangVeData, mode: 'view' | 'edit'): void {
    const dialogRef = this.dialog.open(BangVeComponent, {
      width: '850px',
      disableClose: true,
      data: {
        bangVeData: bangVe,
        mode: mode
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog chi tiết/sửa đã đóng với kết quả:', result);
      if (result && mode === 'edit') {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để cập nhật bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Gọi Firebase để cập nhật bảng vẽ
        this.updateDrawing(result).then((response) => {
          console.log('Firebase response for updated drawing:', response);
          
          // Cập nhật bảng vẽ trong danh sách local
          const index = this.drawings.findIndex(b => b.id === result.id);
          if (index > -1) {
            this.drawings[index] = response;
            this.filteredDrawings = this.drawings.slice();
            this.updatePagedNewDrawings();
          }
          
          this.thongbao('Cập nhật bảng vẽ thành công!', 'Đóng', 'success');
        }).catch((error) => {
          console.error('Error updating drawing:', error);
          this.handleApiError(error, 'cập nhật bảng vẽ');
          
          // Fallback: cập nhật local nếu Firebase thất bại
          const index = this.drawings.findIndex(b => b.id === result.id);
          if (index > -1) {
            this.drawings[index] = result;
            this.filteredDrawings = this.drawings.slice();
            this.updatePagedNewDrawings();
          }
        });
      }
    });
  }

  openStatusDetailDialog(drawing: BangVeData): void {
    console.log('Opening status detail dialog for drawing:', drawing);
    
    const dialogRef = this.dialog.open(StatusDetailPopupComponent, {
      width: '1200px',
      maxHeight: '80vh',
      disableClose: false,
      data: {
        drawing: drawing
      },
      panelClass: 'status-detail-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Status detail dialog closed with result:', result);
      
      // Nếu hoàn thành thành công, refresh dữ liệu
      if (result && result.completed) {
        console.log('Drawing completed, refreshing data...');
        this.loadDrawings();
        
        // Hiển thị thông báo thành công
        this._snackBar.open('Đã hoàn thành bảng vẽ thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      }
    });
  }

  deleteBangVe(bangVe: BangVeData): void {
    // Hiển thị dialog xác nhận trước khi xóa
    const confirmDialog = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa bảng vẽ "${bangVe.kyhieubangve}" không?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để xóa bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Gọi Firebase để xóa bảng vẽ
        this.deleteDrawing(bangVe.id).then(() => {
          console.log('Firebase response for deleted drawing: success');
          
          // Xóa bảng vẽ khỏi danh sách local
          this.drawings = this.drawings.filter(b => b.id !== bangVe.id);
          this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== bangVe.id);
          this.updatePagedNewDrawings();
          
          this.thongbao('Xóa bảng vẽ thành công!', 'Đóng', 'success');
        }).catch((error) => {
          console.error('Error deleting drawing:', error);
          this.handleApiError(error, 'xóa bảng vẽ');
        });
      }
    });
  }

  // Method mới: Tìm kiếm bảng vẽ đang gia công
  searchInProgressDrawings(): void {
    this.filterInProgressDrawings();
    this.pageIndexInProgress = 0;
    this.updatePagedInProgressDrawings();
  }

  // Method mới: Xử lý page change cho bảng vẽ đang gia công
  onInProgressDrawingsPageChange(event: PageEvent): void {
    this.pageIndexInProgress = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedInProgressDrawings();
  }

  // Method để transform dữ liệu từ API response an toàn
  private transformDrawingData(item: any): BangVeData {
    return {
      id: item.Id || item.id || 0,
      kyhieubangve: item.kyhieubangve || '',
      congsuat: item.congsuat || 0,
      tbkt: item.tbkt || '',
      dienap: item.dienap || '',
      soboiday: item.soboiday || '',
      bd_ha_trong: item.bd_ha_trong || '',
      bd_ha_ngoai: item.bd_ha_ngoai || '',
      bd_cao: item.bd_cao || '',
      bd_ep: item.bd_ep || '',
      bung_bd: item.bung_bd || 0,
      user_create: item.user_create || '',
      // Safe type casting for trang_thai: handle both boolean and number
      trang_thai: this.safeCastTrangThai(item.trang_thai),
      // Thêm các field mới cho trạng thái bôi dây
      trang_thai_bd_cao: this.safeCastTrangThai(item.trang_thai_bd_cao),
      trang_thai_bd_ha: this.safeCastTrangThai(item.trang_thai_bd_ha),
      trang_thai_bd_ep: this.safeCastTrangThai(item.trang_thai_bd_ep),
      bd_cao_id: item.bd_cao_id || null,
      bd_ha_id: item.bd_ha_id || null,
      bd_ep_id: item.bd_ep_id || null,
      created_at: item.created_at ? new Date(item.created_at) : new Date(),
      username: item.username || '',
      email: item.email || '',
      role_name: item.role_name || ''
    };
  }

  // Method để cast trang_thai an toàn
  private safeCastTrangThai(value: any): number | null {
    console.log(`🔧 [safeCastTrangThai] Input value: ${value} (type: ${typeof value})`);
    
    if (value === null || value === undefined) {
      console.log(`🔧 [safeCastTrangThai] Value is null/undefined, returning null`);
      return null;
    }
    
    // Nếu là boolean, convert thành number
    if (typeof value === 'boolean') {
      const result = value ? 1 : 0;
      console.log(`🔧 [safeCastTrangThai] Boolean ${value} converted to number ${result}`);
      return result;
    }
    
    // Nếu là number, đảm bảo là 0, 1, 2, hoặc null
    if (typeof value === 'number') {
      if (value === 0 || value === 1 || value === 2) {
        console.log(`🔧 [safeCastTrangThai] Valid number ${value} preserved`);
        return value;
      }
      // Nếu là số khác, có thể là lỗi từ backend, return null
      console.warn(`🔧 [safeCastTrangThai] Unexpected trang_thai value: ${value}, converting to null`);
      return null;
    }
    
    // Nếu là string, thử parse
    if (typeof value === 'string') {
      const parsed = parseInt(value);
      if (!isNaN(parsed) && (parsed === 0 || parsed === 1 || parsed === 2)) {
        console.log(`🔧 [safeCastTrangThai] String "${value}" parsed to number ${parsed}`);
        return parsed;
      }
      console.warn(`🔧 [safeCastTrangThai] String "${value}" could not be parsed to valid trang_thai`);
    }
    
    // Fallback: return null
    console.warn(`🔧 [safeCastTrangThai] Cannot cast trang_thai value: ${value} (type: ${typeof value}), converting to null`);
    return null;
  }

  // Method để transform dữ liệu processed drawings từ API response an toàn
  private transformProcessedDrawingData(item: any): ProcessedBangVeData {
    return {
      ...this.transformDrawingData(item),
      user_process: item.user_process || '',
      process_date: item.process_date ? new Date(item.process_date) : new Date(),
      process_status: item.process_status || ''
    };
  }

  // Method để xử lý lỗi API một cách nhất quán
  private handleApiError(error: any, operation: string): void {
    console.error(`Error in ${operation}:`, error);
    
    if (error.status === 0) {
      // Network error - server không thể kết nối
      this.thongbao('Không thể kết nối đến máy chủ. Vui lòng kiểm tra:\n1. Backend server đang chạy\n2. Kết nối mạng\n3. URL API chính xác', 'Đóng', 'error');
    } else if (error.status === 401) {
      this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
      this.router.navigate(['/landing']);
    } else if (error.status === 400) {
      this.thongbao('Dữ liệu không hợp lệ, vui lòng kiểm tra lại thông tin', 'Đóng', 'error');
    } else if (error.status === 500) {
      // Xử lý lỗi type casting từ backend
      if (error.error && error.error.includes('Data type casting error')) {
        this.thongbao('Lỗi dữ liệu từ máy chủ: Vui lòng liên hệ quản trị viên để kiểm tra cấu trúc dữ liệu', 'Đóng', 'error');
      } else {
        this.thongbao('Lỗi máy chủ (500): Vui lòng kiểm tra:\n1. Backend server đang chạy bình thường\n2. Database connection\n3. API endpoint tồn tại\n4. Server logs để biết chi tiết lỗi', 'Đóng', 'error');
      }
    } else if (error.status === 404) {
      this.thongbao('Không tìm thấy dữ liệu yêu cầu hoặc API endpoint không tồn tại', 'Đóng', 'error');
    } else if (error.status === 503) {
      this.thongbao('Dịch vụ tạm thời không khả dụng, vui lòng thử lại sau', 'Đóng', 'error');
    } else {
      this.thongbao(`Lỗi khi ${operation}: ${error.message || 'Không xác định'} (Status: ${error.status})`, 'Đóng', 'error');
    }
  }

  // Method để filter dữ liệu theo user đăng nhập
  private filterDataByUser(data: any[], userId: string): any[] {
    if (!data || !Array.isArray(data)) {
      console.warn('filterDataByUser: data is not a valid array');
      return [];
    }
    if (!userId) {
      console.warn('filterDataByUser: userId is not provided');
      return [];
    }
    console.log('=== filterDataByUser called ===');
    console.log('User ID:', userId);
    console.log('User Role:', this.userRole);
    console.log('User Role type:', typeof this.userRole);
    console.log('Total data items before filtering:', data.length);
    console.log('=== ROLE CHECKING DETAILS ===');
    console.log('this.userRole === "admin":', this.userRole === 'admin');
    console.log('this.userRole === "manager":', this.userRole === 'manager');
    console.log('this.userRole === "Admin":', this.userRole === 'Admin');
    console.log('this.userRole === "Manager":', this.userRole === 'Manager');
    console.log('this.userRole?.toLowerCase() === "admin":', this.userRole?.toLowerCase() === 'admin');
    console.log('this.userRole?.toLowerCase() === "manager":', this.userRole?.toLowerCase() === 'manager');
    console.log('this.hasAdminOrManagerRole():', this.hasAdminOrManagerRole());

    // Kiểm tra role với case-insensitive comparison
    const userRoleLower = this.userRole?.toLowerCase();
    const isAdminOrManager = userRoleLower === 'admin' || 
                            userRoleLower === 'manager' || 
                            userRoleLower === 'administrator' ||
                            this.hasAdminOrManagerRole();

    if (isAdminOrManager) {
      console.log('User is admin/manager, returning ALL data without filtering');
      console.log('Admin/Manager can see all drawings regardless of tbl_user_bangve assignments');
      return data;
    }

    console.log('User is regular user, filtering data based on tbl_user_bangve assignments');
    // Với user thường, chỉ lấy bảng vẽ được assign trong tbl_user_bangve
    const userAssignedData = data.filter(item => {
      const assignedUsers = item.assigned_users || item.user_bangve || [];
      console.log(`Drawing ${item.kyhieubangve} (ID: ${item.id}):`);
      console.log('  - Assigned users:', assignedUsers);
      console.log('  - Current user ID:', userId);
      const isAssigned = assignedUsers.some((assignedUser: any) => {
        const assignedUserId = assignedUser.user_id || assignedUser.userId;
        const isMatch = assignedUserId && (assignedUserId === userId || assignedUserId.toString() === userId.toString());
        console.log(`    - Assigned user ID: ${assignedUserId}, matches current user: ${isMatch}`);
        return isMatch;
      });
      console.log(`  - Is assigned to current user: ${isAssigned}`);
      return isAssigned;
    });
    console.log('=== filterDataByUser results ===');
    console.log('Data filtered by tbl_user_bangve assignments:', userAssignedData.length);
    console.log('Filtered data for user:', userAssignedData);
    return userAssignedData;
  }
  // Test API connectivity đơn giản hơn - DISABLED, using Firebase only
  private testSimpleApiConnectivity(): void {
    console.log('=== API test disabled - using Firebase only ===');
  }

  // Method để kiểm tra trạng thái API và hiển thị thông tin - DISABLED, using Firebase only
  private checkApiStatus(): void {
    console.log('=== API status check disabled - using Firebase only ===');
  }

  // Method để kiểm tra endpoint có tồn tại không một cách an toàn - DISABLED, using Firebase only
  private testApiEndpointExistence(): void {
    console.log('=== API endpoint test disabled - using Firebase only ===');
  }

  // Method để debug cấu trúc data từ API response
  private debugApiResponseStructure(data: any[]): void {
    console.log('=== Debug API Response Structure ===');
    
    if (!data || data.length === 0) {
      console.log('No data to analyze');
      return;
    }
    
    // Lấy sample item để phân tích cấu trúc
    const sampleItem = data[0];
    console.log('Sample item structure:', sampleItem);
    
    // Kiểm tra các field quan trọng
    console.log('Key fields analysis:');
    console.log('- id:', sampleItem.id);
    console.log('- kyhieubangve:', sampleItem.kyhieubangve);
    console.log('- user_create:', sampleItem.user_create);
    console.log('- trang_thai:', sampleItem.trang_thai);
    
    // Kiểm tra field assigned_users
    console.log('- assigned_users:', sampleItem.assigned_users);
    if (sampleItem.assigned_users && Array.isArray(sampleItem.assigned_users)) {
      console.log('  - assigned_users is array with length:', sampleItem.assigned_users.length);
      if (sampleItem.assigned_users.length > 0) {
        console.log('  - First assigned user:', sampleItem.assigned_users[0]);
        console.log('  - user_id field:', sampleItem.assigned_users[0].user_id);
        console.log('  - permission_type field:', sampleItem.assigned_users[0].permission_type);
      }
    }
    
    // Kiểm tra field user_bangve (alternative field name)
    console.log('- user_bangve:', sampleItem.user_bangve);
    if (sampleItem.user_bangve && Array.isArray(sampleItem.user_bangve)) {
      console.log('  - user_bangve is array with length:', sampleItem.user_bangve.length);
    }
    
    // Kiểm tra các field khác có thể chứa thông tin user
    console.log('- userId:', sampleItem.userId);
    console.log('- user_id:', sampleItem.user_id);
    console.log('- khau_sx:', sampleItem.khau_sx);
    
    console.log('=== End Structure Analysis ===');
  }

  // Method để kiểm tra data flow
  private debugDataFlow(): void {
    console.log('=== DEBUG DATA FLOW ===');
    console.log('Current drawings array length:', this.drawings?.length);
    console.log('Current inProgressDrawings array length:', this.inProgressDrawings?.length);
    console.log('Current processedDrawings array length:', this.processedDrawings?.length);
    console.log('Current filteredDrawings array length:', this.filteredDrawings?.length);
    console.log('Current filteredInProgressDrawings array length:', this.filteredInProgressDrawings?.length);
    console.log('Current filteredProcessedDrawings array length:', this.filteredProcessedDrawings?.length);
    console.log('Current pagedNewDrawings array length:', this.pagedNewDrawings?.length);
    console.log('Current pagedInProgressDrawings array length:', this.pagedInProgressDrawings?.length);
    console.log('Current pagedProcessedDrawings array length:', this.pagedProcessedDrawings?.length);
    
    if (this.drawings && this.drawings.length > 0) {
      console.log('Sample drawing data:', this.drawings[0]);
    }
    
    if (this.inProgressDrawings && this.inProgressDrawings.length > 0) {
      console.log('Sample in-progress drawing data:', this.inProgressDrawings[0]);
    }
    
    if (this.processedDrawings && this.processedDrawings.length > 0) {
      console.log('Sample processed drawing data:', this.processedDrawings[0]);
    }
    
    console.log('=== END DEBUG DATA FLOW ===');
  }

  // Method để kiểm tra API response
  private debugApiResponse(response: any[]): void {
    console.log('=== DEBUG API RESPONSE ===');
    console.log('Response type:', typeof response);
    console.log('Is Array:', Array.isArray(response));
    console.log('Response length:', response?.length);
    
    if (response && Array.isArray(response) && response.length > 0) {
      console.log('First item structure:', response[0]);
      console.log('First item keys:', Object.keys(response[0]));
      
      // Kiểm tra các field quan trọng
      const firstItem = response[0];
      console.log('Has assigned_users field:', 'assigned_users' in firstItem);
      console.log('Has user_bangve field:', 'user_bangve' in firstItem);
      console.log('Has user_create field:', 'user_create' in firstItem);
      console.log('Has khau_sx field:', 'khau_sx' in firstItem);
      
      if (firstItem.assigned_users) {
        console.log('assigned_users structure:', firstItem.assigned_users);
        console.log('assigned_users type:', typeof firstItem.assigned_users);
        console.log('assigned_users is array:', Array.isArray(firstItem.assigned_users));
      }
      
      if (firstItem.user_bangve) {
        console.log('user_bangve structure:', firstItem.user_bangve);
        console.log('user_bangve type:', typeof firstItem.user_bangve);
        console.log('user_bangve is array:', Array.isArray(firstItem.user_bangve));
      }
    } else {
      console.log('Response is empty or not an array');
    }
    
    console.log('=== END DEBUG API RESPONSE ===');
  }

  // Method để kiểm tra authentication status
  private debugAuthentication(): void {
    console.log('=== DEBUG AUTHENTICATION ===');
    
    // Kiểm tra token
    const token = this.authService.getToken();
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);
    console.log('Token starts with Bearer:', token?.startsWith('Bearer '));
    
    // Kiểm tra user info
    const userInfo = this.authService.getUserInfo();
    console.log('User info exists:', !!userInfo);
    console.log('User info:', userInfo);
    
    // Kiểm tra login status
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Is logged in:', isLoggedIn);
    
    // Kiểm tra localStorage
    console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('localStorage idToken:', localStorage.getItem('idToken'));
    console.log('localStorage userRole:', localStorage.getItem('userRole'));
    console.log('localStorage role:', localStorage.getItem('role'));
    
    // Kiểm tra sessionStorage
    console.log('sessionStorage accessToken:', sessionStorage.getItem('accessToken'));
    console.log('sessionStorage idToken:', sessionStorage.getItem('idToken'));
    console.log('sessionStorage userRole:', sessionStorage.getItem('userRole'));
    console.log('sessionStorage role:', sessionStorage.getItem('role'));
    
    console.log('=== END DEBUG AUTHENTICATION ===');
  }

  // Method để test API call thực tế - DISABLED, using Firebase only
  private testActualApiCall(): void {
    console.log('=== API test call disabled - using Firebase only ===');
  }

  // Method để kiểm tra user authentication và role
  private checkUserAuthAndRole(): void {
    console.log('=== CHECKING USER AUTH AND ROLE ===');
    
    // Kiểm tra authentication
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    
    if (!token || !isLoggedIn) {
      console.error('User is not authenticated');
      return;
    }
    
    console.log('User is authenticated');
    
    // Kiểm tra user info
    const userInfo = this.authService.getUserInfo();
    console.log('User info:', userInfo);
    
    // Kiểm tra role từ các nguồn khác nhau
    const roleFromUserInfo = userInfo?.roles?.[0];
    const roleFromLocalStorage = localStorage.getItem('role');
    const roleFromUserRole = localStorage.getItem('userRole');
    const khauSxFromUserInfo = userInfo?.khau_sx;
    const khauSxFromLocalStorage = localStorage.getItem('khau_sx');
    
    console.log('Role sources:');
    console.log('  - From userInfo.roles[0]:', roleFromUserInfo);
    console.log('  - From localStorage role:', roleFromLocalStorage);
    console.log('  - From localStorage userRole:', roleFromUserRole);
    console.log('  - From userInfo.khau_sx:', khauSxFromUserInfo);
    console.log('  - From localStorage khau_sx:', khauSxFromLocalStorage);
    
    // Kiểm tra role hiện tại
    console.log('Current this.userRole:', this.userRole);
    console.log('Current this.khau_sx:', this.khau_sx);
    
    // Kiểm tra quyền admin/manager
    const hasAdminRole = this.hasAdminOrManagerRole();
    console.log('Has admin/manager role:', hasAdminRole);
    
    // Kiểm tra xem có phải admin/manager không
    const userRoleLower = this.userRole?.toLowerCase();
    const isAdminOrManager = userRoleLower === 'admin' || 
                            userRoleLower === 'manager' || 
                            userRoleLower === 'administrator';
    
    console.log('Is admin/manager (direct check):', isAdminOrManager);
    console.log('=== END CHECKING USER AUTH AND ROLE ===');
  }

  // Method để kiểm tra API hoạt động
  private checkApiWorking(): void {
    console.log('=== API working check disabled - using Firebase only ===');
  }

  // Method để xử lý thay đổi trang
  onPageChange(event: PageEvent): void {
    console.log('=== Page change event ===');
    console.log('Page index:', event.pageIndex);
    console.log('Page size:', event.pageSize);
    console.log('Current tab index:', this.currentTabIndex);
    
    // Cập nhật page size nếu có thay đổi
    this.pageSize = event.pageSize;
    
    // Cập nhật page index theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      this.pageIndex = event.pageIndex;
      console.log('Updated pageIndex for NEW drawings:', this.pageIndex);
      this.updatePagedNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndexInProgress = event.pageIndex;
      console.log('Updated pageIndexInProgress for IN PROGRESS drawings:', this.pageIndexInProgress);
      this.updatePagedInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      this.pageIndex = event.pageIndex;
      console.log('Updated pageIndex for PROCESSED drawings:', this.pageIndex);
      this.updatePagedProcessedDrawings();
    }
    
    console.log('=== Page change completed ===');
  }

  // Method để refresh data
  refreshData(): void {
    console.log('=== Refreshing data ===');
    console.log('Current tab index:', this.currentTabIndex);
    
    // Kiểm tra authentication trước
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token, cannot refresh data');
      return;
    }
    
    // Load lại tất cả data từ API (chỉ 1 lần gọi)
    this.loadDrawings();
    
    console.log('=== Data refresh completed ===');
  }

  /**
   * Debug method để kiểm tra trạng thái phân loại
   */
  public debugCategorizationStatus(): void {
    console.log('=== DEBUG: Categorization Status ===');
    console.log('Total drawings:', this.drawings.length + this.inProgressDrawings.length + this.processedDrawings.length);
    console.log('New drawings:', this.drawings.length);
    console.log('In progress drawings:', this.inProgressDrawings.length);
    console.log('Processed drawings:', this.processedDrawings.length);
    
    // Kiểm tra các items có trang_thai_approve trong từng tab
    const newWithApproval = this.drawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    const inProgressWithApproval = this.inProgressDrawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    const processedWithApproval = this.processedDrawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    
    console.log('New drawings with approval status:', newWithApproval.length);
    console.log('In progress drawings with approval status:', inProgressWithApproval.length);
    console.log('Processed drawings with approval status:', processedWithApproval.length);
    
    if (inProgressWithApproval.length > 0) {
      console.warn('⚠️ Found approved/rejected items in IN PROGRESS tab:');
      inProgressWithApproval.forEach(item => {
        console.warn(`  - ${item.kyhieubangve} (trang_thai_approve: ${item.trang_thai_approve})`);
      });
    }
    
    console.log('=== END DEBUG ===');
  }

  /**
   * Force re-categorize data hiện tại
   */
  public forceRecategorizeData(): void {
    console.log('=== Force Re-categorizing Data ===');
    
    // Lấy tất cả data hiện tại
    const allDrawings = [...this.drawings, ...this.inProgressDrawings, ...this.processedDrawings];
    console.log('Total drawings to re-categorize:', allDrawings.length);
    
    // Reset arrays
    this.drawings = [];
    this.inProgressDrawings = [];
    this.processedDrawings = [];
    
    // Re-categorize
    this.categorizeDrawingsByTrangThai(allDrawings);
    
    // Update UI
    this.updatePagedNewDrawings();
    this.updatePagedInProgressDrawings();
    this.updatePagedProcessedDrawings();
    
    console.log('=== Re-categorization completed ===');
    this.debugCategorizationStatus();
  }

  // Method để xử lý search
  onSearch(): void {
    console.log('=== Search triggered ===');
    console.log('Current tab index:', this.currentTabIndex);
    
    // Xử lý search theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      console.log('Searching in NEW drawings tab');
      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      console.log('Searching in IN PROGRESS drawings tab');
      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      console.log('Searching in PROCESSED drawings tab');
      this.filterProcessedDrawings();
    }
    
    console.log('=== Search completed ===');
  }

  // Method để xử lý clear search
  onSearchClear(): void {
    console.log('=== Search clear triggered ===');
    console.log('Current tab index:', this.currentTabIndex);
    
    // Clear search theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      console.log('Clearing search in NEW drawings tab');
      this.searchTerm = '';
      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      console.log('Clearing search in IN PROGRESS drawings tab');
      this.searchTermInProgress = '';
      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      console.log('Clearing search in PROCESSED drawings tab');
      this.searchTermProcessed = '';
      this.filterProcessedDrawings();
    }
    
    console.log('=== Search clear completed ===');
  }

  // Method để xử lý search input
  onSearchInput(): void {
    console.log('=== Search input triggered ===');
    console.log('Current tab index:', this.currentTabIndex);
    
    // Xử lý search input theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      console.log('Search input in NEW drawings tab');
      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      console.log('Search input in IN PROGRESS drawings tab');
      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      console.log('Search input in PROCESSED drawings tab');
      this.filterProcessedDrawings();
    }
    
    console.log('=== Search input completed ===');
  }

  // Method để xử lý search input cho tab đang gia công
  onSearchInputInProgress(): void {
    console.log('=== Search input IN PROGRESS triggered ===');
    // Sử dụng method chung
    this.onSearchInput();
  }

  // Method để xử lý search input cho tab đã xử lý
  onSearchInputProcessed(): void {
    console.log('=== Search input PROCESSED triggered ===');
    // Sử dụng method chung
    this.onSearchInput();
  }

  // Method để xử lý clear search cho tab đang gia công
  onSearchClearInProgress(): void {
    console.log('=== Search clear IN PROGRESS triggered ===');
    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý clear search cho tab đã xử lý
  onSearchClearProcessed(): void {
    console.log('=== Search clear PROCESSED triggered ===');
    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý search cho tab đang gia công
  onSearchInProgress(): void {
    console.log('=== Search IN PROGRESS triggered ===');
    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý search cho tab đã xử lý
  onSearchProcessed(): void {
    console.log('=== Search PROCESSED triggered ===');
    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý clear search cho tab bảng vẽ mới
  onSearchClearNew(): void {
    console.log('=== Search clear NEW triggered ===');
    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý search cho tab bảng vẽ mới
  onSearchNew(): void {
    console.log('=== Search NEW triggered ===');
    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý search input cho tab bảng vẽ mới
  onSearchInputNew(): void {
    console.log('=== Search input NEW triggered ===');
    // Sử dụng method chung
    this.onSearchInput();
  }
}