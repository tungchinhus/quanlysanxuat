import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-debug-quan-day-assignment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container" style="padding: 20px; max-width: 1200px; margin: 0 auto;">
      <h2>Debug Quan Day Assignment</h2>
      
      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Current User Info</h3>
        <pre>{{ userInfo | json }}</pre>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>User Role Detection</h3>
        <p><strong>Is Gia Cong Ha:</strong> {{ isGiaCongHa }}</p>
        <p><strong>Is Gia Cong Cao:</strong> {{ isGiaCongCao }}</p>
        <p><strong>Is Gia Cong Ep:</strong> {{ isGiaCongEp }}</p>
        <p><strong>User Role:</strong> {{ userRole | json }}</p>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>User Assignments ({{ userAssignments.length }} items)</h3>
        <pre>{{ userAssignments | json }}</pre>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Assigned BangVe ({{ assignedBangVe.length }} items)</h3>
        <pre>{{ assignedBangVe | json }}</pre>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Mapped Data ({{ mappedData.length }} items)</h3>
        <pre>{{ mappedData | json }}</pre>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Filtered Data by Role</h3>
        <p><strong>New Tab (quanDays):</strong> {{ quanDays.length }} items</p>
        <p><strong>In Progress Tab:</strong> {{ inProgressQuanDays.length }} items</p>
        <p><strong>Completed Tab:</strong> {{ completedQuanDays.length }} items</p>
      </div>

      <button (click)="refreshData()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Refresh Data
      </button>
    </div>
  `,
  styles: [`
    .debug-container {
      font-family: Arial, sans-serif;
    }
    .section {
      background-color: #f8f9fa;
    }
    pre {
      background-color: #f1f1f1;
      padding: 10px;
      border-radius: 3px;
      overflow-x: auto;
      max-height: 300px;
    }
  `]
})
export class DebugQuanDayAssignmentComponent implements OnInit {
  userInfo: any = null;
  userRole: any = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false;
  userAssignments: any[] = [];
  assignedBangVe: any[] = [];
  mappedData: any[] = [];
  quanDays: any[] = [];
  inProgressQuanDays: any[] = [];
  completedQuanDays: any[] = [];

  constructor(
    private authService: AuthService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBangVeService: FirebaseBangVeService,
    private userManagementService: UserManagementFirebaseService
  ) {}

  async ngOnInit() {
    await this.loadDebugData();
  }

  async loadDebugData() {
    try {
      console.log('=== DEBUG LOAD DATA START ===');
      
      // 1. Get current user info
      this.userInfo = this.authService.getUserInfo();
      console.log('Current user info:', this.userInfo);
      
      if (!this.userInfo) {
        console.error('No user info available');
        return;
      }

      // 2. Determine user role
      this.determineUserRole();
      
      // 3. Get user from Firestore
      const userEmail = this.userInfo.email;
      if (!userEmail) {
        console.error('No user email available');
        return;
      }

      const user = await this.userManagementService.getUserByEmail(userEmail).pipe(take(1)).toPromise();
      if (!user) {
        console.error('User not found in Firestore');
        return;
      }

      console.log('Found user in Firestore:', user);

      // 4. Get user assignments by both user_id and firebase_uid
      console.log('Getting user assignments...');
      console.log('User ID from Firestore:', user.id);
      console.log('Firebase UID:', this.userInfo.uid);
      
      const userAssignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(user.id));
      const userAssignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.userInfo.uid);
      
      // Combine both results and remove duplicates
      const allAssignments = [...userAssignmentsByUserId, ...userAssignmentsByFirebaseUID];
      this.userAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );
      
      console.log('User assignments by user_id:', userAssignmentsByUserId.length, 'items');
      console.log('User assignments by firebase_uid:', userAssignmentsByFirebaseUID.length, 'items');
      console.log('Combined user assignments:', this.userAssignments.length, 'items');

      // 5. Filter assignments by role
      let relevantAssignments = this.userAssignments;
      if (this.isGiaCongHa) {
        relevantAssignments = this.userAssignments.filter(assignment => {
          // Chỉ lấy assignments cho bối dây hạ
          const hasBdHaId = assignment.bd_ha_id !== undefined && assignment.bd_ha_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ha' || assignment.khau_sx === 'boidayha';
          return hasBdHaId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongCao) {
        relevantAssignments = this.userAssignments.filter(assignment => {
          // Chỉ lấy assignments cho bối dây cao
          const hasBdCaoId = assignment.bd_cao_id !== undefined && assignment.bd_cao_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_cao' || assignment.khau_sx === 'boidaycao';
          return hasBdCaoId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongEp) {
        relevantAssignments = this.userAssignments.filter(assignment => {
          // Chỉ lấy assignments cho ép bối dây
          const hasBdEpId = assignment.bd_ep_id !== undefined && assignment.bd_ep_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ep' || assignment.khau_sx === 'epboiday';
          return hasBdEpId || hasCorrectKhauSx;
        });
      }

      console.log('Relevant assignments:', relevantAssignments);

      // 6. Get assigned bangve
      const assignedBangVeIds = relevantAssignments.map(assignment => assignment.bangve_id);
      console.log('Assigned bangve IDs:', assignedBangVeIds);

      const allBangVe = await this.firebaseBangVeService.getAllBangVe();
      this.assignedBangVe = allBangVe.filter(bangVe => 
        assignedBangVeIds.includes(String(bangVe.id))
      );
      console.log('Assigned bangve:', this.assignedBangVe);

      // 7. Create assignment map
      const assignmentMap = new Map();
      relevantAssignments.forEach(assignment => {
        assignmentMap.set(assignment.bangve_id, assignment);
      });

      // 8. Map data
      this.mappedData = this.assignedBangVe.map(bangVe => {
        const assignment = assignmentMap.get(String(bangVe.id));
        return {
          id: String(bangVe.id),
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
          trang_thai_bv: bangVe.trang_thai || 0,
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

      console.log('Mapped data:', this.mappedData);

      // 9. Filter by status
      this.quanDays = this.mappedData.filter(item => {
        if (this.isGiaCongHa) {
          return (item.trang_thai_bd_ha === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          return (item.trang_thai_bd_cao === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          return (item.trang_thai_bd_ep === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ep');
        }
        return false;
      });

      this.inProgressQuanDays = this.mappedData.filter(item => {
        if (this.isGiaCongHa) {
          return (item.trang_thai_bd_ha === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          return (item.trang_thai_bd_cao === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          return (item.trang_thai_bd_ep === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ep');
        }
        return false;
      });

      this.completedQuanDays = this.mappedData.filter(item => {
        if (this.isGiaCongHa) {
          return item.bd_ha_id && item.trang_thai_bd_ha === 2;
        } else if (this.isGiaCongCao) {
          return item.bd_cao_id && item.trang_thai_bd_cao === 2;
        } else if (this.isGiaCongEp) {
          return item.bd_ep_id && item.trang_thai_bd_ep === 2;
        }
        return false;
      });

      console.log('Filtered results:');
      console.log('- New tab (quanDays):', this.quanDays.length, 'items');
      console.log('- In-progress tab:', this.inProgressQuanDays.length, 'items');
      console.log('- Completed tab:', this.completedQuanDays.length, 'items');

      console.log('=== DEBUG LOAD DATA END ===');
    } catch (error) {
      console.error('Error loading debug data:', error);
    }
  }

  private determineUserRole(): void {
    if (this.userInfo) {
      this.userRole = {
        id: this.userInfo.id || 0,
        username: this.userInfo.username || '',
        email: this.userInfo.email || '',
        role_name: this.userInfo.role || this.userInfo.role_name || '',
        khau_sx: this.userInfo.khau_sx || ''
      };
      
      const khauSx = this.userRole.khau_sx?.toLowerCase() || '';
      const roleName = this.userRole.role_name?.toLowerCase() || '';
      const userRoles = this.userInfo.roles || [];
      const rolesString = userRoles.join(',').toLowerCase();
      
      this.isGiaCongHa = khauSx.includes('quandayha') || 
                         khauSx.includes('boidayha') || 
                         khauSx.includes('ha') ||
                         roleName.includes('boidayha') ||
                         roleName.includes('quandayha') ||
                         rolesString.includes('boidayha') ||
                         rolesString.includes('quandayha');
      
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
    }
  }

  async refreshData() {
    await this.loadDebugData();
  }
}
