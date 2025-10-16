import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './services/auth.service';
import { FirebaseBdHaService, BdHaData } from './services/firebase-bd-ha.service';
import { FirebaseUserBangVeService } from './services/firebase-user-bangve.service';
import { FirebaseUserManagementService } from './services/firebase-user-management.service';

@Component({
  selector: 'app-boi-day-ha-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Test Bối Dây Hạ Data Saving</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="user-info" *ngIf="currentUser">
            <h3>Current User:</h3>
            <p><strong>Email:</strong> {{ currentUser.email }}</p>
            <p><strong>UID:</strong> {{ currentUser.uid }}</p>
            <p><strong>Roles:</strong> {{ userRoles.join(', ') }}</p>
          </div>

          <form [formGroup]="testForm" class="test-form">
            <mat-form-field appearance="outline">
              <mat-label>Ký hiệu bảng vẽ</mat-label>
              <input matInput formControlName="kyhieubangve" placeholder="testbangvel-001">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Người gia công</mat-label>
              <input matInput formControlName="nguoigiacong" [value]="currentUser?.email || ''">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quy cách dây</mat-label>
              <input matInput formControlName="quycachday" placeholder="Cu 1.0mm">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Số sợi dây</mat-label>
              <input matInput type="number" formControlName="sosoiday" placeholder="1">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nhà sản xuất</mat-label>
              <mat-select formControlName="nhasanxuat">
                <mat-option value="BS-HN">BS-HN</mat-option>
                <mat-option value="BS-HCM">BS-HCM</mat-option>
                <mat-option value="BS-DN">BS-DN</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Chu vi khuôn (mm)</mat-label>
              <input matInput type="number" formControlName="chuvikhuon" placeholder="100">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>KT bung bối dây</mat-label>
              <input matInput type="number" formControlName="kt_bung_bd" placeholder="50">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Máy quấn dây</mat-label>
              <mat-select formControlName="mayquanday">
                <mat-option value="QD13">QD13</mat-option>
                <mat-option value="QD14">QD14</mat-option>
                <mat-option value="QD15">QD15</mat-option>
              </mat-select>
            </mat-form-field>
          </form>

          <div class="test-buttons">
            <button mat-raised-button color="primary" 
                    (click)="testCreateBdHa()" 
                    [disabled]="loading || !testForm.valid">
              {{ loading ? 'Testing...' : 'Test Create BdHa' }}
            </button>
            
            <button mat-raised-button color="accent" 
                    (click)="testUpdateUserBangVe()" 
                    [disabled]="loading">
              {{ loading ? 'Testing...' : 'Test Update UserBangVe' }}
            </button>
          </div>

          <div class="logs" *ngIf="logs.length > 0">
            <h3>Test Logs:</h3>
            <div class="log-entry" *ngFor="let log of logs">
              <span [class]="log.type">{{ log.message }}</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .user-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .test-form {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .test-buttons {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
    }
    
    .logs {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .log-entry {
      margin-bottom: 8px;
      font-family: monospace;
    }
    
    .success {
      color: green;
    }
    
    .error {
      color: red;
    }
    
    .info {
      color: blue;
    }
  `]
})
export class BoiDayHaTestComponent implements OnInit {
  currentUser: any = null;
  userRoles: string[] = [];
  testForm: FormGroup;
  loading = false;
  logs: Array<{message: string, type: string}> = [];

  constructor(
    private authService: AuthService,
    private firebaseBdHaService: FirebaseBdHaService,
    private firebaseUserBangVeService: FirebaseUserBangVeService,
    private firebaseUserManagementService: FirebaseUserManagementService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.testForm = this.fb.group({
      kyhieubangve: ['testbangvel-' + Date.now(), Validators.required],
      nguoigiacong: ['', Validators.required],
      quycachday: ['Cu 1.0mm', Validators.required],
      sosoiday: [1, Validators.required],
      nhasanxuat: ['BS-HN', Validators.required],
      chuvikhuon: [100, Validators.required],
      kt_bung_bd: [50, Validators.required],
      mayquanday: ['QD13', Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadCurrentUser();
  }

  async loadCurrentUser() {
    try {
      this.currentUser = await this.authService.getCurrentUser();
      if (this.currentUser) {
        this.addLog('✅ Current user loaded: ' + this.currentUser.email, 'success');
        
        // Load user roles
        const user = await this.firebaseUserManagementService.getUserByEmail(this.currentUser.email);
        if (user) {
          this.userRoles = user.roles || [];
          this.addLog('✅ User roles loaded: ' + this.userRoles.join(', '), 'success');
          
          // Set nguoigiacong field
          this.testForm.patchValue({
            nguoigiacong: this.currentUser.email
          });
        } else {
          this.addLog('❌ User not found in Firestore', 'error');
        }
      } else {
        this.addLog('❌ No current user', 'error');
      }
    } catch (error: any) {
      this.addLog('❌ Error loading current user: ' + error.message, 'error');
    }
  }

  async testCreateBdHa() {
    this.loading = true;
    this.addLog('Testing create BdHa...', 'info');

    try {
      const formData = this.testForm.value;
      
      const bdHaData: Omit<BdHaData, 'id'> = {
        masothe_bd_ha: 'TEST-BD-HA-' + Date.now(),
        kyhieubangve: formData.kyhieubangve,
        ngaygiacong: new Date(),
        nguoigiacong: formData.nguoigiacong,
        quycachday: formData.quycachday,
        sosoiday: formData.sosoiday,
        ngaysanxuat: new Date(),
        nhasanxuat: formData.nhasanxuat,
        chuvikhuon: formData.chuvikhuon,
        kt_bung_bd: formData.kt_bung_bd,
        chieuquanday: true,
        mayquanday: formData.mayquanday,
        trang_thai: 1,
        trang_thai_approve: 'pending',
        user_update: this.currentUser?.email || 'test@test.com',
        created_at: new Date(),
        khau_sx: 'bd_ha'
      };

      this.addLog('Creating BdHa with data: ' + JSON.stringify(bdHaData, null, 2), 'info');
      
      const bdHaId = await this.firebaseBdHaService.createBdHa(bdHaData);
      this.addLog('✅ Successfully created BdHa with ID: ' + bdHaId, 'success');
      
      this.snackBar.open('BdHa created successfully!', '×', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
      
    } catch (error: any) {
      this.addLog('❌ Error creating BdHa: ' + error.message, 'error');
      this.addLog('Error details: ' + JSON.stringify(error, null, 2), 'error');
      
      this.snackBar.open('Error creating BdHa: ' + error.message, '×', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }

    this.loading = false;
  }

  async testUpdateUserBangVe() {
    this.loading = true;
    this.addLog('Testing update UserBangVe...', 'info');

    try {
      // Get user from Firestore
      const user = await this.firebaseUserManagementService.getUserByEmail(this.currentUser.email);
      if (!user) {
        this.addLog('❌ User not found in Firestore', 'error');
        return;
      }

      // Get user assignments
      const userAssignments = await this.firebaseUserBangVeService.getUserBangVeByUserId(parseInt(user.id));
      this.addLog('Found ' + userAssignments.length + ' user assignments', 'info');

      if (userAssignments.length > 0) {
        const firstAssignment = userAssignments[0];
        this.addLog('First assignment: ' + JSON.stringify(firstAssignment, null, 2), 'info');
        
        // Try to update the assignment
        const bdHaId = 'TEST-BD-HA-' + Date.now();
        const trangThaiBdHa = 1;
        
        await this.firebaseUserBangVeService.updateUserBangVeWithBdHaId(String(firstAssignment.id!), bdHaId, trangThaiBdHa);
        this.addLog('✅ Successfully updated UserBangVe assignment', 'success');
        
        this.snackBar.open('UserBangVe updated successfully!', '×', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      } else {
        this.addLog('❌ No user assignments found', 'error');
      }
      
    } catch (error: any) {
      this.addLog('❌ Error updating UserBangVe: ' + error.message, 'error');
      this.addLog('Error details: ' + JSON.stringify(error, null, 2), 'error');
      
      this.snackBar.open('Error updating UserBangVe: ' + error.message, '×', {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }

    this.loading = false;
  }

  private addLog(message: string, type: string = 'info') {
    this.logs.push({
      message: new Date().toLocaleTimeString() + ' - ' + message,
      type: type
    });
  }
}
