import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection, sql } from '../config/database';
import { jwtConfig } from '../config/jwt';
import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

const SALT_ROUNDS = 10;

/**
 * Đăng nhập
 */
export async function login(
  req: Request<object, ApiResponse<AuthResponse>, LoginRequest>,
  res: Response<ApiResponse<AuthResponse>>
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên đăng nhập và mật khẩu',
      });
      return;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .query<User>('SELECT * FROM Users WHERE Username = @username AND IsActive = 1');

    const user = result.recordset[0];

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
      return;
    }

    // So sánh password
    const isValidPassword = await bcrypt.compare(password, user.PasswordHash);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
      return;
    }

    // Cập nhật LastLogin
    await pool
      .request()
      .input('userId', sql.Int, user.UserId)
      .query('UPDATE Users SET LastLogin = SYSUTCDATETIME() WHERE UserId = @userId');

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: user.UserId,
        username: user.Username,
        role: user.Role,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          userId: user.UserId,
          username: user.Username,
          role: user.Role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi đăng nhập',
    });
  }
}

/**
 * Đăng ký tài khoản mới (chỉ user thường)
 */
export async function register(
  req: Request<object, ApiResponse<AuthResponse>, RegisterRequest>,
  res: Response<ApiResponse<AuthResponse>>
): Promise<void> {
  try {
    const { username, password, tenNguoiDung } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Vui lòng nhập tên đăng nhập và mật khẩu',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
      return;
    }

    const pool = await getConnection();

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .query('SELECT UserId FROM Users WHERE Username = @username');

    if (existingUser.recordset.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Tên đăng nhập đã tồn tại',
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo user mới (role = 'user')
    const insertResult = await pool
      .request()
      .input('username', sql.NVarChar, username)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, 'user')
      .query(`
        INSERT INTO Users (Username, PasswordHash, Role, IsActive) 
        OUTPUT INSERTED.UserId, INSERTED.Username, INSERTED.Role
        VALUES (@username, @passwordHash, @role, 1)
      `);

    const newUser = insertResult.recordset[0];

    // Tạo JWT token
    const token = jwt.sign(
      {
        userId: newUser.UserId,
        username: newUser.Username,
        role: newUser.Role,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          userId: newUser.UserId,
          username: newUser.Username,
          role: newUser.Role,
        },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server khi đăng ký',
    });
  }
}

/**
 * Lấy thông tin user hiện tại
 */
export async function getMe(
  req: Request,
  res: Response<ApiResponse>
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Chưa xác thực',
      });
      return;
    }

    const pool = await getConnection();
    const result = await pool
      .request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT UserId, Username, Role, IsActive, LastLogin, NgayTao 
        FROM Users 
        WHERE UserId = @userId
      `);

    const user = result.recordset[0];

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Không tìm thấy user',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server',
    });
  }
}

/**
 * Seed admin mặc định (gọi khi khởi động server)
 */
export async function seedDefaultAdmin(): Promise<void> {
  try {
    const pool = await getConnection();
    
    // Kiểm tra đã có admin chưa
    const existingAdmin = await pool
      .request()
      .input('username', sql.NVarChar, 'admin')
      .query('SELECT UserId FROM Users WHERE Username = @username');

    if (existingAdmin.recordset.length > 0) {
      console.log('✅ Admin account đã tồn tại');
      return;
    }

    // Tạo admin mặc định
    const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);

    await pool
      .request()
      .input('username', sql.NVarChar, 'admin')
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('role', sql.NVarChar, 'admin')
      .query(`
        INSERT INTO Users (Username, PasswordHash, Role, IsActive) 
        VALUES (@username, @passwordHash, @role, 1)
      `);

    console.log('✅ Đã tạo tài khoản admin mặc định (admin/admin123)');
  } catch (error) {
    console.error('❌ Lỗi seed admin:', error);
  }
}



