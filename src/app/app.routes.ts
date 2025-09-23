import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dang-nhap',
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
    data: { roles: ['admin', 'super_admin', 'manager', 'kcs', 'totruong'] }
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
      roles: ['admin', 'super_admin', 'manager', 'totruong'],
      permissions: ['drawing_view']
    }
  },
  {
    path: 'quan-day',
    loadComponent: () => import('./components/quan-day/quan-day.component').then(m => m.QuanDayComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['quandaycao', 'boidaycao'],
      permissions: ['quan_day_view']
    }
  },
  {
    path: 'ds-quan-day',
    loadComponent: () => import('./components/ds-quan-day/ds-quan-day.component').then(m => m.DsQuanDayComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['quandaycao', 'boidaycao', 'quandayha', 'boidayha', 'epboiday', 'boidayep'],
      permissions: ['quan_day_view']
    }
  },
  {
    path: 'debug-admin',
    loadComponent: () => import('./debug-admin.component').then(m => m.DebugAdminComponent)
  },
  {
    path: 'debug-quan-day-assignment',
    loadComponent: () => import('./components/debug-quan-day-assignment/debug-quan-day-assignment.component').then(m => m.DebugQuanDayAssignmentComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'test-quan-day-assignment',
    loadComponent: () => import('./components/test-quan-day-assignment/test-quan-day-assignment.component').then(m => m.TestQuanDayAssignmentComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'simple-debug',
    loadComponent: () => import('./components/simple-debug/simple-debug.component').then(m => m.SimpleDebugComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'step-by-step-debug',
    loadComponent: () => import('./components/step-by-step-debug/step-by-step-debug.component').then(m => m.StepByStepDebugComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'assignment-debug',
    loadComponent: () => import('./components/assignment-debug/assignment-debug.component').then(m => m.AssignmentDebugComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-flow-debug',
    loadComponent: () => import('./components/data-flow-debug/data-flow-debug.component').then(m => m.DataFlowDebugComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ui-debug',
    loadComponent: () => import('./components/ui-debug/ui-debug.component').then(m => m.UiDebugComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'debug-user-bangve',
    loadComponent: () => import('./components/debug-user-bangve/debug-user-bangve.component').then(m => m.DebugUserBangVeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'test-assignment',
    loadComponent: () => import('./components/test-assignment/test-assignment.component').then(m => m.TestAssignmentComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'kcs-manager',
    loadComponent: () => import('./components/kcs-manager/kcs-manager.component').then(m => m.KcsManagerComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['kcs', 'admin', 'super_admin'],
      permissions: ['kcs_manager']
    }
  },
  {
    path: 'kcs-check',
    loadComponent: () => import('./components/kcs-check/kcs-check.component').then(m => m.KcsCheckComponent),
    canActivate: [AuthGuard],
    data: { 
      roles: ['kcs'],
      permissions: ['kcs_check']
    }
  },
  {
    path: 'menu-debug',
    loadComponent: () => import('./components/menu-debug/menu-debug.component').then(m => m.MenuDebugComponent)
  },
];
