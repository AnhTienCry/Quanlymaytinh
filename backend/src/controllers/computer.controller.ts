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
        .input('tinhTrang', sql.NVarChar, tinhTrang)
        .input('deXuat', sql.NVarChar, deXuat)
        .input('tenNguoiDung', sql.NVarChar, tenNguoiDung)
        .query(`
          UPDATE MayTinh SET
            TenMT = @tenMT, CPU = @cpu, RAM = @ram, SSD = @ssd, VGA = @vga,
            IPAddress = @ip, OS = @os, SerialNumber = @serial, Model = @model, Hang = @hang,
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
        .input('tinhTrang', sql.NVarChar, tinhTrang)
        .input('deXuat', sql.NVarChar, deXuat)
        .input('tenNguoiDung', sql.NVarChar, tenNguoiDung)
        .query(`
          INSERT INTO MayTinh (
            TenMT, MAC, CPU, RAM, SSD, VGA, IPAddress, OS, 
            SerialNumber, Model, Hang, TinhTrang, DeXuat, TenNguoiDung, 
            TrangThai, NgayTao
          )
          OUTPUT INSERTED.MaMT
          VALUES (
            @tenMT, @mac, @cpu, @ram, @ssd, @vga, @ip, @os, 
            @serial, @model, @hang, @tinhTrang, @deXuat, @tenNguoiDung, 
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
// 4. CẬP NHẬT MÁY TÍNH (ADMIN SỬA TAY)
// ==========================================
export async function updateComputer(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const pool = await getConnection();

    // Chỉ update những field được gửi lên (không overwrite các field khác)
    const updateFields: string[] = [];
    const request = pool.request().input('id', sql.Int, parseInt(id));

    if (updateData.MaTS !== undefined) {
      request.input('maTS', sql.NVarChar, updateData.MaTS);
      updateFields.push('MaTS = @maTS');
    }
    if (updateData.TenMT !== undefined) {
      request.input('tenMT', sql.NVarChar, updateData.TenMT);
      updateFields.push('TenMT = @tenMT');
    }
    if (updateData.Model !== undefined) {
      request.input('model', sql.NVarChar, updateData.Model);
      updateFields.push('Model = @model');
    }
    if (updateData.Hang !== undefined) {
      request.input('hang', sql.NVarChar, updateData.Hang);
      updateFields.push('Hang = @hang');
    }
    if (updateData.CPU !== undefined) {
      request.input('cpu', sql.NVarChar, updateData.CPU);
      updateFields.push('CPU = @cpu');
    }
    if (updateData.RAM !== undefined) {
      request.input('ram', sql.NVarChar, updateData.RAM);
      updateFields.push('RAM = @ram');
    }
    if (updateData.SSD !== undefined) {
      request.input('ssd', sql.NVarChar, updateData.SSD);
      updateFields.push('SSD = @ssd');
    }
    if (updateData.VGA !== undefined) {
      request.input('vga', sql.NVarChar, updateData.VGA);
      updateFields.push('VGA = @vga');
    }
    if (updateData.TrangThai !== undefined) {
      request.input('trangThai', sql.NVarChar, updateData.TrangThai);
      updateFields.push('TrangThai = @trangThai');
    }
    if (updateData.MaKho !== undefined) {
      request.input('maKho', sql.Int, updateData.MaKho);
      updateFields.push('MaKho = @maKho');
    }
    if (updateData.TinhTrang !== undefined) {
      request.input('tinhTrang', sql.NVarChar, updateData.TinhTrang);
      updateFields.push('TinhTrang = @tinhTrang');
    }
    if (updateData.DeXuat !== undefined) {
      request.input('deXuat', sql.NVarChar, updateData.DeXuat);
      updateFields.push('DeXuat = @deXuat');
    }
    if (updateData.TenNguoiDung !== undefined) {
      request.input('tenNguoiDung', sql.NVarChar, updateData.TenNguoiDung);
      updateFields.push('TenNguoiDung = @tenNguoiDung');
    }

    // Luôn cập nhật NgayCapNhat
    updateFields.push('NgayCapNhat = SYSUTCDATETIME()');

    if (updateFields.length === 0) {
      res.status(400).json({ success: false, error: 'Không có dữ liệu để cập nhật' });
      return;
    }

    const updateQuery = `UPDATE MayTinh SET ${updateFields.join(', ')} WHERE MaMT = @id`;
    await request.query(updateQuery);

    res.json({ success: true, message: 'Đã cập nhật' });
  } catch (error) {
    console.error('UpdateComputer error:', error);
    res.status(500).json({ success: false, error: 'Lỗi cập nhật' });
  }
}

// ==========================================
// 5. XÓA MÁY TÍNH
// ==========================================
export async function deleteComputer(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    await pool.request().input('id', sql.Int, parseInt(id)).query('DELETE FROM LichSuQuet WHERE MaMT = @id');
    await pool.request().input('id', sql.Int, parseInt(id)).query('DELETE FROM MayTinh WHERE MaMT = @id');
    res.json({ success: true, message: 'Đã xóa máy tính' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi xóa máy tính' });
  }
}