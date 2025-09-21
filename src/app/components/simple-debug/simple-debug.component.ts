import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-simple-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Simple Debug - Quan Day Assignment</h2>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 1: Current User Info</h3>
        <pre>{{ userInfo | json }}</pre>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 2: User from Firestore</h3>
        <pre>{{ userFromFirestore | json }}</pre>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 3: Role Detection</h3>
        <p><strong>khau_sx:</strong> {{ khauSx }}</p>
        <p><strong>role_name:</strong> {{ roleName }}</p>
        <p><strong>roles array:</strong> {{ rolesArray | json }}</p>
        <p><strong>isGiaCongHa:</strong> {{ isGiaCongHa }}</p>
        <p><strong>isGiaCongCao:</strong> {{ isGiaCongCao }}</p>
        <p><strong>isGiaCongEp:</strong> {{ isGiaCongEp }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 4: User Assignments</h3>
        <p><strong>By User ID ({{ userFromFirestore?.id }}):</strong> {{ assignmentsByUserId.length }} items</p>
        <p><strong>By Firebase UID ({{ userInfo?.uid }}):</strong> {{ assignmentsByFirebaseUID.length }} items</p>
        <p><strong>Combined:</strong> {{ combinedAssignments.length }} items</p>
        
        <div *ngIf="combinedAssignments.length > 0">
          <h4>Assignment Details:</h4>
          <div *ngFor="let assignment of combinedAssignments" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ assignment.id }}</p>
            <p><strong>user_id:</strong> {{ assignment.user_id }}</p>
            <p><strong>firebase_uid:</strong> {{ assignment.firebase_uid }}</p>
            <p><strong>bangve_id:</strong> {{ assignment.bangve_id }}</p>
            <p><strong>khau_sx:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>bd_ha_id:</strong> {{ assignment.bd_ha_id }}</p>
            <p><strong>bd_cao_id:</strong> {{ assignment.bd_cao_id }}</p>
            <p><strong>bd_ep_id:</strong> {{ assignment.bd_ep_id }}</p>
            <p><strong>status:</strong> {{ assignment.status }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 5: Filtered Assignments</h3>
        <p><strong>Relevant Assignments:</strong> {{ relevantAssignments.length }} items</p>
        
        <div *ngIf="relevantAssignments.length > 0">
          <h4>Filtered Assignment Details:</h4>
          <div *ngFor="let assignment of relevantAssignments" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ assignment.id }}</p>
            <p><strong>bangve_id:</strong> {{ assignment.bangve_id }}</p>
            <p><strong>khau_sx:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>bd_ha_id:</strong> {{ assignment.bd_ha_id }}</p>
            <p><strong>bd_cao_id:</strong> {{ assignment.bd_cao_id }}</p>
            <p><strong>bd_ep_id:</strong> {{ assignment.bd_ep_id }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Step 6: Assigned BangVe</h3>
        <p><strong>Assigned BangVe IDs:</strong> {{ assignedBangVeIds | json }}</p>
        <p><strong>Total BangVe in system:</strong> {{ allBangVe.length }} items</p>
        <p><strong>Assigned BangVe:</strong> {{ assignedBangVe.length }} items</p>
        
        <div *ngIf="assignedBangVe.length > 0">
          <h4>Assigned BangVe Details:</h4>
          <div *ngFor="let bangve of assignedBangVe" style="margin: 10px 0; padding: 10px; background: white; border: 1px solid #ddd;">
            <p><strong>ID:</strong> {{ bangve.id }}</p>
            <p><strong>Ký hiệu:</strong> {{ bangve.kyhieubangve }}</p>
            <p><strong>Trạng thái:</strong> {{ bangve.trang_thai }}</p>
          </div>
        </div>
      </div>

      <button (click)="runDebug()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Debug
      </button>
    </div>
  `
})
export class SimpleDebugComponent implements OnInit {
  userInfo: any = null;
  userFromFirestore: any = null;
  khauSx: string = '';
  roleName: string = '';
  rolesArray: string[] = [];
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false;
  assignmentsByUserId: any[] = [];
  assignmentsByFirebaseUID: any[] = [];
  combinedAssignments: any[] = [];
  relevantAssignments: any[] = [];
  assignedBangVeIds: string[] = [];
  allBangVe: any[] = [];
  assignedBangVe: any[] = [];

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
      console.log('=== SIMPLE DEBUG START ===');
      
      // Step 1: Get current user info
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
      this.khauSx = (this.userFromFirestore.khau_sx || '').toLowerCase();
      this.roleName = (this.userFromFirestore.role_name || '').toLowerCase();
      this.rolesArray = this.userFromFirestore.roles || [];
      
      const rolesString = this.rolesArray.join(',').toLowerCase();
      
      this.isGiaCongHa = this.khauSx.includes('quandayha') || 
                        this.khauSx.includes('boidayha') || 
                        this.khauSx.includes('ha') ||
                        this.roleName.includes('boidayha') ||
                        this.roleName.includes('quandayha') ||
                        rolesString.includes('boidayha') ||
                        rolesString.includes('quandayha');
      
      this.isGiaCongCao = this.khauSx.includes('quandaycao') || 
                          this.khauSx.includes('boidaycao') || 
                          this.khauSx.includes('cao') ||
                          this.roleName.includes('boidaycao') ||
                          this.roleName.includes('quandaycao') ||
                          rolesString.includes('boidaycao') ||
                          rolesString.includes('quandaycao');

      this.isGiaCongEp = this.khauSx.includes('epboiday') || 
                        this.khauSx.includes('boidayep') || 
                        this.khauSx.includes('ep') ||
                        this.roleName.includes('epboiday') ||
                        this.roleName.includes('boidayep') ||
                        rolesString.includes('epboiday') ||
                        rolesString.includes('boidayep');
      
      console.log('Step 3 - Role Detection:', {
        khauSx: this.khauSx,
        roleName: this.roleName,
        rolesArray: this.rolesArray,
        isGiaCongHa: this.isGiaCongHa,
        isGiaCongCao: this.isGiaCongCao,
        isGiaCongEp: this.isGiaCongEp
      });

      // Step 4: Get user assignments
      this.assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(this.userFromFirestore.id));
      this.assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.userInfo.uid);
      
      const allAssignments = [...this.assignmentsByUserId, ...this.assignmentsByFirebaseUID];
      this.combinedAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );
      
      console.log('Step 4 - User Assignments:', {
        byUserId: this.assignmentsByUserId.length,
        byFirebaseUID: this.assignmentsByFirebaseUID.length,
        combined: this.combinedAssignments.length
      });

      // Step 5: Filter assignments by role
      this.relevantAssignments = this.combinedAssignments;
      if (this.isGiaCongHa) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          // Chỉ lấy assignments cho bối dây hạ
          const hasBdHaId = assignment.bd_ha_id !== undefined && assignment.bd_ha_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ha' || assignment.khau_sx === 'boidayha';
          return hasBdHaId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongCao) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          // Chỉ lấy assignments cho bối dây cao
          const hasBdCaoId = assignment.bd_cao_id !== undefined && assignment.bd_cao_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_cao' || assignment.khau_sx === 'boidaycao';
          return hasBdCaoId || hasCorrectKhauSx;
        });
      } else if (this.isGiaCongEp) {
        this.relevantAssignments = this.combinedAssignments.filter(assignment => {
          // Chỉ lấy assignments cho ép bối dây
          const hasBdEpId = assignment.bd_ep_id !== undefined && assignment.bd_ep_id !== null;
          const hasCorrectKhauSx = assignment.khau_sx === 'bd_ep' || assignment.khau_sx === 'epboiday';
          return hasBdEpId || hasCorrectKhauSx;
        });
      }
      
      console.log('Step 5 - Filtered Assignments:', this.relevantAssignments.length);

      // Step 6: Get assigned bangve
      this.assignedBangVeIds = this.relevantAssignments.map(assignment => assignment.bangve_id);
      this.allBangVe = await this.firebaseBangVeService.getAllBangVe();
      this.assignedBangVe = this.allBangVe.filter(bangVe => 
        this.assignedBangVeIds.includes(String(bangVe.id))
      );
      
      console.log('Step 6 - Assigned BangVe:', {
        assignedIds: this.assignedBangVeIds,
        totalBangVe: this.allBangVe.length,
        assignedBangVe: this.assignedBangVe.length
      });

      console.log('=== SIMPLE DEBUG END ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
