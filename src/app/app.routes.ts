import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  { 
    path: 'header-test', 
    loadComponent: () => import('./components/header-test/header-test.component').then(m => m.HeaderTestComponent)
  },
  { 
    path: 'firebase-test', 
    loadComponent: () => import('./components/firebase-test/simple-firebase-test.component').then(m => m.SimpleFirebaseTestComponent)
  },
  { 
    path: 'auth-test', 
    loadComponent: () => import('./components/firebase-test/auth-test.component').then(m => m.AuthTestComponent)
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/dang-nhap/dang-nhap.component').then(m => m.DangNhapComponent) },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'production', 
    loadComponent: () => import('./features/production-management/production-management').then(m => m.ProductionManagementComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'inventory', 
    loadComponent: () => import('./features/inventory-management/inventory-management').then(m => m.InventoryManagementComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'quality', 
    loadComponent: () => import('./features/quality-control/quality-control').then(m => m.QualityControlComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'users', 
    loadComponent: () => import('./components/quan-ly-user/user-management.component').then(m => m.UserManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  { 
    path: 'roles', 
    loadComponent: () => import('./components/quan-ly-phan-quyen/role-management.component').then(m => m.RoleManagementComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  { 
    path: 'unauthorized', 
    loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
