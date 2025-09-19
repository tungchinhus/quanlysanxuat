import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DialogComponent } from '../../components/shared/dialogs/dialog/dialog.component';
import { BoiDayHaPopupComponent } from './boi-day-ha-popup/boi-day-ha-popup.component';
import { BoiDayCaoPopupComponent } from './boi-day-cao-popup/boi-day-cao-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EpBoiDayPopupComponent } from './ep-boi-day-popup/ep-boi-day-popup.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

export interface QuanDayData {
  id: string; // Firebase document ID (string)
  kyhieuquanday: string;
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
  trang_thai: number | null;
  trang_thai_bv: number | null; // Trạng thái tổng thể bảng vẽ: 1=đang xử lý, 2=đã hoàn thành
  trang_thai_bd_cao: number | null; // Trạng thái bối dây cao: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ha: number | null; // Trạng thái bối dây hạ: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ep: number | null; // Trạng thái bối dây ép: 1=đang làm, 2=đã hoàn thành
  bd_ha_id?: number | null; // ID của bối dây hạ từ tbl_bd_ha
  bd_cao_id?: number | null; // ID của bối dây cao từ tbl_bd_cao
  bd_ep_id?: number | null; // ID của bối dây ép từ tbl_bd_ep
  created_at: Date;
  username: string;
  email: string;
  role_name: string;
  khau_sx?: string; // Thêm khau_sx để lưu thông tin khâu sản xuất
}

export interface UserRole {
  id: string | number;
  username: string;
  email: string;
  role_name: string;
  khau_sx?: string;
}

export interface CompletedQuanDayData extends QuanDayData {
  completed_date: Date;
  completed_by: string;
  completion_notes: string;
}

// Interface cho response từ API GetUserAssignedDrawings
export interface GetUserAssignedDrawingsResponse {
  Drawings?: any[]; // API trả về Drawings (chữ D viết hoa)
  drawings?: any[]; // Fallback cho trường hợp chữ thường
  IsAdminOrManager: boolean;
  IsSuccess: boolean;
  Message: string;
  TotalCount: number;
  UserEmail: string;
  UserId: string;
  UserRoles: string[];
}

@Component({
  selector: 'app-ds-quan-day',
  templateUrl: './ds-quan-day.component.html',
  styleUrls: ['./ds-quan-day.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule
]
})
export class DsQuanDayComponent implements OnInit {
  quanDays: QuanDayData[] = [];
  completedQuanDays: CompletedQuanDayData[] = [];
  inProgressQuanDays: QuanDayData[] = []; // Thêm dữ liệu cho tab "Đang gia công"
   
  isAuthenticated: boolean = false;
  currentUser: any = null;
  userRole: UserRole | null = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false; 

