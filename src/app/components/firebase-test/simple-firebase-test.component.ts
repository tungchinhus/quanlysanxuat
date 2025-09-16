import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FirebaseCollectionSetupService } from '../../scripts/setup-firebase-collections';

@Component({
  selector: 'app-simple-firebase-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="simple-test-container">
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>cloud</mat-icon>
            Simple Firebase Test
          </mat-card-title>
          <mat-card-subtitle>
            Test Firebase connection without authentication
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="test-content">
            <h3>Firebase Configuration Test</h3>
            <p>This page should load without any authentication requirements.</p>
            
            <div class="test-actions">
              <button mat-raised-button color="primary" (click)="testBasicConnection()">
                <mat-icon>wifi</mat-icon>
                Test Basic Connection
              </button>
              
              <button mat-raised-button color="accent" (click)="setupFirebaseCollections()">
                <mat-icon>cloud_upload</mat-icon>
                Setup Collections
              </button>
              
              <button mat-raised-button color="warn" (click)="clearCollections()">
                <mat-icon>delete</mat-icon>
                Clear Collections
              </button>
              
              <button mat-raised-button color="accent" (click)="goToLogin()">
                <mat-icon>login</mat-icon>
                Go to Login
              </button>
            </div>

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
    .simple-test-container {
      padding: 20px;
      max-width: 800px;
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
export class SimpleFirebaseTestComponent implements OnInit {
  isLoading = false;
  testResult = '';

  constructor(
    private snackBar: MatSnackBar,
    private setupService: FirebaseCollectionSetupService
  ) {}

  ngOnInit(): void {
    console.log('Simple Firebase Test Component loaded successfully!');
    this.testResult = 'Component loaded without authentication!';
  }

  testBasicConnection(): void {
    this.isLoading = true;
    this.testResult = 'Testing basic connection...';
    
    // Simulate a test
    setTimeout(() => {
      this.isLoading = false;
      this.testResult = 'Basic connection test completed!';
      this.snackBar.open('Test completed successfully!', 'Close', {
        duration: 3000
      });
    }, 2000);
  }

  async setupFirebaseCollections(): Promise<void> {
    this.isLoading = true;
    this.testResult = 'Setting up Firebase collections...';
    
    try {
      await this.setupService.setupCollections();
      this.testResult = '✅ Firebase collections setup completed!\n\nCollections created:\n- users (with sample users)\n- roles (with role definitions)';
      this.snackBar.open('Collections setup completed!', 'Close', {
        duration: 5000
      });
    } catch (error) {
      this.testResult = `❌ Error setting up collections: ${error}`;
      this.snackBar.open('Error setting up collections', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  async clearCollections(): Promise<void> {
    this.isLoading = true;
    this.testResult = 'Clearing Firebase collections...';
    
    try {
      await this.setupService.clearAllCollections();
      this.testResult = '✅ All collections cleared!';
      this.snackBar.open('Collections cleared!', 'Close', {
        duration: 3000
      });
    } catch (error) {
      this.testResult = `❌ Error clearing collections: ${error}`;
      this.snackBar.open('Error clearing collections', 'Close', {
        duration: 5000
      });
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin(): void {
    window.location.href = '/login';
  }
}
