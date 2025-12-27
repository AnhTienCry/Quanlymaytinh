import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { ApiResponse, Computer, ScanData } from '../types';

// ==========================================
// 1. LẤY DANH SÁCH MÁY TÍNH
// ==========================================
export async function getAllComputers(
  req: Request,
  res: Response<ApiResponse<Computer[]>>
): Promise<void> {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        mt.*,
        nv.TenNV as TenNguoiDung_NV,
        k.TenKho
      FROM MayTinh mt
      LEFT JOIN NhanVien nv ON mt.MaNV_DangDung = nv.MaNV
      LEFT JOIN Kho k ON mt.MaKho = k.MaKho
      ORDER BY mt.NgayCapNhat DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('GetAllComputers error:', error);
    res.status(500).json({ success: false, error: 'Lỗi lấy danh sách máy' });
  }
}

// ==========================================
// 2. LẤY CHI TIẾT 1 MÁY
// ==========================================
export async function getComputerById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Computer>>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT mt.*, nv.TenNV as TenNguoiDung_NV, k.TenKho
        FROM MayTinh mt
        LEFT JOIN NhanVien nv ON mt.MaNV_DangDung = nv.MaNV
        LEFT JOIN Kho k ON mt.MaKho = k.MaKho
        WHERE mt.MaMT = @id
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Không tìm thấy máy tính' });
      return;
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}

// ==========================================
// 3. XỬ LÝ QUÉT & LƯU (QUAN TRỌNG NHẤT)
// ==========================================
export async function submitScanData(
  req: Request<object, ApiResponse, ScanData>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const scanData = req.body;

    // Validate MAC
    if (!scanData.mac || scanData.mac === '00:00:00:00:00:00') {
      res.status(400).json({ success: false, error: 'Địa chỉ MAC không hợp lệ' });
      return;
    }

    const pool = await getConnection();

    // Check tồn tại
    const existingPC = await pool.request()
      .input('mac', sql.NVarChar, scanData.mac)
      .query('SELECT MaMT FROM MayTinh WHERE MAC = @mac');

    let maMT: number;
    
    // Chuẩn bị dữ liệu (tránh null gây lỗi)
    const hostname = scanData.hostname || 'Unknown PC';
    const model = scanData.model || '';
    const hang = scanData.manufacturer || '';
    const namSX = scanData.namSX || null; // Năm sản xuất
    const tenNguoiDung = scanData.tenNguoiDung || null;
    const tinhTrang = scanData.tinhTrang || null;
    const deXuat = scanData.deXuat || null;

    if (existingPC.recordset.length > 0) {
      // --- UPDATE ---
      maMT = existingPC.recordset[0].MaMT;
      await pool.request()
        .input('maMT', sql.Int, maMT)
        .input('tenMT', sql.NVarChar, hostname)
        .input('cpu', sql.NVarChar, scanData.cpu)
        .input('ram', sql.NVarChar, scanData.ram)
        .input('ssd', sql.NVarChar, scanData.ssd)
        .input('vga', sql.NVarChar, scanData.vga)
        .input('ip', sql.NVarChar, scanData.ip)
        .input('os', sql.NVarChar, scanData.os)
        .input('serial', sql.NVarChar, scanData.serialNumber)
        .input('model', sql.NVarChar, model)
        .input('hang', sql.NVarChar, hang)
        .input('namSX', sql.Int, namSX) // Thêm NamSX
        .input('tinhTrang', sql.NVarChar, tinhTrang)
        .input('deXuat', sql.NVarChar, deXuat)
        .input('tenNguoiDung', sql.NVarChar, tenNguoiDung)
        .query(`
          UPDATE MayTinh SET
            TenMT = @tenMT, CPU = @cpu, RAM = @ram, SSD = @ssd, VGA = @vga,
            IPAddress = @ip, OS = @os, SerialNumber = @serial, Model = @model, Hang = @hang, NamSX = @namSX,
            NgayCapNhat = SYSUTCDATETIME(),
            TinhTrang = COALESCE(@tinhTrang, TinhTrang),
            DeXuat = COALESCE(@deXuat, DeXuat),
            TenNguoiDung = COALESCE(@tenNguoiDung, TenNguoiDung)
          WHERE MaMT = @maMT
        `);
    } else {
      // --- INSERT (MÁY MỚI) ---
      const insertResult = await pool.request()
        .input('tenMT', sql.NVarChar, hostname)
        .input('mac', sql.NVarChar, scanData.mac)
        .input('cpu', sql.NVarChar, scanData.cpu)
        .input('ram', sql.NVarChar, scanData.ram)
        .input('ssd', sql.NVarChar, scanData.ssd)
        .input('vga', sql.NVarChar, scanData.vga)
        .input('ip', sql.NVarChar, scanData.ip)
        .input('os', sql.NVarChar, scanData.os)
        .input('serial', sql.NVarChar, scanData.serialNumber)
        .input('model', sql.NVarChar, model)
        .input('hang', sql.NVarChar, hang)
        .input('namSX', sql.Int, namSX) // Thêm NamSX
        .input('tinhTrang', sql.NVarChar, tinhTrang)
        .input('deXuat', sql.NVarChar, deXuat)
        .input('tenNguoiDung', sql.NVarChar, tenNguoiDung)
        .query(`
          INSERT INTO MayTinh (
            TenMT, MAC, CPU, RAM, SSD, VGA, IPAddress, OS, 
            SerialNumber, Model, Hang, NamSX, TinhTrang, DeXuat, TenNguoiDung, 
            TrangThai, NgayTao
          )
          OUTPUT INSERTED.MaMT
          VALUES (
            @tenMT, @mac, @cpu, @ram, @ssd, @vga, @ip, @os, 
            @serial, @model, @hang, @namSX, @tinhTrang, @deXuat, @tenNguoiDung, 
            N'Đang sử dụng', SYSUTCDATETIME()
          )
        `);
      maMT = insertResult.recordset[0].MaMT;
    }

    // Lưu lịch sử
    await pool.request()
      .input('maMT', sql.Int, maMT)
      .input('mac', sql.NVarChar, scanData.mac)
      .input('ip', sql.NVarChar, scanData.ip)
      .input('rawData', sql.NVarChar, JSON.stringify(scanData))
      .query(`
        INSERT INTO LichSuQuet (MaMT, MAC, IPAddress, RawData, NguonQuet)
        VALUES (@maMT, @mac, @ip, @rawData, 'agent-tool')
      `);

    res.json({ success: true, message: 'Lưu thành công', data: { maMT } });

  } catch (error) {
    console.error('SubmitScanData error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server lưu dữ liệu' });
  }
}

