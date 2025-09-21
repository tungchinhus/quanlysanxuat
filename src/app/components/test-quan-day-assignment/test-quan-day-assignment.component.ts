import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-test-quan-day-assignment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-container" style="padding: 20px; max-width: 800px; margin: 0 auto;">
      <h2>Test Quan Day Assignment</h2>
      
      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Current User Info</h3>
        <p><strong>UID:</strong> {{ currentUser?.uid }}</p>
        <p><strong>Email:</strong> {{ currentUser?.email }}</p>
        <p><strong>Roles:</strong> {{ currentUser?.roles | json }}</p>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>User Assignments Test</h3>
        <p><strong>By User ID:</strong> {{ assignmentsByUserId.length }} items</p>
        <p><strong>By Firebase UID:</strong> {{ assignmentsByFirebaseUID.length }} items</p>
        <p><strong>Combined:</strong> {{ combinedAssignments.length }} items</p>
        
        <div *ngIf="combinedAssignments.length > 0">
          <h4>Assignment Details:</h4>
          <div *ngFor="let assignment of combinedAssignments" style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 3px;">
            <p><strong>ID:</strong> {{ assignment.id }}</p>
            <p><strong>User ID:</strong> {{ assignment.user_id }}</p>
            <p><strong>Firebase UID:</strong> {{ assignment.firebase_uid }}</p>
            <p><strong>Bangve ID:</strong> {{ assignment.bangve_id }}</p>
            <p><strong>Khau SX:</strong> {{ assignment.khau_sx }}</p>
            <p><strong>Status:</strong> {{ assignment.status }}</p>
          </div>
        </div>
      </div>

      <div class="section" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
        <h3>Assigned BangVe Test</h3>
        <p><strong>Total BangVe:</strong> {{ allBangVe.length }} items</p>
        <p><strong>Assigned BangVe:</strong> {{ assignedBangVe.length }} items</p>
        
        <div *ngIf="assignedBangVe.length > 0">
          <h4>Assigned BangVe Details:</h4>
          <div *ngFor="let bangve of assignedBangVe" style="margin-bottom: 10px; padding: 10px; background: #f5f5f5; border-radius: 3px;">
            <p><strong>ID:</strong> {{ bangve.id }}</p>
            <p><strong>Ký hiệu:</strong> {{ bangve.kyhieubangve }}</p>
            <p><strong>Trạng thái:</strong> {{ bangve.trang_thai }}</p>
          </div>
        </div>
      </div>

      <button (click)="runTest()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Run Test
      </button>
    </div>
  `,
  styles: [`
    .test-container {
      font-family: Arial, sans-serif;
    }
    .section {
      background-color: #f8f9fa;
    }
  `]
})
export class TestQuanDayAssignmentComponent implements OnInit {
  currentUser: any = null;
  assignmentsByUserId: any[] = [];
  assignmentsByFirebaseUID: any[] = [];
  combinedAssignments: any[] = [];
  allBangVe: any[] = [];
  assignedBangVe: any[] = [];

  constructor(
    private authService: AuthService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBangVeService: FirebaseBangVeService,
    private userManagementService: UserManagementFirebaseService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getUserInfo();
    this.runTest();
  }

  async runTest() {
    try {
      console.log('=== RUNNING QUAN DAY ASSIGNMENT TEST ===');
      
      if (!this.currentUser) {
        console.error('No current user');
        return;
      }

      console.log('Current user:', this.currentUser);

      // Get user from Firestore
      const user = await this.userManagementService.getUserByEmail(this.currentUser.email).pipe(take(1)).toPromise();
      if (!user) {
        console.error('User not found in Firestore');
        return;
      }

      console.log('User from Firestore:', user);

      // Test both lookup methods
      this.assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(user.id));
      this.assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.currentUser.uid);

      // Combine results
      const allAssignments = [...this.assignmentsByUserId, ...this.assignmentsByFirebaseUID];
      this.combinedAssignments = allAssignments.filter((assignment, index, self) => 
        index === self.findIndex(a => a.id === assignment.id)
      );

      console.log('Assignments by user_id:', this.assignmentsByUserId);
      console.log('Assignments by firebase_uid:', this.assignmentsByFirebaseUID);
      console.log('Combined assignments:', this.combinedAssignments);

      // Get all bangve
      this.allBangVe = await this.firebaseBangVeService.getAllBangVe();
      console.log('All bangve:', this.allBangVe.length);

      // Get assigned bangve
      const assignedBangVeIds = this.combinedAssignments.map(assignment => assignment.bangve_id);
      this.assignedBangVe = this.allBangVe.filter(bangVe => 
        assignedBangVeIds.includes(String(bangVe.id))
      );

      console.log('Assigned bangve IDs:', assignedBangVeIds);
      console.log('Assigned bangve:', this.assignedBangVe);

      console.log('=== TEST COMPLETED ===');
    } catch (error) {
      console.error('Test error:', error);
    }
  }
}
