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
import { FirebaseService } from '../../services/firebase.service';
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
import { UserRole, KhauSx, RoleHelper } from '../../models/user-roles.enum';

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
  ky_hieu_bv_boidayha?: string; // Ký hiệu BV boidayha
  ky_hieu_bv_boidaycao?: string; // Ký hiệu BV boidaycao
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
    private firebaseService: FirebaseService,
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



    
    if (this.khau_sx) {

      switch (this.khau_sx.toLowerCase()) {
        case 'boidayha':

          break;
        case 'boidaycao':

          break;
        case 'boidayep':

          break;
        case 'admin':

          break;
        default:

      }
    } else {

    }

  }

  // Method để kiểm tra authentication
  checkAuthentication(): void {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    










    
    if (!token || !isLoggedIn) {

      this.isAuthenticated = false;
      
      // Khởi tạo với dữ liệu rỗng
      this.initializeEmptyData();
      return;
    }
    

    this.isAuthenticated = true;
    // Load data từ API - chỉ gọi loadDrawings vì nó đã xử lý tất cả
    this.loadDrawings();
  }

  // Method để kiểm tra quyền admin, manager hoặc totruong
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    console.log('DsBangveComponent - Checking permissions:');
    console.log('userInfo:', userInfo);
    
    // Kiểm tra từ userInfo trước
    if (userInfo?.roles) {
      const hasAdminRole = RoleHelper.isAdminOrManager(userInfo.roles);
      if (hasAdminRole) {
        console.log('Has admin role from userInfo:', hasAdminRole);
        return true;
      }
    }
    
    // Kiểm tra từ localStorage với case-insensitive
    const role = localStorage.getItem('role');
    const userRole = localStorage.getItem('userRole');
    console.log('role from localStorage:', role);
    console.log('userRole from localStorage:', userRole);
    
    const hasAdminRole = !!(role && (role.toLowerCase() === UserRole.ADMIN || role.toLowerCase() === UserRole.MANAGER || role.toLowerCase() === UserRole.TOTRUONG)) ||
                        !!(userRole && (userRole.toLowerCase() === UserRole.ADMIN || userRole.toLowerCase() === UserRole.MANAGER || userRole.toLowerCase() === UserRole.TOTRUONG));
    
    // Kiểm tra thêm từ khau_sx
    const hasAdminKhauSx = !!(this.khau_sx && this.khau_sx.toLowerCase() === KhauSx.ADMIN);
    
    const finalResult = hasAdminRole || hasAdminKhauSx;
    console.log('hasAdminRole from localStorage:', hasAdminRole);
    console.log('hasAdminKhauSx:', hasAdminKhauSx);
    console.log('finalResult:', finalResult);
    
    return finalResult;
  }

  // Method để hiển thị thông báo không có quyền
  showPermissionDeniedMessage(): void {
    this.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin, manager hoặc tổ trưởng mới có quyền thêm bảng vẽ mới.', 'Đóng', 'error');
  }

  // Method để debug quyền truy cập của user
  private debugUserPermissions(): void {









    








    

    const userInfo = this.authService.getUserInfo();
    const token = this.authService.getToken();



    





    





  }

  // Method để kiểm tra quyền của user
  private checkUserPermissions(): void {

    this.debugUserPermissions();
    
    // Kiểm tra xem user có quyền admin/manager không
    const hasAdminRole = this.hasAdminOrManagerRole();

    
    if (hasAdminRole) {

    } else {

    }
  }

  // Test API connectivity - DISABLED, using Firebase only
  testApiConnectivity(): void {

  }

  // Method để kiểm tra kết nối server - DISABLED, using Firebase only
  private checkServerConnectivity(): Observable<boolean> {

    return of(true);
  }

  // Method để kiểm tra kết nối server trước khi gọi API chính - DISABLED, using Firebase only
  private ensureServerConnection(): Observable<boolean> {

    return of(true);
  }

  // Method để đảm bảo collection Firebase tồn tại và có dữ liệu mẫu
  private async ensureFirebaseCollection(): Promise<void> {
    try {

      
      // Đảm bảo collection tồn tại
      await this.firebaseBangVeService.ensureCollectionExists();
      
      // Kiểm tra xem có dữ liệu không
      const existingData = await this.firebaseBangVeService.getAllBangVe();
      
      if (existingData.length === 0) {

      } else {

      }
      
    } catch (error) {
      console.error('❌ [ensureFirebaseCollection] Error ensuring collection:', error);
    }
  }

  // Firebase methods (Primary data source)
  loadDrawings(): void {


    
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

      
      // Ensure collection exists
      await this.firebaseBangVeService.ensureCollectionExists();
      
      // Load all drawings from Firebase
      const firebaseDrawings = await this.firebaseBangVeService.getAllBangVe();
      

      
      if (firebaseDrawings && firebaseDrawings.length > 0) {
        // Load user_bangve data to get boiday status information
        const userBangVeData = await this.loadUserBangVeData();

        
        // Merge bangve data with user_bangve data to get complete status information
        const enrichedDrawings = this.enrichDrawingsWithBoidayStatus(firebaseDrawings, userBangVeData);

        
        // Process the enriched data
        this.categorizeDrawingsByTrangThai(enrichedDrawings);
        
        // Update filtered lists
        this.filterNewDrawings();
        this.updatePagedNewDrawings();
        this.filterInProgressDrawings();
        this.updatePagedInProgressDrawings();
        this.filterProcessedDrawings();
        this.updatePagedProcessedDrawings();
        





      } else {

        this.initializeEmptyData();
      }
    } catch (error) {
      console.error('❌ [loadDrawingsFromFirebase] Error loading from Firebase:', error);
      this.initializeEmptyData();
    }
  }

  categorizeDrawingsByTrangThai(drawings: BangVeData[]) {

    
    // Reset arrays
    this.drawings = [];
    this.inProgressDrawings = [];
    this.processedDrawings = [];
    
    drawings.forEach((drawing, index) => {





      
      // Log thông tin boiday nếu có
      if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {

      }
      
      // Convert to number for comparison
      const trangThai = Number(drawing.trang_thai);



      
      // Kiểm tra xem có phải bảng vẽ đã hoàn thành bôi dây cao hoặc bôi dây hạ không
      const isBoidayCaoCompleted = this.checkBoidayCaoCompletion(drawing);
      const isBoidayHaCompleted = this.checkBoidayHaCompletion(drawing);


      
      // Kiểm tra user đang login có phải là user được gán hay không
      const currentUser = this.authService.getUserInfo();
      const currentUserUID = currentUser?.uid || currentUser?.id;
      
      // Handle both string and array cases for assigned_by_user_id
      let isAssignedToCurrentUser = false;
      if (drawing.assigned_by_user_id && currentUserUID) {
        if (Array.isArray(drawing.assigned_by_user_id)) {
          // If it's an array, check if currentUserUID is in the array
          isAssignedToCurrentUser = drawing.assigned_by_user_id.includes(currentUserUID);
        } else {
          // If it's a string, do direct comparison
          isAssignedToCurrentUser = drawing.assigned_by_user_id === currentUserUID;
        }
      }



      
      // Kiểm tra KCS approval status
      const trangThaiApprove = drawing.trang_thai_approve;

      
      // Phân loại dựa vào KCS approval status TRƯỚC, sau đó mới đến trang_thai và trạng thái bôi dây
      if (trangThaiApprove === 'approved' || trangThaiApprove === 'rejected') {
        // KCS đã approve/reject → Tab "Đã xử lý" (ưu tiên cao nhất)

        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: drawing.user_create || 'Unknown',
          process_date: drawing.created_at || new Date(),
          process_status: trangThaiApprove === 'approved' ? 'KCS Approved' : 'KCS Rejected'
        };
        this.processedDrawings.push(processedDrawing);
      } else if (trangThai === 2 || (isBoidayCaoCompleted && isAssignedToCurrentUser) || (isBoidayHaCompleted && isAssignedToCurrentUser)) {
        // Chỉ đưa vào tab "Đã xử lý" nếu đã được KCS duyệt
        const isKcsApproved = drawing.trang_thai_approve === 'approved';
        
        if (isKcsApproved) {
          // Hoàn thành và đã được KCS duyệt → Tab "Đã xử lý"
          const processedDrawing: ProcessedBangVeData = {
            ...drawing,
            user_process: drawing.user_create || 'Unknown',
            process_date: drawing.created_at || new Date(),
            process_status: 'Completed'
          };
          this.processedDrawings.push(processedDrawing);
        } else {
          // Hoàn thành nhưng chưa được KCS duyệt → Tab "Đang gia công"
          this.inProgressDrawings.push(drawing);
        }
      } else if (trangThai === 1 || (isAssignedToCurrentUser && (drawing.trang_thai_bd_ha === 1 || drawing.trang_thai_bd_cao === 1))) {
        // Đang gia công → Tab "Đang gia công"

        this.inProgressDrawings.push(drawing);
      } else if (trangThai === 0 || drawing.trang_thai === null || drawing.trang_thai === undefined || isNaN(trangThai)) {
        // Mới → Tab "Bảng vẽ mới"

        this.drawings.push(drawing);
      } else {
        // Khác → Default to "Bảng vẽ mới" tab

        this.drawings.push(drawing);
      }
    });
    




    
    // Debug: Show sample items from each category
    if (this.drawings.length > 0) {

    }
    if (this.inProgressDrawings.length > 0) {

    }
    if (this.processedDrawings.length > 0) {

    }
    
    // Log thông tin chi tiết về bảng vẽ có boiday
    // this.logBoidayCategorization();
  }

  // Method để load dữ liệu user_bangve từ Firebase
  private async loadUserBangVeData(): Promise<any[]> {
    try {

      const userBangVeData = await this.firebaseUserBangVeService.getAllUserBangVe();

      return userBangVeData;
    } catch (error) {
      console.error('❌ [loadUserBangVeData] Error loading user_bangve data:', error);
      return [];
    }
  }

  // Method để merge dữ liệu bangve với user_bangve để có thông tin trạng thái bôi dây
  private enrichDrawingsWithBoidayStatus(drawings: BangVeData[], userBangVeData: any[]): BangVeData[] {


    
    return drawings.map(drawing => {
      // Tìm user_bangve record tương ứng với bangve_id
      const userBangVeRecord = userBangVeData.find(ubv => ubv.bangve_id === drawing.id);
      




      
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
        bd_cao_user_update: userBangVeRecord?.user_update || null,
        // Đảm bảo các field bảng vẽ được populate đúng
        bd_ha_ngoai: drawing.bd_ha_ngoai || '',
        bd_ep: drawing.bd_ep || '',
        ky_hieu_bv_boidayha: drawing.ky_hieu_bv_boidayha || '',
        ky_hieu_bv_boidaycao: drawing.ky_hieu_bv_boidaycao || ''
      };
    });
  }

  // Method để kiểm tra xem bôi dây cao đã hoàn thành chưa
  private checkBoidayCaoCompletion(drawing: BangVeData): boolean {

    
    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserUID = currentUser?.uid || currentUser?.id;

    
    // Kiểm tra trạng thái bôi dây cao từ user_bangve
    const trangThaiBdCao = drawing.trang_thai_bd_cao;
    const bdCaoId = drawing.bd_cao_id;
    const assignedByUserId = drawing.assigned_by_user_id;
    



    
    // Bôi dây cao được coi là hoàn thành nếu:
    // 1. trang_thai_bd_cao = 2 (đã hoàn thành) VÀ
    // 2. có bd_cao_id (không rỗng) VÀ
    // 3. user đang login là user được gán (assigned_by_user_id)
    const hasValidTrangThai = trangThaiBdCao === 2;
    const hasValidBdCaoId = !!(bdCaoId && bdCaoId.trim() !== '');
    const isAssignedToCurrentUser = !!(assignedByUserId && currentUserUID && assignedByUserId === currentUserUID);
    
    const isCompleted = hasValidTrangThai && hasValidBdCaoId && isAssignedToCurrentUser;
    




    
    return isCompleted;
  }

  // Method để kiểm tra xem bôi dây hạ đã hoàn thành chưa
  private checkBoidayHaCompletion(drawing: BangVeData): boolean {

    
    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserUID = currentUser?.uid || currentUser?.id;

    
    // Kiểm tra trạng thái bôi dây hạ từ user_bangve
    const trangThaiBdHa = drawing.trang_thai_bd_ha;
    const bdHaId = drawing.bd_ha_id;
    const assignedByUserId = drawing.assigned_by_user_id;
    



    
    // Bôi dây hạ được coi là hoàn thành nếu:
    // 1. trang_thai_bd_ha = 2 (đã hoàn thành) VÀ
    // 2. có bd_ha_id (không rỗng) VÀ
    // 3. user đang login là user được gán (assigned_by_user_id)
    const hasValidTrangThai = trangThaiBdHa === 2;
    const hasValidBdHaId = !!(bdHaId && bdHaId.trim() !== '');
    const isAssignedToCurrentUser = !!(assignedByUserId && currentUserUID && assignedByUserId === currentUserUID);
    
    const isCompleted = hasValidTrangThai && hasValidBdHaId && isAssignedToCurrentUser;
    




    
    return isCompleted;
  }

  // Method để force UI update
  private forceUIUpdate(): void {

    
    // Trigger change detection manually
    this.cdr.detectChanges();
    
    // Update all paged lists
    this.updatePagedNewDrawings();
    this.updatePagedInProgressDrawings();
    this.updatePagedProcessedDrawings();
    
    // Force refresh của tất cả các tab
    this.refreshAllTabs();
    

  }

  // Method mới: Refresh tất cả các tab
  private refreshAllTabs(): void {

    
    // Refresh tab bảng vẽ mới
    if (this.currentTabIndex === 0) {

      this.updatePagedNewDrawings();
    }
    
    // Refresh tab đang gia công
    if (this.currentTabIndex === 1) {

      this.updatePagedInProgressDrawings();
    }
    
    // Refresh tab hoàn thành
    if (this.currentTabIndex === 2) {

      this.updatePagedProcessedDrawings();
    }
    
    // Force change detection cho tất cả các tab
    this.cdr.detectChanges();
    

  }

  // Method để khởi tạo dữ liệu rỗng
  private initializeEmptyData(): void {

    
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
    

  }

  // Method mới: Filter bảng vẽ mới
  filterNewDrawings(): void {



    
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredDrawings = [...this.drawings];

    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredDrawings = this.drawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );

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



    
    if (!this.searchTermInProgress || this.searchTermInProgress.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredInProgressDrawings = [...this.inProgressDrawings];

    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTermInProgress.toLowerCase().trim();
      this.filteredInProgressDrawings = this.inProgressDrawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );

    }
    
    // Reset pagination về trang đầu tiên
    this.pageIndexInProgress = 0;
    
    // Cập nhật paged data
    this.updatePagedInProgressDrawings();
  }

  // Method để filter bảng vẽ đã xử lý
  filterProcessedDrawings(): void {



    
    if (!this.searchTermProcessed || this.searchTermProcessed.trim() === '') {
      // Nếu không có search term, hiển thị tất cả
      this.filteredProcessedDrawings = [...this.processedDrawings];

    } else {
      // Nếu có search term, filter theo kyhieubangve
      const searchLower = this.searchTermProcessed.toLowerCase().trim();
      this.filteredProcessedDrawings = this.processedDrawings.filter(drawing => 
        drawing.kyhieubangve?.toLowerCase().includes(searchLower)
      );

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

    return of([]);
  }

  // Firebase method để thêm mới bảng vẽ
  async addNewDrawing(drawingData: BangVeData): Promise<BangVeData> {
    try {

      
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
        user_create: currentUsername,
        trang_thai: STATUS.NEW, // Bảng vẽ mới có trang_thai = 0
        created_at: new Date(),
        username: currentUsername,
        email: userInfo?.email || '',
        role_name: userInfo?.roles?.[0] || 'user',
        isActive: true
      };
      

      
      // Tạo document mới trong Firebase
      const docId = await this.firebaseBangVeService.createBangVe(firebaseData);
      
      // Tạo object trả về với ID mới
      const newDrawing: BangVeData = {
        ...firebaseData,
        id: docId, // Sử dụng docId trực tiếp (string)
        created_at: firebaseData.created_at
      };
      

      return newDrawing;
      
    } catch (error) {
      console.error('❌ Error adding new drawing to Firebase:', error);
      throw error;
    }
  }

  // Firebase method để cập nhật bảng vẽ
  async updateDrawing(drawingData: BangVeData): Promise<BangVeData> {
    try {

      
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
        user_create: drawingData.user_create,
        trang_thai: drawingData.trang_thai,
        created_at: drawingData.created_at,
        username: drawingData.username,
        email: drawingData.email,
        role_name: drawingData.role_name,
        isActive: drawingData.IsActive !== false // Default to true if not specified
      };
      

      
      // Cập nhật document trong Firebase
      const docId = typeof drawingData.id === 'string' ? drawingData.id : drawingData.id.toString();
      await this.firebaseBangVeService.updateBangVe(docId, updateData);
      

      return drawingData;
      
    } catch (error) {
      console.error('❌ Error updating drawing in Firebase:', error);
      throw error;
    }
  }

  // Firebase method để xóa bảng vẽ
  async deleteDrawing(drawingId: number | string): Promise<void> {
    try {

      
      // Xóa document trong Firebase (soft delete)
      await this.firebaseBangVeService.deleteBangVe(drawingId.toString());
      

      
    } catch (error) {
      console.error('❌ Error deleting drawing in Firebase:', error);
      throw error;
    }
  }

  // API method để gia công bảng vẽ - DISABLED, using Firebase only
  processDrawingApi(drawingId: number | string, userQuanday1: string, userQuanday2: string): Observable<any> {

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




    
    // Cập nhật current tab index
    this.currentTabIndex = event.index;
    
    // Reset pagination về trang đầu tiên khi chuyển tab
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      this.pageIndex = 0;

      this.updatePagedNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndexInProgress = 0;

      this.updatePagedInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      this.pageIndex = 0;

      this.updatePagedProcessedDrawings();
    }
    


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




    
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.pagedNewDrawings = this.filteredDrawings.slice(startIndex, endIndex);
    



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




    
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    
    this.pagedProcessedDrawings = this.filteredProcessedDrawings.slice(startIndex, endIndex);
    



  }

  onProcessedDrawingsPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedProcessedDrawings();
  }

  // View processed details
  onViewProcessedDetails(drawing: ProcessedBangVeData): void {
    // Implement view processed details logic

  }

  addDrawing() {

  }
  editDrawing(d: BangVeData) {

  }

  async onGiaCong(drawing: BangVeData): Promise<void> {
    console.log('onGiaCong called with drawing:', drawing);
    
    // Kiểm tra quyền admin hoặc manager
    const hasPermission = this.hasAdminOrManagerRole();
    console.log('hasPermission:', hasPermission);
    
    if (!hasPermission) {
      console.log('No permission, redirecting based on khau_sx');
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    console.log('Opening dialog with data:', { drawing });
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
      this.commonService.thongbao('Không thể mở popup gia công. Vui lòng thử lại.', 'Đóng', 'error');
      return;
    }

    dialogRef.afterClosed().subscribe(result => {






      
      if (result && result.confirmed) {

        
        // Cập nhật trạng thái bảng vẽ thành 1 (đang xử lý) trong Firebase
        this.updateDrawingStatusToInProgressInBackend(drawing.id, () => {

          
          // Cập nhật frontend
          this.updateDrawingStatusToInProgress(drawing.id);
          
          // Reload data để cập nhật UI
          this.loadDrawings();
          
          // Hiển thị thông báo thành công
          this.thongbao('Bảng vẽ đã được chuyển sang trạng thái đang xử lý!', 'Đóng', 'success');
        });
      } else {

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

        this.thongbao('Gia công bảng vẽ thành công!', 'Đóng', 'success');
        
        // Cập nhật trạng thái bảng vẽ trong danh sách
        this.updateDrawingStatus(drawing.id, true);
        
        // Cập nhật trạng thái thành "đang gia công" (1) trong Firebase
        // Và chỉ reload data sau khi Firebase update thành công
        this.updateDrawingStatusToInProgressInBackend(drawing.id, () => {

          
          // Cập nhật trạng thái thành "đang gia công" (1) trong frontend
          this.updateDrawingStatusToInProgress(drawing.id);
          
          // Thêm delay nhỏ để đảm bảo backend đã xử lý xong
          setTimeout(() => {

            
            // Refresh danh sách bảng vẽ sau khi backend đã được cập nhật
            // Đảm bảo load lại cả 3 tab: mới, đang gia công, và hoàn thành
            this.loadDrawings();
            
            // Force UI refresh để đảm bảo thay đổi được hiển thị
            this.forceUIUpdate();
            
            // Thêm delay thêm để đảm bảo data được load hoàn toàn
            setTimeout(() => {

              
              // Kiểm tra xem bảng vẽ đã được chuyển đúng tab chưa
              this.verifyDrawingStatusUpdate(drawing.id);
              
              // Force UI update lần nữa để đảm bảo mọi thay đổi được hiển thị
              this.forceUIUpdate();
              

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

    
    // Tìm bảng vẽ trong danh sách mới
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      const drawing = this.drawings[drawingIndex];

      
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
      


      
      try {
        // Gọi Firebase UpdateDrawing để cập nhật
        const response = await this.updateDrawing(updatedDrawing);

        
        // Gọi callback nếu có sau khi Firebase update thành công
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        console.error(`❌ [updateDrawingStatusToInProgressInBackend] Failed to update drawing ${drawingId} in Firebase:`, error);
        this.thongbao('Cập nhật trạng thái bảng vẽ trong Firebase thất bại!', 'Đóng', 'error');
        
        // Fallback: vẫn cập nhật frontend và reload data để đảm bảo UI được cập nhật

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

        
        // Force refresh toàn bộ data để đảm bảo categorization đúng
        this.refreshData();
        

      } else {
        console.error(`❌ [updateDrawingKcsApprovalStatus] Failed to update drawing ${drawingId} KCS approval status in Firebase:`, response);
      }
    } catch (error) {
      console.error(`❌ [updateDrawingKcsApprovalStatus] Error updating drawing ${drawingId} KCS approval status in Firebase:`, error);
    }
  }

  // Method mới: Kiểm tra xem bảng vẽ đã được cập nhật trạng thái đúng chưa
  private verifyDrawingStatusUpdate(drawingId: number | string): void {

    
    // Kiểm tra trong từng danh sách
    const inNewList = this.drawings.find(d => d.id === drawingId);
    const inProgressList = this.inProgressDrawings.find(d => d.id === drawingId);
    const inProcessedList = this.processedDrawings.find(d => d.id === drawingId);
    




    
    if (inNewList) {
      console.warn(`⚠️ [verifyDrawingStatusUpdate] Drawing ${drawingId} still in new drawings list!`);
      console.warn(`  - Current trang_thai: ${inNewList.trang_thai}`);
      
      // Nếu vẫn ở tab mới, thử chuyển sang tab đang gia công
      if (inNewList.trang_thai === STATUS.PROCESSING) {

        this.moveDrawingToInProgress(drawingId);
      }
    } else if (inProgressList) {


    } else if (inProcessedList) {


    } else {
      console.warn(`⚠️ [verifyDrawingStatusUpdate] Drawing ${drawingId} not found in any list!`);
    }
  }

  // Method mới: Di chuyển bảng vẽ từ tab mới sang tab đang gia công
  private moveDrawingToInProgress(drawingId: number | string): void {

    
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
      



    } else {
      console.warn(`⚠️ [moveDrawingToInProgress] Drawing ${drawingId} not found in new drawings list`);
    }
  }

  // Method mới: Log thông tin về bảng vẽ đã có thi công boidayha hoặc boidaycao
  private logBoidayInfo(): void {

    
    // Kiểm tra bảng vẽ mới
    if (this.drawings.length > 0) {

      this.drawings.forEach((drawing, index) => {

      });
    }
    
    // Kiểm tra bảng vẽ đang gia công
    if (this.inProgressDrawings.length > 0) {

      this.inProgressDrawings.forEach((drawing, index) => {

        // Log thông tin về boiday nếu có
        if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {

        }
      });
    }
    
    // Kiểm tra bảng vẽ hoàn thành
    if (this.processedDrawings.length > 0) {

      this.processedDrawings.forEach((drawing, index) => {

        // Log thông tin về boiday nếu có
        if (drawing.bd_ha_trong || drawing.bd_ha_ngoai || drawing.bd_cao || drawing.bd_ep) {

        }
      });
    }
    
    // Tổng kết
    const totalDrawings = this.drawings.length + this.inProgressDrawings.length + this.processedDrawings.length;




  }

  // Phương thức mới: Tự động chuyển trang dựa trên roles của user
  private redirectBasedOnKhauSx(drawing: BangVeData): void {
    const userInfo = this.authService.getUserInfo();
    const userRoles = userInfo?.roles || [];
    
    console.log('redirectBasedOnKhauSx: userRoles:', userRoles);
    
    // Ưu tiên kiểm tra roles array trước
    if (RoleHelper.isGiaCongCao(userRoles)) {
      console.log('User has QUANDAYCAO role, redirecting to boidaycao');
      this.goBoidayCao();
      return;
    } else if (RoleHelper.isGiaCongHa(userRoles)) {
      console.log('User has QUANDAYHA role, redirecting to boidayha');
      this.goBoidayHa(drawing);
      return;
    }
    
    // Fallback: kiểm tra khau_sx cũ
    if (!this.khau_sx || this.khau_sx === 'unknown') {
      this.thongbao('Không thể xác định khâu sản xuất của bạn. Vui lòng liên hệ quản trị viên.', 'Đóng', 'warning');
      return;
    }

    // Nếu user là admin/manager, không cần chuyển hướng
    if (this.khau_sx === KhauSx.ADMIN) {
      this.thongbao('Bạn có quyền admin/manager. Vui lòng sử dụng chức năng gia công thông thường.', 'Đóng', 'info');
      return;
    }

    console.log('Fallback to khau_sx:', this.khau_sx);
    switch (this.khau_sx.toLowerCase()) {
      case KhauSx.QUANDAYHA:
      case 'boidayha': // Fallback cho khau_sx cũ
        console.log('Redirecting to boidayha based on khau_sx');
        this.goBoidayHa(drawing);
        break;
      case KhauSx.QUANDAYCAO:
      case 'boidaycao': // Fallback cho khau_sx cũ
        console.log('Redirecting to boidaycao based on khau_sx');
        this.goBoidayCao();
        break;
      case KhauSx.EPBOIDAY:
      case 'boidayep': // Fallback cho khau_sx cũ
        console.log('Redirecting to epboiday based on khau_sx');
        // Nếu có trang boi-day-ep, có thể thêm navigation ở đây
        this.thongbao('Chức năng bối dây ép đang được phát triển.', 'Đóng', 'info');
        break;
      default:
        console.log('Unknown khau_sx:', this.khau_sx);
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
    // Chỉ đưa vào tab "Đã xử lý" nếu đã được KCS duyệt
    const isKcsApproved = drawing.trang_thai_approve === 'approved';
    
    if (isKcsApproved) {
      // Đã được KCS duyệt → Tab "Đã xử lý"
      const processedDrawing: ProcessedBangVeData = {
        ...drawing,
        user_process: this.username || 'unknown',
        process_date: new Date(),
        process_status: 'KCS Approved'
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
      
      this.thongbao('Gia công thành công và đã được KCS duyệt!', 'Đóng', 'success');
    } else {
      // Chưa được KCS duyệt → Tab "Đang gia công"
      const inProgressDrawing = {
        ...drawing,
        trang_thai: 1 // Đánh dấu là đang gia công
      };
      
      // Move from new drawings to in-progress drawings
      this.drawings = this.drawings.filter(d => d.id !== drawing.id);
      this.inProgressDrawings.push(inProgressDrawing);
      
      // Update filtered lists
      this.filteredDrawings = this.filteredDrawings.filter(d => d.id !== drawing.id);
      this.filteredInProgressDrawings.push(inProgressDrawing);
      
      // Update paged lists
      this.updatePagedNewDrawings();
      this.updatePagedInProgressDrawings();
      
      this.thongbao('Gia công thành công! Chờ KCS duyệt.', 'Đóng', 'info');
    }
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
    



    
    // Kiểm tra authentication trước khi gọi API
    const token = this.authService.getToken();
    if (!token) {
      this.thongbao('Vui lòng đăng nhập để gia công bảng vẽ', 'Đóng', 'error');
      return;
    }

    // Gọi API để gia công bảng vẽ
    this.processDrawingApi(drawing.id, userQuanday1, userQuanday2).subscribe({
      next: (response) => {
        // Xóa bảng vẽ khỏi danh sách mới
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        // Kiểm tra KCS approval status
        const isKcsApproved = drawing.trang_thai_approve === 'approved';
        
        if (isKcsApproved) {
          // Đã được KCS duyệt → Tab "Đã xử lý"
          const processedDrawing: ProcessedBangVeData = {
            ...drawing,
            user_process: `${userName1}, ${userName2}`,
            process_date: new Date(),
            process_status: 'KCS Approved'
          };
          this.processedDrawings = [...this.processedDrawings, processedDrawing];
          this.filteredProcessedDrawings = this.processedDrawings.slice();
          this.updatePagedProcessedDrawings();
          
          this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}! (Đã KCS duyệt)`, 'Đóng', 'success');
        } else {
          // Chưa được KCS duyệt → Tab "Đang gia công"
          const inProgressDrawing = {
            ...drawing,
            trang_thai: 1,
            user_process: `${userName1}, ${userName2}`,
            process_date: new Date()
          };
          this.inProgressDrawings.push(inProgressDrawing);
          this.filteredInProgressDrawings.push(inProgressDrawing);
          this.updatePagedInProgressDrawings();
          
          this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}! (Chờ KCS duyệt)`, 'Đóng', 'info');
        }
      },
      error: (error) => {
        console.error('Error processing drawing:', error);
        this.handleApiError(error, 'gia công bảng vẽ');
        
        // Fallback: xử lý local nếu API thất bại
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        // Kiểm tra KCS approval status cho fallback
        const isKcsApproved = drawing.trang_thai_approve === 'approved';
        
        if (isKcsApproved) {
          const processedDrawing: ProcessedBangVeData = {
            ...drawing,
            user_process: `${userName1}, ${userName2}`,
            process_date: new Date(),
            process_status: 'KCS Approved'
          };
          this.processedDrawings = [...this.processedDrawings, processedDrawing];
          this.filteredProcessedDrawings = this.processedDrawings.slice();
          this.updatePagedProcessedDrawings();
          
          this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}! (Đã KCS duyệt)`, 'Đóng', 'success');
        } else {
          const inProgressDrawing = {
            ...drawing,
            trang_thai: 1,
            user_process: `${userName1}, ${userName2}`,
            process_date: new Date()
          };
          this.inProgressDrawings.push(inProgressDrawing);
          this.filteredInProgressDrawings.push(inProgressDrawing);
          this.updatePagedInProgressDrawings();
          
          this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}! (Chờ KCS duyệt)`, 'Đóng', 'info');
        }
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
      width: '90vw',
      maxWidth: '1200px',
      minWidth: '320px',
      disableClose: true,
      data: {
        mode: 'add'
      },
      panelClass: ['custom-dialog-container', 'responsive-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {

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
      width: '90vw',
      maxWidth: '850px',
      minWidth: '320px',
      disableClose: true,
      data: {
        bangVeData: bangVe,
        mode: mode
      },
      panelClass: ['custom-dialog-container', 'responsive-dialog']
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result && mode === 'edit') {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để cập nhật bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Gọi Firebase để cập nhật bảng vẽ
        this.updateDrawing(result).then((response) => {

          
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

      
      // Nếu hoàn thành thành công, refresh dữ liệu
      if (result && result.completed) {

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
    // Kiểm tra quyền admin hoặc manager trước khi hiển thị dialog
    if (!this.hasAdminOrManagerRole()) {
      this.showPermissionDeniedMessage();
      return;
    }

    // Chỉ cho phép xóa ở tab "Bảng vẽ mới" (trang_thai = STATUS.NEW hoặc null/0)
    const status = bangVe.trang_thai ?? 0;
    if (status !== STATUS.NEW) {
      this.thongbao('Chỉ được phép xóa ở tab Bảng vẽ mới.', 'Đóng', 'warning');
      return;
    }

    // Hiển thị dialog xác nhận trước khi xóa
    const confirmDialog = this.dialog.open(DialogComponent, {
      width: 'auto',
      maxWidth: '500px',
      minWidth: '400px',
      maxHeight: '80vh',
      data: {
        title: 'Xác nhận xóa bảng vẽ',
        message: `Bạn có chắc chắn muốn xóa bảng vẽ "${bangVe.kyhieubangve}" không?\n\nLưu ý: Hành động này sẽ xóa tất cả thông tin liên quan bao gồm:\n- Dữ liệu bảng vẽ\n- Thông tin phân công người dùng\n- Dữ liệu bối dây hạ/cao/ép\n- Lịch sử xử lý`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      },
      panelClass: ['custom-confirmation-dialog']
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để xóa bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Thực hiện xóa toàn diện
        this.performComprehensiveDelete(bangVe);
      }
    });
  }

  /**
   * Thực hiện xóa toàn diện bảng vẽ và tất cả dữ liệu liên quan
   * @param bangVe - Bảng vẽ cần xóa
   */
  private async performComprehensiveDelete(bangVe: BangVeData): Promise<void> {
    try {
      console.log('🔄 [performComprehensiveDelete] Starting comprehensive delete for:', bangVe.kyhieubangve);
      
      // Hiển thị loading indicator
      this.thongbao('Đang xóa bảng vẽ và dữ liệu liên quan...', 'Đóng', 'info');
      
      const bangVeId = bangVe.id.toString();
      
      // 1. Tìm và xóa tất cả user_bangve records liên quan
      await this.deleteRelatedUserBangVeRecords(bangVeId);
      
      // 2. Xóa các bd_ha records liên quan
      await this.deleteRelatedBdHaRecords(bangVeId);
      
      // 3. Xóa các bd_cao records liên quan
      await this.deleteRelatedBdCaoRecords(bangVeId);
      
      // 4. Xóa các bd_ep records liên quan (nếu có)
      await this.deleteRelatedBdEpRecords(bangVeId);
      
      // 5. Cuối cùng xóa bảng vẽ chính
      await this.deleteDrawing(bangVeId);
      
      // 6. Cập nhật UI
      this.updateUIAfterDeletion(bangVe);
      
      // 7. Reload dữ liệu để đảm bảo UI được cập nhật
      await this.loadDrawings();
      
      console.log('✅ [performComprehensiveDelete] Comprehensive delete completed successfully');
      this.thongbao(`Đã xóa thành công bảng vẽ "${bangVe.kyhieubangve}" và tất cả dữ liệu liên quan!`, 'Đóng', 'success');
      
    } catch (error) {
      console.error('❌ [performComprehensiveDelete] Error during comprehensive delete:', error);
      this.thongbao('Có lỗi xảy ra khi xóa bảng vẽ. Vui lòng thử lại hoặc liên hệ quản trị viên.', 'Đóng', 'error');
    }
  }

  /**
   * Xóa tất cả user_bangve records liên quan đến bảng vẽ
   * @param bangVeId - ID của bảng vẽ
   */
  private async deleteRelatedUserBangVeRecords(bangVeId: string): Promise<void> {
    try {
      console.log('🔄 [deleteRelatedUserBangVeRecords] Deleting user_bangve records for bangve:', bangVeId);
      
      // Lấy tất cả user_bangve records liên quan
      const userBangVeRecords = await this.firebaseUserBangVeService.getUserBangVeByBangVeId(bangVeId);
      
      if (userBangVeRecords && userBangVeRecords.length > 0) {
        console.log(`Found ${userBangVeRecords.length} user_bangve records to delete`);
        
        // Xóa từng record
        for (const record of userBangVeRecords) {
          if (record.id) {
            await this.firebaseUserBangVeService.deleteUserBangVe(record.id.toString());
            console.log(`Deleted user_bangve record: ${record.id}`);
          }
        }
        
        console.log('✅ [deleteRelatedUserBangVeRecords] All user_bangve records deleted successfully');
      } else {
        console.log('ℹ️ [deleteRelatedUserBangVeRecords] No user_bangve records found for this bangve');
      }
    } catch (error) {
      console.error('❌ [deleteRelatedUserBangVeRecords] Error deleting user_bangve records:', error);
      throw error;
    }
  }

  /**
   * Xóa tất cả bd_ha records liên quan đến bảng vẽ
   * @param bangVeId - ID của bảng vẽ
   */
  private async deleteRelatedBdHaRecords(bangVeId: string): Promise<void> {
    try {
      console.log('🔄 [deleteRelatedBdHaRecords] Deleting bd_ha records for bangve:', bangVeId);
      
      // Import FirebaseBdHaService để sử dụng
      const { FirebaseBdHaService } = await import('../../services/firebase-bd-ha.service');
      const firebaseBdHaService = new FirebaseBdHaService(this.firebaseService);
      
      // Lấy thông tin bảng vẽ để có kyhieubangve
      const bangVe = await this.firebaseBangVeService.getBangVeById(bangVeId);
      if (!bangVe) {
        console.log('ℹ️ [deleteRelatedBdHaRecords] BangVe not found, skipping bd_ha deletion');
        return;
      }
      
      // Lấy tất cả bd_ha records liên quan
      const bdHaRecords = await firebaseBdHaService.getBdHaByKyHieuBangVe(bangVe.kyhieubangve);
      
      if (bdHaRecords && bdHaRecords.length > 0) {
        console.log(`Found ${bdHaRecords.length} bd_ha records to delete`);
        
        // Xóa từng record
        for (const record of bdHaRecords) {
          if (record.id) {
            await firebaseBdHaService.deleteBdHa(record.id);
            console.log(`Deleted bd_ha record: ${record.id}`);
          }
        }
        
        console.log('✅ [deleteRelatedBdHaRecords] All bd_ha records deleted successfully');
      } else {
        console.log('ℹ️ [deleteRelatedBdHaRecords] No bd_ha records found for this bangve');
      }
    } catch (error) {
      console.error('❌ [deleteRelatedBdHaRecords] Error deleting bd_ha records:', error);
      // Không throw error để không làm gián đoạn quá trình xóa
      console.warn('⚠️ [deleteRelatedBdHaRecords] Continuing with other deletions despite bd_ha error');
    }
  }

  /**
   * Xóa tất cả bd_cao records liên quan đến bảng vẽ
   * @param bangVeId - ID của bảng vẽ
   */
  private async deleteRelatedBdCaoRecords(bangVeId: string): Promise<void> {
    try {
      console.log('🔄 [deleteRelatedBdCaoRecords] Deleting bd_cao records for bangve:', bangVeId);
      
      // Import FirebaseBdCaoService để sử dụng
      const { FirebaseBdCaoService } = await import('../../services/firebase-bd-cao.service');
      const firebaseBdCaoService = new FirebaseBdCaoService(this.firebaseService);
      
      // Lấy thông tin bảng vẽ để có kyhieubangve
      const bangVe = await this.firebaseBangVeService.getBangVeById(bangVeId);
      if (!bangVe) {
        console.log('ℹ️ [deleteRelatedBdCaoRecords] BangVe not found, skipping bd_cao deletion');
        return;
      }
      
      // Lấy tất cả bd_cao records liên quan
      const bdCaoRecords = await firebaseBdCaoService.getBdCaoByKyHieuBangVe(bangVe.kyhieubangve);
      
      if (bdCaoRecords && bdCaoRecords.length > 0) {
        console.log(`Found ${bdCaoRecords.length} bd_cao records to delete`);
        
        // Xóa từng record
        for (const record of bdCaoRecords) {
          if (record.id) {
            await firebaseBdCaoService.deleteBdCao(record.id);
            console.log(`Deleted bd_cao record: ${record.id}`);
          }
        }
        
        console.log('✅ [deleteRelatedBdCaoRecords] All bd_cao records deleted successfully');
      } else {
        console.log('ℹ️ [deleteRelatedBdCaoRecords] No bd_cao records found for this bangve');
      }
    } catch (error) {
      console.error('❌ [deleteRelatedBdCaoRecords] Error deleting bd_cao records:', error);
      // Không throw error để không làm gián đoạn quá trình xóa
      console.warn('⚠️ [deleteRelatedBdCaoRecords] Continuing with other deletions despite bd_cao error');
    }
  }

  /**
   * Xóa tất cả bd_ep records liên quan đến bảng vẽ (nếu có service)
   * @param bangVeId - ID của bảng vẽ
   */
  private async deleteRelatedBdEpRecords(bangVeId: string): Promise<void> {
    try {
      console.log('🔄 [deleteRelatedBdEpRecords] Checking for bd_ep records for bangve:', bangVeId);
      
      // Kiểm tra xem có service bd_ep không
      try {
        // Tạm thời comment out vì service chưa tồn tại
        // const { FirebaseBdEpService } = await import('../../services/firebase-bd-ep.service');
        // const firebaseBdEpService = new FirebaseBdEpService(this.firebaseService);
        
        // Lấy thông tin bảng vẽ để có kyhieubangve
        const bangVe = await this.firebaseBangVeService.getBangVeById(bangVeId);
        if (!bangVe) {
          console.log('ℹ️ [deleteRelatedBdEpRecords] BangVe not found, skipping bd_ep deletion');
          return;
        }
        
        // TODO: Implement bd_ep deletion when service is available
        // const bdEpRecords = await firebaseBdEpService.getBdEpByKyHieuBangVe(bangVe.kyhieubangve);
        
        console.log('ℹ️ [deleteRelatedBdEpRecords] FirebaseBdEpService not yet implemented, skipping bd_ep deletion');
      } catch (importError) {
        console.log('ℹ️ [deleteRelatedBdEpRecords] FirebaseBdEpService not available, skipping bd_ep deletion');
      }
    } catch (error) {
      console.error('❌ [deleteRelatedBdEpRecords] Error deleting bd_ep records:', error);
      // Không throw error để không làm gián đoạn quá trình xóa
      console.warn('⚠️ [deleteRelatedBdEpRecords] Continuing with other deletions despite bd_ep error');
    }
  }

  /**
   * Cập nhật UI sau khi xóa thành công
   * @param bangVe - Bảng vẽ đã bị xóa
   */
  private updateUIAfterDeletion(bangVe: BangVeData): void {
    try {
      console.log('🔄 [updateUIAfterDeletion] Updating UI after deletion of:', bangVe.kyhieubangve);
      
      // Xóa khỏi tất cả các danh sách local
          this.drawings = this.drawings.filter(b => b.id !== bangVe.id);
      this.inProgressDrawings = this.inProgressDrawings.filter(b => b.id !== bangVe.id);
      this.processedDrawings = this.processedDrawings.filter(b => b.id !== bangVe.id);
      
      // Cập nhật filtered lists
          this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== bangVe.id);
      this.filteredInProgressDrawings = this.filteredInProgressDrawings.filter(b => b.id !== bangVe.id);
      this.filteredProcessedDrawings = this.filteredProcessedDrawings.filter(b => b.id !== bangVe.id);
      
      // Cập nhật paged lists
          this.updatePagedNewDrawings();
      this.updatePagedInProgressDrawings();
      this.updatePagedProcessedDrawings();
      
      // Force UI update
      this.forceUIUpdate();
      
      console.log('✅ [updateUIAfterDeletion] UI updated successfully');
    } catch (error) {
      console.error('❌ [updateUIAfterDeletion] Error updating UI:', error);
      // Fallback: reload data từ Firebase
      this.loadDrawings();
    }
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
      id: item.Id || item.id || '0', // Sử dụng string ID để tương thích với Firebase
      kyhieubangve: item.kyhieubangve || '',
      congsuat: item.congsuat || 0,
      tbkt: item.tbkt || '',
      dienap: item.dienap || '',
      soboiday: item.soboiday || '',
      bd_ha_trong: item.bd_ha_trong || '',
      bd_ha_ngoai: item.bd_ha_ngoai || '',
      bd_cao: item.bd_cao || '',
      bd_ep: item.bd_ep || '',
      ky_hieu_bv_boidayha: item.ky_hieu_bv_boidayha || '',
      ky_hieu_bv_boidaycao: item.ky_hieu_bv_boidaycao || '',
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

    
    if (value === null || value === undefined) {

      return null;
    }
    
    // Nếu là boolean, convert thành number
    if (typeof value === 'boolean') {
      const result = value ? 1 : 0;

      return result;
    }
    
    // Nếu là number, đảm bảo là 0, 1, 2, hoặc null
    if (typeof value === 'number') {
      if (value === 0 || value === 1 || value === 2) {

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














    // Kiểm tra role với case-insensitive comparison
    const userRoleLower = this.userRole?.toLowerCase();
    const isAdminOrManager = userRoleLower === 'admin' || 
                            userRoleLower === 'manager' || 
                            userRoleLower === 'administrator' ||
                            this.hasAdminOrManagerRole();

    if (isAdminOrManager) {


      return data;
    }


    // Với user thường, chỉ lấy bảng vẽ được assign trong tbl_user_bangve
    const userAssignedData = data.filter(item => {
      const assignedUsers = item.assigned_users || item.user_bangve || [];



      const isAssigned = assignedUsers.some((assignedUser: any) => {
        const assignedUserId = assignedUser.user_id || assignedUser.userId;
        const isMatch = assignedUserId && (assignedUserId === userId || assignedUserId.toString() === userId.toString());

        return isMatch;
      });

      return isAssigned;
    });



    return userAssignedData;
  }
  // Test API connectivity đơn giản hơn - DISABLED, using Firebase only
  private testSimpleApiConnectivity(): void {

  }

  // Method để kiểm tra trạng thái API và hiển thị thông tin - DISABLED, using Firebase only
  private checkApiStatus(): void {

  }

  // Method để kiểm tra endpoint có tồn tại không một cách an toàn - DISABLED, using Firebase only
  private testApiEndpointExistence(): void {

  }

  // Method để debug cấu trúc data từ API response
  private debugApiResponseStructure(data: any[]): void {

    
    if (!data || data.length === 0) {

      return;
    }
    
    // Lấy sample item để phân tích cấu trúc
    const sampleItem = data[0];

    
    // Kiểm tra các field quan trọng





    
    // Kiểm tra field assigned_users

    if (sampleItem.assigned_users && Array.isArray(sampleItem.assigned_users)) {

      if (sampleItem.assigned_users.length > 0) {



      }
    }
    
    // Kiểm tra field user_bangve (alternative field name)

    if (sampleItem.user_bangve && Array.isArray(sampleItem.user_bangve)) {

    }
    
    // Kiểm tra các field khác có thể chứa thông tin user



    

  }

  // Method để kiểm tra data flow
  private debugDataFlow(): void {










    
    if (this.drawings && this.drawings.length > 0) {

    }
    
    if (this.inProgressDrawings && this.inProgressDrawings.length > 0) {

    }
    
    if (this.processedDrawings && this.processedDrawings.length > 0) {

    }
    

  }

  // Method để kiểm tra API response
  private debugApiResponse(response: any[]): void {




    
    if (response && Array.isArray(response) && response.length > 0) {


      
      // Kiểm tra các field quan trọng
      const firstItem = response[0];




      
      if (firstItem.assigned_users) {



      }
      
      if (firstItem.user_bangve) {



      }
    } else {

    }
    

  }

  // Method để kiểm tra authentication status
  private debugAuthentication(): void {

    
    // Kiểm tra token
    const token = this.authService.getToken();



    
    // Kiểm tra user info
    const userInfo = this.authService.getUserInfo();


    
    // Kiểm tra login status
    const isLoggedIn = this.authService.isLoggedIn();

    
    // Kiểm tra localStorage




    
    // Kiểm tra sessionStorage




    

  }

  // Method để test API call thực tế - DISABLED, using Firebase only
  private testActualApiCall(): void {

  }

  // Method để kiểm tra user authentication và role
  private checkUserAuthAndRole(): void {

    
    // Kiểm tra authentication
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    
    if (!token || !isLoggedIn) {
      console.error('User is not authenticated');
      return;
    }
    

    
    // Kiểm tra user info
    const userInfo = this.authService.getUserInfo();

    
    // Kiểm tra role từ các nguồn khác nhau
    const roleFromUserInfo = userInfo?.roles?.[0];
    const roleFromLocalStorage = localStorage.getItem('role');
    const roleFromUserRole = localStorage.getItem('userRole');
    const khauSxFromUserInfo = userInfo?.khau_sx;
    const khauSxFromLocalStorage = localStorage.getItem('khau_sx');
    






    
    // Kiểm tra role hiện tại


    
    // Kiểm tra quyền admin/manager
    const hasAdminRole = this.hasAdminOrManagerRole();

    
    // Kiểm tra xem có phải admin/manager không
    const userRoleLower = this.userRole?.toLowerCase();
    const isAdminOrManager = userRoleLower === 'admin' || 
                            userRoleLower === 'manager' || 
                            userRoleLower === 'administrator';
    


  }

  // Method để kiểm tra API hoạt động
  private checkApiWorking(): void {

  }

  // Method để xử lý thay đổi trang
  onPageChange(event: PageEvent): void {




    
    // Cập nhật page size nếu có thay đổi
    this.pageSize = event.pageSize;
    
    // Cập nhật page index theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      this.pageIndex = event.pageIndex;

      this.updatePagedNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndexInProgress = event.pageIndex;

      this.updatePagedInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"
      this.pageIndex = event.pageIndex;

      this.updatePagedProcessedDrawings();
    }
    

  }

  // Method để refresh data
  refreshData(): void {


    
    // Kiểm tra authentication trước
    const token = this.authService.getToken();
    if (!token) {
      console.warn('No authentication token, cannot refresh data');
      return;
    }
    
    // Load lại tất cả data từ API (chỉ 1 lần gọi)
    this.loadDrawings();
    

  }

  /**
   * Debug method để kiểm tra trạng thái phân loại
   */
  public debugCategorizationStatus(): void {





    
    // Kiểm tra các items có trang_thai_approve trong từng tab
    const newWithApproval = this.drawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    const inProgressWithApproval = this.inProgressDrawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    const processedWithApproval = this.processedDrawings.filter(d => d.trang_thai_approve === 'approved' || d.trang_thai_approve === 'rejected');
    



    
    if (inProgressWithApproval.length > 0) {
      console.warn('⚠️ Found approved/rejected items in IN PROGRESS tab:');
      inProgressWithApproval.forEach(item => {
        console.warn(`  - ${item.kyhieubangve} (trang_thai_approve: ${item.trang_thai_approve})`);
      });
    }
    

  }

  /**
   * Force re-categorize data hiện tại
   */
  public forceRecategorizeData(): void {

    
    // Lấy tất cả data hiện tại
    const allDrawings = [...this.drawings, ...this.inProgressDrawings, ...this.processedDrawings];

    
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
    

    this.debugCategorizationStatus();
  }

  // Method để xử lý search
  onSearch(): void {


    
    // Xử lý search theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"

      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"

      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"

      this.filterProcessedDrawings();
    }
    

  }

  // Method để xử lý clear search
  onSearchClear(): void {


    
    // Clear search theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"

      this.searchTerm = '';
      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"

      this.searchTermInProgress = '';
      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"

      this.searchTermProcessed = '';
      this.filterProcessedDrawings();
    }
    

  }

  // Method để xử lý search input
  onSearchInput(): void {


    
    // Xử lý search input theo tab hiện tại
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"

      this.filterNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"

      this.filterInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã xử lý"

      this.filterProcessedDrawings();
    }
    

  }

  // Method để xử lý search input cho tab đang gia công
  onSearchInputInProgress(): void {

    // Sử dụng method chung
    this.onSearchInput();
  }

  // Method để xử lý search input cho tab đã xử lý
  onSearchInputProcessed(): void {

    // Sử dụng method chung
    this.onSearchInput();
  }

  // Method để xử lý clear search cho tab đang gia công
  onSearchClearInProgress(): void {

    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý clear search cho tab đã xử lý
  onSearchClearProcessed(): void {

    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý search cho tab đang gia công
  onSearchInProgress(): void {

    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý search cho tab đã xử lý
  onSearchProcessed(): void {

    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý clear search cho tab bảng vẽ mới
  onSearchClearNew(): void {

    // Sử dụng method chung
    this.onSearchClear();
  }

  // Method để xử lý search cho tab bảng vẽ mới
  onSearchNew(): void {

    // Sử dụng method chung
    this.onSearch();
  }

  // Method để xử lý search input cho tab bảng vẽ mới
  onSearchInputNew(): void {

    // Sử dụng method chung
    this.onSearchInput();
  }
}
