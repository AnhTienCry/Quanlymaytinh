-- =============================================
-- QUẢN LÝ MÁY TÍNH - DATABASE SCHEMA
-- SQL Server
-- =============================================

-- Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'QuanLyMayTinhDB')
BEGIN
    CREATE DATABASE QuanLyMayTinhDB;
END
GO

USE QuanLyMayTinhDB;
GO

-- =============================================
-- 1. BẢNG KHO (Warehouses)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Kho')
BEGIN
    CREATE TABLE Kho (
        MaKho INT IDENTITY(1,1) PRIMARY KEY,
        TenKho NVARCHAR(100) NOT NULL,
        DiaChi NVARCHAR(255),
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- 2. BẢNG PHÒNG BAN (Departments)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PhongBan')
BEGIN
    CREATE TABLE PhongBan (
        MaPB INT IDENTITY(1,1) PRIMARY KEY,
        TenPB NVARCHAR(100) NOT NULL,
        MoTa NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- 3. BẢNG NHÂN VIÊN (Employees)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhanVien')
BEGIN
    CREATE TABLE NhanVien (
        MaNV INT IDENTITY(1,1) PRIMARY KEY,
        TenNV NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100),
        SoDienThoai NVARCHAR(20),
        MaPB INT FOREIGN KEY REFERENCES PhongBan(MaPB),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- 4. BẢNG USERS (Đăng nhập)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        Role NVARCHAR(20) NOT NULL CHECK (Role IN ('admin', 'user')),
        MaNV INT FOREIGN KEY REFERENCES NhanVien(MaNV),
        IsActive BIT DEFAULT 1,
        LastLogin DATETIME2,
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
ELSE
BEGIN
    -- Migrate old plain 'Password' column to 'PasswordHash' if present
    IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Password')
    BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'PasswordHash')
        BEGIN
            EXEC sp_rename 'Users.Password', 'PasswordHash', 'COLUMN';
        END
    END
END
GO

-- =============================================
-- 5. BẢNG MÁY TÍNH (Computers)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MayTinh')
BEGIN
    CREATE TABLE MayTinh (
        MaMT INT IDENTITY(1,1) PRIMARY KEY,
        MaTS NVARCHAR(50),             -- ĐÃ BỎ TỪ KHÓA 'UNIQUE' Ở ĐÂY ĐỂ TRÁNH LỖI 1 NULL
        TenMT NVARCHAR(100) DEFAULT N'New PC', 
        Model NVARCHAR(100),                  
        Hang NVARCHAR(100),                    
        NamSX INT,                             
        CPU NVARCHAR(200),
        RAM NVARCHAR(50),                      
        SSD NVARCHAR(200),                     
        VGA NVARCHAR(200),                     
        MAC NVARCHAR(50) NOT NULL UNIQUE,      -- MAC vẫn giữ Unique cứng (bắt buộc phải có và không trùng)
        IPAddress NVARCHAR(45),                
        SerialNumber NVARCHAR(100),            
        OS NVARCHAR(100),                      
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        MaNV_DangDung INT FOREIGN KEY REFERENCES NhanVien(MaNV), 
        TrangThai NVARCHAR(50) DEFAULT N'Trong kho', 
        TinhTrang NVARCHAR(500),               
        DeXuat NVARCHAR(1000),                 
        TenNguoiDung NVARCHAR(200),            
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME(),
        NgayCapNhat DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    
    -- Index cho tìm kiếm nhanh
    CREATE INDEX IX_MayTinh_MAC ON MayTinh(MAC);

    -- TẠO UNIQUE INDEX THÔNG MINH (Cho phép nhiều NULL, nhưng cấm trùng Mã Tài Sản nếu đã nhập)
    CREATE UNIQUE INDEX IX_MayTinh_MaTS_Unique 
    ON MayTinh(MaTS) 
    WHERE MaTS IS NOT NULL;
END
ELSE
BEGIN
    -- ... (Giữ nguyên phần thêm cột nếu bảng đã tồn tại) ...
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MayTinh') AND name = 'TinhTrang')
    BEGIN
        ALTER TABLE MayTinh ADD TinhTrang NVARCHAR(500);
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MayTinh') AND name = 'DeXuat')
    BEGIN
        ALTER TABLE MayTinh ADD DeXuat NVARCHAR(1000);
    END
    
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('MayTinh') AND name = 'TenNguoiDung')
    BEGIN
        ALTER TABLE MayTinh ADD TenNguoiDung NVARCHAR(200);
    END
END
GO

-- =============================================
-- 6. BẢNG NHẬP KHO (Stock In)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NhapKho')
BEGIN
    CREATE TABLE NhapKho (
        MaNhap INT IDENTITY(1,1) PRIMARY KEY,
        SoCT NVARCHAR(50) NOT NULL,            -- Số chứng từ
        NgayNhap DATE NOT NULL,
        MaNV_NguoiNhap INT FOREIGN KEY REFERENCES NhanVien(MaNV), -- Mã người dùng = Mã NV
        MaMT INT FOREIGN KEY REFERENCES MayTinh(MaMT),
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        SoLuong INT DEFAULT 1,
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- 7. BẢNG XUẤT KHO (Stock Out)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'XuatKho')
BEGIN
    CREATE TABLE XuatKho (
        MaXuat INT IDENTITY(1,1) PRIMARY KEY,
        SoCT NVARCHAR(50) NOT NULL,            -- Số chứng từ
        NgayXuat DATE NOT NULL,
        MaNV_NguoiXuat INT FOREIGN KEY REFERENCES NhanVien(MaNV), -- Mã người dùng = Mã NV
        MaMT INT FOREIGN KEY REFERENCES MayTinh(MaMT),
        MaNV_NguoiNhan INT FOREIGN KEY REFERENCES NhanVien(MaNV), -- Ai nhận máy
        MaKho INT FOREIGN KEY REFERENCES Kho(MaKho),
        DienGiai NVARCHAR(500),
        NgayTao DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- 8. BẢNG LỊCH SỬ QUÉT (Scan History)
-- =============================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LichSuQuet')
BEGIN
    CREATE TABLE LichSuQuet (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MaMT INT FOREIGN KEY REFERENCES MayTinh(MaMT),
        MAC NVARCHAR(50),
        IPAddress NVARCHAR(45),
        RawData NVARCHAR(MAX),                 -- JSON đầy đủ từ agent
        NguonQuet NVARCHAR(50),                -- 'agent-tool', 'arp', 'manual'
        NgayQuet DATETIME2 DEFAULT SYSUTCDATETIME()
    );
END
GO

-- =============================================
-- INSERT DỮ LIỆU MẪU
-- =============================================

-- Kho mẫu
IF NOT EXISTS (SELECT * FROM Kho)
BEGIN
    INSERT INTO Kho (TenKho, DiaChi, MoTa) VALUES
    (N'Kho chính', N'Tầng 1, Tòa nhà A', N'Kho lưu trữ thiết bị chính'),
    (N'Kho chi nhánh HCM', N'Quận 1, TP.HCM', N'Kho chi nhánh miền Nam'),
    (N'Kho chi nhánh HN', N'Cầu Giấy, Hà Nội', N'Kho chi nhánh miền Bắc');
END
GO

-- Phòng ban mẫu
IF NOT EXISTS (SELECT * FROM PhongBan)
BEGIN
    INSERT INTO PhongBan (TenPB, MoTa) VALUES
    (N'Phòng IT', N'Quản lý hệ thống CNTT'),
    (N'Phòng Kế toán', N'Quản lý tài chính'),
    (N'Phòng Nhân sự', N'Quản lý nhân sự'),
    (N'Phòng Kinh doanh', N'Bán hàng và marketing');
END
GO

-- Nhân viên mẫu
IF NOT EXISTS (SELECT * FROM NhanVien)
BEGIN
    INSERT INTO NhanVien (TenNV, Email, SoDienThoai, MaPB) VALUES
    (N'Nguyễn Văn Admin', N'admin@company.com', N'0901234567', 1),
    (N'Trần Thị User', N'user@company.com', N'0901234568', 2),
    (N'Lê Văn IT', N'it@company.com', N'0901234569', 1);
END
GO

-- User mẫu
-- User accounts are NOT seeded here to avoid storing password hashes in
-- the repository. The backend will seed a single official admin account at
-- startup (username: admin, password: admin123 hashed securely). If you
-- need to create additional users manually, run an INSERT with a proper
-- bcrypt hash value for the `PasswordHash` column.
--
-- Example (do NOT uncomment without replacing <bcrypt_hash>):
-- INSERT INTO Users (Username, PasswordHash, Role, MaNV) VALUES
-- (N'admin', '<bcrypt_hash>', 'admin', 1);
GO

PRINT N'✅ Database khởi tạo thành công!';
GO
