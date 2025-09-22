export interface KcsApproveData {
  id?: string;
  kyhieubangve?: string;        // nvarchar(255) - Ký hiệu bảng vẽ
  id_boiday?: string;           // nvarchar(255) - ID bối dây
  masothe_bd?: string;          // nvarchar(50) - Mã số thẻ bối dây
  user_kcs_approve?: string;    // nvarchar(255) - User KCS approve
  kcs_approve_status?: string;  // nvarchar(255) - Trạng thái approve KCS
  ghi_chu?: string;             // nvarchar(255) - Ghi chú
  ngay_approve?: Date;          // datetime - Ngày approve
  created_at?: Date;            // Thời gian tạo (Firebase)
  updated_at?: Date;            // Thời gian cập nhật (Firebase)
}

export interface KcsApproveCreateData extends Omit<KcsApproveData, 'id' | 'created_at' | 'updated_at'> {
  // Required fields for creation
  kyhieubangve: string;
  id_boiday: string;
  user_kcs_approve: string;
  kcs_approve_status: string;
  ngay_approve: Date;
}

export interface KcsApproveUpdateData extends Partial<KcsApproveData> {
  id: string;
  updated_at?: Date;
}
