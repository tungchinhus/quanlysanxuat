import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent) },
  { path: 'production', loadComponent: () => import('./features/production-management/production-management').then(m => m.ProductionManagementComponent) },
  { path: 'inventory', loadComponent: () => import('./features/inventory-management/inventory-management').then(m => m.InventoryManagementComponent) },
  { path: 'quality', loadComponent: () => import('./features/quality-control/quality-control').then(m => m.QualityControlComponent) },
  { path: '**', redirectTo: '/dashboard' }
];