// ==========================================
// 4. CẬP NHẬT THÔNG TIN MÁY TÍNH (ADMIN)
// ==========================================
export async function updateComputer(
  req: Request<{ id: string }, ApiResponse, Partial<Computer>>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const pool = await getConnection();

    const updates: string[] = [];
    const request = pool.request().input('id', sql.Int, parseInt(id));

    // Dynamically add fields to update
    if (updateData.MaTS !== undefined) {
      updates.push('MaTS = @maTS');
      request.input('maTS', sql.NVarChar, updateData.MaTS);
    }
    if (updateData.TenMT !== undefined) {
      updates.push('TenMT = @tenMT');
      request.input('tenMT', sql.NVarChar, updateData.TenMT);
    }
    if (updateData.Model !== undefined) {
      updates.push('Model = @model');
      request.input('model', sql.NVarChar, updateData.Model);
    }
    if (updateData.Hang !== undefined) {
      updates.push('Hang = @hang');
      request.input('hang', sql.NVarChar, updateData.Hang);
    }
    if (updateData.NamSX !== undefined) {
      updates.push('NamSX = @namSX');
      request.input('namSX', sql.Int, updateData.NamSX);
    }
    if (updateData.CPU !== undefined) {
      updates.push('CPU = @cpu');
      request.input('cpu', sql.NVarChar, updateData.CPU);
    }
    if (updateData.RAM !== undefined) {
      updates.push('RAM = @ram');
      request.input('ram', sql.NVarChar, updateData.RAM);
    }
    if (updateData.SSD !== undefined) {
      updates.push('SSD = @ssd');
      request.input('ssd', sql.NVarChar, updateData.SSD);
    }
    if (updateData.VGA !== undefined) {
      updates.push('VGA = @vga');
      request.input('vga', sql.NVarChar, updateData.VGA);
    }
    if (updateData.MAC !== undefined) {
      updates.push('MAC = @mac');
      request.input('mac', sql.NVarChar, updateData.MAC);
    }
    if (updateData.IPAddress !== undefined) {
      updates.push('IPAddress = @ip');
      request.input('ip', sql.NVarChar, updateData.IPAddress);
    }
    if (updateData.SerialNumber !== undefined) {
      updates.push('SerialNumber = @serial');
      request.input('serial', sql.NVarChar, updateData.SerialNumber);
    }
    if (updateData.OS !== undefined) {
      updates.push('OS = @os');
      request.input('os', sql.NVarChar, updateData.OS);
    }
    if (updateData.MaKho !== undefined) {
      updates.push('MaKho = @maKho');
      request.input('maKho', sql.Int, updateData.MaKho);
    }
    if (updateData.MaNV_DangDung !== undefined) {
      updates.push('MaNV_DangDung = @maNV_DangDung');
      request.input('maNV_DangDung', sql.Int, updateData.MaNV_DangDung);
    }
    if (updateData.TrangThai !== undefined) {
      updates.push('TrangThai = @trangThai');
      request.input('trangThai', sql.NVarChar, updateData.TrangThai);
    }
    // Thêm các trường mới
    if (updateData.TinhTrang !== undefined) {
      updates.push('TinhTrang = @tinhTrang');
      request.input('tinhTrang', sql.NVarChar, updateData.TinhTrang);
    }
    if (updateData.DeXuat !== undefined) {
      updates.push('DeXuat = @deXuat');
      request.input('deXuat', sql.NVarChar, updateData.DeXuat);
    }
    if (updateData.TenNguoiDung !== undefined) {
      updates.push('TenNguoiDung = @tenNguoiDung');
      request.input('tenNguoiDung', sql.NVarChar, updateData.TenNguoiDung);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
      return;
    }

    updates.push('NgayCapNhat = SYSUTCDATETIME()');

    await request.query(`
      UPDATE MayTinh 
      SET ${updates.join(', ')}
      WHERE MaMT = @id
    `);

    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('UpdateComputer error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}

// ==========================================
// 5. LẤY THÔNG TIN MÁY TÍNH CỦA USER HIỆN TẠI
// ==========================================
export async function getMyComputer(
  req: Request,
  res: Response<ApiResponse<Computer>>
): Promise<void> {
  try {
    console.log('📋 GetMyComputer called', { path: req.path, method: req.method });
    
    if (!req.user) {
      console.log('❌ GetMyComputer: No user in request');
      res.status(401).json({ success: false, error: 'Chưa xác thực' });
      return;
    }

    const pool = await getConnection();
    const username = req.user.username;
    console.log('📋 GetMyComputer: username', username);

    // Tìm máy tính có TenNguoiDung trùng với username
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT TOP 1 mt.*, nv.TenNV as TenNguoiDung_NV, k.TenKho
        FROM MayTinh mt
        LEFT JOIN NhanVien nv ON mt.MaNV_DangDung = nv.MaNV
        LEFT JOIN Kho k ON mt.MaKho = k.MaKho
        WHERE mt.TenNguoiDung = @username
        ORDER BY mt.NgayCapNhat DESC
      `);

    if (result.recordset.length === 0) {
      console.log('📋 GetMyComputer: No computer found for username:', username);
      res.status(404).json({ 
        success: false, 
        error: 'Chưa có thông tin máy tính. Vui lòng tải và chạy công cụ quét trước. Lưu ý: Khi công cụ hỏi "Tên đăng nhập", vui lòng nhập chính xác tên đăng nhập của bạn.' 
      });
      return;
    }

    console.log('📋 GetMyComputer: Found computer:', result.recordset[0].MaMT);
    res.json({ success: true, data: result.recordset[0] });
  } catch (error) {
    console.error('GetMyComputer error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}

// ==========================================
// 5.1. CẬP NHẬT MÁY TÍNH CỦA USER HIỆN TẠI (Cho phép user update máy tính của mình)
// ==========================================
export async function updateMyComputer(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    console.log('📝 UpdateMyComputer called', { body: req.body });
    
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Chưa xác thực' });
      return;
    }

    const pool = await getConnection();
    const username = req.user.username;
    const updateData = req.body;
    
    console.log('📝 UpdateMyComputer - username:', username, 'updateData:', updateData);

    // Tìm máy tính của user
    const computerResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT TOP 1 MaMT FROM MayTinh 
        WHERE TenNguoiDung = @username
        ORDER BY NgayCapNhat DESC
      `);

    if (computerResult.recordset.length === 0) {
      res.status(404).json({ success: false, error: 'Không tìm thấy máy tính của bạn' });
      return;
    }

    const maMT = computerResult.recordset[0].MaMT;

    // Build dynamic update query - chỉ cho phép update TinhTrang và DeXuat
    const updates: string[] = [];
    const request = pool.request().input('maMT', sql.Int, maMT);

    if (updateData.TinhTrang !== undefined) {
      updates.push('TinhTrang = @tinhTrang');
      request.input('tinhTrang', sql.NVarChar, updateData.TinhTrang);
    }
    if (updateData.DeXuat !== undefined) {
      updates.push('DeXuat = @deXuat');
      request.input('deXuat', sql.NVarChar, updateData.DeXuat);
    }

    if (updates.length === 0) {
      res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
      return;
    }

    updates.push('NgayCapNhat = SYSUTCDATETIME()');

    await request.query(`
      UPDATE MayTinh 
      SET ${updates.join(', ')}
      WHERE MaMT = @maMT
    `);

    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('UpdateMyComputer error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}

// ==========================================
// 6. XÓA MÁY TÍNH
// ==========================================
export async function deleteComputer(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM MayTinh WHERE MaMT = @id');

    res.json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    console.error('DeleteComputer error:', error);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
}
