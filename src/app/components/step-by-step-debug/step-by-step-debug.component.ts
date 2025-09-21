import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-step-by-step-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Step-by-Step Debug - DS Quan Day Display</h2>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 1: User Info & Role Detection</h3>
        <p><strong>User Email:</strong> {{ userInfo?.email }}</p>
        <p><strong>Firebase UID:</strong> {{ userInfo?.uid }}</p>
        <p><strong>User from Firestore ID:</strong> {{ userFromFirestore?.id }}</p>
        <p><strong>khau_sx:</strong> {{ userFromFirestore?.khau_sx }}</p>
        <p><strong>isGiaCongHa:</strong> {{ isGiaCongHa }}</p>
        <p><strong>isGiaCongCao:</strong> {{ isGiaCongCao }}</p>
        <p><strong>isGiaCongEp:</strong> {{ isGiaCongEp }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 2: User Assignments</h3>
        <p><strong>Total Assignments:</strong> {{ combinedAssignments.length }}</p>
        <div *ngIf="combinedAssignments.length > 0">
          <h4>Assignment Details:</h4>
          <div *ngFor="let assignment of combinedAssignments" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
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
        <h3>Step 3: Filtered Assignments by Role</h3>
        <p><strong>Relevant Assignments:</strong> {{ relevantAssignments.length }}</p>
        <div *ngIf="relevantAssignments.length > 0">
          <h4>Filtered Assignment Details:</h4>
          <div *ngFor="let assignment of relevantAssignments" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
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
        <h3>Step 4: Assigned BangVe</h3>
        <p><strong>Assigned BangVe IDs:</strong> {{ assignedBangVeIds | json }}</p>
        <p><strong>Total BangVe in system:</strong> {{ allBangVe.length }}</p>
        <p><strong>Assigned BangVe:</strong> {{ assignedBangVe.length }}</p>
        <div *ngIf="assignedBangVe.length > 0">
          <h4>Assigned BangVe Details:</h4>
          <div *ngFor="let bangve of assignedBangVe" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ bangve.id }}</p>
            <p><strong>Ký hiệu:</strong> {{ bangve.kyhieubangve }}</p>
            <p><strong>Trạng thái:</strong> {{ bangve.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 5: Mapped Data</h3>
        <p><strong>Mapped Data Length:</strong> {{ mappedData.length }}</p>
        <div *ngIf="mappedData.length > 0">
          <h4>Mapped Data Details:</h4>
          <div *ngFor="let item of mappedData" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>Ký hiệu:</strong> {{ item.kyhieuquanday }}</p>
            <p><strong>khau_sx:</strong> {{ item.khau_sx }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ item.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ item.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ item.trang_thai_bd_ep }}</p>
            <p><strong>trang_thai:</strong> {{ item.trang_thai }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 6: Tab Classification</h3>
        <p><strong>New Tab (quanDays):</strong> {{ newTabData.length }}</p>
        <p><strong>In-Progress Tab (inProgressQuanDays):</strong> {{ inProgressTabData.length }}</p>
        <p><strong>Completed Tab (completedQuanDays):</strong> {{ completedTabData.length }}</p>
        
        <div *ngIf="newTabData.length > 0">
          <h4>New Tab Data:</h4>
          <div *ngFor="let item of newTabData" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ item.id }}</p>
            <p><strong>Ký hiệu:</strong> {{ item.kyhieuquanday }}</p>
            <p><strong>khau_sx:</strong> {{ item.khau_sx }}</p>
            <p><strong>trang_thai_bd_ha:</strong> {{ item.trang_thai_bd_ha }}</p>
            <p><strong>trang_thai_bd_cao:</strong> {{ item.trang_thai_bd_cao }}</p>
            <p><strong>trang_thai_bd_ep:</strong> {{ item.trang_thai_bd_ep }}</p>
            <p><strong>trang_thai:</strong> {{ item.trang_thai }}</p>
          </div>
        </div>
      </div>

      <button (click)="runDebug()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Debug
      </button>
    </div>
  `
})
export class StepByStepDebugComponent implements OnInit {
  userInfo: any = null;
  userFromFirestore: any = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false;
  combinedAssignments: any[] = [];
  relevantAssignments: any[] = [];
  assignedBangVeIds: string[] = [];
  allBangVe: any[] = [];
  assignedBangVe: any[] = [];
  mappedData: any[] = [];
  newTabData: any[] = [];
  inProgressTabData: any[] = [];
  completedTabData: any[] = [];

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
      console.log('=== STEP BY STEP DEBUG START ===');
      
      // Step 1: Get user info and role detection
      this.userInfo = this.authService.getUserInfo();
      console.log('Step 1 - User Info:', this.userInfo);
      
      if (!this.userInfo || !this.userInfo.email) {
        console.error('No user info or email');
        return;
      }

      this.userFromFirestore = await this.userManagementService.getUserByEmail(this.userInfo.email).pipe(take(1)).toPromise();
      console.log('Step 1 - User from Firestore:', this.userFromFirestore);
      
      if (!this.userFromFirestore) {
        console.error('User not found in Firestore');
        return;
      }

      // Determine roles
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
      
      console.log('Step 1 - Role Detection:', {
        khauSx,
        roleName,
        rolesArray,
        isGiaCongHa: this.isGiaCongHa,
        isGiaCongCao: this.isGiaCongCao,
        isGiaCongEp: this.isGiaCongEp
      });

      // Step 2: Get user assignments
      const assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(this.userFromFirestore.id));
      const assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.userInfo.uid);
      
      const allAssignments = [...assignmentsByUserId, ...assignmentsByFirebaseUID];
      this.combinedAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );
      
      console.log('Step 2 - User Assignments:', {
        byUserId: assignmentsByUserId.length,
        byFirebaseUID: assignmentsByFirebaseUID.length,
        combined: this.combinedAssignments.length
      });

      // Step 3: Filter assignments by role
      this.relevantAssignments = this.combinedAssignments;
      if (this.isGiaCongHa) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          const hasBdHaId = assignment.bd_ha_id !== undefined && assignment.bd_ha_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ha' || assignment.khau_sx === 'boidayha';
          return hasBdHaId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongCao) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          const hasBdCaoId = assignment.bd_cao_id !== undefined && assignment.bd_cao_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_cao' || assignment.khau_sx === 'boidaycao';
          return hasBdCaoId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongEp) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          const hasBdEpId = assignment.bd_ep_id !== undefined && assignment.bd_ep_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ep' || assignment.khau_sx === 'epboiday';
          return hasBdEpId || hasCorrectKhauSx;
        });
      }
      
      console.log('Step 3 - Filtered Assignments:', this.relevantAssignments.length);

      // Step 4: Get assigned bangve
      this.assignedBangVeIds = this.relevantAssignments.map(assignment => assignment.bangve_id);
      this.allBangVe = await this.firebaseBangVeService.getAllBangVe();
      this.assignedBangVe = this.allBangVe.filter(bangVe => 
        this.assignedBangVeIds.includes(String(bangVe.id))
      );
      
      console.log('Step 4 - Assigned BangVe:', {
        assignedIds: this.assignedBangVeIds,
        totalBangVe: this.allBangVe.length,
        assignedBangVe: this.assignedBangVe.length
      });

      // Step 5: Map data
      const assignmentMap = new Map();
      this.relevantAssignments.forEach(assignment => {
        assignmentMap.set(assignment.bangve_id, assignment);
      });
      
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
      
      console.log('Step 5 - Mapped Data:', this.mappedData.length);

      // Step 6: Tab classification
      this.newTabData = this.mappedData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          result = (item.trang_thai_bd_ha === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ha');
        } else if (this.isGiaCongCao) {
          result = (item.trang_thai_bd_cao === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_cao');
        } else if (this.isGiaCongEp) {
          result = (item.trang_thai_bd_ep === 0) || (item.trang_thai === 0 && item.khau_sx === 'bd_ep');
        }
        console.log(`Item ${item.kyhieuquanday}: trang_thai_bd_ha=${item.trang_thai_bd_ha}, trang_thai_bd_cao=${item.trang_thai_bd_cao}, trang_thai_bd_ep=${item.trang_thai_bd_ep}, trang_thai=${item.trang_thai}, khau_sx=${item.khau_sx}, included in new tab: ${result}`);
        return result;
      });

      this.inProgressTabData = this.mappedData.filter(item => {
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

      this.completedTabData = this.mappedData.filter(item => {
        let result = false;
        if (this.isGiaCongHa) {
          result = item.bd_ha_id && item.trang_thai_bd_ha === 2;
        } else if (this.isGiaCongCao) {
          result = item.bd_cao_id && item.trang_thai_bd_cao === 2;
        } else if (this.isGiaCongEp) {
          result = item.bd_ep_id && item.trang_thai_bd_ep === 2;
        }
        return result;
      });
      
      console.log('Step 6 - Tab Classification:', {
        newTab: this.newTabData.length,
        inProgressTab: this.inProgressTabData.length,
        completedTab: this.completedTabData.length
      });

      console.log('=== STEP BY STEP DEBUG END ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
