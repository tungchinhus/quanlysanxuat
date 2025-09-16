export interface User {
  id?: string;
  email: string;
  displayName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
  createdBy?: string;
  uid?: string; // For username lookup
}

export enum UserRole {
  ADMIN = 'admin',
  TOTRUONG_QUANDAY = 'totruong_quanday',
  QUANDAY_HA = 'quanday_ha',
  QUANDAY_CAO = 'quanday_cao',
  EP_BOIDAY = 'ep_boiday',
  KCS = 'kcs'
}

export const USER_ROLES = {
  [UserRole.ADMIN]: {
    name: 'Quản trị hệ thống',
    description: 'Toàn quyền quản lý hệ thống',
    permissions: ['all']
  },
  [UserRole.TOTRUONG_QUANDAY]: {
    name: 'Tổ trưởng quấn dây',
    description: 'Tạo và quản lý bảng vẽ',
    permissions: ['bangve_create', 'bangve_edit', 'bangve_view', 'bangve_delete']
  },
  [UserRole.QUANDAY_HA]: {
    name: 'Quấn dây hạ',
    description: 'Thao tác bối dây hạ',
    permissions: ['bd_ha_create', 'bd_ha_edit', 'bd_ha_view']
  },
  [UserRole.QUANDAY_CAO]: {
    name: 'Quấn dây cao',
    description: 'Thao tác bối dây cao',
    permissions: ['bd_cao_create', 'bd_cao_edit', 'bd_cao_view']
  },
  [UserRole.EP_BOIDAY]: {
    name: 'Ép bối dây',
    description: 'Thao tác ép bối dây',
    permissions: ['ep_boiday_create', 'ep_boiday_edit', 'ep_boiday_view']
  },
  [UserRole.KCS]: {
    name: 'Kiểm tra chất lượng',
    description: 'Kiểm tra chất lượng khâu sản xuất',
    permissions: ['kcs_approve', 'kcs_view', 'quality_control']
  }
};
