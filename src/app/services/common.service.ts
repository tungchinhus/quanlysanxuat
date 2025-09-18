import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // Ensure trailing slash so callers can safely do `${base}api/...`
  private readonly API_BASE_URL = 'https://localhost:7190/';

  constructor(private snackBar: MatSnackBar) {}

  getServerAPIURL(): string {
    return this.API_BASE_URL;
  }

  thongbao(message: string, action: string = 'Đóng', type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      panelClass: [`snackbar-${type}`]
    };
    
    this.snackBar.open(message, action, config);
  }

  pushEvent(event: any): void {
    // Simple event pushing - can be enhanced with proper event service
    console.log('Event pushed:', event);
  }
}
