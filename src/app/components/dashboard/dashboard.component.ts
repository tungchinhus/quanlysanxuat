import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { SidenavService } from '../../services/sidenav.service';
import { DashboardStatsService, DashboardStats } from '../../services/dashboard-stats.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatRippleModule,
    MatGridListModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  stats: DashboardStats | null = null;
  isLoading = true;
  isRefreshing = false;

  constructor(
    private sidenavService: SidenavService,
    private dashboardStatsService: DashboardStatsService
  ) {}

  ngOnInit(): void {
    console.log('DashboardComponent initialized');
    
    // Set default stats immediately for testing
    this.stats = {
      totalTransformers: 0,
      completedTransformers: 0,
      inProgressTransformers: 0,
      errorTransformers: 0,
      highVoltageErrors: 0,
      lowVoltageErrors: 0,
      completionRate: 0,
      errorRate: 0,
      recentActivities: [],
      monthlyStats: []
    };
    this.isLoading = false;
    
    // Also try to load real stats
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Tải dữ liệu thống kê
   */
  private loadStats(): void {
    console.log('Loading dashboard stats...');
    this.isLoading = true;
    
    this.dashboardStatsService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          console.log('Stats loaded:', stats);
          this.stats = stats;
          this.isLoading = false;
          this.isRefreshing = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          // Set default stats if there's an error
          this.stats = {
            totalTransformers: 0,
            completedTransformers: 0,
            inProgressTransformers: 0,
            errorTransformers: 0,
            highVoltageErrors: 0,
            lowVoltageErrors: 0,
            completionRate: 0,
            errorRate: 0,
            recentActivities: [],
            monthlyStats: []
          };
          this.isLoading = false;
          this.isRefreshing = false;
        }
      });
  }

  /**
   * Làm mới dữ liệu
   */
  async refreshStats(): Promise<void> {
    this.isRefreshing = true;
    await this.dashboardStatsService.refreshStats();
  }

  /**
   * Lấy màu sắc cho card
   */
  getCardColor(type: string): string {
    switch (type) {
      case 'completed': return 'primary';
      case 'in_progress': return 'accent';
      case 'error': return 'warn';
      default: return 'primary';
    }
  }

  /**
   * Lấy icon cho card
   */
  getCardIcon(type: string): string {
    switch (type) {
      case 'completed': return 'check_circle';
      case 'in_progress': return 'build';
      case 'error': return 'error';
      case 'total': return 'directions_bus';
      default: return 'help';
    }
  }

  /**
   * Lấy màu cho chip trạng thái
   */
  getChipColor(status: string): string {
    switch (status) {
      case 'completed': return 'primary';
      case 'in_progress': return 'accent';
      case 'error': return 'warn';
      case 'pending': return 'basic';
      default: return 'basic';
    }
  }

  /**
   * Format số liệu
   */
  formatNumber(value: number): string {
    return value.toLocaleString('vi-VN');
  }

  /**
   * Format phần trăm
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Format thời gian
   */
  formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return 'Vừa xong';
  }
}
