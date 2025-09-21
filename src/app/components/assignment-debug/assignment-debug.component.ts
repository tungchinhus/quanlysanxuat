import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-assignment-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2>Assignment Debug - Kiểm tra Assignment Mismatch</h2>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Current User Info</h3>
        <p><strong>Email:</strong> {{ userInfo?.email }}</p>
        <p><strong>Firebase UID:</strong> {{ userInfo?.uid }}</p>
        <p><strong>Roles:</strong> {{ userInfo?.roles | json }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>User from Firestore</h3>
        <p><strong>ID:</strong> {{ userFromFirestore?.id }}</p>
        <p><strong>Email:</strong> {{ userFromFirestore?.email }}</p>
        <p><strong>khau_sx:</strong> {{ userFromFirestore?.khau_sx }}</p>
        <p><strong>role_name:</strong> {{ userFromFirestore?.role_name }}</p>
        <p><strong>roles:</strong> {{ userFromFirestore?.roles | json }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Role Detection</h3>
        <p><strong>isGiaCongHa:</strong> {{ isGiaCongHa }}</p>
        <p><strong>isGiaCongCao:</strong> {{ isGiaCongCao }}</p>
        <p><strong>isGiaCongEp:</strong> {{ isGiaCongEp }}</p>
        <p><strong>Expected khau_sx:</strong> {{ expectedKhauSx }}</p>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>All User Assignments</h3>
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
            <p><strong>status:</strong> {{ assignment.status }}</p>
            <p><strong>assigned_at:</strong> {{ assignment.assigned_at | date:'medium' }}</p>
            <p><strong>assigned_by_user_id:</strong> {{ assignment.assigned_by_user_id }}</p>
          </div>
        </div>
      </div>

      <div style="margin: 20px 0; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
        <h3>Assignment Analysis</h3>
        <p><strong>Assignments with khau_sx = 'bd_ha':</strong> {{ assignmentsBdHa.length }}</p>
        <p><strong>Assignments with khau_sx = 'bd_cao':</strong> {{ assignmentsBdCao.length }}</p>
        <p><strong>Assignments with khau_sx = 'bd_ep':</strong> {{ assignmentsBdEp.length }}</p>
        <p><strong>Assignments with bd_ha_id:</strong> {{ assignmentsWithBdHaId.length }}</p>
        <p><strong>Assignments with bd_cao_id:</strong> {{ assignmentsWithBdCaoId.length }}</p>
        <p><strong>Assignments with bd_ep_id:</strong> {{ assignmentsWithBdEpId.length }}</p>
        
        <div *ngIf="mismatchedAssignments.length > 0" style="background: #ffebee; padding: 10px; border: 1px solid #f44336; border-radius: 5px; margin: 10px 0;">
          <h4 style="color: #d32f2f;">⚠️ Mismatched Assignments:</h4>
          <div *ngFor="let assignment of mismatchedAssignments" style="margin: 5px 0; padding: 5px; background: white; border: 1px solid #f44336;">
            <p><strong>Assignment ID:</strong> {{ assignment.id }}</p>
            <p><strong>khau_sx:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>Expected khau_sx:</strong> {{ expectedKhauSx }}</p>
            <p><strong>User ID:</strong> {{ assignment.user_id }}</p>
            <p><strong>Firebase UID:</strong> {{ assignment.firebase_uid }}</p>
          </div>
        </div>
      </div>

      <button (click)="runDebug()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Debug
      </button>
    </div>
  `
})
export class AssignmentDebugComponent implements OnInit {
  userInfo: any = null;
  userFromFirestore: any = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;
  isGiaCongEp: boolean = false;
  expectedKhauSx: string = '';
  allAssignments: any[] = [];
  assignmentsBdHa: any[] = [];
  assignmentsBdCao: any[] = [];
  assignmentsBdEp: any[] = [];
  assignmentsWithBdHaId: any[] = [];
  assignmentsWithBdCaoId: any[] = [];
  assignmentsWithBdEpId: any[] = [];
  mismatchedAssignments: any[] = [];

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
      console.log('=== ASSIGNMENT DEBUG START ===');
      
      // Get user info
      this.userInfo = this.authService.getUserInfo();
      console.log('User Info:', this.userInfo);
      
      if (!this.userInfo || !this.userInfo.email) {
        console.error('No user info or email');
        return;
      }

      // Get user from Firestore
      this.userFromFirestore = await this.userManagementService.getUserByEmail(this.userInfo.email).pipe(take(1)).toPromise();
      console.log('User from Firestore:', this.userFromFirestore);
      
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

      // Determine expected khau_sx
      if (this.isGiaCongHa) {
        this.expectedKhauSx = 'bd_ha';
      } else if (this.isGiaCongCao) {
        this.expectedKhauSx = 'bd_cao';
      } else if (this.isGiaCongEp) {
        this.expectedKhauSx = 'bd_ep';
      }

      console.log('Role Detection:', {
        isGiaCongHa: this.isGiaCongHa,
        isGiaCongCao: this.isGiaCongCao,
        isGiaCongEp: this.isGiaCongEp,
        expectedKhauSx: this.expectedKhauSx
      });

      // Get all assignments
      const assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(this.userFromFirestore.id));
      const assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.userInfo.uid);
      
      const allAssignments = [...assignmentsByUserId, ...assignmentsByFirebaseUID];
      this.allAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );
      
      console.log('All Assignments:', this.allAssignments);

      // Analyze assignments
      this.assignmentsBdHa = this.allAssignments.filter(a => a.khau_sx === 'bd_ha');
      this.assignmentsBdCao = this.allAssignments.filter(a => a.khau_sx === 'bd_cao');
      this.assignmentsBdEp = this.allAssignments.filter(a => a.khau_sx === 'bd_ep');
      
      this.assignmentsWithBdHaId = this.allAssignments.filter(a => a.bd_ha_id !== undefined && a.bd_ha_id !== null);
      this.assignmentsWithBdCaoId = this.allAssignments.filter(a => a.bd_cao_id !== undefined && a.bd_cao_id !== null);
      this.assignmentsWithBdEpId = this.allAssignments.filter(a => a.bd_ep_id !== undefined && a.bd_ep_id !== null);

      // Find mismatched assignments
      this.mismatchedAssignments = this.allAssignments.filter(assignment => {
        if (this.isGiaCongHa && assignment.khau_sx !== 'bd_ha') {
          return true;
        } else if (this.isGiaCongCao && assignment.khau_sx !== 'bd_cao') {
          return true;
        } else if (this.isGiaCongEp && assignment.khau_sx !== 'bd_ep') {
          return true;
        }
        return false;
      });

      console.log('Assignment Analysis:', {
        total: this.allAssignments.length,
        bdHa: this.assignmentsBdHa.length,
        bdCao: this.assignmentsBdCao.length,
        bdEp: this.assignmentsBdEp.length,
        withBdHaId: this.assignmentsWithBdHaId.length,
        withBdCaoId: this.assignmentsWithBdCaoId.length,
        withBdEpId: this.assignmentsWithBdEpId.length,
        mismatched: this.mismatchedAssignments.length
      });

      console.log('=== ASSIGNMENT DEBUG END ===');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
