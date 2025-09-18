export enum STATUS {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2,
  PROCESSING = 3,
  COMPLETED = 4,
  CANCELLED = 5,
  NEW = 6,
  PROCESSED = 7
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
  VIEWER = 'viewer'
}
