import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';

export interface ChangePasswordDialogData {
  user: User;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent {
  changePasswordForm: FormGroup;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {
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

  getErrorMessage(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} là bắt buộc`;
    }
    
    if (field?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} phải có ít nhất 6 ký tự`;
    }
    
    if (field?.hasError('pattern')) {
      return `${this.getFieldLabel(fieldName)} phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số`;
    }
    
    if (field?.hasError('passwordMismatch')) {
      return 'Mật khẩu xác nhận không khớp';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    switch (fieldName) {
      case 'newPassword':
        return 'Mật khẩu mới';
      case 'confirmPassword':
        return 'Xác nhận mật khẩu';
      default:
        return fieldName;
    }
  }

  onSubmit(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      const newPassword = this.changePasswordForm.get('newPassword')?.value;
      
      this.dialogRef.close({
        success: true,
        newPassword: newPassword,
        user: this.data.user
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.changePasswordForm.controls).forEach(key => {
        this.changePasswordForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }
}
