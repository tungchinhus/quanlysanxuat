import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { FreePasswordService } from '../../../services/free-password.service';

export interface PasswordSetupDialogData {
  user: User;
}

@Component({
  selector: 'app-password-setup-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  templateUrl: './password-setup-dialog.component.html',
  styleUrls: ['./password-setup-dialog.component.css']
})
export class PasswordSetupDialogComponent {
  setupForm: FormGroup;
  changePasswordForm: FormGroup;
  isLoading = false;
  currentTab = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PasswordSetupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PasswordSetupDialogData,
    private freePasswordService: FreePasswordService
  ) {
    this.setupForm = this.fb.group({
      email: [data.user.email || '', [Validators.required, Validators.email]]
    });

    this.changePasswordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  async onSetupTempPassword(): Promise<void> {
    if (this.setupForm.valid) {
      this.isLoading = true;
      
      try {
        const result = await this.freePasswordService.setupTempPassword(
          this.data.user.id,
          this.setupForm.get('email')?.value
        );
        
        if (result.success) {
          // Chuyển sang tab đổi mật khẩu
          this.currentTab = 1;
          alert(`✅ ${result.message}`);
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error: any) {
        alert(`❌ Lỗi: ${error.message || error}`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onChangePassword(): Promise<void> {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      
      try {
        const result = await this.freePasswordService.changeUserPasswordFree(
          this.data.user.id,
          this.changePasswordForm.get('newPassword')?.value
        );
        
        if (result.success) {
          this.dialogRef.close({ success: true, message: result.message });
        } else {
          alert(`❌ ${result.message}`);
        }
      } catch (error: any) {
        alert(`❌ Lỗi: ${error.message || error}`);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
