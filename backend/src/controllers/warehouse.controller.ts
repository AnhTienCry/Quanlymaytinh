import { Request, Response } from 'express';
import { getConnection, sql } from '../config/database';
import { ApiResponse, Kho } from '../types';

/**
 * Lấy danh sách kho
 */
export async function getAllWarehouses(
  req: Request,
  res: Response<ApiResponse<Kho[]>>
): Promise<void> {
  try {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Kho ORDER BY NgayTao DESC');

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('GetAllWarehouses error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách kho',
    });
  }
}

/**
 * Thêm kho mới
 */
export async function createWarehouse(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { TenKho, DiaChi, MoTa } = req.body;

    if (!TenKho) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên kho',
      });
      return;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('tenKho', sql.NVarChar, TenKho)
      .input('diaChi', sql.NVarChar, DiaChi)
      .input('moTa', sql.NVarChar, MoTa)
      .query(`
        INSERT INTO Kho (TenKho, DiaChi, MoTa)
        OUTPUT INSERTED.*
        VALUES (@tenKho, @diaChi, @moTa)
      `);

    res.status(201).json({
      success: true,
      message: 'Đã thêm kho mới',
      data: result.recordset[0],
    });
  } catch (error) {
    console.error('CreateWarehouse error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi thêm kho',
    });
  }
}

/**
 * Cập nhật kho
 */
export async function updateWarehouse(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const { TenKho, DiaChi, MoTa } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .input('tenKho', sql.NVarChar, TenKho)
      .input('diaChi', sql.NVarChar, DiaChi)
      .input('moTa', sql.NVarChar, MoTa)
      .query(`
        UPDATE Kho SET
          TenKho = COALESCE(@tenKho, TenKho),
          DiaChi = COALESCE(@diaChi, DiaChi),
          MoTa = COALESCE(@moTa, MoTa),
          NgayCapNhat = SYSUTCDATETIME()
        WHERE MaKho = @id
      `);

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy kho',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Đã cập nhật kho',
    });
  } catch (error) {
    console.error('UpdateWarehouse error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật kho',
    });
  }
}

/**
 * Xóa kho
 */
export async function deleteWarehouse(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const { id } = req.params;
    const pool = await getConnection();

    const result = await pool
      .request()
      .input('id', sql.Int, parseInt(id))
      .query('DELETE FROM Kho WHERE MaKho = @id');

    if (result.rowsAffected[0] === 0) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy kho',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Đã xóa kho',
    });
  } catch (error) {
    console.error('DeleteWarehouse error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa kho',
    });
  }
}



