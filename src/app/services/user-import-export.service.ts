import { Injectable } from '@angular/core';
import { User, Role, Permission } from '../models/user.model';
import { FirebaseUserManagementService } from './firebase-user-management.service';
import { firstValueFrom } from 'rxjs';

export interface ExportData {
  users: User[];
  roles: Role[];
  permissions: Permission[];
  exportDate: Date;
  version: string;
}

export interface ImportResult {
  success: boolean;
  message: string;
  importedUsers: number;
  importedRoles: number;
  importedPermissions: number;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserImportExportService {

  constructor(private firebaseUserService: FirebaseUserManagementService) {}

  /**
   * Export tất cả dữ liệu user, role, permission ra file JSON
   */
  async exportAllData(): Promise<ExportData> {
    try {
      const users = await firstValueFrom(this.firebaseUserService.getUsers());
      const roles = await firstValueFrom(this.firebaseUserService.getRoles());
      const permissions = await firstValueFrom(this.firebaseUserService.getPermissions());

      const exportData: ExportData = {
        users,
        roles,
        permissions,
        exportDate: new Date(),
        version: '1.0.0'
      };

      return exportData;
    } catch (error: any) {
      console.error('Error exporting data:', error);
      throw new Error('Không thể xuất dữ liệu: ' + error.message);
    }
  }

  /**
   * Export chỉ users ra file JSON
   */
  async exportUsers(): Promise<User[]> {
    try {
      const users = await firstValueFrom(this.firebaseUserService.getUsers());
      return users;
    } catch (error: any) {
      console.error('Error exporting users:', error);
      throw new Error('Không thể xuất danh sách người dùng: ' + error.message);
    }
  }

  /**
   * Export chỉ roles ra file JSON
   */
  async exportRoles(): Promise<Role[]> {
    try {
      const roles = await firstValueFrom(this.firebaseUserService.getRoles());
      return roles;
    } catch (error: any) {
      console.error('Error exporting roles:', error);
      throw new Error('Không thể xuất danh sách vai trò: ' + error.message);
    }
  }

  /**
   * Export chỉ permissions ra file JSON
   */
  async exportPermissions(): Promise<Permission[]> {
    try {
      const permissions = await firstValueFrom(this.firebaseUserService.getPermissions());
      return permissions;
    } catch (error: any) {
      console.error('Error exporting permissions:', error);
      throw new Error('Không thể xuất danh sách quyền hạn: ' + error.message);
    }
  }

  /**
   * Download dữ liệu ra file JSON
   */
  downloadAsJSON(data: any, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download dữ liệu ra file CSV
   */
  downloadAsCSV(data: any[], filename: string, type: 'users' | 'roles' | 'permissions'): void {
    let csvContent = '';
    
    if (type === 'users') {
      csvContent = this.convertUsersToCSV(data as User[]);
    } else if (type === 'roles') {
      csvContent = this.convertRolesToCSV(data as Role[]);
    } else if (type === 'permissions') {
      csvContent = this.convertPermissionsToCSV(data as Permission[]);
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Import dữ liệu từ file JSON
   */
  async importFromJSON(file: File): Promise<ImportResult> {
    try {
      const text = await this.readFileAsText(file);
      const data = JSON.parse(text) as ExportData;
      
      const result: ImportResult = {
        success: true,
        message: 'Import thành công',
        importedUsers: 0,
        importedRoles: 0,
        importedPermissions: 0,
        errors: []
      };

      // Import permissions trước
      if (data.permissions && data.permissions.length > 0) {
        for (const permission of data.permissions) {
          try {
            await this.firebaseUserService.createPermission(permission);
            result.importedPermissions++;
          } catch (error: any) {
            result.errors.push(`Lỗi import permission ${permission.name}: ${error.message}`);
          }
        }
      }

      // Import roles
      if (data.roles && data.roles.length > 0) {
        for (const role of data.roles) {
          try {
            await this.firebaseUserService.createRole(role);
            result.importedRoles++;
          } catch (error: any) {
            result.errors.push(`Lỗi import role ${role.name}: ${error.message}`);
          }
        }
      }

      // Import users
      if (data.users && data.users.length > 0) {
        for (const user of data.users) {
          try {
            // Loại bỏ id và timestamps để tạo mới
            const { id, createdAt, updatedAt, ...userData } = user;
            await this.firebaseUserService.createUser(userData);
            result.importedUsers++;
          } catch (error: any) {
            result.errors.push(`Lỗi import user ${user.username}: ${error.message}`);
          }
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
        result.message = `Import hoàn thành với ${result.errors.length} lỗi`;
      }

      return result;
    } catch (error: any) {
      console.error('Error importing data:', error);
      return {
        success: false,
        message: 'Lỗi khi đọc file: ' + error.message,
        importedUsers: 0,
        importedRoles: 0,
        importedPermissions: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Import users từ file CSV
   */
  async importUsersFromCSV(file: File): Promise<ImportResult> {
    try {
      const text = await this.readFileAsText(file);
      const users = this.parseCSVToUsers(text);
      
      const result: ImportResult = {
        success: true,
        message: 'Import users thành công',
        importedUsers: 0,
        importedRoles: 0,
        importedPermissions: 0,
        errors: []
      };

      for (const user of users) {
        try {
          await this.firebaseUserService.createUser(user);
          result.importedUsers++;
          } catch (error: any) {
            result.errors.push(`Lỗi import user ${user.username}: ${error.message}`);
          }
      }

      if (result.errors.length > 0) {
        result.success = false;
        result.message = `Import users hoàn thành với ${result.errors.length} lỗi`;
      }

      return result;
    } catch (error: any) {
      console.error('Error importing users from CSV:', error);
      return {
        success: false,
        message: 'Lỗi khi đọc file CSV: ' + error.message,
        importedUsers: 0,
        importedRoles: 0,
        importedPermissions: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Đọc file thành text
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  /**
   * Convert users to CSV
   */
  private convertUsersToCSV(users: User[]): string {
    const headers = [
      'Username', 'Email', 'Full Name', 'Phone', 'Department', 
      'Position', 'Is Active', 'Roles', 'Created At', 'Updated At'
    ];
    
    const rows = users.map(user => [
      user.username,
      user.email,
      user.fullName,
      user.phone || '',
      user.department || '',
      user.position || '',
      user.isActive ? 'Yes' : 'No',
      user.roles.join(';'),
      user.createdAt.toISOString(),
      user.updatedAt.toISOString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert roles to CSV
   */
  private convertRolesToCSV(roles: Role[]): string {
    const headers = [
      'Name', 'Display Name', 'Description', 'Is Active', 
      'Permissions Count', 'Created At', 'Updated At'
    ];
    
    const rows = roles.map(role => [
      role.name,
      role.displayName,
      role.description || '',
      role.isActive ? 'Yes' : 'No',
      role.permissions?.length || 0,
      role.createdAt.toISOString(),
      role.updatedAt.toISOString()
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  /**
   * Convert permissions to CSV
   */
  private convertPermissionsToCSV(permissions: Permission[]): string {
    const headers = [
      'Name', 'Display Name', 'Description', 'Module', 
      'Action', 'Is Active'
    ];
    
    const rows = permissions.map(permission => [
      permission.name,
      permission.displayName,
      permission.description || '',
      permission.module,
      permission.action,
      permission.isActive ? 'Yes' : 'No'
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  /**
   * Parse CSV to users
   */
  private parseCSVToUsers(csvText: string): Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
    const users: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
        const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
          username: values[0] || '',
          email: values[1] || '',
          fullName: values[2] || '',
          phone: values[3] || '',
          department: values[4] || '',
          position: values[5] || '',
          isActive: values[6]?.toLowerCase() === 'yes',
          roles: values[7] ? values[7].split(';').filter(r => r.trim()) : [],
          createdBy: 'import',
          updatedBy: 'import'
        };
        users.push(user);
      }
    }

    return users;
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type) || 
           allowedTypes.some(type => file.name.toLowerCase().endsWith(type));
  }

  /**
   * Get file size in MB
   */
  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }
}
