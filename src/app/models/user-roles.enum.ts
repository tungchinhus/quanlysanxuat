// Enum cho các role của user
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ADMINISTRATOR = 'administrator',
  TOTRUONG = 'totruong',
  QUANDAYCAO = 'quandaycao',
  QUANDAYHA = 'quandayha',
  EPBOIDAY = 'epboiday',
  KCS = 'kcs',
  USER = 'user'
}

// Enum cho các khâu sản xuất
export enum KhauSx {
  ADMIN = 'admin',
  QUANDAYCAO = 'quandaycao',
  QUANDAYHA = 'quandayha',
  EPBOIDAY = 'epboiday',
  KCS = 'kcs',
  UNKNOWN = 'unknown'
}

// Mapping từ role sang khau_sx
export const ROLE_TO_KHAU_SX_MAP: Record<string, KhauSx> = {
  [UserRole.QUANDAYCAO]: KhauSx.QUANDAYCAO,
  [UserRole.QUANDAYHA]: KhauSx.QUANDAYHA,
  [UserRole.EPBOIDAY]: KhauSx.EPBOIDAY,
  [UserRole.KCS]: KhauSx.KCS,
  [UserRole.ADMIN]: KhauSx.ADMIN,
  [UserRole.MANAGER]: KhauSx.ADMIN,
  [UserRole.ADMINISTRATOR]: KhauSx.ADMIN,
  [UserRole.TOTRUONG]: KhauSx.ADMIN
};

// Helper functions
export class RoleHelper {
  /**
   * Chuyển đổi roles array sang khau_sx
   * @param roles Array of roles
   * @returns KhauSx enum value
   */
  static rolesToKhauSx(roles: string[]): KhauSx {
    if (!roles || roles.length === 0) {
      return KhauSx.UNKNOWN;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    // Ưu tiên kiểm tra theo thứ tự quan trọng
    const priorityOrder = [
      UserRole.ADMIN,
      UserRole.MANAGER,
      UserRole.ADMINISTRATOR,
      UserRole.TOTRUONG,
      UserRole.QUANDAYCAO,
      UserRole.QUANDAYHA,
      UserRole.EPBOIDAY,
      UserRole.KCS
    ];

    for (const priorityRole of priorityOrder) {
      if (normalizedRoles.includes(priorityRole.toLowerCase())) {
        return ROLE_TO_KHAU_SX_MAP[priorityRole] || KhauSx.UNKNOWN;
      }
    }

    return KhauSx.UNKNOWN;
  }

  /**
   * Kiểm tra user có quyền admin/manager không
   * @param roles Array of roles
   * @returns boolean
   */
  static isAdminOrManager(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    return normalizedRoles.some(role => 
      role === UserRole.ADMIN ||
      role === UserRole.MANAGER ||
      role === UserRole.ADMINISTRATOR ||
      role === UserRole.TOTRUONG
    );
  }

  /**
   * Kiểm tra user có quyền gia công hạ không
   * @param roles Array of roles
   * @returns boolean
   */
  static isGiaCongHa(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    return normalizedRoles.some(role => 
      role === UserRole.QUANDAYHA
    );
  }

  /**
   * Kiểm tra user có quyền gia công cao không
   * @param roles Array of roles
   * @returns boolean
   */
  static isGiaCongCao(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    return normalizedRoles.some(role => 
      role === UserRole.QUANDAYCAO
    );
  }

  /**
   * Kiểm tra user có quyền gia công ép không
   * @param roles Array of roles
   * @returns boolean
   */
  static isGiaCongEp(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    return normalizedRoles.some(role => 
      role === UserRole.EPBOIDAY
    );
  }

  /**
   * Kiểm tra user có quyền KCS không
   * @param roles Array of roles
   * @returns boolean
   */
  static isKCS(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    // Normalize roles to lowercase để không phân biệt chữ hoa thường
    const normalizedRoles = roles.map(role => role.toLowerCase().trim());

    return normalizedRoles.some(role => 
      role === UserRole.KCS
    );
  }

  /**
   * Normalize roles array (chuyển về lowercase và loại bỏ duplicate)
   * @param roles Array of roles
   * @returns Normalized roles array
   */
  static normalizeRoles(roles: string[]): string[] {
    if (!roles || roles.length === 0) {
      return [];
    }

    return [...new Set(roles.map(role => role.toLowerCase().trim()))];
  }

  /**
   * Validate role string
   * @param role Role string
   * @returns boolean
   */
  static isValidRole(role: string): boolean {
    if (!role) {
      return false;
    }

    const normalizedRole = role.toLowerCase().trim();
    return Object.values(UserRole).includes(normalizedRole as UserRole);
  }

  /**
   * Get display name for role
   * @param role Role string
   * @returns Display name
   */
  static getRoleDisplayName(role: string): string {
    const roleDisplayNames: Record<string, string> = {
      [UserRole.ADMIN]: 'Quản trị viên',
      [UserRole.MANAGER]: 'Quản lý',
      [UserRole.ADMINISTRATOR]: 'Quản trị viên',
      [UserRole.TOTRUONG]: 'Tổ trưởng',
      [UserRole.QUANDAYCAO]: 'Quấn dây cao',
      [UserRole.QUANDAYHA]: 'Quấn dây hạ',
      [UserRole.EPBOIDAY]: 'Ép bối dây',
      [UserRole.KCS]: 'Kiểm soát chất lượng',
      [UserRole.USER]: 'Người dùng'
    };

    return roleDisplayNames[role.toLowerCase()] || role;
  }

  /**
   * Get display name for khau_sx
   * @param khauSx KhauSx enum value
   * @returns Display name
   */
  static getKhauSxDisplayName(khauSx: KhauSx): string {
    const khauSxDisplayNames: Record<KhauSx, string> = {
      [KhauSx.ADMIN]: 'Quản trị',
      [KhauSx.QUANDAYCAO]: 'Quấn dây cao',
      [KhauSx.QUANDAYHA]: 'Quấn dây hạ',
      [KhauSx.EPBOIDAY]: 'Ép bối dây',
      [KhauSx.KCS]: 'Kiểm soát chất lượng',
      [KhauSx.UNKNOWN]: 'Không xác định'
    };

    return khauSxDisplayNames[khauSx] || khauSx;
  }
}
