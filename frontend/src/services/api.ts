import axios, { AxiosError, AxiosResponse } from 'axios';

// API Base URL - Tự động detect dựa trên hostname
// Nếu truy cập từ localhost, dùng localhost
// Nếu truy cập từ IP khác, dùng IP đó
function getApiUrl(): string {
  // Ưu tiên biến môi trường nếu có
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Tự động detect: sử dụng cùng host với frontend nhưng port 3000
  const currentHost = window.location.hostname;
  return `http://${currentHost}:3000/api`;
}

const API_URL = getApiUrl();

console.log('🔗 API URL:', API_URL);

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.error 
      || error.response?.data?.message 
      || error.message 
      || 'Có lỗi xảy ra';
    
    return Promise.reject(new Error(message));
  }
);

// API Response type
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

export interface AuthUser {
  userId: number;
  username: string;
  role: 'admin' | 'user';
}

// Helper to normalize role from API response (database might return 'Admin' instead of 'admin')
export function normalizeRole(role: string | undefined | null): 'admin' | 'user' {
  if (!role) return 'user';
  const normalized = role.toLowerCase().trim();
  return normalized === 'admin' ? 'admin' : 'user';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
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
  TrangThai?: string;
  TinhTrang?: string;
  DeXuat?: string;
  TenNguoiDung?: string;
  TenKho?: string;
  NgayTao?: string;
  NgayCapNhat?: string;
}

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
  tinhTrang?: string;
  deXuat?: string;
  tenNguoiDung?: string;
}

// Dashboard types
export interface DashboardStats {
  totalComputers: number;
  totalUsers: number;
  totalWarehouses: number;
  totalDepartments: number;
  recentScans: Array<{
    Id: number;
    MaMT?: number;
    MAC?: string;
    IPAddress?: string;
    NgayQuet: string;
    TenMT?: string;
    TenNguoiDung?: string;
  }>;
  computersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

// Warehouse types
export interface Warehouse {
  MaKho: number;
  TenKho: string;
  DiaChi?: string;
  MoTa?: string;
  NgayTao?: string;
  NgayCapNhat?: string;
}

// User types
export interface User {
  UserId: number;
  Username: string;
  Role: 'admin' | 'user';
  IsActive: boolean;
  LastLogin?: string;
  NgayTao: string;
  ComputerCount?: number;
}

// ============================================
// API Functions
// ============================================

// Auth APIs
export const authApi = {
  login: (data: LoginRequest) => 
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<AuthResponse>>('/auth/register', data),
  
  getMe: () => 
    api.get<ApiResponse<AuthUser>>('/auth/me'),
};

// Computer APIs
export const computerApi = {
  getAll: () => 
    api.get<ApiResponse<Computer[]>>('/computers'),
  
  getById: (id: number) => 
    api.get<ApiResponse<Computer>>(`/computers/${id}`),
  
  submitScan: (data: ScanData) => 
    api.post<ApiResponse<{ maMT: number }>>('/computers/scan', data),
  
  update: (id: number, data: Partial<Computer>) => 
    api.put<ApiResponse>(`/computers/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse>(`/computers/${id}`),
};

// Dashboard APIs
export const dashboardApi = {
  getStats: () => 
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
  
  getUsers: () => 
    api.get<ApiResponse<User[]>>('/dashboard/users'),
  
  getRecentUsers: () => 
    api.get<ApiResponse<User[]>>('/dashboard/recent-users'),
};

// Warehouse APIs
export const warehouseApi = {
  getAll: () => 
    api.get<ApiResponse<Warehouse[]>>('/warehouses'),
  
  create: (data: Partial<Warehouse>) => 
    api.post<ApiResponse<Warehouse>>('/warehouses', data),
  
  update: (id: number, data: Partial<Warehouse>) => 
    api.put<ApiResponse>(`/warehouses/${id}`, data),
  
  delete: (id: number) => 
    api.delete<ApiResponse>(`/warehouses/${id}`),
};

export default api;
