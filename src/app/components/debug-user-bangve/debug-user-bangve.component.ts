import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-debug-user-bangve',
  templateUrl: './debug-user-bangve.component.html',
  styleUrls: ['./debug-user-bangve.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DebugUserBangVeComponent implements OnInit {
  allUserBangVe: any[] = [];
  currentUserAssignments: any[] = [];
  currentUser: any = null;
  currentUserFromFirestore: any = null;
  isLoading = false;

  constructor(
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private userManagementService: UserManagementFirebaseService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    await this.loadDebugData();
    this.isLoading = false;
  }

  async loadDebugData() {
    try {
      console.log('=== DEBUG USER BANGVE DATA ===');
      
      // 1. Lấy thông tin user hiện tại
      this.currentUser = this.authService.getUserInfo();
      console.log('Current user from AuthService:', this.currentUser);
      
      if (!this.currentUser?.email) {
        console.error('No current user email found');
        return;
      }

      // 2. Lấy user từ Firestore
      this.currentUserFromFirestore = await this.userManagementService.getUserByEmail(this.currentUser.email).pipe(take(1)).toPromise();
      console.log('Current user from Firestore:', this.currentUserFromFirestore);

      // 3. Lấy tất cả user_bangve records
      this.allUserBangVe = await this.firebaseUserBangVeService.getAllUserBangVe();
      console.log('All user_bangve records:', this.allUserBangVe);

      // 4. Lấy assignments cho user hiện tại
      if (this.currentUserFromFirestore) {
        const assignmentsByUserId = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(this.currentUserFromFirestore.id));
        const assignmentsByFirebaseUID = await this.firebaseUserBangVeService.getUserBangVeByFirebaseUID(this.currentUser.uid);
        
        // Kết hợp và loại bỏ trùng lặp
        const allAssignments = [...assignmentsByUserId, ...assignmentsByFirebaseUID];
        this.currentUserAssignments = allAssignments.filter((assignment, index, self) => 
          index === self.findIndex(a => a.id === assignment.id)
        );
        
        console.log('Assignments by user_id:', assignmentsByUserId);
        console.log('Assignments by firebase_uid:', assignmentsByFirebaseUID);
        console.log('Combined assignments:', this.currentUserAssignments);
      }

    } catch (error) {
      console.error('Error loading debug data:', error);
    }
  }

  async refreshData() {
    this.isLoading = true;
    await this.loadDebugData();
    this.isLoading = false;
  }
}
