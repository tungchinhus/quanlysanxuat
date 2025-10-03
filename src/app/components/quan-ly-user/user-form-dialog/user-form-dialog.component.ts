import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User, Role } from '../../../models/user.model';

export interface UserFormData {
  user?: User;
  roles: Role[];
  isEdit: boolean;
}

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.css'
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  selectedRoles: string[] = [];
  isEdit: boolean = false;
  createWithAuth: boolean = false;
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormData
  ) {
    this.isEdit = data.isEdit;
    this.selectedRoles = data.user?.roles || [];
    
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: [''],
      department: [''],
      position: [''],
      isActive: [true],
      createWithAuth: [false],
      password: ['', [
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    if (this.isEdit && this.data.user) {
      this.userForm.patchValue({
        username: this.data.user.username,
        email: this.data.user.email,
        fullName: this.data.user.fullName,
        phone: this.data.user.phone || '',
        department: this.data.user.department || '',
        position: this.data.user.position || '',
        isActive: this.data.user.isActive
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    const createWithAuth = form.get('createWithAuth');
    
    // Only validate if createWithAuth is true
    if (createWithAuth?.value && password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
    }
    
    return null;
  }

  onRoleSelectionChange(roleId: string, isSelected: boolean): void {
    if (isSelected) {
      if (!this.selectedRoles.includes(roleId)) {
        this.selectedRoles.push(roleId);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(id => id !== roleId);
    }
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoles.includes(roleId);
  }

  onSubmit(): void {
    if (this.userForm.valid && this.selectedRoles.length > 0) {
      const formValue = this.userForm.value;
      
      // Validate password if createWithAuth is true
      if (formValue.createWithAuth) {
        if (!formValue.password || formValue.password.length < 6) {
          alert('Mật khẩu phải có ít nhất 6 ký tự');
          return;
        }
        if (formValue.password !== formValue.confirmPassword) {
          alert('Mật khẩu xác nhận không khớp');
          return;
        }
      }
      
      const userData = {
        ...formValue,
        roles: this.selectedRoles,
        createWithAuth: formValue.createWithAuth,
        password: formValue.createWithAuth ? formValue.password : undefined
      };
      
      this.dialogRef.close(userData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getErrorMessage(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Trường này là bắt buộc';
    }
    if (field?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength'].requiredLength;
      return `Tối thiểu ${requiredLength} ký tự`;
    }
    if (field?.hasError('pattern')) {
      if (fieldName === 'password') {
        return 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
      }
    }
    if (field?.hasError('passwordMismatch')) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  }

  getRoleDisplayName(roleName: string): string {
    const role = this.data.roles.find(r => r.name === roleName);
    return role ? role.displayName : roleName;
  }
}
