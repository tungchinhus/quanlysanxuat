import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-data-flow-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Data Flow Debug - Kiểm tra từng bước tạo data</h2>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 1: User Info</h3>
        <p><strong>Email:</strong> {{ userInfo?.email }}</p>
        <p><strong>Firebase UID:</strong> {{ userInfo?.uid }}</p>
        <p><strong>Roles:</strong> {{ userInfo?.roles | json }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 2: User from Firestore</h3>
        <p><strong>ID:</strong> {{ userFromFirestore?.id }}</p>
        <p><strong>Email:</strong> {{ userFromFirestore?.email }}</p>
        <p><strong>khau_sx:</strong> {{ userFromFirestore?.khau_sx }}</p>
        <p><strong>role_name:</strong> {{ userFromFirestore?.role_name }}</p>
        <p><strong>roles:</strong> {{ userFromFirestore?.roles | json }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 3: Role Detection</h3>
        <p><strong>isGiaCongHa:</strong> {{ isGiaCongHa }}</p>
        <p><strong>isGiaCongCao:</strong> {{ isGiaCongCao }}</p>
        <p><strong>isGiaCongEp:</strong> {{ isGiaCongEp }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 4: User Assignments</h3>
        <p><strong>Total Assignments:</strong> {{ allAssignments.length }}</p>
        <div *ngIf="allAssignments.length > 0">
          <h4>Assignment Details:</h4>
          <div *ngFor="let assignment of allAssignments; let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>Assignment {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ assignment.id }}</p>
            <p><strong>user_id:</strong> {{ assignment.user_id }}</p>
            <p><strong>firebase_uid:</strong> {{ assignment.firebase_uid }}</p>
            <p><strong>bangve_id:</strong> {{ assignment.bangve_id }}</p>
            <p><strong>khau_sx:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>bd_ha_id:</strong> {{ assignment.bd_ha_id }}</p>
            <p><strong>bd_cao_id:</strong> {{ assignment.bd_cao_id }}</p>
            <p><strong>bd_ep_id:</strong> {{ assignment.bd_ep_id }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ assignment.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ assignment.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ assignment.trang_thai_bd_ep }}</p>
            <p><strong>trang_thai:</strong> {{ assignment.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 5: Relevant Assignments (Filtered by Role)</h3>
        <p><strong>Relevant Assignments:</strong> {{ relevantAssignments.length }}</p>
        <div *ngIf="relevantAssignments.length > 0">
          <h4>Relevant Assignment Details:</h4>
          <div *ngFor="let assignment of relevantAssignments; let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>Relevant Assignment {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ assignment.id }}</p>
            <p><strong>bangve_id:</strong> {{ assignment.bangve_id }}</p>
            <p><strong>khau_sx:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>bd_ha_id:</strong> {{ assignment.bd_ha_id }}</p>
            <p><strong>bd_cao_id:</strong> {{ assignment.bd_cao_id }}</p>
            <p><strong>bd_ep_id:</strong> {{ assignment.bd_ep_id }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ assignment.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ assignment.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ assignment.trang_thai_bd_ep }}</p>
            <p><strong>trang_thai:</strong> {{ assignment.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 6: Assigned BangVe IDs</h3>
        <p><strong>Assigned BangVe IDs:</strong> {{ assignedBangVeIds | json }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 7: All BangVe from Firebase</h3>
        <p><strong>Total BangVe:</strong> {{ allBangVe.length }}</p>
        <div *ngIf="allBangVe.length > 0">
          <h4>Sample BangVe:</h4>
          <div *ngFor="let bangVe of allBangVe.slice(0, 3); let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>BangVe {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ bangVe.id }}</p>
            <p><strong>kyhieubangve:</strong> {{ bangVe.kyhieubangve }}</p>
            <p><strong>congsuat:</strong> {{ bangVe.congsuat }}</p>
            <p><strong>trang_thai:</strong> {{ bangVe.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 8: Assigned BangVe (Filtered)</h3>
        <p><strong>Assigned BangVe:</strong> {{ assignedBangVe.length }}</p>
        <div *ngIf="assignedBangVe.length > 0">
          <h4>Assigned BangVe Details:</h4>
          <div *ngFor="let bangVe of assignedBangVe; let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>Assigned BangVe {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ bangVe.id }}</p>
            <p><strong>kyhieubangve:</strong> {{ bangVe.kyhieubangve }}</p>
            <p><strong>congsuat:</strong> {{ bangVe.congsuat }}</p>
            <p><strong>trang_thai:</strong> {{ bangVe.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 9: Mapped Data</h3>
        <p><strong>Mapped Data:</strong> {{ mappedData.length }}</p>
        <div *ngIf="mappedData.length > 0">
          <h4>Mapped Data Details:</h4>
          <div *ngFor="let item of mappedData; let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>Mapped Item {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>kyhieuquanday:</strong> {{ item.kyhieuquanday }}</p>
            <p><strong>congsuat:</strong> {{ item.congsuat }}</p>
            <p><strong>trang_thai:</strong> {{ item.trang_thai }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ item.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ item.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ item.trang_thai_bd_ep }}</p>
            <p><strong>khau_sx:</strong> {{ item.khau_sx }}</p>
            <p><strong>bd_ha_id:</strong> {{ item.bd_ha_id }}</p>
            <p><strong>bd_cao_id:</strong> {{ item.bd_cao_id }}</p>
            <p><strong>bd_ep_id:</strong> {{ item.bd_ep_id }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 10: Tab Classification</h3>
        <p><strong>New Tab (quanDays):</strong> {{ quanDays.length }}</p>
        <p><strong>In Progress Tab (inProgressQuanDays):</strong> {{ inProgressQuanDays.length }}</p>
        <p><strong>Completed Tab (completedQuanDays):</strong> {{ completedQuanDays.length }}</p>
        
        <div *ngIf="quanDays.length > 0">
          <h4>New Tab Items:</h4>
          <div *ngFor="let item of quanDays; let i = index" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <h5>New Item {{ i + 1 }}:</h5>
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>kyhieuquanday:</strong> {{ item.kyhieuquanday }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ item.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ item.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ item.trang_thai_bd_ep }}</p>
            <p><strong>khau_sx:</strong> {{ item.khau_sx }}</p>
          </div>
        </div>
      </div>

      <button (click)="runDebug()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Debug
      </button>
    </div>
  `
})
export class DataFlowDebugComponent implements OnInit {
  userInfo: any = null;
  userFromFirestore: any = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false;
  allAssignments: any[] = [];
  relevantAssignments: any[] = [];
  assignedBangVeIds: string[] = [];
  allBangVe: any[] = [];
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

  ngOnInit() {
    this.runDebug();
  }

  async runDebug() {
    try {
      console.log('=== DATA FLOW DEBUG START ===');
      
      // Step 1: Get user info
      this.userInfo = this.authService.getUserInfo();
      console.log('Step 1 - User Info:', this.userInfo);
      
      if (!this.userInfo || !this.userInfo.email) {
        console.error('No user info or email');
        return;
      }

      // Step 2: Get user from Firestore
      this.userFromFirestore = await this.userManagementService.getUserByEmail(this.userInfo.email).pipe(take(1)).toPromise();
      console.log('Step 2 - User from Firestore:', this.userFromFirestore);
      
      if (!this.userFromFirestore) {
        console.error('User not found in Firestore');
        return;
      }

      // Step 3: Determine roles
      const khauSx = (this.userFromFirestore.khau_sx || '').toLowerCase();
      const roleName = (this.userFromFirestore.role_name || '').toLowerCase();
      const rolesArray = this.userFromFirestore.roles || [];
      const rolesString = rolesArray.join(',').toLowerCase();
      
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

      console.log('Step 3 - Role Detection:', {
        isGiaCongHa: this.isGiaCongHa,
        isGiaCongCao: this.isGiaCongCao,
        isGiaCongEp: this.isGiaCongEp
      });

      // Step 4: Get all assignments
      const assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(this.userFromFirestore.id));
      const assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.userInfo.uid);
      
      const allAssignments = [...assignmentsByUserId, ...assignmentsByFirebaseUID];
      this.allAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );
      
      console.log('Step 4 - All Assignments:', this.allAssignments);

      // Step 5: Filter assignments by role
      this.relevantAssignments = this.allAssignments;
      if (this.isGiaCongHa) {
        this.relevantAssignments = this.allAssignments.filter(assignment => {
          const hasBdHaId = assignment.bd_ha_id !== undefined && assignment.bd_ha_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ha' || assignment.khau_sx === 'boidayha';
          return hasBdHaId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongCao) {
        this.relevantAssignments = this.allAssignments.filter(assignment => {
          const hasBdCaoId = assignment.bd_cao_id !== undefined && assignment.bd_cao_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_cao' || assignment.khau_sx === 'boidaycao';
          return hasBdCaoId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongEp) {
        this.relevantAssignments = this.allAssignments.filter(assignment => {
          const hasBdEpId = assignment.bd_ep_id !== undefined && assignment.bd_ep_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ep' || assignment.khau_sx === 'epboiday';
          return hasBdEpId || hasCorrectKhauSx;
        });
      }

      console.log('Step 5 - Relevant Assignments:', this.relevantAssignments);

      // Step 6: Get assigned BangVe IDs
      this.assignedBangVeIds = this.relevantAssignments.map(assignment => assignment.bangve_id);
      console.log('Step 6 - Assigned BangVe IDs:', this.assignedBangVeIds);

      // Step 7: Get all BangVe from Firebase
      this.allBangVe = await this.firebaseBangVeService.getAllBangVe();
      console.log('Step 7 - All BangVe:', this.allBangVe.length);

      // Step 8: Filter assigned BangVe
      this.assignedBangVe = this.allBangVe.filter(bangVe => 
        this.assignedBangVeIds.includes(String(bangVe.id))
      );
      console.log('Step 8 - Assigned BangVe:', this.assignedBangVe);

      // Step 9: Map data
      this.mappedData = this.assignedBangVe.map(bangVe => {
        const assignment = this.relevantAssignments.find(a => String(a.bangve_id) === String(bangVe.id));
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

      console.log('Step 9 - Mapped Data:', this.mappedData);

      // Step 10: Tab classification
      this.quanDays = this.mappedData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          result = (item.trang_thai_bd_ha === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ep');
        }
        return result;
      });

      this.inProgressQuanDays = this.mappedData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          result = (item.trang_thai_bd_ha === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 1) || (item.trang_thai === 1 && item.khau_sx === 'bd_ep');
        }
        return result;
      });

      this.completedQuanDays = this.mappedData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          result = (item.trang_thai_bd_ha === 2) || (item.trang_thai === 2 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 2) || (item.trang_thai === 2 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 2) || (item.trang_thai === 2 && item.khau_sx === 'bd_ep');
        }
        return result;
      });

      console.log('Step 10 - Tab Classification:', {
        newTab: this.quanDays.length,
        inProgressTab: this.inProgressQuanDays.length,
        completedTab: this.completedQuanDays.length
      });

      console.log('=== DATA FLOW DEBUG END ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