  displayedColumns: string[] = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'bd_ha_trong', 'bd_ha_ngoai', 'bd_cao', 'bd_ep', 'bung_bd', 'user_create', 'created_at', 'trang_thai', 'actions'];
  displayedColumnsCompleted: string[] = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'created_at', 'trang_thai', 'actions'];
  
  searchTerm: string = '';
  filteredQuanDays: QuanDayData[] = [];
  pagedNewQuanDays: QuanDayData[] = [];
  
  searchTermCompleted: string = '';
  filteredCompletedQuanDays: CompletedQuanDayData[] = [];
  pagedCompletedQuanDays: CompletedQuanDayData[] = [];

  searchTermInProgress: string = '';
  filteredInProgressQuanDays: QuanDayData[] = [];
  pagedInProgressQuanDays: QuanDayData[] = [];

  pageSize = 5;
  pageIndex = 0;
  pageSizeCompleted = 5;
  pageIndexCompleted = 0;
  currentTabIndex = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: QuanDayData[] = [];

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBangVeService: FirebaseBangVeService,
    private userManagementService: UserManagementFirebaseService
  ) {}

  ngOnInit(): void {
    console.log('DsQuanDayComponent initialized');
    
    // Khởi tạo các array để tránh lỗi undefined
    this.quanDays = [];
    this.completedQuanDays = [];
    this.filteredQuanDays = [];
    this.pagedNewQuanDays = [];
    this.filteredCompletedQuanDays = [];
    this.pagedCompletedQuanDays = [];
    
    this.checkAuthentication();
    
    // Kiểm tra và refresh dữ liệu nếu cần
    setTimeout(() => {
      if (this.shouldRefreshData()) {
        console.log('Auto-refreshing data...');
        this.refreshData();
      }
    }, 2000); // Đợi 2 giây sau khi component khởi tạo
  }

  async checkAuthentication(): Promise<void> {
    try {
      // Kiểm tra xem user có đăng nhập không
      this.isAuthenticated = this.authService.isLoggedIn();
      console.log('checkAuthentication: isLoggedIn =', this.isAuthenticated);
      
      if (this.isAuthenticated) {
        // Lấy thông tin user từ localStorage trực tiếp
        this.currentUser = this.authService.getCurrentUser();
        console.log('checkAuthentication: currentUser from localStorage =', this.currentUser);
        
        if (this.currentUser) {
          // Kiểm tra xem user có user_id không
          const userId = this.getUserId();
          console.log('checkAuthentication: resolved userId =', userId);
          console.log('checkAuthentication: userId details =', {
            id: this.currentUser?.id,
            user_id: this.currentUser?.user_id,
            userId: this.currentUser?.userId,
            Id: this.currentUser?.Id,
            UserId: this.currentUser?.UserId
          });
          
          if (userId !== null && this.isValidUserId(userId)) {
            console.log('checkAuthentication: User ID valid, proceeding with role determination and data loading');
            // Xác định loại user và quyền
            this.determineUserRole();
            
            // Kiểm tra xem user có quyền truy cập trang quấn dây không
            if (this.hasQuanDayAccess()) {
              console.log('checkAuthentication: User has quan day access, loading data...');
              this.loadQuanDayData();
            } else {
              console.log('checkAuthentication: User does not have quan day access, redirecting to unauthorized');
              this.showError('Bạn không có quyền truy cập trang quản lý quấn dây');
              this.router.navigate(['/unauthorized']);
            }
          } else {
            console.error('User không có thông tin user_id hợp lệ:', userId);
            this.debugUserIdIssue();
            this.showError('User không có quyền truy cập dữ liệu này - userId không hợp lệ');
          }
        } else {
          console.error('Không thể lấy thông tin user');
          this.showError('Không thể lấy thông tin người dùng');
        }
      } else {
        console.log('User not authenticated, redirecting to login');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('checkAuthentication: Lỗi kiểm tra xác thực:', error);
      console.error('checkAuthentication: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      this.showError('Lỗi xác thực người dùng');
    }
  }

  // Helper method để lấy thông tin user từ localStorage trực tiếp
  private getUserInfoFromLocalStorage(): any {
    try {
      const userInfo = {
        id: localStorage.getItem('userId') || localStorage.getItem('id'),
        user_id: localStorage.getItem('userId') || localStorage.getItem('id'),
        userId: localStorage.getItem('userId') || localStorage.getItem('id'),
        Id: localStorage.getItem('userId') || localStorage.getItem('id'),
        UserId: localStorage.getItem('userId') || localStorage.getItem('id'),
        username: localStorage.getItem('username') || '',
        email: localStorage.getItem('email') || '',
        firstName: localStorage.getItem('firstName') || '',
        lastName: localStorage.getItem('lastName') || '',
        hoten: localStorage.getItem('hoten') || '',
        role: localStorage.getItem('role') || '',
        khau_sx: localStorage.getItem('khau_sx') || ''
      };
      
      console.log('getUserInfoFromLocalStorage: Retrieved user info:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('getUserInfoFromLocalStorage: Error accessing localStorage:', error);
      return null;
    }
  }

  async loadQuanDayData(): Promise<void> {
    try {
      console.log('=== LOAD QUAN DAY DATA FROM FIREBASE START ===');
      console.log('Current user:', this.currentUser);
      console.log('User role:', this.userRole);
      console.log('Is gia cong ha:', this.isGiaCongHa);
      console.log('Is gia cong cao:', this.isGiaCongCao);
      console.log('Is gia cong ep:', this.isGiaCongEp);
      
      // Lấy email từ currentUser để map với users collection
      const userEmail = this.currentUser?.email;
      console.log('User email for Firestore query:', userEmail);
      console.log('Current user object:', this.currentUser);
      
      if (!userEmail) {
        console.error('Cannot get user email, skipping data load');
        this.quanDays = [];
        this.filteredQuanDays = [];
        this.pagedNewQuanDays = [];
        this.completedQuanDays = [];
        this.filteredCompletedQuanDays = [];
        this.pagedCompletedQuanDays = [];
        return;
      }

      // Lấy dữ liệu từ Firebase
      console.log('=== FIREBASE DATA LOADING ===');
      
      // 1. Lấy user từ email để có user ID từ Firestore users collection
      console.log('Getting user by email from Firestore:', userEmail);
      const user = await this.userManagementService.getUserByEmail(userEmail).pipe(take(1)).toPromise();
      if (!user) {
        console.error('User not found in Firestore users collection, skipping data load');
        this.quanDays = [];
        this.filteredQuanDays = [];
        this.pagedNewQuanDays = [];
        this.completedQuanDays = [];
        this.filteredCompletedQuanDays = [];
        this.pagedCompletedQuanDays = [];
        return;
      }
      console.log('Found user in Firestore:', user);
      
      // 2. Lấy user_bangve assignments cho user hiện tại bằng user ID từ Firestore
      console.log('Loading user_bangve assignments for user ID:', user.id);
      const userAssignments = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(user.id));
      console.log('User assignments loaded:', userAssignments.length, 'items');
      
      // 2. Filter assignments theo role của user (hỗ trợ cả trường mới và legacy)
      let relevantAssignments = userAssignments;
      if (this.isGiaCongHa) {
        relevantAssignments = userAssignments.filter(assignment => 
          // Sử dụng trường mới nếu có, fallback về legacy
          (assignment.bd_ha_id !== undefined && assignment.bd_ha_id !== null) ||
          (assignment.khau_sx === 'bd_ha' || assignment.khau_sx === 'boidayha')
        );
        console.log('Filtered assignments for boidayha:', relevantAssignments.length, 'items');
        console.log('Sample assignments:', relevantAssignments.slice(0, 2));
      } else if (this.isGiaCongCao) {
        relevantAssignments = userAssignments.filter(assignment => 
          // Sử dụng trường mới nếu có, fallback về legacy
          (assignment.bd_cao_id !== undefined && assignment.bd_cao_id !== null) ||
          (assignment.khau_sx === 'bd_cao' || assignment.khau_sx === 'boidaycao')
        );
        console.log('Filtered assignments for boidaycao:', relevantAssignments.length, 'items');
        console.log('Sample assignments:', relevantAssignments.slice(0, 2));
      } else if (this.isGiaCongEp) {
        relevantAssignments = userAssignments.filter(assignment => 
          // Sử dụng trường mới nếu có, fallback về legacy
          (assignment.bd_ep_id !== undefined && assignment.bd_ep_id !== null) ||
          (assignment.khau_sx === 'bd_ep' || assignment.khau_sx === 'epboiday')
        );
        console.log('Filtered assignments for epboiday:', relevantAssignments.length, 'items');
        console.log('Sample assignments:', relevantAssignments.slice(0, 2));
      }
      
      if (relevantAssignments.length === 0) {
        console.log('No relevant assignments found for user role, showing empty data');
        this.quanDays = [];
        this.filteredQuanDays = [];
        this.pagedNewQuanDays = [];
        this.completedQuanDays = [];
        this.filteredCompletedQuanDays = [];
        this.pagedCompletedQuanDays = [];
        return;
      }
      
      // 3. Lấy danh sách bangve_id từ assignments
      const assignedBangVeIds = relevantAssignments.map(assignment => assignment.bangve_id);
      console.log('Assigned bangve IDs:', assignedBangVeIds);
      
      // 4. Lấy chỉ những bảng vẽ được gán cho user
      console.log('Loading assigned bangve from Firebase...');
      const allBangVe = await this.firebaseBangVeService.getAllBangVe();
      const assignedBangVe = allBangVe.filter(bangVe => 
        assignedBangVeIds.includes(String(bangVe.id)) // Đảm bảo cả hai đều là string
      );
      console.log('Assigned bangve loaded:', assignedBangVe.length, 'items');
      
      // 5. Tạo map của assignments để dễ lookup
      const assignmentMap = new Map();
      relevantAssignments.forEach(assignment => {
        assignmentMap.set(assignment.bangve_id, assignment);
      });
      console.log('Assignment map created with', assignmentMap.size, 'entries');
      
      // 6. Map dữ liệu từ Firebase sang QuanDayData format
      const mappedData = assignedBangVe.map(bangVe => {
        const assignment = assignmentMap.get(String(bangVe.id)); // Đảm bảo cả hai đều là string
        return {
          id: String(bangVe.id), // Đảm bảo ID là string
          kyhieuquanday: bangVe.kyhieubangve || '',
          congsuat: bangVe.congsuat || 0,
          tbkt: bangVe.tbkt || '',
          dienap: bangVe.dienap || '',
          soboiday: bangVe.soboiday || '',
          bd_ha_trong: bangVe.bd_ha_trong || '',
          bd_ha_ngoai: bangVe.bd_ha_ngoai || '',
          bd_cao: bangVe.bd_cao || '',
          bd_ep: bangVe.bd_ep || '',
          bung_bd: bangVe.bung_bd || 0,
          user_create: bangVe.user_create || '',
          trang_thai: bangVe.trang_thai || 0,
          trang_thai_bv: bangVe.trang_thai || 0, // Map to trang_thai as fallback
          trang_thai_bd_cao: assignment?.trang_thai_bd_cao !== undefined ? assignment.trang_thai_bd_cao : (assignment?.trang_thai || 0),
          trang_thai_bd_ha: assignment?.trang_thai_bd_ha !== undefined ? assignment.trang_thai_bd_ha : (assignment?.trang_thai || 0),
          trang_thai_bd_ep: assignment?.trang_thai_bd_ep !== undefined ? assignment.trang_thai_bd_ep : (assignment?.trang_thai || 0),
          bd_ha_id: assignment?.bd_ha_id || null,
          bd_cao_id: assignment?.bd_cao_id || null,
          bd_ep_id: assignment?.bd_ep_id || null,
          created_at: bangVe.created_at || new Date(),
          username: bangVe.username || bangVe.user_create || '',
          email: bangVe.email || '',
          role_name: bangVe.role_name || 'user',
          khau_sx: assignment?.khau_sx || ''
        };
      });
      
      console.log('Mapped data length:', mappedData.length);
      console.log('Sample mapped data:', mappedData.slice(0, 2));
      
      // 5. Filter dữ liệu theo quyền của user
      const filteredData = await this.filterDataByUserPermission(mappedData);
      console.log('Data after permission filter:', filteredData.length);
      console.log('Sample filtered data:', filteredData.slice(0, 2));
          
      // 6. Phân loại dữ liệu dựa trên trạng thái trong user_bangve
      console.log('=== DEBUG DATA FILTERING ===');
      console.log('Filtered data before role filtering:', filteredData.length, 'items');
      console.log('Sample filtered data:', filteredData.slice(0, 2));
      console.log('User role flags:', {
        isGiaCongHa: this.isGiaCongHa,
        isGiaCongCao: this.isGiaCongCao,
        isGiaCongEp: this.isGiaCongEp
      });
      
      // Tab "Mới" - hiển thị bảng vẽ được gán cho user nhưng chưa bắt đầu (trang_thai = 0)
      this.quanDays = filteredData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          // Sử dụng trường mới nếu có, fallback về legacy
          result = (item.trang_thai_bd_ha === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ep');
        }
        console.log(`Item ${item.kyhieuquanday}: trang_thai_bd_ha=${item.trang_thai_bd_ha}, trang_thai_bd_cao=${item.trang_thai_bd_cao}, trang_thai_bd_ep=${item.trang_thai_bd_ep}, trang_thai=${item.trang_thai}, khau_sx=${item.khau_sx}, included in new tab: ${result}`);
        return result;
      });

      // Tab "Đang gia công" - hiển thị bảng vẽ đang được thi công (trang_thai = 1)
      this.inProgressQuanDays = filteredData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          // Sử dụng trường mới nếu có, fallback về legacy
          result = (item.trang_thai_bd_ha === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ep');
        }
        console.log(`Item ${item.kyhieuquanday}: trang_thai_bd_ha=${item.trang_thai_bd_ha}, trang_thai_bd_cao=${item.trang_thai_bd_cao}, trang_thai_bd_ep=${item.trang_thai_bd_ep}, trang_thai=${item.trang_thai}, khau_sx=${item.khau_sx}, included in in-progress tab: ${result}`);
        return result;
      });
      
      console.log('Filtered results:');
      console.log('- New tab (quanDays):', this.quanDays.length, 'items');
      console.log('- In-progress tab (inProgressQuanDays):', this.inProgressQuanDays.length, 'items');
      console.log('=== END DEBUG DATA FILTERING ===');
          
      // Tab "Đã hoàn thành" - hiển thị bảng vẽ đã hoàn thành (có bd_ha_id/bd_cao_id và trang_thai = 2)
      let completedData: any[] = [];
      
      if (this.isGiaCongHa) {
        completedData = filteredData.filter(item => item.bd_ha_id && item.trang_thai_bd_ha === 2);
      } else if (this.isGiaCongCao) {
        completedData = filteredData.filter(item => item.bd_cao_id && item.trang_thai_bd_cao === 2);
      } else if (this.isGiaCongEp) {
        completedData = filteredData.filter(item => item.bd_ep_id && item.trang_thai_bd_ep === 2);
      }
      
      this.completedQuanDays = completedData;
      console.log('Completed data length:', this.completedQuanDays.length);
      
      // Cập nhật filtered data cho từng tab
      this.filteredQuanDays = [...this.quanDays];
      this.filteredCompletedQuanDays = [...this.completedQuanDays];
      this.filteredInProgressQuanDays = [...this.inProgressQuanDays];
      
      // Cập nhật paginated data
      this.updatePagedNewQuanDays();
      this.updatePagedCompletedQuanDays();
      this.updatePagedInProgressQuanDays();
      
      // Trigger change detection
      this.cdr.detectChanges();
      
      console.log('=== LOAD QUAN DAY DATA FROM FIREBASE END ===');
      console.log('Final data counts:');
      console.log('- New tab:', this.quanDays.length);
      console.log('- In-progress tab:', this.inProgressQuanDays.length);
      console.log('- Completed tab:', this.completedQuanDays.length);
      console.log('- Paged new:', this.pagedNewQuanDays.length);
      console.log('- Paged in-progress:', this.pagedInProgressQuanDays.length);
      console.log('- Paged completed:', this.pagedCompletedQuanDays.length);
      
    } catch (error) {
      console.error('Error in loadQuanDayData from Firebase:', error);
      this.quanDays = [];
      this.filteredQuanDays = [];
      this.pagedNewQuanDays = [];
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Lấy dữ liệu quấn dây đã hoàn thành từ tbl_user_bangve
  private async loadCompletedQuanDayData(userId: string | number, headers: HttpHeaders): Promise<void> {
    try {
      console.log('loadCompletedQuanDayData: Loading completed data for userId:', userId);
      
      // Sử dụng API mới để lấy dữ liệu từ tbl_user_bangve
      const apiUrl = `${this.commonService.getServerAPIURL()}api/ProductionData/get-completed-bangve`;
      
             const requestBody = {
         user_id: userId,
         // Filter theo các cột trong tbl_user_bangve - lấy tất cả các loại đã hoàn thành
         trang_thai_bd_ha: [2], // 2 = đã hoàn thành bối dây hạ
         trang_thai_bd_cao: [2], // 2 = đã hoàn thành bối dây cao
         trang_thai_bd_ep: [2], // 2 = đã hoàn thành bối dây ép
         // Thêm filter để đảm bảo chỉ lấy dữ liệu của user hiện tại
         status: true, // Chỉ lấy các bản ghi có status = true
         // Thêm filter để chỉ lấy những bản ghi có bd_ha_id hoặc bd_cao_id
         has_bd_id: true
       };

      console.log('loadCompletedQuanDayData: Request body:', requestBody);

      this.http.post<any>(apiUrl, requestBody, { headers })
        .pipe(
          catchError(error => {
            console.error('loadCompletedQuanDayData: API error:', error);
            // Không sử dụng mock data, để API thực tế xử lý
            console.log('loadCompletedQuanDayData: API error - returning empty array');
            return of([]);
          })
        )
        .subscribe(async (data: any) => {
          console.log('loadCompletedQuanDayData: Raw completed data from tbl_user_bangve API:', data);
          console.log('loadCompletedQuanDayData: Data type:', typeof data, 'Is array:', Array.isArray(data));
          console.log('loadCompletedQuanDayData: Raw data keys:', data ? Object.keys(data) : 'No data');
          
          // Xử lý response từ API mới
          let completedData: any[] = [];
          
          if (data && typeof data === 'object') {
            // Nếu response có cấu trúc { data: [], success: true }
            if ('data' in data && Array.isArray(data.data)) {
              completedData = data.data;
            } else if ('bangve' in data && Array.isArray(data.bangve)) {
              completedData = data.bangve;
            } else if (Array.isArray(data)) {
              completedData = data;
            } else if ('result' in data && Array.isArray(data.result)) {
              completedData = data.result;
            }
          }
          
          // Log chi tiết để debug
          console.log('loadCompletedQuanDayData: Response structure:', {
            hasData: !!data,
            dataType: typeof data,
            isArray: Array.isArray(data),
            keys: data ? Object.keys(data) : [],
            completedDataLength: completedData.length
          });
          
          console.log('loadCompletedQuanDayData: Completed data to process:', completedData.length, 'items');
          
          // Map dữ liệu từ tbl_user_bangve sang CompletedQuanDayData
          const mappedData = completedData.map(item => this.mapCompletedBangVeToQuanDay(item));
          console.log('loadCompletedQuanDayData: Mapped data length:', mappedData.length);
          
          // Filter dữ liệu theo quyền của user
          const filteredData = await this.filterDataByUserPermission(mappedData);
          console.log('loadCompletedQuanDayData: Data after permission filter:', filteredData.length);
          
          this.completedQuanDays = filteredData;
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          console.log('loadCompletedQuanDayData: Final completed data length:', this.completedQuanDays.length);
          
          // Debug chi tiết dữ liệu đã hoàn thành
          if (this.completedQuanDays.length > 0) {
            console.log('loadCompletedQuanDayData: Sample completed data:', this.completedQuanDays[0]);
            console.log('loadCompletedQuanDayData: All completed data:', this.completedQuanDays);
          } else {
            console.log('loadCompletedQuanDayData: No completed data found. Checking API response...');
            console.log('loadCompletedQuanDayData: Raw API response:', data);
          }
          
          // Force update UI và change detection
          this.cdr.detectChanges();
          
          // Thêm delay nhỏ để đảm bảo UI được cập nhật
          setTimeout(() => {
            this.cdr.detectChanges();
            console.log('loadCompletedQuanDayData: UI update completed with delay');
          }, 100);
        });

    } catch (error) {
      console.error('loadCompletedQuanDayData: Error loading completed data:', error);
      console.error('loadCompletedQuanDayData: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Không sử dụng mock data, để API thực tế xử lý
      console.log('loadCompletedQuanDayData: Main catch - clearing arrays');
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Helper method để kiểm tra userId có hợp lệ không
  private isValidUserId(userId: string | number | null): boolean {
    console.log('isValidUserId: Checking userId:', userId, 'Type:', typeof userId);
    
    if (userId === null || userId === undefined) {
      console.log('isValidUserId: userId is null or undefined');
      return false;
    }
    
    // Nếu userId là string, kiểm tra xem có phải UUID, Firebase UID, hoặc số hợp lệ không
    if (typeof userId === 'string') {
      console.log('isValidUserId: userId is string, checking if valid UUID, Firebase UID, or numeric');
      
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        console.log('isValidUserId: Valid UUID userId:', userId);
        return true;
      }
      
      // Firebase UID format: alphanumeric string, typically 28 characters
      const firebaseUidRegex = /^[a-zA-Z0-9]{20,30}$/;
      if (firebaseUidRegex.test(userId)) {
        console.log('isValidUserId: Valid Firebase UID userId:', userId);
        return true;
      }
      
      // Nếu không phải UUID hoặc Firebase UID, kiểm tra xem có phải số hợp lệ không
      const numUserId = Number(userId);
      if (!isNaN(numUserId) && numUserId > 0) {
        console.log('isValidUserId: Valid numeric userId:', userId);
        return true;
      }
      
      console.warn('isValidUserId: Invalid string userId:', userId);
      return false;
    }
    
    // Nếu userId là number, kiểm tra xem có > 0 không
    if (typeof userId === 'number') {
      if (userId > 0) {
        console.log('isValidUserId: Valid numeric userId:', userId);
        return true;
      }
      
      console.warn('isValidUserId: Invalid numeric userId:', userId);
      return false;
    }
    
    console.warn('isValidUserId: Invalid userId type:', typeof userId, 'Value:', userId);
    return false;
  }

  // Method để debug vấn đề userId
  private debugUserIdIssue(): void {
    console.log('=== DEBUG USER ID ISSUE ===');
    console.log('Current user object:', this.currentUser);
    console.log('LocalStorage contents:');
    console.log('- userId:', localStorage.getItem('userId'));
    console.log('- id:', localStorage.getItem('id'));
    console.log('- accessToken:', localStorage.getItem('accessToken'));
    console.log('- email:', localStorage.getItem('email'));
    console.log('- username:', localStorage.getItem('username'));
    console.log('- khau_sx:', localStorage.getItem('khau_sx'));
    console.log('- role:', localStorage.getItem('role'));
    
    // Kiểm tra auth service
    console.log('Auth service status:');
    console.log('- isLoggedIn:', this.authService.isLoggedIn());
    console.log('- isTokenValid:', this.authService.isTokenValid());
    console.log('- getToken:', this.authService.getToken());
    
    console.log('=== END DEBUG ===');
  }

  // Helper method để lấy userId một cách nhất quán
  private getUserId(): string | number | null {
    console.log('=== DEBUG GET USER ID ===');
    console.log('Current user object:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('getUserId: currentUser is null');
      return null;
    }
    
    // Log toàn bộ currentUser để debug
    console.log('getUserId: currentUser object:', this.currentUser);
    console.log('getUserId: currentUser keys:', Object.keys(this.currentUser));
    
    // Thử lấy từ các thuộc tính khác nhau theo thứ tự ưu tiên
    let userId = this.currentUser.id || 
                 this.currentUser.user_id || 
                 this.currentUser.userId ||
                 this.currentUser.Id ||
                 this.currentUser.UserId;
    
    console.log('getUserId: Raw userId found:', userId, 'Type:', typeof userId);
    
    // Nếu không tìm thấy từ currentUser, thử lấy từ localStorage trực tiếp
    if (!userId) {
      console.log('getUserId: No userId in currentUser, trying localStorage directly...');
      userId = localStorage.getItem('userId') || localStorage.getItem('id');
      console.log('getUserId: userId from localStorage:', userId);
      console.log('getUserId: localStorage contents:', {
        userId: localStorage.getItem('userId'),
        id: localStorage.getItem('id'),
        accessToken: localStorage.getItem('accessToken'),
        email: localStorage.getItem('email'),
        username: localStorage.getItem('username')
      });
    }
    
    if (userId !== undefined && userId !== null) {
      console.log('getUserId: Found userId:', userId, 'Type:', typeof userId);
      
      // Xử lý trường hợp userId = "0" - chuyển thành số 0
      if (userId === "0") {
        console.log('getUserId: Converting "0" to number 0');
        console.log('=== END DEBUG GET USER ID ===');
        return 0;
      }
      
      // Nếu userId là UUID string, giữ nguyên
      if (typeof userId === 'string' && this.isValidUserId(userId)) {
        console.log('getUserId: Valid userId (UUID or numeric):', userId);
        console.log('=== END DEBUG GET USER ID ===');
        return userId;
      }
      
      // Xử lý trường hợp userId là string number - chuyển thành number
      if (typeof userId === 'string' && !isNaN(Number(userId))) {
        const numUserId = Number(userId);
        console.log('getUserId: Converting string userId to number:', numUserId);
        console.log('=== END DEBUG GET USER ID ===');
        return numUserId;
      }
      
      console.log('getUserId: Returning userId as is:', userId);
      console.log('=== END DEBUG GET USER ID ===');
      return userId;
    }
    
    console.warn('getUserId: Không thể lấy userId từ currentUser hoặc localStorage. Available properties:', {
      id: this.currentUser.id,
      user_id: this.currentUser.user_id,
      userId: this.currentUser.userId,
      Id: this.currentUser.Id,
      UserId: this.currentUser.UserId
    });
    console.log('=== END DEBUG GET USER ID ===');
    return null;
  }

  // Helper method để chuyển đổi userId thành number
  private convertUserIdToNumber(userId: string | number): number {
    console.log('convertUserIdToNumber: Converting userId:', userId, 'Type:', typeof userId);
    
    if (typeof userId === 'number') {
      console.log('convertUserIdToNumber: userId is already a number:', userId);
      return userId;
    }
    
    const numUserId = Number(userId);
    if (isNaN(numUserId)) {
      console.warn('convertUserIdToNumber: Invalid userId string:', userId);
      return 0;
    }
    
    console.log('convertUserIdToNumber: Successfully converted to number:', numUserId);
    return numUserId;
  }

  // Kiểm tra xem user có quyền truy cập trang quấn dây không
  private hasQuanDayAccess(): boolean {
    console.log('=== DEBUG HAS QUAN DAY ACCESS ===');
    console.log('Current user:', this.currentUser);
    
    if (!this.currentUser) {
      console.log('hasQuanDayAccess: No current user');
      return false;
    }

    // Kiểm tra roles array
    const userRoles = this.currentUser?.roles || [];
    const rolesString = userRoles.join(',').toLowerCase();
    
    // Kiểm tra role_name
    const roleName = (this.currentUser?.role || this.currentUser?.role_name || '').toLowerCase();
    
    // Kiểm tra khau_sx
    const khauSx = (this.currentUser?.khau_sx || '').toLowerCase();
    
    // Kiểm tra username
    const username = (this.currentUser?.username || '').toLowerCase();
    
    console.log('hasQuanDayAccess: Checking access with:', {
      userRoles,
      rolesString,
      roleName,
      khauSx,
      username
    });

    // Kiểm tra các role có quyền truy cập trang quấn dây
    const hasAccess = 
      // Kiểm tra roles array
      rolesString.includes('boidayha') ||
      rolesString.includes('boidaycao') ||
      rolesString.includes('quandayha') ||
      rolesString.includes('quandaycao') ||
      rolesString.includes('epboiday') ||
      rolesString.includes('boidayep') ||
      // Kiểm tra role_name
      roleName.includes('boidayha') ||
      roleName.includes('boidaycao') ||
      roleName.includes('quandayha') ||
      roleName.includes('quandaycao') ||
      roleName.includes('epboiday') ||
      roleName.includes('boidayep') ||
      // Kiểm tra khau_sx
      khauSx.includes('boidayha') ||
      khauSx.includes('boidaycao') ||
      khauSx.includes('quandayha') ||
      khauSx.includes('quandaycao') ||
      khauSx.includes('epboiday') ||
      khauSx.includes('boidayep') ||
      khauSx.includes('ha') ||
      khauSx.includes('cao') ||
      khauSx.includes('ep') ||
      // Kiểm tra username
      username.includes('boidayha') ||
      username.includes('boidaycao') ||
      username.includes('quandayha') ||
      username.includes('quandaycao') ||
      username.includes('epboiday') ||
      username.includes('boidayep') ||
      // Admin và manager có quyền truy cập tất cả
      rolesString.includes('admin') ||
      rolesString.includes('manager') ||
      roleName.includes('admin') ||
      roleName.includes('manager');

    console.log('hasQuanDayAccess: Access result:', hasAccess);
    console.log('hasQuanDayAccess: Detailed checks:', {
      rolesStringIncludes: {
        boidayha: rolesString.includes('boidayha'),
        boidaycao: rolesString.includes('boidaycao'),
        quandayha: rolesString.includes('quandayha'),
        quandaycao: rolesString.includes('quandaycao'),
        epboiday: rolesString.includes('epboiday'),
        boidayep: rolesString.includes('boidayep'),
        admin: rolesString.includes('admin'),
        manager: rolesString.includes('manager')
      },
      roleNameIncludes: {
        boidayha: roleName.includes('boidayha'),
        boidaycao: roleName.includes('boidaycao'),
        quandayha: roleName.includes('quandayha'),
        quandaycao: roleName.includes('quandaycao'),
        epboiday: roleName.includes('epboiday'),
        boidayep: roleName.includes('boidayep'),
        admin: roleName.includes('admin'),
        manager: roleName.includes('manager')
      },
      khauSxIncludes: {
        boidayha: khauSx.includes('boidayha'),
        boidaycao: khauSx.includes('boidaycao'),
        quandayha: khauSx.includes('quandayha'),
        quandaycao: khauSx.includes('quandaycao'),
        epboiday: khauSx.includes('epboiday'),
        boidayep: khauSx.includes('boidayep'),
        ha: khauSx.includes('ha'),
        cao: khauSx.includes('cao'),
        ep: khauSx.includes('ep')
      },
      usernameIncludes: {
        boidayha: username.includes('boidayha'),
        boidaycao: username.includes('boidaycao'),
        quandayha: username.includes('quandayha'),
        quandaycao: username.includes('quandaycao'),
        epboiday: username.includes('epboiday'),
        boidayep: username.includes('boidayep')
      }
    });
    console.log('=== END DEBUG HAS QUAN DAY ACCESS ===');
    return hasAccess;
  }

  // Xác định loại user và quyền
  private determineUserRole(): void {
    console.log('=== DEBUG DETERMINE USER ROLE ===');
    console.log('Current user object:', this.currentUser);
    
    if (this.currentUser) {
      this.userRole = {
        id: this.getUserId() || 0,
        username: this.currentUser?.username || '',
        email: this.currentUser?.email || '',
        role_name: this.currentUser?.role || this.currentUser?.role_name || '', // Check both role and role_name
        khau_sx: this.currentUser?.khau_sx || ''
      };
      
      // Xác định loại gia công dựa trên khau_sx, role_name và roles array
      const khauSx = this.userRole.khau_sx?.toLowerCase() || '';
      const roleName = this.userRole.role_name?.toLowerCase() || '';
      const userRoles = this.currentUser?.roles || [];
      const rolesString = userRoles.join(',').toLowerCase();
      
      console.log('determineUserRole: Raw values - khau_sx:', khauSx, 'role_name:', roleName, 'roles:', userRoles);
      console.log('determineUserRole: User role object:', this.userRole);
      
      // Kiểm tra quyền gia công hạ - kiểm tra cả role_name và roles array
      this.isGiaCongHa = khauSx.includes('quandayha') || 
                         khauSx.includes('boidayha') || 
                         khauSx.includes('ha') ||
                         roleName.includes('boidayha') ||
                         roleName.includes('quandayha') ||
                         rolesString.includes('boidayha') ||
                         rolesString.includes('quandayha');
      
      // Kiểm tra quyền gia công cao - kiểm tra cả role_name và roles array
      this.isGiaCongCao = khauSx.includes('quandaycao') || 
                          khauSx.includes('boidaycao') || 
                          khauSx.includes('cao') ||
                          roleName.includes('boidaycao') ||
                          roleName.includes('quandaycao') ||
                          rolesString.includes('boidaycao') ||
                          rolesString.includes('quandaycao');

      this.isGiaCongEp = khauSx.includes('epboiday') || 
                          khauSx.includes('boidayep') || 
                          khauSx.includes('ep') ||
                          roleName.includes('epboiday') ||
                          roleName.includes('boidayep') ||
                          rolesString.includes('epboiday') ||
                          rolesString.includes('boidayep');  
      
      console.log('determineUserRole: User role determined:', this.userRole);
      console.log('determineUserRole: Is gia cong ha:', this.isGiaCongHa);
      console.log('determineUserRole: Is gia cong cao:', this.isGiaCongCao);
      console.log('determineUserRole: Is gia cong ep:', this.isGiaCongEp);
      console.log('determineUserRole: Permission check details:', {
        khauSx: khauSx,
        roleName: roleName,
        roles: userRoles,
        rolesString: rolesString,
        khauSxIncludes: {
          quandayha: khauSx.includes('quandayha'),
          boidayha: khauSx.includes('boidayha'),
          ha: khauSx.includes('ha'),
          quandaycao: khauSx.includes('quandaycao'),
          boidaycao: khauSx.includes('boidaycao'),
          cao: khauSx.includes('cao')
        },
        roleNameIncludes: {
          boidayha: roleName.includes('boidayha'),
          quandayha: roleName.includes('quandayha'),
          boidaycao: roleName.includes('boidaycao'),
          quandaycao: roleName.includes('quandaycao')
        },
        rolesIncludes: {
          boidayha: rolesString.includes('boidayha'),
          quandayha: rolesString.includes('quandayha'),
          boidaycao: rolesString.includes('boidaycao'),
          quandaycao: rolesString.includes('quandaycao')
        }
      });
      console.log('=== END DEBUG DETERMINE USER ROLE ===');
      
      // Log thông tin user để debug
      console.log('Current user info:', {
        id: this.currentUser?.id,
        user_id: this.currentUser?.user_id,
        userId: this.currentUser?.userId,
        Id: this.currentUser?.Id,
        UserId: this.currentUser?.UserId,
        username: this.currentUser?.username,
        role: this.currentUser?.role,
        role_name: this.currentUser?.role_name,
        roles: this.currentUser?.roles,
        khau_sx: this.currentUser?.khau_sx
      });
    }
  }

  // Loại bỏ dữ liệu trùng lặp dựa trên id
  private removeDuplicateData(data: any): any[] {
    // Kiểm tra xem data có phải là array không
    if (!Array.isArray(data)) {
      console.warn('removeDuplicateData: data is not an array, returning empty array. Data type:', typeof data, 'Data:', data);
      return [];
    }
    
    console.log('removeDuplicateData: Input data length:', data.length);
    console.log('removeDuplicateData: Sample input data:', data.slice(0, 2));
    
    const seen = new Set();
    const filteredData = data.filter(item => {
      if (!item || !item.Id) {
        console.warn('removeDuplicateData: Item missing id:', item);
        return false;
      }
      
      const duplicate = seen.has(item.Id);
      seen.add(item.Id);
      return !duplicate;
    });
    
    console.log('removeDuplicateData: Output data length:', filteredData.length);
    console.log('removeDuplicateData: Sample output data:', filteredData.slice(0, 2));
    
    return filteredData;
  }

  // Loại bỏ dữ liệu trùng lặp cho completed data dựa trên id
  private removeDuplicateCompletedData(data: any[]): any[] {
    if (!Array.isArray(data)) {
      console.warn('removeDuplicateCompletedData: data is not an array, returning empty array');
      return [];
    }
    
    console.log('removeDuplicateCompletedData: Input data length:', data.length);
    
    const seen = new Set();
    const filteredData = data.filter(item => {
      if (!item || !item.id) {
        console.warn('removeDuplicateCompletedData: Item missing id:', item);
        return false;
      }
      
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
    
    console.log('removeDuplicateCompletedData: Output data length:', filteredData.length);
    return filteredData;
  }

  // Map dữ liệu từ tbl_bangve sang QuanDayData
  private mapBangVeToQuanDay(bangVe: any): QuanDayData {
    console.log('mapBangVeToQuanDay: Input bangVe:', bangVe);
    
         const mappedData = {
       id: bangVe.id || bangVe.Id,
       kyhieuquanday: bangVe.kyhieubangve || '',
       congsuat: bangVe.congsuat || 0,
       tbkt: bangVe.tbkt || '',
       dienap: bangVe.dienap || '',
       soboiday: bangVe.soboiday || '',
       bd_ha_trong: bangVe.bd_ha_trong || '',
       bd_ha_ngoai: bangVe.bd_ha_ngoai || '',
       bd_cao: bangVe.bd_cao || '',
       bd_ep: bangVe.bd_ep || '',
       bung_bd: bangVe.bung_bd || 0,
       user_create: bangVe.user_create || '',
       trang_thai: bangVe.trang_thai || 0,
       trang_thai_bv: bangVe.trang_thai_bv || 0,
       trang_thai_bd_cao: bangVe.trang_thai_bd_cao || 0,
       trang_thai_bd_ha: bangVe.trang_thai_bd_ha || 0,
       trang_thai_bd_ep: bangVe.trang_thai_bd_ep || 0,
       bd_ha_id: bangVe.bd_ha_id || null,
       bd_cao_id: bangVe.bd_cao_id || null,
       bd_ep_id: bangVe.bd_ep_id || null,
       created_at: new Date(bangVe.created_at) || new Date(),
       username: bangVe.username || '',
       email: bangVe.email || '',
       role_name: bangVe.role_name || '',
       khau_sx: bangVe.khau_sx || ''
     };
    
    console.log('mapBangVeToQuanDay: Mapped data:', mappedData);
    return mappedData;
  }

  // Map dữ liệu đã hoàn thành từ tbl_bangve sang CompletedQuanDayData
  private mapCompletedBangVeToQuanDay(bangVe: any): CompletedQuanDayData {
    console.log('mapCompletedBangVeToQuanDay: Input bangVe:', bangVe);
    
         const mappedData = {
       id: bangVe.id,
       kyhieuquanday: bangVe.kyhieubangve || '',
       congsuat: bangVe.congsuat || 0,
       tbkt: bangVe.tbkt || '',
       dienap: bangVe.dienap || '',
       soboiday: bangVe.soboiday || '',
       bd_ha_trong: bangVe.bd_ha_trong || '',
       bd_ha_ngoai: bangVe.bd_ha_ngoai || '',
       bd_cao: bangVe.bd_cao || '',
       bd_ep: bangVe.bd_ep || '',
       bung_bd: bangVe.bung_bd || 0,
       user_create: bangVe.user_create || '',
       trang_thai: bangVe.trang_thai || 0,
       trang_thai_bv: bangVe.trang_thai_bv || 0,
       trang_thai_bd_cao: bangVe.trang_thai_bd_cao || 0,
       trang_thai_bd_ha: bangVe.trang_thai_bd_ha || 0,
       trang_thai_bd_ep: bangVe.trang_thai_bd_ep || 0,
       bd_ha_id: bangVe.bd_ha_id || null,
       bd_cao_id: bangVe.bd_cao_id || null,
       bd_ep_id: bangVe.bd_ep_id || null,
       created_at: new Date(bangVe.created_at) || new Date(),
       username: bangVe.username || '',
       email: bangVe.email || '',
       role_name: bangVe.role_name || '',
       khau_sx: bangVe.khau_sx || '',
       completed_date: new Date(bangVe.completed_date) || new Date(),
       completed_by: bangVe.completed_by || '',
       completion_notes: bangVe.completion_notes || ''
     };
    
    console.log('mapCompletedBangVeToQuanDay: Mapped data:', mappedData);
    return mappedData;
  }

  // Dữ liệu mẫu fallback
  private getMockData(): QuanDayData[] {
    console.log('getMockData: Generating mock data for current user');
    
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    console.log('getMockData: Current username:', currentUsername);
    
    const mockData = [
             {
         id: '1', 
         kyhieuquanday: 'QD001', 
         congsuat: 212, 
         tbkt: 'Máy biến áp 1', 
         dienap: '220V', 
         soboiday: '5',
         bd_ha_trong: '10mm', 
         bd_ha_ngoai: '12mm', 
         bd_cao: '15mm', 
         bd_ep: '2mm', 
         bung_bd: 1,
         user_create: currentUsername, // Sử dụng username hiện tại
         trang_thai: 0, 
         trang_thai_bv: 1, // Đang xử lý
         trang_thai_bd_cao: 1, // Đang làm bối dây cao
         trang_thai_bd_ha: 0,
         trang_thai_bd_ep: 0,
         bd_ha_id: 5, // Có bd_ha_id nhưng chưa hoàn thành
         bd_cao_id: null,
         bd_ep_id: null,
         created_at: new Date('2025-08-11'), 
         username: currentUsername, // Sử dụng username hiện tại
         email: `${currentUsername}@example.com`, 
         role_name: 'operator',
         khau_sx: 'Khâu 1'
       },
       {
         id: '2', 
         kyhieuquanday: 'QD002', 
         congsuat: 234, 
         tbkt: 'Máy biến áp 2', 
         dienap: '380V', 
         soboiday: '3',
         bd_ha_trong: '8mm', 
         bd_ha_ngoai: '10mm', 
         bd_cao: '12mm', 
         bd_ep: '1.5mm', 
         bung_bd: 1,
         user_create: currentUsername, // Sử dụng username hiện tại
         trang_thai: 0, 
         trang_thai_bv: 1, // Đang xử lý
         trang_thai_bd_cao: 0, // Chưa làm bối dây cao
         trang_thai_bd_ha: 0,
         trang_thai_bd_ep: 0,
         bd_ha_id: null, // Chưa có bd_ha_id
         bd_cao_id: null,
         bd_ep_id: null,
         created_at: new Date('2025-08-11'), 
         username: currentUsername, // Sử dụng username hiện tại
         email: `${currentUsername}@example.com`, 
         role_name: 'operator',
         khau_sx: 'Khâu 2'
       }
    ];
    
    console.log('getMockData: Generated mock data length:', mockData.length);
    return mockData;
  }

  private getMockCompletedData(): CompletedQuanDayData[] {
    console.log('getMockCompletedData: Generating mock completed data for current user');
    
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    console.log('getMockCompletedData: Current username:', currentUsername);
    
    const mockCompletedData = [
             {
         id: '3', 
         kyhieuquanday: 'QD003', 
         congsuat: 100, 
         tbkt: 'Máy biến áp 3', 
         dienap: '220V', 
         soboiday: '5',
         bd_ha_trong: '10mm', 
         bd_ha_ngoai: '12mm', 
         bd_cao: '15mm', 
         bd_ep: '2mm', 
         bung_bd: 1,
         user_create: currentUsername, // Sử dụng username hiện tại
         trang_thai: 2, 
         trang_thai_bv: 2, // Đã hoàn thành
         trang_thai_bd_cao: 2, // Đã hoàn thành bối dây cao
         trang_thai_bd_ha: 2,
         trang_thai_bd_ep: 2,
         bd_ha_id: 6, // Có bd_ha_id và đã hoàn thành
         bd_cao_id: 7, // Có bd_cao_id và đã hoàn thành
         bd_ep_id: 8, // Có bd_ep_id và đã hoàn thành
         created_at: new Date('2025-08-01'), 
         username: currentUsername, // Sử dụng username hiện tại
         email: `${currentUsername}@example.com`, 
         role_name: 'operator',
         khau_sx: 'Khâu 1',
         completed_date: new Date('2025-08-10'), 
         completed_by: currentUsername, // Sử dụng username hiện tại
         completion_notes: 'Hoàn thành đúng tiến độ'
       },
       {
         id: '4', 
         kyhieuquanday: 'QD004', 
         congsuat: 150, 
         tbkt: 'Máy biến áp 4', 
         dienap: '380V', 
         soboiday: '4',
         bd_ha_trong: '12mm', 
         bd_ha_ngoai: '14mm', 
         bd_cao: '18mm', 
         bd_ep: '2.5mm', 
         bung_bd: 1,
         user_create: currentUsername, // Sử dụng username hiện tại
         trang_thai: 2, 
         trang_thai_bv: 2, // Đã hoàn thành
         trang_thai_bd_cao: 2, // Đã hoàn thành bối dây cao
         trang_thai_bd_ha: 2,
         trang_thai_bd_ep: 2,
         bd_ha_id: 9, // Có bd_ha_id và đã hoàn thành
         bd_cao_id: 10, // Có bd_cao_id và đã hoàn thành
         bd_ep_id: 11, // Có bd_ep_id và đã hoàn thành
         created_at: new Date('2025-08-02'), 
         username: currentUsername, // Sử dụng username hiện tại
         email: `${currentUsername}@example.com`, 
         role_name: 'operator',
         khau_sx: 'Khâu 2',
         completed_date: new Date('2025-08-12'), 
         completed_by: currentUsername, // Sử dụng username hiện tại
         completion_notes: 'Hoàn thành đúng tiến độ'
       }
    ];
    
    console.log('getMockCompletedData: Generated mock completed data length:', mockCompletedData.length);
    return mockCompletedData;
  }

  onPageChange(event: PageEvent): void {
    console.log('onPageChange: Page change event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, this.pageIndex, this.pageSize);
    console.log('onPageChange: Updated paged data length:', this.pagedNewQuanDays.length);
  }

  onPageChangeCompleted(event: PageEvent): void {
    console.log('onPageChangeCompleted: Page change event:', event);
    this.pageIndexCompleted = event.pageIndex;
    this.pageSizeCompleted = event.pageSize;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, this.pageIndexCompleted, this.pageSizeCompleted);
    console.log('onPageChangeCompleted: Updated paged data length:', this.pagedCompletedQuanDays.length);
  }

  onPageChangeInProgress(event: PageEvent): void {
    console.log('onPageChangeInProgress: Page change event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagedInProgressQuanDays = this.getPaginatedData(this.filteredInProgressQuanDays, this.pageIndex, this.pageSize);
    console.log('onPageChangeInProgress: Updated paged data length:', this.pagedInProgressQuanDays.length);
  }

  onTabChange(event: MatTabChangeEvent): void {
    console.log('onTabChange: Tab change event:', event);
    this.currentTabIndex = event.index;
    console.log('onTabChange: Current tab index updated to:', this.currentTabIndex);
    
    // Reset pagination về trang đầu tiên khi chuyển tab
    if (this.currentTabIndex === 0) {
      // Tab "Mới"
      this.pageIndex = 0;
      this.updatePagedNewQuanDays();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndex = 0;
      this.updatePagedInProgressQuanDays();
    } else if (this.currentTabIndex === 2) {
      // Tab "Đã hoàn thành"
      this.pageIndexCompleted = 0;
      this.updatePagedCompletedQuanDays();
    }
    
    // Force change detection để đảm bảo UI được cập nhật
    this.cdr.detectChanges();
    
    console.log('onTabChange: Tab change completed, pagination reset');
  }

  // Method để cập nhật paged data cho tab "Mới"
  private updatePagedNewQuanDays(): void {
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, this.pageIndex, this.pageSize);
    console.log('updatePagedNewQuanDays: Updated paged data length:', this.pagedNewQuanDays.length);
  }

  // Method để cập nhật paged data cho tab "Đang gia công"
  private updatePagedInProgressQuanDays(): void {
    this.pagedInProgressQuanDays = this.getPaginatedData(this.filteredInProgressQuanDays, this.pageIndex, this.pageSize);
    console.log('updatePagedInProgressQuanDays: Updated paged data length:', this.pagedInProgressQuanDays.length);
  }

  // Method để cập nhật paged data cho tab "Đã hoàn thành"
  private updatePagedCompletedQuanDays(): void {
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, this.pageIndexCompleted, this.pageSizeCompleted);
    console.log('updatePagedCompletedQuanDays: Updated paged data length:', this.pagedCompletedQuanDays.length);
  }

  searchQuanDays(): void {
    console.log('searchQuanDays: Starting search with term:', this.searchTerm);
    console.log('searchQuanDays: Original quanDays length:', this.quanDays.length);
    
    if (!this.searchTerm.trim()) {
      this.filteredQuanDays = [...this.quanDays];
      console.log('searchQuanDays: Empty search term, showing all data');
    } else {
      this.filteredQuanDays = this.quanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log('searchQuanDays: Filtered data length:', this.filteredQuanDays.length);
    }
    
    this.pageIndex = 0;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
    console.log('searchQuanDays: Paged data length:', this.pagedNewQuanDays.length);
  }

  searchInProgressQuanDays(): void {
    console.log('searchInProgressQuanDays: Starting search with term:', this.searchTermInProgress);
    console.log('searchInProgressQuanDays: Original inProgressQuanDays length:', this.inProgressQuanDays.length);
    
    if (!this.searchTermInProgress.trim()) {
      this.filteredInProgressQuanDays = [...this.inProgressQuanDays];
      console.log('searchInProgressQuanDays: Empty search term, showing all data');
    } else {
      this.filteredInProgressQuanDays = this.inProgressQuanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTermInProgress.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTermInProgress.toLowerCase())
      );
      console.log('searchInProgressQuanDays: Filtered data length:', this.filteredInProgressQuanDays.length);
    }
    
    this.pageIndex = 0;
    this.pagedInProgressQuanDays = this.getPaginatedData(this.filteredInProgressQuanDays, 0, this.pageSize);
    console.log('searchInProgressQuanDays: Paged data length:', this.pagedInProgressQuanDays.length);
  }

  searchCompletedQuanDays(): void {
    console.log('searchCompletedQuanDays: Starting search with term:', this.searchTermCompleted);
    console.log('searchCompletedQuanDays: Original completedQuanDays length:', this.completedQuanDays.length);
    
    if (!this.searchTermCompleted.trim()) {
      this.filteredCompletedQuanDays = [...this.completedQuanDays];
      console.log('searchCompletedQuanDays: Empty search term, showing all data');
    } else {
      this.filteredCompletedQuanDays = this.completedQuanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTermCompleted.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTermCompleted.toLowerCase())
      );
      console.log('searchCompletedQuanDays: Filtered data length:', this.filteredCompletedQuanDays.length);
    }
    
    this.pageIndexCompleted = 0;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
    console.log('searchCompletedQuanDays: Paged data length:', this.pagedCompletedQuanDays.length);
  }

  // Clear search terms
  clearSearch(): void {
    console.log('clearSearch: Clearing search term');
    this.searchTerm = '';
    this.searchQuanDays();
  }

  clearCompletedSearch(): void {
    console.log('clearCompletedSearch: Clearing completed search term');
    this.searchTermCompleted = '';
    this.searchCompletedQuanDays();
  }

  getPaginatedData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    console.log('getPaginatedData: Input - data length:', data.length, 'pageIndex:', pageIndex, 'pageSize:', pageSize);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('getPaginatedData: Empty or invalid data, returning empty array');
      return [];
    }
    
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const result = data.slice(startIndex, endIndex);
    
    console.log('getPaginatedData: Output - startIndex:', startIndex, 'endIndex:', endIndex, 'result length:', result.length);
    console.log('getPaginatedData: Sample result:', result.slice(0, 2));
    
    return result;
  }

  // Xử lý gia công hạ
  onGiaCongHa(element: QuanDayData): void {
    console.log('onGiaCongHa: Processing lower winding for:', element.kyhieuquanday);
    console.log('onGiaCongHa: Element details:', element);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongHa) {
      console.log('onGiaCongHa: User does not have permission for lower winding processing');
      this.showError('Bạn không có quyền thực hiện gia công hạ');
      return;
    }
    
    console.log('onGiaCongHa: Opening lower winding popup...');
    
    // Mở popup bối dây hạ
    const dialogRef = this.dialog.open(BoiDayHaPopupComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('onGiaCongHa: Lower winding data saved successfully:', result.data);
        
        // Nếu lưu thành công và cần reload data
        if (result.reloadData) {
          console.log('Reload data sau khi lưu bối dây hạ thành công');
          this.showSuccess(result.message || 'Thông tin bối dây hạ đã được lưu thành công!');
          
          // Cập nhật trạng thái bối dây hạ trong database trước
          this.updateBoiDayHaStatus(element.id, 1);
          
          // Log thông tin để debug
          console.log('onGiaCongHa: After updating status, element details:', {
            id: element.id,
            kyhieuquanday: element.kyhieuquanday,
            bd_ha_id: element.bd_ha_id,
            trang_thai_bd_ha: element.trang_thai_bd_ha
          });
          
          // Force refresh dữ liệu để đảm bảo cập nhật đúng
          this.forceRefreshData();
          
          // Chuyển sang tab "Đã hoàn thành" để user thấy kết quả
          this.currentTabIndex = 1;
          
          // Đảm bảo tab được chọn đúng
          this.onTabChange({ index: 1, tab: { textLabel: 'Đã hoàn thành' } } as MatTabChangeEvent);
          
          this.cdr.detectChanges();
        } else {
          // Fallback cho trường hợp cũ
          this.showSuccess('Thông tin bối dây hạ đã được lưu thành công!');
          this.refreshData();
        }
      } else {
        console.log('onGiaCongHa: Popup closed without saving or with error');
      }
    });
  }

  // Xử lý gia công cao
  onGiaCongCao(element: QuanDayData): void {
    console.log('onGiaCongCao: Processing upper winding for:', element.kyhieuquanday);
    console.log('onGiaCongCao: Element details:', element);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongCao) {
      console.log('onGiaCongCao: User does not have permission for upper winding processing');
      this.showError('Bạn không có quyền thực hiện gia công cao');
      return;
    }
    
    console.log('onGiaCongCao: Opening upper winding popup...');
    
    // Mở popup bối dây cao
    const dialogRef = this.dialog.open(BoiDayCaoPopupComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('onGiaCongCao: Upper winding data saved successfully:', result.data);
        
        // Nếu lưu thành công và cần reload data
        if (result.reloadData) {
          console.log('Reload data sau khi lưu bối dây cao thành công');
          this.showSuccess(result.message || 'Thông tin bối dây cao đã được lưu thành công!');
          
          // Reload data và chuyển sang tab "Đã hoàn thành"
          this.loadQuanDayData();
          // Lấy userId và headers để gọi loadCompletedQuanDayData
          const userId = this.getUserId();
          const token = this.authService.getToken();
          if (userId && token) {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            });
            this.loadCompletedQuanDayData(userId, headers);
          }
          
          // Chuyển sang tab "Đã hoàn thành" để user thấy kết quả
          this.currentTabIndex = 1;
          this.cdr.detectChanges();
        } else {
          // Fallback cho trường hợp cũ
          this.showSuccess('Thông tin bối dây cao đã được lưu thành công!');
          this.refreshData();
        }
      } else {
        console.log('onGiaCongCao: Popup closed without saving or with error');
      }
    });
  }

  onGiaCongEp(element: QuanDayData): void {
    console.log('onGiaCongEp: Processing winding pressing for:', element.kyhieuquanday);
    console.log('onGiaCongEp: Element details:', element);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongEp) {
      console.log('onGiaCongEp: User does not have permission for winding pressing');
      this.showError('Bạn không có quyền thực hiện gia công ép');
      return;
    }
    
    console.log('onGiaCongEp: Opening winding pressing popup...');
    
    // Mở popup bối dây ép
    const dialogRef = this.dialog.open(EpBoiDayPopupComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('onGiaCongEp: Winding pressing data saved successfully:', result.data);
        
        // Nếu lưu thành công và cần reload data
        if (result.reloadData) {
          console.log('Reload data sau khi lưu bối dây ép thành công');
          this.showSuccess(result.message || 'Thông tin bối dây ép đã được lưu thành công!');
          
          // Cập nhật trạng thái bối dây ép trong database trước
          this.updateBoiDayEpStatus(element.id, 2);
          
          // Log thông tin để debug
          console.log('onGiaCongEp: After updating status, element details:', {
            id: element.id,
            kyhieuquanday: element.kyhieuquanday,
            bd_ep_id: element.bd_ep_id,
            trang_thai_bd_ep: element.trang_thai_bd_ep
          });
          
          // Force refresh dữ liệu để đảm bảo cập nhật đúng
          this.forceRefreshData();
          
          // Chuyển sang tab "Đã hoàn thành" để user thấy kết quả
          this.currentTabIndex = 1;
          
          // Đảm bảo tab được chọn đúng
          this.onTabChange({ index: 1, tab: { textLabel: 'Đã hoàn thành' } } as MatTabChangeEvent);
          
          this.cdr.detectChanges();
        } else {
          // Fallback cho trường hợp cũ
          this.showSuccess('Thông tin bối dây ép đã được lưu thành công!');
          this.refreshData();
        }
      } else {
        console.log('onGiaCongEp: Popup closed without saving or with error');
      }
    });
  }

  private updateBoiDayEpStatus(bangveId: string, status: number): void {
    console.log(`updateBoiDayEpStatus: Updating bối dây ép status for bangveId: ${bangveId} to status: ${status}`);
    
    try {
      const userId = this.getUserId();
      const token = this.authService.getToken();
      
      if (userId && token) {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        
        // Gọi API để cập nhật trạng thái bối dây ép
        const apiUrl = `${this.commonService.getServerAPIURL()}api/UserBangVe/update-boidayep-status`;
        const requestBody = {
          user_id: userId,
          bangve_id: bangveId,
          trang_thai_bd_ep: status
        };
        
        console.log('updateBoiDayEpStatus: Request body:', requestBody);
        
        this.http.post(apiUrl, requestBody, { headers }).subscribe({
          next: (response) => {
            console.log('updateBoiDayEpStatus: Successfully updated status:', response);
          },
          error: (error) => {
            console.error('updateBoiDayEpStatus: Error updating status:', error);
            // Không hiển thị lỗi cho user vì đây là operation background
          }
        });
      } else {
        console.warn('updateBoiDayEpStatus: No userId or token available');
      }
    } catch (error) {
      console.error('updateBoiDayEpStatus: Error:', error);
    }
  }

  // Method để refresh data
  async refreshData(): Promise<void> {
    console.log('refreshData: Starting data refresh...');
    
    try {
      // Kiểm tra lại authentication
      await this.checkAuthentication();
      
      // Nếu vẫn có vấn đề, thử load data trực tiếp
      if (this.isAuthenticated && this.currentUser) {
        console.log('refreshData: Authentication OK, loading data directly...');
        await this.loadQuanDayData();
      } else {
        console.log('refreshData: Authentication failed, cannot load data');
      }
    } catch (error) {
      console.error('refreshData: Error during refresh:', error);
      this.showError('Lỗi khi refresh dữ liệu');
    }
  }

  // Method để force refresh dữ liệu sau khi lưu thông tin bối dây
  private async forceRefreshData(): Promise<void> {
    console.log('forceRefreshData: Starting forced data refresh...');
    
    try {
      // Lấy userId và headers
      const userId = this.getUserId();
      const token = this.authService.getToken();
      
      if (userId && token) {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        
        // Thêm delay nhỏ trước khi refresh để đảm bảo database đã được cập nhật
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reload dữ liệu đã hoàn thành trước (vì đây là dữ liệu cần hiển thị)
        await this.loadCompletedQuanDayData(userId, headers);
        
        // Sau đó reload dữ liệu mới
        await this.loadQuanDayData();
        
        // Force change detection
        this.cdr.detectChanges();
        
        // Thêm delay để đảm bảo UI được cập nhật hoàn toàn
        setTimeout(() => {
          this.cdr.detectChanges();
          console.log('forceRefreshData: Final UI update completed');
        }, 300);
        
        console.log('forceRefreshData: Data refresh completed successfully');
        
        // Log trạng thái dữ liệu sau khi refresh
        this.logDataStatusAfterRefresh();
        
        // Log chi tiết về dữ liệu đã hoàn thành
        console.log('forceRefreshData: Detailed completed data analysis:');
        if (this.completedQuanDays.length > 0) {
          this.completedQuanDays.forEach((item, index) => {
            console.log(`Completed item ${index + 1}:`, {
              id: item.id,
              kyhieuquanday: item.kyhieuquanday,
              bd_ha_id: item.bd_ha_id,
              bd_cao_id: item.bd_cao_id,
              trang_thai_bd_ha: item.trang_thai_bd_ha,
              trang_thai_bd_cao: item.trang_thai_bd_cao,
              completed_date: item.completed_date,
              completion_notes: item.completion_notes
            });
          });
        } else {
          console.log('forceRefreshData: No completed data found after refresh');
        }
      } else {
        console.warn('forceRefreshData: No userId or token available');
        // Fallback to regular refresh
        this.refreshData();
      }
    } catch (error) {
      console.error('forceRefreshData: Error during forced refresh:', error);
      // Fallback to regular refresh
      this.refreshData();
    }
  }

  // Method để log trạng thái dữ liệu sau khi refresh
  private logDataStatusAfterRefresh(): void {
    console.log('=== DATA STATUS AFTER REFRESH ===');
    console.log('quanDays (tab mới):', this.quanDays.length, 'items');
    console.log('inProgressQuanDays (tab đang gia công):', this.inProgressQuanDays.length, 'items');
    console.log('completedQuanDays (tab hoàn thành):', this.completedQuanDays.length, 'items');
    console.log('filteredQuanDays:', this.filteredQuanDays.length, 'items');
    console.log('filteredInProgressQuanDays:', this.filteredInProgressQuanDays.length, 'items');
    console.log('filteredCompletedQuanDays:', this.filteredCompletedQuanDays.length, 'items');
    console.log('pagedNewQuanDays:', this.pagedNewQuanDays.length, 'items');
    console.log('pagedInProgressQuanDays:', this.pagedInProgressQuanDays.length, 'items');
    console.log('pagedCompletedQuanDays:', this.pagedCompletedQuanDays.length, 'items');
    
    if (this.completedQuanDays.length > 0) {
      console.log('Sample completed item:', this.completedQuanDays[0]);
    }
    
    console.log('Current tab index:', this.currentTabIndex);
    console.log('=== END DATA STATUS ===');
  }

  // Method để cập nhật trạng thái bối dây hạ trong database
  private updateBoiDayHaStatus(bangveId: string, status: number): void {
    console.log(`updateBoiDayHaStatus: Updating bối dây hạ status for bangveId: ${bangveId} to status: ${status}`);
    
    try {
      const userId = this.getUserId();
      const token = this.authService.getToken();
      
      if (userId && token) {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });
        
        // Gọi API để cập nhật trạng thái bối dây hạ
        const apiUrl = `${this.commonService.getServerAPIURL()}api/UserBangVe/update-boidayha-status`;
        const requestBody = {
          user_id: userId,
          bangve_id: bangveId,
          trang_thai_bd_ha: status
        };
        
        console.log('updateBoiDayHaStatus: Request body:', requestBody);
        
        this.http.post(apiUrl, requestBody, { headers }).subscribe({
          next: (response) => {
            console.log('updateBoiDayHaStatus: Successfully updated status:', response);
          },
          error: (error) => {
            console.error('updateBoiDayHaStatus: Error updating status:', error);
            // Không hiển thị lỗi cho user vì đây là operation background
          }
        });
      } else {
        console.warn('updateBoiDayHaStatus: No userId or token available');
      }
    } catch (error) {
      console.error('updateBoiDayHaStatus: Error:', error);
    }
  }

  // Method để kiểm tra xem có nên refresh data không
  private shouldRefreshData(): boolean {
    // Refresh nếu không có data hoặc có lỗi
    return this.quanDays.length === 0 && this.inProgressQuanDays.length === 0 && this.completedQuanDays.length === 0;
  }

  // Kiểm tra quyền hiển thị nút gia công
  canShowGiaCongHa(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công hạ khi:
    // 1. User có quyền gia công hạ
    // 2. Trạng thái bối dây hạ chưa hoàn thành (null, 0, hoặc 1)
    const canShow = this.isGiaCongHa && 
           (element.trang_thai_bd_ha === null || element.trang_thai_bd_ha === 0 || element.trang_thai_bd_ha === 1);
    
    console.log('canShowGiaCongHa:', {
      elementId: element.id,
      elementKyHieu: element.kyhieuquanday,
      isGiaCongHa: this.isGiaCongHa,
      trang_thai_bd_ha: element.trang_thai_bd_ha,
      canShow: canShow
    });
    
    return canShow;
  }

  canShowGiaCongCao(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công cao khi:
    // 1. User có quyền gia công cao
    // 2. Trạng thái bối dây cao chưa hoàn thành (null, 0, hoặc 1)
    const canShow = this.isGiaCongCao && 
           (element.trang_thai_bd_cao === null || element.trang_thai_bd_cao === 0 || element.trang_thai_bd_cao === 1);
    
    console.log('canShowGiaCongCao:', {
      elementId: element.id,
      elementKyHieu: element.kyhieuquanday,
      isGiaCongCao: this.isGiaCongCao,
      trang_thai_bd_cao: element.trang_thai_bd_cao,
      canShow: canShow
    });
    
    return canShow;
  }

  // Logout user
  logout(): void {
    try {
      console.log('logout: Starting logout process...');
      this.authService.logout();
      console.log('logout: Logout successful, redirecting to login...');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('logout: Error during logout:', error);
      console.error('logout: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      this.showError('Lỗi khi đăng xuất');
    }
  }

  // Kiểm tra và cập nhật trạng thái xác thực
  private checkAndUpdateAuthStatus(): void {
    const isStillLoggedIn = this.authService.isLoggedIn();
    console.log('checkAndUpdateAuthStatus: Current auth status:', {
      isStillLoggedIn: isStillLoggedIn,
      wasAuthenticated: this.isAuthenticated
    });
    
    if (!isStillLoggedIn && this.isAuthenticated) {
      console.log('checkAndUpdateAuthStatus: User session expired, redirecting to login');
      this.isAuthenticated = false;
      this.currentUser = null;
      this.userRole = null;
      this.router.navigate(['/login']);
    }
  }

  openDialog(message: string): void {
    console.log('openDialog: Opening dialog with message:', message);
    this.dialog.open(DialogComponent, {
      data: { message: message }
    });
  }

  // Method để xử lý lỗi và hiển thị thông báo cho user
  private showError(message: string): void {
    console.error('showError:', message);
    
    // Hiển thị thông báo lỗi cho user
    this._snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Method để xử lý lỗi và hiển thị thông báo thành công
  private showSuccess(message: string): void {
    console.log('showSuccess:', message);
    
    // Hiển thị thông báo thành công cho user
    this._snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  // Lấy tên hiển thị của user
  getUserDisplayName(): string {
    if (!this.currentUser) {
      console.log('getUserDisplayName: currentUser is null, returning Unknown');
      return 'Unknown';
    }
    
    let displayName = 'Unknown';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      displayName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    } else if (this.currentUser.username) {
      displayName = this.currentUser.username;
    } else if (this.currentUser.email) {
      displayName = this.currentUser.email;
    }
    
    console.log('getUserDisplayName: Resolved display name:', displayName, 'from user data:', {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      username: this.currentUser.username,
      email: this.currentUser.email
    });
    
    return displayName;
  }

  // Lấy thông tin role hiển thị
  getRoleDisplayInfo(): string {
    if (!this.userRole) {
      console.log('getRoleDisplayInfo: userRole is null, returning empty string');
      return '';
    }
    
    let roleInfo = '';
    
    if (this.userRole.role_name) {
      roleInfo += this.userRole.role_name;
    }
    
    if (this.userRole.khau_sx) {
      if (roleInfo) roleInfo += ' - ';
      roleInfo += this.userRole.khau_sx;
    }
    
    console.log('getRoleDisplayInfo: Resolved role info:', roleInfo, 'from userRole:', this.userRole);
    
    return roleInfo;
  }

  // Kiểm tra xem user có được assign bảng vẽ này không
  private async checkUserDrawingAssignment(userId: string | number, bangveId: number): Promise<boolean> {
    try {
      console.log('checkUserDrawingAssignment: Checking assignment for userId:', userId, 'bangveId:', bangveId);
      console.log('checkUserDrawingAssignment: userId type:', typeof userId, 'bangveId type:', typeof bangveId);
      
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/CheckUserAssignment`;
      const token = this.authService.getToken();
      
      if (!token) {
        console.log('checkUserDrawingAssignment: No token available');
        return false;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const requestBody = {
        user_id: userId,
        bangve_id: bangveId
      };

      console.log('checkUserDrawingAssignment: Request body:', requestBody);
      console.log('checkUserDrawingAssignment: API URL:', apiUrl);

      const response = await this.http.post<{isAssigned: boolean}>(apiUrl, requestBody, { headers }).toPromise();
      const isAssigned = response?.isAssigned || false;
      
      console.log('checkUserDrawingAssignment: API response:', response, 'isAssigned:', isAssigned);
      console.log('checkUserDrawingAssignment: Response type:', typeof response);
      
      return isAssigned;
      
    } catch (error) {
      console.error('checkUserDrawingAssignment: Error checking assignment:', error);
      console.error('checkUserDrawingAssignment: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return false;
    }
  }

  // Kiểm tra xem user hiện tại có nên thấy dữ liệu không dựa trên database
  public async shouldUserSeeData(): Promise<boolean> {
    if (!this.currentUser) {
      console.log('shouldUserSeeData: currentUser is null');
      return false;
    }
    
    try {
      console.log('shouldUserSeeData: Starting permission check for user:', this.currentUser.username);
      
      // Gọi API api/UserBangVe để lấy tất cả assignment
      const apiUrl = `${this.commonService.getServerAPIURL()}api/UserBangVe`;
      const token = this.authService.getToken();
      
      if (!token) {
        console.log('shouldUserSeeData: No token available');
        return false;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Lấy user_id từ thông tin user hiện tại
      const currentUserId = this.getUserId();
      if (currentUserId === null) {
        console.log('shouldUserSeeData: No user ID available');
        return false;
      }
      
      console.log('shouldUserSeeData: Checking assignment for user ID:', currentUserId);
      console.log('shouldUserSeeData: API URL:', apiUrl);
      
      // Gọi API để lấy tất cả assignment
      const response = await this.http.get<any[]>(apiUrl, { headers }).toPromise();
      console.log('shouldUserSeeData: All assignments from API:', response);
      console.log('shouldUserSeeData: Response type:', typeof response, 'Is array:', Array.isArray(response));
      
      if (!response || !Array.isArray(response)) {
        console.log('shouldUserSeeData: Invalid response from API');
        return false;
      }
      
      console.log('shouldUserSeeData: Total assignments from API:', response.length);
      
      // Kiểm tra xem user hiện tại có được assign bảng vẽ nào không
      const userAssignments = response.filter(assignment => {
        const assignmentUserId = assignment.user_id || assignment.userId;
        if (!assignmentUserId) {
          console.log('shouldUserSeeData: Assignment missing userId:', assignment);
          return false;
        }
        
        console.log('shouldUserSeeData: Comparing assignment userId:', assignmentUserId, 'with current userId:', currentUserId);
        
        // So sánh trực tiếp nếu cùng kiểu dữ liệu
        if (assignmentUserId === currentUserId) {
          console.log('shouldUserSeeData: Direct match found');
          return true;
        }
        
        // So sánh string nếu cần thiết
        const stringMatch = assignmentUserId.toString() === currentUserId.toString();
        console.log('shouldUserSeeData: String comparison result:', stringMatch);
        return stringMatch;
      });
      
      console.log('shouldUserSeeData: User assignments found:', userAssignments);
      console.log('shouldUserSeeData: User assignments count:', userAssignments.length);
      
      const hasAssignment = userAssignments.length > 0;
      console.log(`shouldUserSeeData: User ${this.currentUser.username} (${currentUserId}) has assignment: ${hasAssignment}`);
      
      return hasAssignment;
      
    } catch (error) {
      console.error('shouldUserSeeData: Error checking user assignment:', error);
      console.error('shouldUserSeeData: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Fallback: kiểm tra username và khau_sx
      if (this.currentUser.username || this.currentUser.khau_sx) {
        const username = (this.currentUser.username || '').toLowerCase();
        const khauSx = (this.currentUser.khau_sx || '').toLowerCase();
        
        console.log('shouldUserSeeData: Fallback check - username:', username, 'khau_sx:', khauSx);
        
        // Kiểm tra các pattern phổ biến cho user bối dây
        const usernameChecks = {
          includesBoiday: username.includes('boiday'),
          includesQuanday: username.includes('quanday'),
          exactBoidaycao1: username === 'boidaycao1',
          exactBoidayha1: username === 'boidayha1',
          exactBoidayha: username === 'boidayha'
        };
        
        const khauSxChecks = {
          includesBoiday: khauSx.includes('boiday'),
          includesQuanday: khauSx.includes('quanday'),
          includesHa: khauSx.includes('ha'),
          includesCao: khauSx.includes('cao')
        };
        
        console.log('shouldUserSeeData: Fallback username checks:', usernameChecks);
        console.log('shouldUserSeeData: Fallback khau_sx checks:', khauSxChecks);
        
        if (username.includes('boiday') || 
            username.includes('quanday') ||
            khauSx.includes('boiday') ||
            khauSx.includes('quanday') ||
            khauSx.includes('ha') ||
            khauSx.includes('cao') ||
            username === 'boidaycao1' || 
            username === 'boidayha1' ||
            username === 'boidayha') {
          console.log('shouldUserSeeData: Fallback to username/khau_sx check - allowing access');
          return true;
        }
      }
      
      console.log('shouldUserSeeData: Fallback check failed - denying access');
      return false;
    }
  }

  // Kiểm tra xem user có quyền xem dữ liệu này không
  private hasPermissionToViewData(data: QuanDayData): boolean {
    if (!this.currentUser) {
      console.log('hasPermissionToViewData: currentUser is null');
      return false;
    }
    
    // Nếu dữ liệu đến từ API GetUserAssignedDrawings, 
    // thì mặc định user đã có quyền xem (vì API đã filter rồi)
    // Chỉ cần kiểm tra thêm để đảm bảo an toàn
    const currentUsername = this.currentUser.username;
    const currentUserId = this.getUserId();
    
    const hasPermission = data.username === currentUsername || 
           data.user_create === currentUsername ||
           data.user_create === currentUserId ||
           data.username === currentUserId ||
           data.user_create === (currentUserId?.toString() || '') ||
           data.username === (currentUserId?.toString() || '');
    
    console.log('hasPermissionToViewData: Permission check result:', {
      dataId: data.id,
      dataKyHieu: data.kyhieuquanday,
      dataUsername: data.username,
      dataUserCreate: data.user_create,
      currentUsername: currentUsername,
      currentUserId: currentUserId,
      hasPermission: hasPermission,
      permissionChecks: {
        usernameMatch: data.username === currentUsername,
        userCreateUsernameMatch: data.user_create === currentUsername,
        userCreateIdMatch: data.user_create === currentUserId,
        usernameIdMatch: data.username === currentUserId,
        userCreateIdStringMatch: data.user_create === (currentUserId?.toString() || ''),
        usernameIdStringMatch: data.username === (currentUserId?.toString() || '')
      }
    });
    
    // Kiểm tra xem dữ liệu có được assign cho user này không
    // Dựa trên bảng tbl_user_bangve
    return hasPermission;
  }

  // Filter dữ liệu theo quyền của user
  private async filterDataByUserPermission<T extends QuanDayData>(data: T[]): Promise<T[]> {
    if (!this.currentUser) {
      console.log('filterDataByUserPermission: currentUser is null, returning empty array');
      return [];
    }
    
    try {
      console.log('filterDataByUserPermission: Starting permission filter for user:', this.currentUser.username);
      console.log('filterDataByUserPermission: Input data length:', data.length);
      
      // Nếu data đến từ API GetUserAssignedDrawings, thì mặc định user đã có quyền xem
      // vì API đã filter theo user_id rồi. Không cần filter thêm gì cả.
      if (data.length > 0) {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} - Data from GetUserAssignedDrawings API, returning all data without additional filtering`);
        return data;
      }
      
      // Nếu không có data từ API, kiểm tra xem user có được assign không
      console.log(`filterDataByUserPermission: User ${this.currentUser.username} - No data from API, checking if user has any assignments`);
      
      const shouldSeeData = await this.shouldUserSeeData();
      if (shouldSeeData) {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} được assign trong database, nhưng không có data từ API`);
        // Trả về array rỗng vì không có data từ API
        return [];
      } else {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} không được assign trong database`);
        return [];
      }
      
    } catch (error) {
      console.error('filterDataByUserPermission: Error checking user permission:', error);
      console.error('filterDataByUserPermission: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Fallback: trả về data nếu có lỗi (để tránh mất data)
      console.log('filterDataByUserPermission: Fallback - returning data due to error');
      return data;
    }
  }

  // Kiểm tra xem user có dữ liệu được assign không
  hasAssignedData(): boolean {
    const hasData = this.quanDays.length > 0 || this.inProgressQuanDays.length > 0 || this.completedQuanDays.length > 0;
    
    console.log('hasAssignedData: Check result:', {
      quanDaysLength: this.quanDays.length,
      inProgressQuanDaysLength: this.inProgressQuanDays.length,
      completedQuanDaysLength: this.completedQuanDays.length,
      hasData: hasData
    });
    
    return hasData;
  }

  // Method để hiển thị thông báo khi không có data
  private showNoDataMessage(): void {
    if (this.quanDays.length === 0 && this.inProgressQuanDays.length === 0 && this.completedQuanDays.length === 0) {
      console.log('showNoDataMessage: No data available, showing message');
      // Có thể hiển thị thông báo cho user ở đây
    } else {
      console.log('showNoDataMessage: Data available, quanDays:', this.quanDays.length, 'inProgressQuanDays:', this.inProgressQuanDays.length, 'completedQuanDays:', this.completedQuanDays.length);
    }
  }

  // Method để kiểm tra và hiển thị thông báo cho tab đã hoàn thành
  private checkCompletedTabData(): void {
    console.log('checkCompletedTabData: Checking completed tab data...');
    console.log('checkCompletedTabData: completedQuanDays length:', this.completedQuanDays.length);
    console.log('checkCompletedTabData: filteredCompletedQuanDays length:', this.filteredCompletedQuanDays.length);
    console.log('checkCompletedTabData: pagedCompletedQuanDays length:', this.pagedCompletedQuanDays.length);
    
    if (this.completedQuanDays.length === 0) {
      console.log('checkCompletedTabData: No completed data available');
      // Có thể hiển thị thông báo cho user ở đây
    } else {
      console.log('checkCompletedTabData: Completed data available, sample:', this.completedQuanDays[0]);
    }
  }

  // Method để kiểm tra và hiển thị thông báo cho tab đang gia công
  private checkInProgressTabData(): void {
    console.log('checkInProgressTabData: Checking in progress tab data...');
    console.log('checkInProgressTabData: inProgressQuanDays length:', this.inProgressQuanDays.length);
    console.log('checkInProgressTabData: filteredInProgressQuanDays length:', this.filteredInProgressQuanDays.length);
    console.log('checkInProgressTabData: pagedInProgressQuanDays length:', this.pagedInProgressQuanDays.length);
    
    if (this.inProgressQuanDays.length === 0) {
      console.log('checkInProgressTabData: No in progress data available');
      // Có thể hiển thị thông báo cho user ở đây
    } else {
      console.log('checkInProgressTabData: In progress data available, sample:', this.inProgressQuanDays[0]);
    }
  }

  // Method để kiểm tra trạng thái data source
  private checkDataSourceStatus(): void {
    console.log('checkDataSourceStatus: Current data status:');
    console.log('- quanDays:', this.quanDays.length);
    console.log('- inProgressQuanDays:', this.inProgressQuanDays.length);
    console.log('- completedQuanDays:', this.completedQuanDays.length);
    console.log('- filteredQuanDays:', this.filteredQuanDays.length);
    console.log('- filteredInProgressQuanDays:', this.filteredInProgressQuanDays.length);
    console.log('- filteredCompletedQuanDays:', this.filteredCompletedQuanDays.length);
    console.log('- pagedNewQuanDays:', this.pagedNewQuanDays.length);
    console.log('- pagedInProgressQuanDays:', this.pagedInProgressQuanDays.length);
    console.log('- pagedCompletedQuanDays:', this.pagedCompletedQuanDays.length);
  }

  // Debug method để kiểm tra trạng thái component
  private debugComponentState(): void {
    console.log('=== DEBUG COMPONENT STATE ===');
    console.log('Current user:', this.currentUser);
    console.log('User role:', this.userRole);
    console.log('Is gia cong ha:', this.isGiaCongHa);
    console.log('Is gia cong cao:', this.isGiaCongCao);
    console.log('Is gia cong ep:', this.isGiaCongEp);
    console.log('QuanDays array length:', this.quanDays.length);
    console.log('InProgressQuanDays array length:', this.inProgressQuanDays.length);
    console.log('CompletedQuanDays array length:', this.completedQuanDays.length);
    console.log('FilteredQuanDays array length:', this.filteredQuanDays.length);
    console.log('FilteredInProgressQuanDays array length:', this.filteredInProgressQuanDays.length);
    console.log('FilteredCompletedQuanDays array length:', this.filteredCompletedQuanDays.length);
    console.log('PagedNewQuanDays array length:', this.pagedNewQuanDays.length);
    console.log('PagedInProgressQuanDays array length:', this.pagedInProgressQuanDays.length);
    console.log('PagedCompletedQuanDays array length:', this.pagedCompletedQuanDays.length);
    
    if (this.quanDays.length > 0) {
      console.log('Sample quanDays data:', this.quanDays[0]);
    }
    
    if (this.inProgressQuanDays.length > 0) {
      console.log('Sample inProgressQuanDays data:', this.inProgressQuanDays[0]);
    }
    
    if (this.completedQuanDays.length > 0) {
      console.log('Sample completedQuanDays data:', this.completedQuanDays[0]);
    }
    
    console.log('=== END DEBUG ===');
  }

  // Method để debug toàn bộ quá trình xử lý data
  private debugDataFlow(data: any[], mappedData: any[], filteredData: any[], finalQuanDays: any[], finalCompletedQuanDays: any[]): void {
    console.log('=== DEBUG DATA FLOW ===');
    console.log('1. Raw API data:', {
      length: data.length,
      sample: data.slice(0, 2),
      keys: data.length > 0 ? Object.keys(data[0]) : []
    });
    
    console.log('2. Mapped data:', {
      length: mappedData.length,
      sample: mappedData.slice(0, 2),
      keys: mappedData.length > 0 ? Object.keys(mappedData[0]) : []
    });
    
    console.log('3. After permission filter:', {
      length: filteredData.length,
      sample: filteredData.slice(0, 2)
    });
    
    console.log('4. Final quanDays (tab mới):', {
      length: finalQuanDays.length,
      sample: finalQuanDays.slice(0, 2)
    });
    
    console.log('5. Final inProgressQuanDays (tab đang gia công):', {
      length: this.inProgressQuanDays.length,
      sample: this.inProgressQuanDays.slice(0, 2)
    });
    
    console.log('6. Final completedQuanDays (tab hoàn thành):', {
      length: finalCompletedQuanDays.length,
      sample: finalCompletedQuanDays.slice(0, 2)
    });
    
    console.log('7. Current user info:', {
      username: this.currentUser?.username,
      userId: this.getUserId(),
      khau_sx: this.currentUser?.khau_sx,
      role: this.currentUser?.role
    });
    
    console.log('=== END DEBUG DATA FLOW ===');
  }

  // Method để kiểm tra xem data có được hiển thị đúng trên UI không
  private checkUIDisplayStatus(): void {
    console.log('=== CHECK UI DISPLAY STATUS ===');
    console.log('Data arrays status:');
    console.log('- quanDays:', this.quanDays.length, 'items');
    console.log('- inProgressQuanDays:', this.inProgressQuanDays.length, 'items');
    console.log('- completedQuanDays:', this.completedQuanDays.length, 'items');
    console.log('- filteredQuanDays:', this.filteredQuanDays.length, 'items');
    console.log('- filteredInProgressQuanDays:', this.filteredInProgressQuanDays.length, 'items');
    console.log('- filteredCompletedQuanDays:', this.filteredCompletedQuanDays.length, 'items');
    console.log('- pagedNewQuanDays:', this.pagedNewQuanDays.length, 'items');
    console.log('- pagedInProgressQuanDays:', this.pagedInProgressQuanDays.length, 'items');
    console.log('- pagedCompletedQuanDays:', this.pagedCompletedQuanDays.length, 'items');
    
    // Kiểm tra xem data có được map đúng không
    if (this.quanDays.length > 0) {
      console.log('Sample quanDays item:', this.quanDays[0]);
      console.log('Sample quanDays item keys:', Object.keys(this.quanDays[0]));
    }
    
    if (this.inProgressQuanDays.length > 0) {
      console.log('Sample inProgressQuanDays item:', this.inProgressQuanDays[0]);
      console.log('Sample inProgressQuanDays item keys:', Object.keys(this.inProgressQuanDays[0]));
    }
    
    if (this.completedQuanDays.length > 0) {
      console.log('Sample completedQuanDays item:', this.completedQuanDays[0]);
      console.log('Sample completedQuanDays item keys:', Object.keys(this.completedQuanDays[0]));
    }
    
    // Kiểm tra xem UI có được update không
    console.log('Change detection status:');
    console.log('- ChangeDetectorRef injected:', !!this.cdr);
    
    console.log('=== END CHECK UI DISPLAY STATUS ===');
  }

  // Helper method để lấy drawings data từ API response một cách an toàn
  private extractDrawingsFromResponse(data: any): any[] {
    console.log('extractDrawingsFromResponse: Processing data:', data);
    console.log('extractDrawingsFromResponse: Data type:', typeof data);
    console.log('extractDrawingsFromResponse: Available keys:', data ? Object.keys(data) : 'No data');
    
    if (!data || typeof data !== 'object') {
      console.warn('extractDrawingsFromResponse: Invalid data input');
      return [];
    }
    
    // Kiểm tra cả 2 trường hợp: 'drawings' (chữ thường) và 'Drawings' (chữ hoa)
    if ('drawings' in data && Array.isArray(data.drawings)) {
      console.log('extractDrawingsFromResponse: Found drawings (lowercase):', data.drawings.length, 'items');
      return data.drawings;
    }
    
    if ('Drawings' in data && Array.isArray(data.Drawings)) {
      console.log('extractDrawingsFromResponse: Found Drawings (uppercase):', data.Drawings.length, 'items');
      return data.Drawings;
    }
    
    // Fallback: nếu data trực tiếp là array
    if (Array.isArray(data)) {
      console.log('extractDrawingsFromResponse: Data is directly an array:', data.length, 'items');
      return data;
    }
    
    console.warn('extractDrawingsFromResponse: No drawings array found in response');
    console.warn('extractDrawingsFromResponse: Response structure:', data);
    return [];
  }

  // Helper method để kiểm tra xem API response có thành công không
  private isApiResponseSuccessful(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Kiểm tra cả 2 trường hợp: 'isSuccess' (chữ thường) và 'IsSuccess' (chữ hoa)
    const isSuccess = data.isSuccess || data.IsSuccess;
    
    console.log('isApiResponseSuccessful: Checking response success:', {
      isSuccess: isSuccess,
      hasIsSuccess: 'isSuccess' in data,
      hasIsSuccessUpper: 'IsSuccess' in data,
      dataKeys: Object.keys(data)
    });
    
    return Boolean(isSuccess);
  }

  goToLogin(): void {
    this.router.navigate(['/dang-nhap']);
  }

  openAddQuanDayDialog(): void {
    // TODO: Implement add quan day dialog
    console.log('Add quan day dialog');
  }

  filterQuanDays(): void {
    if (!this.searchTerm.trim()) {
      this.filteredQuanDays = [...this.quanDays];
    } else {
      this.filteredQuanDays = this.quanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.congsuat.toString().includes(this.searchTerm) ||
        item.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.dienap.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.updatePagedData();
  }

  getStatusClass(status: number | null): string {
    if (status === null || status === undefined) return 'status-new';
    switch (status) {
      case 0: return 'status-new';
      case 1: return 'status-processing';
      case 2: return 'status-completed';
      case 3: return 'status-pending';
      case 4: return 'status-approved';
      case 5: return 'status-rejected';
      case 6: return 'status-cancelled';
      default: return 'status-new';
    }
  }

  getStatusText(status: number | null): string {
    if (status === null || status === undefined) return 'Mới';
    switch (status) {
      case 0: return 'Mới';
      case 1: return 'Đang xử lý';
      case 2: return 'Đã hoàn thành';
      case 3: return 'Chờ duyệt';
      case 4: return 'Đã duyệt';
      case 5: return 'Từ chối';
      case 6: return 'Hủy bỏ';
      default: return 'Mới';
    }
  }

  updatePagedData(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedNewQuanDays = this.filteredQuanDays.slice(startIndex, endIndex);
  }

  // Kiểm tra xem user có role admin hoặc manager không
  hasAdminOrManagerRole(): boolean {
    if (!this.currentUser) {
      return false;
    }

    const userRoles = this.currentUser?.roles || [];
    const rolesString = userRoles.join(',').toLowerCase();
    const roleName = (this.currentUser?.role || this.currentUser?.role_name || '').toLowerCase();

    return rolesString.includes('admin') ||
           rolesString.includes('manager') ||
           roleName.includes('admin') ||
           roleName.includes('manager');
  }

}