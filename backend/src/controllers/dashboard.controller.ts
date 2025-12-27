import { Request, Response } from 'express';
import { getConnection } from '../config/database';
import { ApiResponse, DashboardStats } from '../types';

/**
 * Lấy thống kê tổng quan cho Dashboard (Admin)
 */
export async function getDashboardStats(
  req: Request,
  res: Response<ApiResponse<DashboardStats>>
): Promise<void> {
  try {
    const pool = await getConnection();

    // Lấy các thống kê song song
    const [
      computersResult,
      usersResult,
      warehousesResult,
      departmentsResult,
      recentScansResult,
      statusResult,
    ] = await Promise.all([
      pool.request().query('SELECT COUNT(*) as count FROM MayTinh'),
      pool.request().query("SELECT COUNT(*) as count FROM Users WHERE Role = 'user'"),
      pool.request().query('SELECT COUNT(*) as count FROM Kho'),
      pool.request().query('SELECT COUNT(*) as count FROM PhongBan'),
      pool.request().query(`
        SELECT TOP 10 
          ls.*,
          mt.TenMT,
          mt.TenNguoiDung
        FROM LichSuQuet ls
        LEFT JOIN MayTinh mt ON ls.MaMT = mt.MaMT
        ORDER BY ls.NgayQuet DESC
      `),
      pool.request().query(`
        SELECT TrangThai as status, COUNT(*) as count 
        FROM MayTinh 
        GROUP BY TrangThai
      `),
    ]);

    const stats: DashboardStats = {
      totalComputers: computersResult.recordset[0].count,
      totalUsers: usersResult.recordset[0].count,
      totalWarehouses: warehousesResult.recordset[0].count,
      totalDepartments: departmentsResult.recordset[0].count,
      recentScans: recentScansResult.recordset,
      computersByStatus: statusResult.recordset,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy thống kê',
    });
  }
}

/**
 * Lấy danh sách user đã đăng nhập gần đây (Admin)
 */
export async function getRecentUsers(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        u.UserId,
        u.Username,
        u.Role,
        u.LastLogin,
        u.NgayTao,
        (SELECT COUNT(*) FROM MayTinh mt 
         LEFT JOIN LichSuQuet ls ON mt.MaMT = ls.MaMT 
         WHERE ls.RawData LIKE '%"userId":' + CAST(u.UserId AS VARCHAR) + '%'
        ) as ComputerCount
      FROM Users u
      WHERE u.Role = 'user'
      ORDER BY u.LastLogin DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('GetRecentUsers error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách user',
    });
  }
}

/**
 * Lấy danh sách tất cả users (Admin)
 */
export async function getAllUsers(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    const pool = await getConnection();

    const result = await pool.request().query(`
      SELECT 
        u.UserId,
        u.Username,
        u.Role,
        u.IsActive,
        u.LastLogin,
        u.NgayTao
      FROM Users u
      ORDER BY u.NgayTao DESC
    `);

    res.json({
      success: true,
      data: result.recordset,
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi lấy danh sách users',
    });
  }
}



