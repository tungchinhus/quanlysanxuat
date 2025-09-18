import { Injectable } from '@angular/core';
import { collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { FirebaseService } from './firebase.service';
import { firstValueFrom } from 'rxjs';

export interface AuditLog {
  id?: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  oldValues?: any;
  newValues?: any;
}

export interface AuditLogFilter {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  success?: boolean;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly COLLECTION_NAME = 'auditLogs';

  constructor(private firebaseService: FirebaseService) {}

  /**
   * Ghi log audit
   */
  async logAction(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditLog: Omit<AuditLog, 'id'> = {
        ...logData,
        timestamp: new Date()
      };

      const data = {
        ...auditLog,
        timestamp: Timestamp.fromDate(auditLog.timestamp)
      };

      await addDoc(collection(this.firebaseService.getFirestore(), this.COLLECTION_NAME), data);
    } catch (error) {
      console.error('Error logging audit action:', error);
      // Không throw error để không ảnh hưởng đến chức năng chính
    }
  }

  /**
   * Lấy danh sách audit logs với filter
   */
  async getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    try {
      let q = query(collection(this.firebaseService.getFirestore(), this.COLLECTION_NAME));

      // Apply filters
      if (filter.userId) {
        q = query(q, where('userId', '==', filter.userId));
      }
      if (filter.action) {
        q = query(q, where('action', '==', filter.action));
      }
      if (filter.resource) {
        q = query(q, where('resource', '==', filter.resource));
      }
      if (filter.success !== undefined) {
        q = query(q, where('success', '==', filter.success));
      }
      if (filter.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(filter.startDate)));
      }
      if (filter.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(filter.endDate)));
      }

      // Order by timestamp desc
      q = query(q, orderBy('timestamp', 'desc'));

      // Apply limit
      if (filter.limit) {
        q = query(q, limit(filter.limit));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreDocToAuditLog(doc));
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  /**
   * Lấy audit logs của một user cụ thể
   */
  async getUserAuditLogs(userId: string, limitCount: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ userId, limit: limitCount });
  }

  /**
   * Lấy audit logs của một resource cụ thể
   */
  async getResourceAuditLogs(resource: string, resourceId?: string, limitCount: number = 50): Promise<AuditLog[]> {
    const filter: AuditLogFilter = { resource, limit: limitCount };
    if (resourceId) {
      filter.resourceId = resourceId;
    }
    return this.getAuditLogs(filter);
  }

  /**
   * Lấy audit logs theo action
   */
  async getActionAuditLogs(action: string, limitCount: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ action, limit: limitCount });
  }

  /**
   * Lấy audit logs trong khoảng thời gian
   */
  async getAuditLogsByDateRange(startDate: Date, endDate: Date, limitCount: number = 100): Promise<AuditLog[]> {
    return this.getAuditLogs({ startDate, endDate, limit: limitCount });
  }

  /**
   * Lấy audit logs thất bại
   */
  async getFailedAuditLogs(limitCount: number = 50): Promise<AuditLog[]> {
    return this.getAuditLogs({ success: false, limit: limitCount });
  }

  /**
   * Convert Firestore document to AuditLog
   */
  private convertFirestoreDocToAuditLog(doc: any): AuditLog {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId || '',
      userName: data.userName || '',
      action: data.action || '',
      resource: data.resource || '',
      resourceId: data.resourceId,
      details: data.details || '',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: data.timestamp?.toDate() || new Date(),
      success: data.success ?? true,
      errorMessage: data.errorMessage,
      oldValues: data.oldValues,
      newValues: data.newValues
    };
  }

  /**
   * Helper methods để tạo audit log cho các action phổ biến
   */
  
  async logUserLogin(userId: string, userName: string, success: boolean, errorMessage?: string): Promise<void> {
    await this.logAction({
      userId,
      userName,
      action: 'LOGIN',
      resource: 'USER',
      resourceId: userId,
      details: success ? 'User logged in successfully' : 'User login failed',
      success,
      errorMessage
    });
  }

  async logUserLogout(userId: string, userName: string): Promise<void> {
    await this.logAction({
      userId,
      userName,
      action: 'LOGOUT',
      resource: 'USER',
      resourceId: userId,
      details: 'User logged out',
      success: true
    });
  }

  async logUserCreate(createdBy: string, createdByName: string, newUser: any): Promise<void> {
    await this.logAction({
      userId: createdBy,
      userName: createdByName,
      action: 'CREATE',
      resource: 'USER',
      resourceId: newUser.id,
      details: `Created user: ${newUser.username}`,
      success: true,
      newValues: newUser
    });
  }

  async logUserUpdate(updatedBy: string, updatedByName: string, userId: string, oldUser: any, newUser: any): Promise<void> {
    await this.logAction({
      userId: updatedBy,
      userName: updatedByName,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      details: `Updated user: ${newUser.username}`,
      success: true,
      oldValues: oldUser,
      newValues: newUser
    });
  }

  async logUserDelete(deletedBy: string, deletedByName: string, deletedUser: any): Promise<void> {
    await this.logAction({
      userId: deletedBy,
      userName: deletedByName,
      action: 'DELETE',
      resource: 'USER',
      resourceId: deletedUser.id,
      details: `Deleted user: ${deletedUser.username}`,
      success: true,
      oldValues: deletedUser
    });
  }

  async logRoleCreate(createdBy: string, createdByName: string, newRole: any): Promise<void> {
    await this.logAction({
      userId: createdBy,
      userName: createdByName,
      action: 'CREATE',
      resource: 'ROLE',
      resourceId: newRole.id,
      details: `Created role: ${newRole.name}`,
      success: true,
      newValues: newRole
    });
  }

  async logRoleUpdate(updatedBy: string, updatedByName: string, roleId: string, oldRole: any, newRole: any): Promise<void> {
    await this.logAction({
      userId: updatedBy,
      userName: updatedByName,
      action: 'UPDATE',
      resource: 'ROLE',
      resourceId: roleId,
      details: `Updated role: ${newRole.name}`,
      success: true,
      oldValues: oldRole,
      newValues: newRole
    });
  }

  async logRoleDelete(deletedBy: string, deletedByName: string, deletedRole: any): Promise<void> {
    await this.logAction({
      userId: deletedBy,
      userName: deletedByName,
      action: 'DELETE',
      resource: 'ROLE',
      resourceId: deletedRole.id,
      details: `Deleted role: ${deletedRole.name}`,
      success: true,
      oldValues: deletedRole
    });
  }

  async logPermissionCreate(createdBy: string, createdByName: string, newPermission: any): Promise<void> {
    await this.logAction({
      userId: createdBy,
      userName: createdByName,
      action: 'CREATE',
      resource: 'PERMISSION',
      resourceId: newPermission.id,
      details: `Created permission: ${newPermission.name}`,
      success: true,
      newValues: newPermission
    });
  }

  async logPermissionUpdate(updatedBy: string, updatedByName: string, permissionId: string, oldPermission: any, newPermission: any): Promise<void> {
    await this.logAction({
      userId: updatedBy,
      userName: updatedByName,
      action: 'UPDATE',
      resource: 'PERMISSION',
      resourceId: permissionId,
      details: `Updated permission: ${newPermission.name}`,
      success: true,
      oldValues: oldPermission,
      newValues: newPermission
    });
  }

  async logPermissionDelete(deletedBy: string, deletedByName: string, deletedPermission: any): Promise<void> {
    await this.logAction({
      userId: deletedBy,
      userName: deletedByName,
      action: 'DELETE',
      resource: 'PERMISSION',
      resourceId: deletedPermission.id,
      details: `Deleted permission: ${deletedPermission.name}`,
      success: true,
      oldValues: deletedPermission
    });
  }

  async logDataExport(exportedBy: string, exportedByName: string, dataType: string, recordCount: number): Promise<void> {
    await this.logAction({
      userId: exportedBy,
      userName: exportedByName,
      action: 'EXPORT',
      resource: 'DATA',
      details: `Exported ${dataType}: ${recordCount} records`,
      success: true
    });
  }

  async logDataImport(importedBy: string, importedByName: string, dataType: string, recordCount: number, success: boolean, errorMessage?: string): Promise<void> {
    await this.logAction({
      userId: importedBy,
      userName: importedByName,
      action: 'IMPORT',
      resource: 'DATA',
      details: `Imported ${dataType}: ${recordCount} records`,
      success,
      errorMessage
    });
  }

  async logSystemAction(performedBy: string, performedByName: string, action: string, details: string, success: boolean = true, errorMessage?: string): Promise<void> {
    await this.logAction({
      userId: performedBy,
      userName: performedByName,
      action,
      resource: 'SYSTEM',
      details,
      success,
      errorMessage
    });
  }
}
