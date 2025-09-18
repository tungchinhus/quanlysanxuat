import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseService } from './firebase.service';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface DashboardStats {
  totalTransformers: number;
  completedTransformers: number;
  inProgressTransformers: number;
  errorTransformers: number;
  highVoltageErrors: number;
  lowVoltageErrors: number;
  completionRate: number;
  errorRate: number;
  recentActivities: any[];
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  completed: number;
  inProgress: number;
  errors: number;
}

export interface TransformerStatus {
  id: string;
  transformerNumber: string;
  status: 'completed' | 'in_progress' | 'error';
  errorType?: 'high_voltage' | 'low_voltage' | 'other';
  completionDate?: Date;
  errorDate?: Date;
  assignedTo?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStatsService {
  private statsSubject = new BehaviorSubject<DashboardStats>({
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
  });

  public stats$ = this.statsSubject.asObservable();

  constructor(private firebaseService: FirebaseService) {
    this.loadStats();
  }

  /**
   * Tải dữ liệu thống kê từ Firebase
   */
  async loadStats(): Promise<void> {
    try {
      const db = this.firebaseService.getFirestore();
      
      // Lấy tất cả máy biến áp
      const transformersQuery = query(collection(db, 'xeDuaDon')); // Sử dụng collection hiện có
      const transformersSnapshot = await getDocs(transformersQuery);
      
      // Lấy đăng ký sản xuất
      const registrationsQuery = query(collection(db, 'dangKyPhanXe'));
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      // Lấy lịch trình sản xuất
      const schedulesQuery = query(collection(db, 'lichTrinhXe'));
      const schedulesSnapshot = await getDocs(schedulesQuery);

      // Xử lý dữ liệu thống kê
      const stats = this.calculateStats(
        transformersSnapshot.docs,
        registrationsSnapshot.docs,
        schedulesSnapshot.docs
      );

      this.statsSubject.next(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  /**
   * Tính toán thống kê từ dữ liệu Firebase
   */
  private calculateStats(
    transformers: any[],
    registrations: any[],
    schedules: any[]
  ): DashboardStats {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Thống kê máy biến áp
    const totalTransformers = transformers.length;
    let completedTransformers = 0;
    let inProgressTransformers = 0;
    let errorTransformers = 0;
    let highVoltageErrors = 0;
    let lowVoltageErrors = 0;

    // Phân loại trạng thái máy biến áp
    transformers.forEach(transformer => {
      const data = transformer.data();
      const status = data.status || 'in_progress';
      
      switch (status) {
        case 'completed':
          completedTransformers++;
          break;
        case 'in_progress':
          inProgressTransformers++;
          break;
        case 'error':
          errorTransformers++;
          if (data.errorType === 'high_voltage') {
            highVoltageErrors++;
          } else if (data.errorType === 'low_voltage') {
            lowVoltageErrors++;
          }
          break;
      }
    });

    // Thống kê đăng ký sản xuất
    const totalRegistrations = registrations.length;
    const completedRegistrations = registrations.filter(reg => 
      reg.data().status === 'completed'
    ).length;

    // Thống kê lịch trình sản xuất
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter(schedule => 
      schedule.data().status === 'active'
    ).length;

    // Tính tỷ lệ
    const completionRate = totalTransformers > 0 ? (completedTransformers / totalTransformers) * 100 : 0;
    const errorRate = totalTransformers > 0 ? (errorTransformers / totalTransformers) * 100 : 0;

    // Hoạt động gần đây (giả lập)
    const recentActivities = this.generateRecentActivities(transformers, registrations);

    // Thống kê theo tháng (giả lập)
    const monthlyStats = this.generateMonthlyStats();

    return {
      totalTransformers,
      completedTransformers,
      inProgressTransformers,
      errorTransformers,
      highVoltageErrors,
      lowVoltageErrors,
      completionRate: Math.round(completionRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      recentActivities,
      monthlyStats
    };
  }

  /**
   * Tạo hoạt động gần đây
   */
  private generateRecentActivities(transformers: any[], registrations: any[]): any[] {
    const activities: any[] = [];
    const now = new Date();

    // Hoạt động từ máy biến áp
    transformers.slice(0, 5).forEach(transformer => {
      const data = transformer.data();
      activities.push({
        id: transformer.id,
        type: 'transformer',
        title: `Máy biến áp ${data.bienSo || data.transformerNumber} - ${this.getStatusText(data.status)}`,
        time: data.updatedAt?.toDate() || now,
        status: data.status,
        icon: this.getStatusIcon(data.status)
      });
    });

    // Hoạt động từ đăng ký sản xuất
    registrations.slice(0, 3).forEach(reg => {
      const data = reg.data();
      activities.push({
        id: reg.id,
        type: 'registration',
        title: `Đăng ký sản xuất ${data.transformerNumber} - ${this.getStatusText(data.status)}`,
        time: data.createdAt?.toDate() || now,
        status: data.status,
        icon: this.getStatusIcon(data.status)
      });
    });

    return activities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8);
  }

  /**
   * Tạo thống kê theo tháng
   */
  private generateMonthlyStats(): MonthlyStats[] {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('vi-VN', { month: 'short' });
      
      months.push({
        month: monthName,
        completed: Math.floor(Math.random() * 20) + 10,
        inProgress: Math.floor(Math.random() * 15) + 5,
        errors: Math.floor(Math.random() * 5) + 1
      });
    }
    
    return months;
  }

  /**
   * Lấy text trạng thái
   */
  private getStatusText(status: string): string {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress': return 'Đang thi công';
      case 'error': return 'Bị lỗi';
      case 'pending': return 'Chờ xử lý';
      default: return 'Không xác định';
    }
  }

  /**
   * Lấy icon trạng thái
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'in_progress': return 'build';
      case 'error': return 'error';
      case 'pending': return 'schedule';
      default: return 'help';
    }
  }

  /**
   * Làm mới dữ liệu thống kê
   */
  async refreshStats(): Promise<void> {
    await this.loadStats();
  }

  /**
   * Lấy thống kê chi tiết theo loại lỗi
   */
  getErrorBreakdown(): Observable<any> {
    return this.stats$.pipe(
      map(stats => ({
        highVoltage: stats.highVoltageErrors,
        lowVoltage: stats.lowVoltageErrors,
        other: stats.errorTransformers - stats.highVoltageErrors - stats.lowVoltageErrors
      }))
    );
  }

  /**
   * Lấy xu hướng hoàn thành
   */
  getCompletionTrend(): Observable<number[]> {
    return this.stats$.pipe(
      map(stats => stats.monthlyStats.map(month => month.completed))
    );
  }
}
