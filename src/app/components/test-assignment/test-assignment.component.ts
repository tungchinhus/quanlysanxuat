import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseUserBangVeService } from '../../services/firebase-user-bangve.service';
import { FirebaseBangVeService } from '../../services/firebase-bangve.service';
import { UserManagementFirebaseService } from '../../services/user-management-firebase.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-test-assignment',
  templateUrl: './test-assignment.component.html',
  styleUrls: ['./test-assignment.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ]
})
export class TestAssignmentComponent implements OnInit {
  testForm: FormGroup;
  allUsers: any[] = [];
  allBangVe: any[] = [];
  isLoading = false;
  result: any = null;

  constructor(
    private fb: FormBuilder,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseBangVeService: FirebaseBangVeService,
    private userManagementService: UserManagementFirebaseService,
    private authService: AuthService
  ) {
    this.testForm = this.fb.group({
      userId: ['', Validators.required],
      bangveId: ['', Validators.required],
      khauSx: ['bd_ha', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Load users
      const users = await this.userManagementService.getUsers().pipe(take(1)).toPromise();
      this.allUsers = users || [];
      
      // Load bangve
      this.allBangVe = await this.firebaseBangVeService.getAllBangVe();
      
      console.log('Loaded users:', this.allUsers.length);
      console.log('Loaded bangve:', this.allBangVe.length);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    this.isLoading = false;
  }

  async createTestAssignment() {
    if (!this.testForm.valid) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isLoading = true;
    try {
      const formValue = this.testForm.value;
      const selectedUser = this.allUsers.find(u => u.id === formValue.userId);
      const selectedBangVe = this.allBangVe.find(b => b.id === formValue.bangveId);
      
      if (!selectedUser || !selectedBangVe) {
        alert('Không tìm thấy user hoặc bảng vẽ');
        return;
      }

      console.log('Creating test assignment:', {
        user: selectedUser,
        bangve: selectedBangVe,
        khauSx: formValue.khauSx
      });

      // Tạo assignment record
      const assignmentData = {
        user_id: parseInt(selectedUser.id),
        firebase_uid: selectedUser.uid || selectedUser.id,
        bangve_id: String(selectedBangVe.id),
        bd_ha_id: undefined, // Sẽ được cập nhật sau khi tạo bd_ha record
        bd_cao_id: undefined, // Sẽ được cập nhật sau khi tạo bd_cao record
        bd_ep_id: undefined, // Sẽ được cập nhật sau khi tạo bd_ep record
        permission_type: 'gia_cong',
        status: true,
        trang_thai_bv: 1,
        trang_thai_bd_ha: formValue.khauSx === 'bd_ha' ? 0 : undefined,
        trang_thai_bd_cao: formValue.khauSx === 'bd_cao' ? 0 : undefined,
        trang_thai_bd_ep: formValue.khauSx === 'bd_ep' ? 0 : undefined,
        assigned_at: new Date(),
        assigned_by_user_id: 1,
        created_at: new Date(),
        created_by: 1,
        khau_sx: formValue.khauSx,
        trang_thai: 0
      };

      const docId = await this.firebaseUserBangVeService.createUserBangVe(assignmentData);
      
      this.result = {
        success: true,
        docId: docId,
        assignment: assignmentData
      };

      console.log('Test assignment created successfully:', docId);
      alert('Tạo assignment thành công!');
      
    } catch (error) {
      console.error('Error creating test assignment:', error);
      this.result = {
        success: false,
        error: error
      };
      alert('Lỗi khi tạo assignment: ' + error);
    }
    this.isLoading = false;
  }

  async checkAssignments() {
    this.isLoading = true;
    try {
      const allAssignments = await this.firebaseUserBangVeService.getAllUserBangVe();
      this.result = {
        success: true,
        assignments: allAssignments
      };
      console.log('All assignments:', allAssignments);
    } catch (error) {
      console.error('Error checking assignments:', error);
      this.result = {
        success: false,
        error: error
      };
    }
    this.isLoading = false;
  }
}
