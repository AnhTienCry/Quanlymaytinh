import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { ApiResponse, Computer, ScanData } from '../types';

/**
 * Lấy danh sách tất cả máy tính (Admin)
 */
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
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách máy tính',
    });
  }
}

/**
 * Lấy thông tin một máy tính theo ID
 */
export async function getComputerById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<Computer>>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();
    
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT 
          mt.*,
          nv.TenNV as TenNguoiDung_NV,
          k.TenKho
        FROM MayTinh mt
        LEFT JOIN NhanVien nv ON mt.MaNV_DangDung = nv.MaNV
        LEFT JOIN Kho k ON mt.MaKho = k.MaKho
        WHERE mt.MaMT = @id
      `);

    if (result.recordset.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy máy tính',
      });
      return;
    }

    res.json({
      success: true,
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('GetComputerById error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy thông tin máy tính',
    });
  }
}

/**
 * Nhận dữ liệu quét từ Agent Tool và lưu vào database
 * Nếu MAC đã tồn tại thì cập nhật, nếu chưa thì thêm mới
 */
export async function submitScanData(
  req: Request<object, ApiResponse, ScanData>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const scanData = req.body;
    const userId = req.user?.userId;

    if (!scanData.mac) {
      res.status(400).json({
        success: false,
        error: 'Thiếu địa chỉ MAC',
      });
      return;
    }

    const pool = await getConnection();

    // Kiểm tra máy tính đã tồn tại chưa (theo MAC)
    const existingPC = await pool
      .request()
      .input('mac', sql.NVarChar, scanData.mac)
      .query('SELECT MaMT FROM MayTinh WHERE MAC = @mac');

    let maMT: number;

    if (existingPC.recordset.length > 0) {
      // Cập nhật máy tính đã tồn tại
      maMT = existingPC.recordset[0].MaMT;
      
      await pool
        .request()
        .input('maMT', sql.Int, maMT)
        .input('tenMT', sql.NVarChar, scanData.hostname || 'Unknown')
        .input('cpu', sql.NVarChar, scanData.cpu)
        .input('ram', sql.NVarChar, scanData.ram)
        .input('ssd', sql.NVarChar, scanData.ssd)
        .input('vga', sql.NVarChar, scanData.vga)
        .input('ip', sql.NVarChar, scanData.ip)
        .input('os', sql.NVarChar, scanData.os)
        .input('serial', sql.NVarChar, scanData.serialNumber)
        .input('model', sql.NVarChar, scanData.model)
        .input('hang', sql.NVarChar, scanData.manufacturer)
        .input('tinhTrang', sql.NVarChar, scanData.tinhTrang)
        .input('deXuat', sql.NVarChar, scanData.deXuat)
        .input('tenNguoiDung', sql.NVarChar, scanData.tenNguoiDung)
        .query(`
          UPDATE MayTinh SET
            TenMT = @tenMT,
            CPU = @cpu,
            RAM = @ram,
            SSD = @ssd,
            VGA = @vga,
            IPAddress = @ip,
            OS = @os,
            SerialNumber = @serial,
            Model = @model,
            Hang = @hang,
            TinhTrang = @tinhTrang,
            DeXuat = @deXuat,
            TenNguoiDung = @tenNguoiDung,
            NgayCapNhat = SYSUTCDATETIME()
          WHERE MaMT = @maMT
        `);
    } else {
      // Thêm máy tính mới
      const insertResult = await pool
        .request()
        .input('tenMT', sql.NVarChar, scanData.hostname || 'Unknown')
        .input('cpu', sql.NVarChar, scanData.cpu)
        .input('ram', sql.NVarChar, scanData.ram)
        .input('ssd', sql.NVarChar, scanData.ssd)
        .input('vga', sql.NVarChar, scanData.vga)
        .input('mac', sql.NVarChar, scanData.mac)
        .input('ip', sql.NVarChar, scanData.ip)
        .input('os', sql.NVarChar, scanData.os)
        .input('serial', sql.NVarChar, scanData.serialNumber)
        .input('model', sql.NVarChar, scanData.model)
        .input('hang', sql.NVarChar, scanData.manufacturer)
        .input('tinhTrang', sql.NVarChar, scanData.tinhTrang)
        .input('deXuat', sql.NVarChar, scanData.deXuat)
        .input('tenNguoiDung', sql.NVarChar, scanData.tenNguoiDung)
        .query(`
          INSERT INTO MayTinh (TenMT, CPU, RAM, SSD, VGA, MAC, IPAddress, OS, SerialNumber, Model, Hang, TinhTrang, DeXuat, TenNguoiDung, TrangThai)
          OUTPUT INSERTED.MaMT
          VALUES (@tenMT, @cpu, @ram, @ssd, @vga, @mac, @ip, @os, @serial, @model, @hang, @tinhTrang, @deXuat, @tenNguoiDung, N'Đang sử dụng')
        `);
      
      maMT = insertResult.recordset[0].MaMT;
    }

    // Lưu lịch sử quét
    await pool
      .request()
      .input('maMT', sql.Int, maMT)
      .input('mac', sql.NVarChar, scanData.mac)
      .input('ip', sql.NVarChar, scanData.ip)
      .input('rawData', sql.NVarChar, JSON.stringify(scanData))
      .input('nguonQuet', sql.NVarChar, 'agent-tool')
      .query(`
        INSERT INTO LichSuQuet (MaMT, MAC, IPAddress, RawData, NguonQuet)
        VALUES (@maMT, @mac, @ip, @rawData, @nguonQuet)
      `);

    res.json({
      success: true,
      message: existingPC.recordset.length > 0 
        ? 'Đã cập nhật thông tin máy tính' 
        : 'Đã thêm máy tính mới',
      data: { maMT },
    });
  } catch (error) {
    console.error('SubmitScanData error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lưu dữ liệu quét',
    });
  }
}

/**
 * Cập nhật thông tin máy tính (Admin)
 */
export async function updateComputer(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const pool = await getConnection();

    // Kiểm tra máy tính tồn tại
    const existing = await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT MaMT FROM MayTinh WHERE MaMT = @id');

    if (existing.recordset.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy máy tính',
      });
      return;
    }

    // Cập nhật
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .input('maTS', sql.NVarChar, updateData.MaTS)
      .input('tenMT', sql.NVarChar, updateData.TenMT)
      .input('model', sql.NVarChar, updateData.Model)
      .input('hang', sql.NVarChar, updateData.Hang)
      .input('namSX', sql.Int, updateData.NamSX)
      .input('cpu', sql.NVarChar, updateData.CPU)
      .input('ram', sql.NVarChar, updateData.RAM)
      .input('ssd', sql.NVarChar, updateData.SSD)
      .input('vga', sql.NVarChar, updateData.VGA)
      .input('trangThai', sql.NVarChar, updateData.TrangThai)
      .input('maKho', sql.Int, updateData.MaKho)
      .input('tinhTrang', sql.NVarChar, updateData.TinhTrang)
      .input('deXuat', sql.NVarChar, updateData.DeXuat)
      .input('tenNguoiDung', sql.NVarChar, updateData.TenNguoiDung)
      .query(`
        UPDATE MayTinh SET
          MaTS = COALESCE(@maTS, MaTS),
          TenMT = COALESCE(@tenMT, TenMT),
          Model = COALESCE(@model, Model),
          Hang = COALESCE(@hang, Hang),
          NamSX = COALESCE(@namSX, NamSX),
          CPU = COALESCE(@cpu, CPU),
          RAM = COALESCE(@ram, RAM),
          SSD = COALESCE(@ssd, SSD),
          VGA = COALESCE(@vga, VGA),
          TrangThai = COALESCE(@trangThai, TrangThai),
          MaKho = COALESCE(@maKho, MaKho),
          TinhTrang = COALESCE(@tinhTrang, TinhTrang),
          DeXuat = COALESCE(@deXuat, DeXuat),
          TenNguoiDung = COALESCE(@tenNguoiDung, TenNguoiDung),
          NgayCapNhat = SYSUTCDATETIME()
        WHERE MaMT = @id
      `);

    res.json({
      success: true,
      message: 'Đã cập nhật thông tin máy tính',
    });
  } catch (error) {
    console.error('UpdateComputer error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật máy tính',
    });
  }
}

/**
 * Xóa máy tính (Admin)
 */
export async function deleteComputer(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    // Xóa lịch sử quét trước
    await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM LichSuQuet WHERE MaMT = @id');

    // Xóa máy tính
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM MayTinh WHERE MaMT = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy máy tính',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Đã xóa máy tính',
    });
  } catch (error) {
    console.error('DeleteComputer error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa máy tính',
    });
  }
}



