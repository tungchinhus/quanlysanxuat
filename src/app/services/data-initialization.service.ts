import { Injectable } from '@angular/core';
import { FirebaseUserManagementService } from './firebase-user-management.service';
import { Role, Permission, PREDEFINED_ROLES, PREDEFINED_PERMISSIONS, Module, Action } from '../models/user.model';
import { Observable, of, forkJoin, firstValueFrom } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataInitializationService {
  
  constructor(private firebaseUserService: FirebaseUserManagementService) {}

  /**
   * Khởi tạo dữ liệu mẫu cho hệ thống
   */
  async initializeSystemData(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      console.log('Starting system data initialization...');
      
      // Kiểm tra xem dữ liệu đã tồn tại chưa
      const existingRoles = await firstValueFrom(this.firebaseUserService.getRoles()) || [];
      const existingPermissions = await firstValueFrom(this.firebaseUserService.getPermissions()) || [];
      
      if (existingRoles.length > 0 && existingPermissions.length > 0) {
        return {
          success: true,
          message: 'Dữ liệu hệ thống đã được khởi tạo trước đó',
          data: { roles: existingRoles, permissions: existingPermissions }
        };
      }

      // Khởi tạo permissions trước
      const permissions = await this.initializePermissions();
      console.log('Permissions initialized:', permissions.length);

      // Khởi tạo roles
      const roles = await this.initializeRoles(permissions);
      console.log('Roles initialized:', roles.length);

      // Khởi tạo super admin user
      const superAdmin = await this.initializeSuperAdmin();
      console.log('Super admin initialized:', superAdmin);

      return {
        success: true,
        message: 'Dữ liệu hệ thống đã được khởi tạo thành công',
        data: { roles, permissions, superAdmin }
      };

    } catch (error: any) {
      console.error('Error initializing system data:', error);
      return {
        success: false,
        message: `Lỗi khi khởi tạo dữ liệu: ${error.message}`
      };
    }
  }

  /**
   * Khởi tạo tất cả permissions
   */
  private async initializePermissions(): Promise<Permission[]> {
    const permissions: Permission[] = [];
    
    // Đăng ký xe permissions
    const dangKyXePermissions = [
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_VIEW, displayName: 'Xem đăng ký xe', module: Module.DANG_KY_XE, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_CREATE, displayName: 'Tạo đăng ký xe', module: Module.DANG_KY_XE, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_UPDATE, displayName: 'Sửa đăng ký xe', module: Module.DANG_KY_XE, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_DELETE, displayName: 'Xóa đăng ký xe', module: Module.DANG_KY_XE, action: Action.DELETE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_EXPORT, displayName: 'Xuất đăng ký xe', module: Module.DANG_KY_XE, action: Action.EXPORT, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_IMPORT, displayName: 'Nhập đăng ký xe', module: Module.DANG_KY_XE, action: Action.IMPORT, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_APPROVE, displayName: 'Duyệt đăng ký xe', module: Module.DANG_KY_XE, action: Action.APPROVE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.DANG_KY_XE_REJECT, displayName: 'Từ chối đăng ký xe', module: Module.DANG_KY_XE, action: Action.REJECT, isActive: true }
    ];

    // Quản lý nhân viên permissions
    const nhanVienPermissions = [
      { name: PREDEFINED_PERMISSIONS.NHAN_VIEN_VIEW, displayName: 'Xem nhân viên', module: Module.QUAN_LY_NHAN_VIEN, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.NHAN_VIEN_CREATE, displayName: 'Tạo nhân viên', module: Module.QUAN_LY_NHAN_VIEN, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.NHAN_VIEN_UPDATE, displayName: 'Sửa nhân viên', module: Module.QUAN_LY_NHAN_VIEN, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.NHAN_VIEN_DELETE, displayName: 'Xóa nhân viên', module: Module.QUAN_LY_NHAN_VIEN, action: Action.DELETE, isActive: true }
    ];

    // Quản lý tuyến đường permissions
    const tuyenDuongPermissions = [
      { name: PREDEFINED_PERMISSIONS.TUYEN_DUONG_VIEW, displayName: 'Xem tuyến đường', module: Module.QUAN_LY_TUYEN_DUONG, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.TUYEN_DUONG_CREATE, displayName: 'Tạo tuyến đường', module: Module.QUAN_LY_TUYEN_DUONG, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.TUYEN_DUONG_UPDATE, displayName: 'Sửa tuyến đường', module: Module.QUAN_LY_TUYEN_DUONG, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.TUYEN_DUONG_DELETE, displayName: 'Xóa tuyến đường', module: Module.QUAN_LY_TUYEN_DUONG, action: Action.DELETE, isActive: true }
    ];

    // Quản lý xe đưa đón permissions
    const xeDuaDonPermissions = [
      { name: PREDEFINED_PERMISSIONS.XE_DUA_DON_VIEW, displayName: 'Xem xe đưa đón', module: Module.QUAN_LY_XE_DUA_DON, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.XE_DUA_DON_CREATE, displayName: 'Tạo xe đưa đón', module: Module.QUAN_LY_XE_DUA_DON, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.XE_DUA_DON_UPDATE, displayName: 'Sửa xe đưa đón', module: Module.QUAN_LY_XE_DUA_DON, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.XE_DUA_DON_DELETE, displayName: 'Xóa xe đưa đón', module: Module.QUAN_LY_XE_DUA_DON, action: Action.DELETE, isActive: true }
    ];

    // Quản lý user permissions
    const userPermissions = [
      { name: PREDEFINED_PERMISSIONS.USER_VIEW, displayName: 'Xem người dùng', module: Module.QUAN_LY_USER, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.USER_CREATE, displayName: 'Tạo người dùng', module: Module.QUAN_LY_USER, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.USER_UPDATE, displayName: 'Sửa người dùng', module: Module.QUAN_LY_USER, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.USER_DELETE, displayName: 'Xóa người dùng', module: Module.QUAN_LY_USER, action: Action.DELETE, isActive: true }
    ];

    // Quản lý role permissions
    const rolePermissions = [
      { name: PREDEFINED_PERMISSIONS.ROLE_VIEW, displayName: 'Xem vai trò', module: Module.QUAN_LY_PHAN_QUYEN, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.ROLE_CREATE, displayName: 'Tạo vai trò', module: Module.QUAN_LY_PHAN_QUYEN, action: Action.CREATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.ROLE_UPDATE, displayName: 'Sửa vai trò', module: Module.QUAN_LY_PHAN_QUYEN, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.ROLE_DELETE, displayName: 'Xóa vai trò', module: Module.QUAN_LY_PHAN_QUYEN, action: Action.DELETE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.ROLE_ASSIGN, displayName: 'Phân quyền vai trò', module: Module.QUAN_LY_PHAN_QUYEN, action: Action.ASSIGN, isActive: true }
    ];

    // Báo cáo permissions
    const reportPermissions = [
      { name: PREDEFINED_PERMISSIONS.REPORT_VIEW, displayName: 'Xem báo cáo', module: Module.BAO_CAO, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.REPORT_EXPORT, displayName: 'Xuất báo cáo', module: Module.BAO_CAO, action: Action.EXPORT, isActive: true }
    ];

    // Cài đặt permissions
    const settingsPermissions = [
      { name: PREDEFINED_PERMISSIONS.SETTINGS_VIEW, displayName: 'Xem cài đặt', module: Module.CAI_DAT, action: Action.VIEW, isActive: true },
      { name: PREDEFINED_PERMISSIONS.SETTINGS_UPDATE, displayName: 'Sửa cài đặt', module: Module.CAI_DAT, action: Action.UPDATE, isActive: true },
      { name: PREDEFINED_PERMISSIONS.SYSTEM_CONFIG, displayName: 'Cấu hình hệ thống', module: Module.CAI_DAT, action: Action.UPDATE, isActive: true }
    ];

    // Dashboard permissions
    const dashboardPermissions = [
      { name: PREDEFINED_PERMISSIONS.DASHBOARD_VIEW, displayName: 'Xem dashboard', module: Module.DASHBOARD, action: Action.VIEW, isActive: true }
    ];

    const allPermissions = [
      ...dashboardPermissions,
      ...dangKyXePermissions,
      ...nhanVienPermissions,
      ...tuyenDuongPermissions,
      ...xeDuaDonPermissions,
      ...userPermissions,
      ...rolePermissions,
      ...reportPermissions,
      ...settingsPermissions
    ];

    // Tạo permissions trong Firebase
    for (const permission of allPermissions) {
      try {
        const createdPermission = await this.firebaseUserService.createPermission(permission);
        permissions.push(createdPermission);
      } catch (error) {
        console.error(`Error creating permission ${permission.name}:`, error);
      }
    }

    return permissions;
  }

  /**
   * Khởi tạo các roles với permissions tương ứng
   */
  private async initializeRoles(permissions: Permission[]): Promise<Role[]> {
    const roles: Role[] = [];

    // Super Admin - có tất cả quyền
    const superAdminRole = {
      name: PREDEFINED_ROLES.SUPER_ADMIN,
      displayName: 'Super Admin',
      description: 'Quyền truy cập toàn bộ hệ thống',
      permissions: permissions,
      isActive: true
    };

    // Admin - có hầu hết quyền trừ một số quyền hệ thống
    const adminPermissions = permissions.filter(p => 
      !p.name.includes('system_config') && 
      !p.name.includes('role_delete') &&
      p.name !== PREDEFINED_PERMISSIONS.USER_DELETE
    );
    
    const adminRole = {
      name: PREDEFINED_ROLES.ADMIN,
      displayName: 'Admin',
      description: 'Quyền quản trị hệ thống',
      permissions: adminPermissions,
      isActive: true
    };

    // Manager - quyền quản lý cơ bản
    const managerPermissions = permissions.filter(p => 
      p.module === Module.DANG_KY_XE ||
      p.module === Module.QUAN_LY_NHAN_VIEN ||
      p.module === Module.QUAN_LY_TUYEN_DUONG ||
      p.module === Module.QUAN_LY_XE_DUA_DON ||
      (p.module === Module.BAO_CAO && p.action === Action.VIEW)
    );
    
    const managerRole = {
      name: PREDEFINED_ROLES.MANAGER,
      displayName: 'Manager',
      description: 'Quyền quản lý cơ bản',
      permissions: managerPermissions,
      isActive: true
    };

    // User - quyền cơ bản
    const userPermissions = permissions.filter(p => 
      (p.module === Module.DANG_KY_XE && (p.action === Action.VIEW || p.action === Action.CREATE)) ||
      (p.module === Module.BAO_CAO && p.action === Action.VIEW)
    );
    
    const userRole = {
      name: PREDEFINED_ROLES.USER,
      displayName: 'User',
      description: 'Quyền sử dụng cơ bản',
      permissions: userPermissions,
      isActive: true
    };

    // Viewer - chỉ xem
    const viewerPermissions = permissions.filter(p => p.action === Action.VIEW);
    
    const viewerRole = {
      name: PREDEFINED_ROLES.VIEWER,
      displayName: 'Viewer',
      description: 'Quyền chỉ xem',
      permissions: viewerPermissions,
      isActive: true
    };

    const roleDefinitions = [superAdminRole, adminRole, managerRole, userRole, viewerRole];

    // Tạo roles trong Firebase
    for (const role of roleDefinitions) {
      try {
        const createdRole = await this.firebaseUserService.createRole(role);
        roles.push(createdRole);
      } catch (error) {
        console.error(`Error creating role ${role.name}:`, error);
      }
    }

    return roles;
  }

  /**
   * Khởi tạo super admin user
   */
  private async initializeSuperAdmin(): Promise<any> {
    const superAdminUser = {
      username: 'superadmin',
      email: 'superadmin@quanlysanxuat.com',
      fullName: 'Super Administrator',
      phone: '0123456789',
      department: 'IT',
      position: 'System Administrator',
      isActive: true,
      roles: [PREDEFINED_ROLES.SUPER_ADMIN],
      createdBy: 'system',
      updatedBy: 'system'
    };

    try {
      // Kiểm tra xem super admin đã tồn tại chưa
      const existingUsers = await firstValueFrom(this.firebaseUserService.getUsers()) || [];
      const existingSuperAdmin = existingUsers.find(u => u.roles.includes(PREDEFINED_ROLES.SUPER_ADMIN));
      
      if (existingSuperAdmin) {
        console.log('Super admin already exists');
        return existingSuperAdmin;
      }

      const createdUser = await this.firebaseUserService.createUser(superAdminUser);
      console.log('Super admin created successfully');
      return createdUser;
    } catch (error) {
      console.error('Error creating super admin:', error);
      throw error;
    }
  }

  /**
   * Reset toàn bộ dữ liệu hệ thống (chỉ dùng trong development)
   */
  async resetSystemData(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Resetting system data...');
      
      // Xóa tất cả users (trừ super admin)
      const users = await firstValueFrom(this.firebaseUserService.getUsers()) || [];
      for (const user of users) {
        if (!user.roles.includes(PREDEFINED_ROLES.SUPER_ADMIN)) {
          await this.firebaseUserService.deleteUser(user.id);
        }
      }

      // Xóa tất cả roles
      const roles = await firstValueFrom(this.firebaseUserService.getRoles()) || [];
      for (const role of roles) {
        await this.firebaseUserService.deleteRole(role.id);
      }

      // Xóa tất cả permissions
      const permissions = await firstValueFrom(this.firebaseUserService.getPermissions()) || [];
      for (const permission of permissions) {
        await this.firebaseUserService.deletePermission(permission.id);
      }

      // Khởi tạo lại dữ liệu
      await this.initializeSystemData();

      return {
        success: true,
        message: 'Dữ liệu hệ thống đã được reset thành công'
      };
    } catch (error: any) {
      console.error('Error resetting system data:', error);
      return {
        success: false,
        message: `Lỗi khi reset dữ liệu: ${error.message}`
      };
    }
  }
}

