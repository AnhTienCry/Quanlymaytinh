# 🖥️ Hệ thống Quản lý Máy tính

Hệ thống quản lý máy tính toàn diện với đầy đủ tính năng: đăng nhập/đăng ký, quét thông tin máy tính tự động, quản lý nhập/xuất kho.

## 📋 Tính năng

### 👤 Người dùng thường (User)
- Đăng ký / Đăng nhập tài khoản
- Quét thông tin máy tính đang sử dụng
- Nhập thông tin bổ sung: Tên người dùng, Tình trạng máy, Đề xuất
- Gửi thông tin lên hệ thống

### 👨‍💼 Quản trị viên (Admin)
- Dashboard tổng quan
- Quản lý danh sách máy tính
- Xem/Sửa/Xóa thông tin máy
- Quản lý người dùng
- Quản lý kho
- Xem lịch sử quét

## 🏗️ Kiến trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  • React 18 + TypeScript                                    │
│  • TailwindCSS + Ant Design                                 │
│  • Framer Motion (Animations)                               │
│  • Zustand (State Management)                               │
│  • React Router v6                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (Express + TypeScript)             │
│  • Express.js                                               │
│  • JWT Authentication                                       │
│  • bcrypt Password Hashing                                  │
│  • mssql Driver                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (SQL Server)                     │
│  • Users, MayTinh, Kho, PhongBan                           │
│  • NhanVien, NhapKho, XuatKho, LichSuQuet                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js 18+
- SQL Server 2019+
- npm hoặc yarn

### 1. Database

```bash
# Chạy script SQL để tạo database
# Mở SQL Server Management Studio và chạy file:
database/init.sql
```

### 2. Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env (copy từ .env.example)
# Cấu hình kết nối database:
# DB_SERVER=localhost
# DB_PORT=1433
# DB_USER=sa
# DB_PASSWORD=your_password
# DB_NAME=QuanLyMayTinhDB
# JWT_SECRET=your-secret-key

# Chạy development server
npm run dev
```

### 3. Frontend

```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

### 4. Truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Tài khoản Admin mặc định**: `admin` / `admin123`

## 📁 Cấu trúc thư mục

```
Quanlymaytinh/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & JWT config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layouts/     # AuthLayout, MainLayout
│   │   │   └── ui/          # Button, Input, Card, Table, Modal
│   │   ├── hooks/           # Custom hooks (useSystemInfo)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # Zustand stores
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── database/
│   └── init.sql             # Database schema
│
├── agent/
│   ├── scan-tool.ps1        # PowerShell scan tool
│   └── README.md            # Agent documentation
│
└── README.md
```

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/register` | Đăng ký |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### Computers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/computers` | Lấy danh sách máy (Admin) |
| GET | `/api/computers/:id` | Lấy chi tiết máy |
| POST | `/api/computers/scan` | Gửi dữ liệu quét |
| PUT | `/api/computers/:id` | Cập nhật máy (Admin) |
| DELETE | `/api/computers/:id` | Xóa máy (Admin) |

### Dashboard
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/dashboard/stats` | Thống kê tổng quan |
| GET | `/api/dashboard/users` | Danh sách users |

### Warehouses
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/warehouses` | Lấy danh sách kho |
| POST | `/api/warehouses` | Thêm kho (Admin) |
| PUT | `/api/warehouses/:id` | Cập nhật kho (Admin) |
| DELETE | `/api/warehouses/:id` | Xóa kho (Admin) |

## 🔧 Agent Tool

PowerShell script để quét thông tin phần cứng máy tính:

```powershell
# Chạy không gửi lên server (xem trước)
.\agent\scan-tool.ps1

# Gửi lên server với token
.\agent\scan-tool.ps1 -Token "your-jwt-token" -TenNguoiDung "Nguyễn Văn A"
```

## 🎨 UI/UX Features

- **Dark Theme**: Giao diện tối hiện đại, dễ nhìn
- **Glass Morphism**: Hiệu ứng kính mờ sang trọng
- **Smooth Animations**: Animation mượt mà với Framer Motion
- **Responsive**: Tương thích mobile và desktop
- **Vietnamese**: Giao diện hoàn toàn tiếng Việt

## 📝 Luồng hoạt động

### User Flow
```
Đăng nhập → UserHome → Quét thông tin → Nhập tên/tình trạng/đề xuất → Gửi → Thành công
```

### Admin Flow
```
Đăng nhập (admin/admin123) → Dashboard → Xem thống kê → Quản lý máy tính/users/kho
```

## 🛡️ Bảo mật

- JWT Token Authentication
- Password hashing với bcrypt
- Role-based Access Control (Admin/User)
- SQL Injection Prevention (Parameterized queries)
- CORS Protection
- Helmet Security Headers

## 📄 License

MIT License © 2025
