export interface Drawing {
  id?: string;
  kyHieu: string; // Ký hiệu
  congSuat: number; // Công suất
  tbkt: string; // TBKT
  dienAp: string; // Điện áp
  ngayTao: Date; // Ngày tạo
  trangThai: 'new' | 'processing' | 'completed' | 'error'; // Trạng thái
  ghiChu?: string; // Ghi chú
  nguoiTao?: string; // Người tạo
  nguoiXuLy?: string; // Người xử lý
  ngayCapNhat?: Date; // Ngày cập nhật
}

export interface DrawingCreate {
  kyHieu: string;
  congSuat: number;
  tbkt: string;
  dienAp: string;
  ghiChu?: string;
  nguoiTao?: string;
}

export interface DrawingUpdate {
  kyHieu?: string;
  congSuat?: number;
  tbkt?: string;
  dienAp?: string;
  trangThai?: 'new' | 'processing' | 'completed' | 'error';
  ghiChu?: string;
  nguoiXuLy?: string;
  ngayCapNhat?: Date;
}

export interface DrawingStats {
  total: number;
  new: number;
  processing: number;
  completed: number;
  error: number;
}
