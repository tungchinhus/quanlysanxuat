export enum STATUS {
  NEW = 0,           // Mới
  PROCESSING = 1,    // Đang xử lý
  COMPLETED = 2,     // Đã hoàn thành
  PENDING = 3,       // Chờ duyệt
  APPROVED = 4,      // Đã duyệt
  REJECTED = 5,      // Từ chối
  CANCELLED = 6,     // Hủy bỏ
  PROCESSED = 7      // Đã xử lý (legacy)
}

export enum DRAWING_STATUS {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}

export enum USER_ROLE {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  VIEWER = 'viewer',
  QUANDAYCAO = 'quandaycao',
  BOIDAYCAO = 'boidaycao',
  QUANDAYHA = 'quandayha',
  BOIDAYHA = 'boidayha',
  EPBOIDAY = 'epboiday',
  TOTRUONG = 'totruong',
  KCS = 'kcs'
}
