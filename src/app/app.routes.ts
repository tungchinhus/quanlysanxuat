import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dang-nhap',
    loadComponent: () => import('./components/dang-nhap/dang-nhap.component').then(m => m.DangNhapComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager', 'user'] }
  },
  {
    path: 'quan-ly-tuyen-duong',
    loadComponent: () => import('./components/quan-ly-tuyen-duong/quan-ly-tuyen-duong.component').then(m => m.QuanLyTuyenDuongComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quan-ly-xe-dua-don',
    loadComponent: () => import('./components/quan-ly-xe-dua-don/quan-ly-xe-dua-don.component').then(m => m.QuanLyXeDuaDonComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quan-ly-nhan-vien',
    loadComponent: () => import('./components/quan-ly-nhan-vien/quan-ly-nhan-vien.component').then(m => m.QuanLyNhanVienComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'quan-ly-user',
    loadComponent: () => import('./components/quan-ly-user/quan-ly-user.component').then(m => m.QuanLyUserComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['super_admin', 'admin'],
      permissions: ['user_view']
    }
  },
  {
    path: 'quan-ly-phan-quyen',
    loadComponent: () => import('./components/quan-ly-phan-quyen/quan-ly-phan-quyen.component').then(m => m.QuanLyPhanQuyenComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['super_admin', 'admin'],
      permissions: ['role_view']
    }
  },
  {
    path: 'data-initialization',
    loadComponent: () => import('./components/data-initialization/data-initialization.component').then(m => m.DataInitializationComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['super_admin'],
      permissions: ['system_config']
    }
  },
  {
    path: 'user-import-export',
    loadComponent: () => import('./components/user-import-export/user-import-export.component').then(m => m.UserImportExportComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['super_admin', 'admin'],
      permissions: ['user_view']
    }
  },
  {
    path: 'audit-logs',
    loadComponent: () => import('./components/audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['super_admin', 'admin'],
      permissions: ['user_view']
    }
  },
  {
    path: 'ds-bangve',
    loadComponent: () => import('./components/ds-bangve/ds-bangve.component').then(m => m.DsBangveComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['admin', 'manager', 'user'],
      permissions: ['drawing_view']
    }
  },
  {
    path: 'debug-admin',
    loadComponent: () => import('./debug-admin.component').then(m => m.DebugAdminComponent)
  },
];
