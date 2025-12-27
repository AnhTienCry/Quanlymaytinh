// =============================================
// TYPE DEFINITIONS
// =============================================

// User types
export interface User {
  UserId: number;
  Username: string;
  PasswordHash: string;
  Role: 'admin' | 'user';
  MaNV?: number;
  IsActive: boolean;
  LastLogin?: Date;
  NgayTao: Date;
  NgayCapNhat: Date;
}

export interface UserPayload {
  userId: number;
  username: string;
  role: 'admin' | 'user';
}

// Computer types
export interface Computer {
  MaMT: number;
  MaTS?: string;
  TenMT: string;
  Model?: string;
  Hang?: string;
  NamSX?: number;
  CPU?: string;
  RAM?: string;
  SSD?: string;
  VGA?: string;
  MAC: string;
  IPAddress?: string;
  SerialNumber?: string;
  OS?: string;
  MaKho?: number;
  MaNV_DangDung?: number;
  TrangThai: string;
  // Thêm các trường mới theo yêu cầu
  TinhTrang?: string;      // Tình trạng (nhập tay)
  DeXuat?: string;         // Đề xuất (nhập tay)
  TenNguoiDung?: string;   // Tên người dùng (nhập tay)
  NgayTao: Date;
  NgayCapNhat: Date;
}

// Scan data from agent
export interface ScanData {
  hostname: string;
  cpu: string;
  ram: string;
  ssd: string;
  vga: string;
  mac: string;
  ip: string;
  os: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  // Các trường nhập tay
  tinhTrang?: string;
  deXuat?: string;
  tenNguoiDung?: string;
}

// Warehouse types
export interface Kho {
  MaKho: number;
  TenKho: string;
  DiaChi?: string;
  MoTa?: string;
  NgayTao: Date;
  NgayCapNhat: Date;
}

// Department types
export interface PhongBan {
  MaPB: number;
  TenPB: string;
  MoTa?: string;
  NgayTao: Date;
  NgayCapNhat: Date;
}

// Employee types
export interface NhanVien {
  MaNV: number;
  TenNV: string;
  Email?: string;
  SoDienThoai?: string;
  MaPB?: number;
  NgayTao: Date;
  NgayCapNhat: Date;
}

// Stock In types
export interface NhapKho {
  MaNhap: number;
  SoCT: string;
  NgayNhap: Date;
  MaNV_NguoiNhap?: number;
  MaMT?: number;
  MaKho?: number;
  SoLuong: number;
  DienGiai?: string;
  NgayTao: Date;
}

// Stock Out types
export interface XuatKho {
  MaXuat: number;
  SoCT: string;
  NgayXuat: Date;
  MaNV_NguoiXuat?: number;
  MaMT?: number;
  MaNV_NguoiNhan?: number;
  MaKho?: number;
  DienGiai?: string;
  NgayTao: Date;
}

// Scan History
export interface LichSuQuet {
  Id: number;
  MaMT?: number;
  MAC?: string;
  IPAddress?: string;
  RawData?: string;
  NguonQuet?: string;
  NgayQuet: Date;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  tenNguoiDung?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: number;
    username: string;
    role: 'admin' | 'user';
  };
}

// Dashboard stats
export interface DashboardStats {
  totalComputers: number;
  totalUsers: number;
  totalWarehouses: number;
  totalDepartments: number;
  recentScans: LichSuQuet[];
  computersByStatus: { status: string; count: number }[];
}



