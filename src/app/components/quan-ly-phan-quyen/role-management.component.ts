import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../models/user.model';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class RoleManagementComponent implements OnInit {
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  roles: Role[] = [];
  displayedColumns: string[] = ['name', 'description', 'permissions', 'userCount', 'actions'];
  loading = false;

  // Available permissions
  availablePermissions = [
    { key: 'all', name: 'Tất cả quyền', description: 'Có tất cả quyền trong hệ thống' },
    { key: 'bangve_create', name: 'Tạo bảng vé', description: 'Tạo mới bảng vé' },
    { key: 'bangve_edit', name: 'Sửa bảng vé', description: 'Chỉnh sửa bảng vé' },
    { key: 'bangve_view', name: 'Xem bảng vé', description: 'Xem danh sách bảng vé' },
    { key: 'bangve_delete', name: 'Xóa bảng vé', description: 'Xóa bảng vé' },
    { key: 'bd_ha_create', name: 'Tạo bảng đăng hàng', description: 'Tạo mới bảng đăng hàng' },
    { key: 'bd_ha_edit', name: 'Sửa bảng đăng hàng', description: 'Chỉnh sửa bảng đăng hàng' },
    { key: 'bd_ha_view', name: 'Xem bảng đăng hàng', description: 'Xem danh sách bảng đăng hàng' },
    { key: 'bd_cao_create', name: 'Tạo bảng đăng cao', description: 'Tạo mới bảng đăng cao' },
    { key: 'bd_cao_edit', name: 'Sửa bảng đăng cao', description: 'Chỉnh sửa bảng đăng cao' },
    { key: 'bd_cao_view', name: 'Xem bảng đăng cao', description: 'Xem danh sách bảng đăng cao' },
    { key: 'ep_boiday_create', name: 'Tạo ép bồi dây', description: 'Tạo mới ép bồi dây' },
    { key: 'ep_boiday_edit', name: 'Sửa ép bồi dây', description: 'Chỉnh sửa ép bồi dây' },
    { key: 'ep_boiday_view', name: 'Xem ép bồi dây', description: 'Xem danh sách ép bồi dây' },
    { key: 'kcs_approve', name: 'Phê duyệt KCS', description: 'Phê duyệt kiểm soát chất lượng' },
    { key: 'kcs_view', name: 'Xem KCS', description: 'Xem thông tin kiểm soát chất lượng' },
    { key: 'quality_control', name: 'Kiểm soát chất lượng', description: 'Quản lý kiểm soát chất lượng' },
    { key: 'user_manage', name: 'Quản lý người dùng', description: 'Quản lý tài khoản người dùng' },
    { key: 'role_manage', name: 'Quản lý phân quyền', description: 'Quản lý vai trò và quyền hạn' }
  ];

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    // Load predefined roles with their permissions
    this.roles = [
      {
        id: 'admin',
        name: 'Quản trị viên',
        description: 'Có tất cả quyền trong hệ thống',
        permissions: ['all'],
        userCount: 0
      },
      {
        id: 'totruong_quanday',
        name: 'Tổ trưởng quản dây',
        description: 'Quản lý tổ quản dây, tạo và quản lý bảng vé',
        permissions: ['bangve_create', 'bangve_edit', 'bangve_view', 'bangve_delete'],
        userCount: 0
      },
      {
        id: 'quanday_ha',
        name: 'Quản dây hàng',
        description: 'Quản lý bảng đăng hàng',
        permissions: ['bd_ha_create', 'bd_ha_edit', 'bd_ha_view'],
        userCount: 0
      },
      {
        id: 'quanday_cao',
        name: 'Quản dây cao',
        description: 'Quản lý bảng đăng cao',
        permissions: ['bd_cao_create', 'bd_cao_edit', 'bd_cao_view'],
        userCount: 0
      },
      {
        id: 'ep_boiday',
        name: 'Ép bồi dây',
        description: 'Quản lý ép bồi dây',
        permissions: ['ep_boiday_create', 'ep_boiday_edit', 'ep_boiday_view'],
        userCount: 0
      },
      {
        id: 'kcs',
        name: 'Kiểm soát chất lượng',
        description: 'Kiểm soát và phê duyệt chất lượng sản phẩm',
        permissions: ['kcs_approve', 'kcs_view', 'quality_control'],
        userCount: 0
      }
    ];

    // Load user count for each role
    this.loadUserCounts();
  }

  loadUserCounts() {
    this.authService.getAllUsers().subscribe(users => {
      this.roles.forEach(role => {
        role.userCount = users.filter(user => user.role === role.id as UserRole).length;
      });
      this.loading = false;
    });
  }

  getPermissionName(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.name : permissionKey;
  }

  getPermissionDescription(permissionKey: string): string {
    const permission = this.availablePermissions.find(p => p.key === permissionKey);
    return permission ? permission.description : '';
  }

  openRoleForm(role?: Role) {
    // TODO: Implement role form dialog
    console.log('Chức năng đang được phát triển');
    alert('Chức năng đang được phát triển');
  }

  openPermissionDialog(role: Role) {
    // TODO: Implement permission dialog
    console.log('Chức năng đang được phát triển');
    alert('Chức năng đang được phát triển');
  }

  deleteRole(role: Role) {
    if (role.userCount > 0) {
      alert('Không thể xóa vai trò đang có người dùng');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`)) {
      // TODO: Implement delete role
      console.log('Chức năng đang được phát triển');
      alert('Chức năng đang được phát triển');
    }
  }

  canManageRoles(): boolean {
    return this.authService.hasPermission('all') || this.authService.hasPermission('role_manage');
  }
}
