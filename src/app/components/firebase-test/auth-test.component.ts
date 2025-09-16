import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="auth-test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>security</mat-icon>
            Firebase Auth Test
          </mat-card-title>
          <mat-card-subtitle>
            Test Firebase Authentication directly
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="test-content">
            <h3>Test Firebase Authentication</h3>
            
            <form [formGroup]="authForm" (ngSubmit)="testLogin()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" placeholder="admin@thibidi.com">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput type="password" formControlName="password" placeholder="admin123">
              </mat-form-field>

              <div class="test-actions">
                <button mat-raised-button color="primary" type="submit" [disabled]="isLoading">
                  <mat-icon>login</mat-icon>
                  Test Login
                </button>
                
                <button mat-raised-button color="accent" type="button" (click)="testCreateUser()" [disabled]="isLoading">
                  <mat-icon>person_add</mat-icon>
                  Test Create User
                </button>
              </div>
            </form>

            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner diameter="50"></mat-spinner>
              <p>Testing...</p>
            </div>

            <div *ngIf="testResult" class="result-container">
              <h4>Test Result:</h4>
              <pre>{{ testResult }}</pre>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-test-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }

    .test-card {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }

    mat-card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      margin: -24px -24px 24px -24px;
      padding: 24px;
      border-radius: 12px 12px 0 0;
    }

    .test-content {
      padding: 20px 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .test-actions {
      display: flex;
      gap: 12px;
      margin: 20px 0;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .result-container {
      margin-top: 20px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class AuthTestComponent {
  authForm: FormGroup;
  isLoading = false;
  testResult = '';

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private auth: Auth
  ) {
    this.authForm = this.fb.group({
      email: ['admin@thibidi.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  async testLogin(): Promise<void> {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.testResult = 'Testing login...';
    
    const { email, password } = this.authForm.value;
    
    try {
      console.log('Testing login with:', email);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login successful:', userCredential.user);
      
      this.testResult = `✅ Login successful!\n\nUser ID: ${userCredential.user.uid}\nEmail: ${userCredential.user.email}\nEmail Verified: ${userCredential.user.emailVerified}`;
      
      this.snackBar.open('Login test successful!', 'Close', {
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('Login test failed:', error);
      this.testResult = `❌ Login failed!\n\nError Code: ${error.code}\nError Message: ${error.message}\n\nPossible causes:\n1. Firebase Authentication not enabled\n2. User doesn't exist\n3. Wrong password\n4. Invalid email format`;
      
      this.snackBar.open('Login test failed!', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  async testCreateUser(): Promise<void> {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.testResult = 'Testing user creation...';
    
    const { email, password } = this.authForm.value;
    
    try {
      console.log('Testing user creation with:', email);
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      console.log('User creation successful:', userCredential.user);
      
      this.testResult = `✅ User creation successful!\n\nUser ID: ${userCredential.user.uid}\nEmail: ${userCredential.user.email}\nEmail Verified: ${userCredential.user.emailVerified}`;
      
      this.snackBar.open('User creation test successful!', 'Close', {
        duration: 3000
      });
      
    } catch (error: any) {
      console.error('User creation test failed:', error);
      this.testResult = `❌ User creation failed!\n\nError Code: ${error.code}\nError Message: ${error.message}\n\nPossible causes:\n1. Firebase Authentication not enabled\n2. User already exists\n3. Password too weak\n4. Invalid email format`;
      
      this.snackBar.open('User creation test failed!', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }
}
